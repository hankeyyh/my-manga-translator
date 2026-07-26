set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.prepare_images_for_retry(p_user_id uuid, p_task_id uuid, p_image_ids uuid[])
 RETURNS jsonb
 LANGUAGE plpgsql
AS $function$
DECLARE
    v_sub_balance int8;
    v_pay_balance int8;
    v_sub_freeze int8;
    v_pay_freeze int8;
    v_total_sub_freeze int8 := 0;
    v_total_pay_freeze int8 := 0;
    v_total_freeze int8 := 0;
    v_newly_prepared uuid[] := ARRAY[]::uuid[];
    v_already_prepared uuid[] := ARRAY[]::uuid[];
    r record;
BEGIN
    IF p_image_ids IS NULL OR cardinality(p_image_ids) = 0 THEN
        RETURN jsonb_build_object(
            'newly_prepared', '[]'::jsonb,
            'already_prepared', '[]'::jsonb
        );
    END IF;

    -- 锁图片行，防止并发重试同一批
    PERFORM 1
    FROM public.translation_images ti
    WHERE ti.id IN (SELECT DISTINCT unnest(p_image_ids))
    FOR UPDATE;

    -- 校验：每张必须存在、属本 task/user；且处于可重试态或已准备态
    -- 可重试：failed + 当前轮已 REFUND
    -- 已准备：pending + 当前轮已有 RETRY_FREEZE（幂等）
    IF EXISTS (
        SELECT 1
        FROM (
            SELECT DISTINCT unnest(p_image_ids) AS image_id
        ) req
        LEFT JOIN public.translation_images ti ON ti.id = req.image_id
        LEFT JOIN public.translation_tasks tt
            ON tt.id = ti.task_id
           AND tt.user_id = p_user_id
           AND tt.id = p_task_id
        WHERE ti.id IS NULL
           OR tt.id IS NULL
           OR ti.credits <= 0
           OR NOT (
                (
                    ti.status = 'pending'
                    AND EXISTS (
                        SELECT 1 FROM public.credit_logs cl
                        WHERE cl.image_id = ti.id
                          AND cl.biz_type = 'IMAGE_RETRY_FREEZE'
                          AND cl.retry_count = ti.retry_count
                    )
                )
                OR
                (
                    ti.status = 'failed'
                    AND EXISTS (
                        SELECT 1 FROM public.credit_logs cl
                        WHERE cl.image_id = ti.id
                          AND cl.biz_type = 'IMAGE_REFUND'
                          AND cl.retry_count = ti.retry_count
                    )
                )
           )
    ) THEN
        RAISE EXCEPTION 'invalid retry images: must be failed+refunded or already prepared'
            USING ERRCODE = 'P0002';
    END IF;

    -- 锁积分账户
    SELECT pay_to_use_balance, subscription_balance
    INTO v_pay_balance, v_sub_balance
    FROM public.user_credits
    WHERE user_id = p_user_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'user credits not found';
    END IF;

    -- 统计仍需 freeze 的金额（failed 且下一轮尚无 RETRY_FREEZE）
    SELECT COALESCE(SUM(ti.credits), 0)
    INTO v_total_freeze
    FROM (
        SELECT DISTINCT unnest(p_image_ids) AS image_id
    ) req
    JOIN public.translation_images ti ON ti.id = req.image_id
    WHERE ti.status = 'failed'
      AND ti.credits > 0
      AND NOT EXISTS (
          SELECT 1 FROM public.credit_logs cl
          WHERE cl.image_id = ti.id
            AND cl.biz_type = 'IMAGE_RETRY_FREEZE'
            AND cl.retry_count = ti.retry_count + 1
      );

    IF v_total_freeze > 0 AND (v_pay_balance + v_sub_balance) < v_total_freeze THEN
        RAISE EXCEPTION 'not enough credits' USING ERRCODE = 'U0001';
    END IF;

    -- 逐张：已准备进 already；failed 则 freeze(next)+bump 进 newly
    FOR r IN
        SELECT
            ti.id AS image_id,
            ti.task_id,
            ti.credits,
            ti.retry_count AS cur_retry,
            ti.retry_count + 1 AS next_retry,
            ti.status
        FROM (
            SELECT DISTINCT unnest(p_image_ids) AS image_id
        ) req
        JOIN public.translation_images ti ON ti.id = req.image_id
        ORDER BY ti.id
    LOOP
        -- 已准备：不改状态、不扣费，记入 already_prepared
        IF r.status = 'pending' THEN
            v_already_prepared := array_append(v_already_prepared, r.image_id);
            CONTINUE;
        END IF;

        -- failed：若下一轮尚未 freeze，则写流水
        IF NOT EXISTS (
            SELECT 1 FROM public.credit_logs cl
            WHERE cl.image_id = r.image_id
              AND cl.biz_type = 'IMAGE_RETRY_FREEZE'
              AND cl.retry_count = r.next_retry
        ) THEN
            v_sub_freeze := 0;
            v_pay_freeze := 0;

            IF v_sub_balance >= r.credits THEN
                v_sub_freeze := r.credits;
            ELSE
                v_sub_freeze := v_sub_balance;
                v_pay_freeze := r.credits - v_sub_balance;
            END IF;

            v_sub_balance := v_sub_balance - v_sub_freeze;
            v_pay_balance := v_pay_balance - v_pay_freeze;
            v_total_sub_freeze := v_total_sub_freeze + v_sub_freeze;
            v_total_pay_freeze := v_total_pay_freeze + v_pay_freeze;

            INSERT INTO public.credit_logs (
                user_id, task_id, image_id, biz_type, retry_count,
                subscription_credit_change, paytouse_credit_change,
                subscription_frozen_change, paytouse_frozen_change
            ) VALUES (
                p_user_id, r.task_id, r.image_id, 'IMAGE_RETRY_FREEZE', r.next_retry,
                -v_sub_freeze, -v_pay_freeze,
                v_sub_freeze, v_pay_freeze
            );
        END IF;

        UPDATE public.translation_images
        SET status = 'pending',
            error_message = NULL,
            retry_count = r.next_retry
        WHERE id = r.image_id
          AND status = 'failed'
          AND retry_count = r.cur_retry;

        IF NOT FOUND THEN
            RAISE EXCEPTION 'concurrent modification on image %', r.image_id
                USING ERRCODE = 'P0003';
        END IF;

        v_newly_prepared := array_append(v_newly_prepared, r.image_id);
    END LOOP;

    IF v_total_sub_freeze > 0 OR v_total_pay_freeze > 0 THEN
        UPDATE public.user_credits
        SET pay_to_use_balance = pay_to_use_balance - v_total_pay_freeze,
            pay_to_use_frozen = pay_to_use_frozen + v_total_pay_freeze,
            subscription_balance = subscription_balance - v_total_sub_freeze,
            subscription_frozen = subscription_frozen + v_total_sub_freeze
        WHERE user_id = p_user_id;
    END IF;

    RETURN jsonb_build_object(
        'newly_prepared', to_jsonb(v_newly_prepared),
        'already_prepared', to_jsonb(v_already_prepared)
    );
END;
$function$
;


