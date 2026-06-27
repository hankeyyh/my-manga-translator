alter table "public"."credit_logs" add column "retry_count" integer default 0;

alter table "public"."translation_images" alter column "max_retries" set default 0;

CREATE UNIQUE INDEX credit_logs_image_biz_retry_unique ON public.credit_logs USING btree (image_id, biz_type, retry_count) WHERE (image_id IS NOT NULL);

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.batch_capture_image_credits(p_user_id uuid, p_image_ids uuid[])
 RETURNS void
 LANGUAGE plpgsql
AS $function$DECLARE
    v_sub_freeze int8;
    v_pay_freeze int8;
    v_sub_capture int8;
    v_pay_capture int8;
    v_total_sub_capture int8 := 0;
    v_total_pay_capture int8 := 0;
    v_total_capture int8;
    r record;
BEGIN
    -- 空数组直接返回
    IF p_image_ids IS NULL OR cardinality(p_image_ids) = 0 THEN
        RETURN;
    END IF;

    -- 校验：所有 image_id 必须存在，且所属 task 属于该用户
    IF EXISTS (
        SELECT 1
        FROM (
            SELECT DISTINCT unnest(p_image_ids) AS image_id
        ) req
        LEFT JOIN public.translation_images ti ON ti.id = req.image_id
        LEFT JOIN public.translation_tasks tt
            ON tt.id = ti.task_id
           AND tt.user_id = p_user_id
        WHERE ti.id IS NULL OR tt.id IS NULL
    ) THEN
        RAISE EXCEPTION 'invalid image ids or images do not belong to user';
    END IF;

    -- 锁行 user_credits
    SELECT pay_to_use_frozen, subscription_frozen
    INTO v_pay_freeze, v_sub_freeze
    FROM public.user_credits
    WHERE user_id = p_user_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'user credits not found';
    END IF;

    -- 预检：仅统计当前 retry_count 下尚未结算的图片；全部已结算则幂等 no-op
    SELECT COALESCE(SUM(ti.credits), 0)
    INTO v_total_capture
    FROM (
        SELECT DISTINCT unnest(p_image_ids) AS image_id
    ) req
    JOIN public.translation_images ti ON ti.id = req.image_id
    JOIN public.translation_tasks tt
        ON tt.id = ti.task_id
       AND tt.user_id = p_user_id
    WHERE ti.credits > 0
      AND NOT EXISTS (
          SELECT 1
          FROM public.credit_logs cl
          WHERE cl.image_id = ti.id
            AND cl.biz_type = 'IMAGE_CAPTURE'
            AND cl.retry_count = ti.retry_count
      )
      AND NOT EXISTS (
          SELECT 1
          FROM public.credit_logs cl
          WHERE cl.image_id = ti.id
            AND cl.biz_type = 'IMAGE_REFUND'
            AND cl.retry_count = ti.retry_count
      );

    IF v_total_capture = 0 THEN
        RETURN;
    END IF;

    IF (v_pay_freeze + v_sub_freeze) < v_total_capture THEN
        RAISE EXCEPTION 'not enough frozen credits' USING ERRCODE = 'U0002';
    END IF;

    -- 逐张图片核销，累计总变动，每张写一条 credit_logs
    FOR r IN
        SELECT DISTINCT ON (ti.id)
            ti.id AS image_id,
            ti.task_id,
            ti.credits,
            ti.retry_count
        FROM (
            SELECT DISTINCT unnest(p_image_ids) AS image_id
        ) req
        JOIN public.translation_images ti ON ti.id = req.image_id
        JOIN public.translation_tasks tt
            ON tt.id = ti.task_id
           AND tt.user_id = p_user_id
        WHERE ti.credits > 0
          AND NOT EXISTS (
              SELECT 1
              FROM public.credit_logs cl
              WHERE cl.image_id = ti.id
                AND cl.biz_type = 'IMAGE_CAPTURE'
                AND cl.retry_count = ti.retry_count
          )
          AND NOT EXISTS (
              SELECT 1
              FROM public.credit_logs cl
              WHERE cl.image_id = ti.id
                AND cl.biz_type = 'IMAGE_REFUND'
                AND cl.retry_count = ti.retry_count
          )
        ORDER BY ti.id
    LOOP
        v_sub_capture := 0;
        v_pay_capture := 0;

        -- 与单张核销一致：优先核销订阅冻结积分
        IF v_sub_freeze >= r.credits THEN
            v_sub_capture := r.credits;
        ELSE
            v_sub_capture := v_sub_freeze;
            v_pay_capture := r.credits - v_sub_freeze;
        END IF;

        v_sub_freeze := v_sub_freeze - v_sub_capture;
        v_pay_freeze := v_pay_freeze - v_pay_capture;

        v_total_sub_capture := v_total_sub_capture + v_sub_capture;
        v_total_pay_capture := v_total_pay_capture + v_pay_capture;

        INSERT INTO public.credit_logs (
            user_id,
            task_id,
            image_id,
            biz_type,
            retry_count,
            subscription_credit_change,
            paytouse_credit_change,
            subscription_frozen_change,
            paytouse_frozen_change
        )
        VALUES (
            p_user_id,
            r.task_id,
            r.image_id,
            'IMAGE_CAPTURE',
            r.retry_count,
            0,
            0,
            -v_sub_capture,
            -v_pay_capture
        );
    END LOOP;

    -- 一次性更新 user_credits（只减冻结，余额不变）
    IF v_total_sub_capture > 0 OR v_total_pay_capture > 0 THEN
        UPDATE public.user_credits
        SET subscription_frozen = subscription_frozen - v_total_sub_capture,
            pay_to_use_frozen = pay_to_use_frozen - v_total_pay_capture
        WHERE user_id = p_user_id;
    END IF;
END;$function$
;

CREATE OR REPLACE FUNCTION public.batch_refund_image_credits(p_user_id uuid, p_image_ids uuid[])
 RETURNS void
 LANGUAGE plpgsql
AS $function$DECLARE
    v_sub_freeze int8;
    v_pay_freeze int8;
    v_sub_refund int8;
    v_pay_refund int8;
    v_total_sub_refund int8 := 0;
    v_total_pay_refund int8 := 0;
    v_total_refund int8;
    r record;
BEGIN
    -- 空数组直接返回
    IF p_image_ids IS NULL OR cardinality(p_image_ids) = 0 THEN
        RETURN;
    END IF;

    -- 校验：所有 image_id 必须存在，且所属 task 属于该用户
    IF EXISTS (
        SELECT 1
        FROM (
            SELECT DISTINCT unnest(p_image_ids) AS image_id
        ) req
        LEFT JOIN public.translation_images ti ON ti.id = req.image_id
        LEFT JOIN public.translation_tasks tt ON tt.id = ti.task_id AND tt.user_id = p_user_id
        WHERE ti.id IS NULL OR tt.id IS NULL
    ) THEN
        RAISE EXCEPTION 'invalid image ids or images do not belong to user';
    END IF;

    -- 锁行 user_credits
    SELECT pay_to_use_frozen, subscription_frozen
    INTO v_pay_freeze, v_sub_freeze
    FROM public.user_credits
    WHERE user_id = p_user_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'user credits not found';
    END IF;

    -- 预检：仅统计当前 retry_count 下尚未退款的图片（已 capture 的不退）；全部已退款则幂等 no-op
    SELECT COALESCE(SUM(ti.credits), 0)
    INTO v_total_refund
    FROM (
        SELECT DISTINCT unnest(p_image_ids) AS image_id
    ) req
    JOIN public.translation_images ti ON ti.id = req.image_id
    JOIN public.translation_tasks tt ON tt.id = ti.task_id AND tt.user_id = p_user_id
    WHERE ti.credits > 0
      AND NOT EXISTS (
          SELECT 1
          FROM public.credit_logs cl
          WHERE cl.image_id = ti.id
            AND cl.biz_type = 'IMAGE_REFUND'
            AND cl.retry_count = ti.retry_count
      )
      AND NOT EXISTS (
          SELECT 1
          FROM public.credit_logs cl
          WHERE cl.image_id = ti.id
            AND cl.biz_type = 'IMAGE_CAPTURE'
            AND cl.retry_count = ti.retry_count
      );

    IF v_total_refund = 0 THEN
        RETURN;
    END IF;

    IF (v_pay_freeze + v_sub_freeze) < v_total_refund THEN
        RAISE EXCEPTION 'not enough frozen credits to refund' USING ERRCODE = 'U0003';
    END IF;

    -- 逐张图片退款，累计总变动，每张写一条 credit_logs
    FOR r IN
        SELECT DISTINCT ON (ti.id)
            ti.id AS image_id,
            ti.task_id,
            ti.credits,
            ti.retry_count
        FROM (
            SELECT DISTINCT unnest(p_image_ids) AS image_id
        ) req
        JOIN public.translation_images ti ON ti.id = req.image_id
        JOIN public.translation_tasks tt ON tt.id = ti.task_id AND tt.user_id = p_user_id
        WHERE ti.credits > 0
          AND NOT EXISTS (
              SELECT 1
              FROM public.credit_logs cl
              WHERE cl.image_id = ti.id
                AND cl.biz_type = 'IMAGE_REFUND'
                AND cl.retry_count = ti.retry_count
          )
          AND NOT EXISTS (
              SELECT 1
              FROM public.credit_logs cl
              WHERE cl.image_id = ti.id
                AND cl.biz_type = 'IMAGE_CAPTURE'
                AND cl.retry_count = ti.retry_count
          )
        ORDER BY ti.id
    LOOP
        v_sub_refund := 0;
        v_pay_refund := 0;

        -- 与单张退款一致：优先回退订阅冻结积分
        IF v_sub_freeze >= r.credits THEN
            v_sub_refund := r.credits;
        ELSE
            v_sub_refund := v_sub_freeze;
            v_pay_refund := r.credits - v_sub_freeze;
        END IF;

        v_sub_freeze := v_sub_freeze - v_sub_refund;
        v_pay_freeze := v_pay_freeze - v_pay_refund;

        v_total_sub_refund := v_total_sub_refund + v_sub_refund;
        v_total_pay_refund := v_total_pay_refund + v_pay_refund;

        INSERT INTO public.credit_logs (
            user_id,
            task_id,
            image_id,
            biz_type,
            retry_count,
            subscription_credit_change,
            paytouse_credit_change,
            subscription_frozen_change,
            paytouse_frozen_change
        )
        VALUES (
            p_user_id,
            r.task_id,
            r.image_id,
            'IMAGE_REFUND',
            r.retry_count,
            v_sub_refund,
            v_pay_refund,
            -v_sub_refund,
            -v_pay_refund
        );
    END LOOP;

    -- 一次性更新 user_credits
    IF v_total_sub_refund > 0 OR v_total_pay_refund > 0 THEN
        UPDATE public.user_credits
        SET pay_to_use_balance = pay_to_use_balance + v_total_pay_refund,
            subscription_balance = subscription_balance + v_total_sub_refund,
            pay_to_use_frozen = pay_to_use_frozen - v_total_pay_refund,
            subscription_frozen = subscription_frozen - v_total_sub_refund
        WHERE user_id = p_user_id;
    END IF;
END;$function$
;

CREATE OR REPLACE FUNCTION public.freeze_image_credits_for_retry(p_user_id uuid, p_task_id uuid, p_image_ids uuid[], p_retry_cnt integer)
 RETURNS void
 LANGUAGE plpgsql
AS $function$
DECLARE
    v_sub_balance int8;
    v_pay_balance int8;
    v_sub_freeze int8;
    v_pay_freeze int8;
    v_total_sub_freeze int8 := 0;
    v_total_pay_freeze int8 := 0;
    v_total_freeze int8;
    v_prev_retry_count int;
    r record;
BEGIN
    -- 空数组直接返回
    IF p_image_ids IS NULL OR cardinality(p_image_ids) = 0 THEN
        RETURN;
    END IF;

    IF p_retry_cnt IS NULL OR p_retry_cnt < 1 THEN
        RAISE EXCEPTION 'retry_cnt must be >= 1'
            USING ERRCODE = 'P0001';
    END IF;

    v_prev_retry_count := p_retry_cnt - 1;

    -- 校验：image 存在、归属用户/task、status=failed
    -- 上一轮已 IMAGE_REFUND、当前轮尚未 IMAGE_RETRY_FREEZE
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
           OR ti.status <> 'failed'
           OR ti.credits <= 0
           OR NOT EXISTS (
               SELECT 1
               FROM public.credit_logs cl
               WHERE cl.image_id = ti.id
                 AND cl.biz_type = 'IMAGE_REFUND'
                 AND cl.retry_count = v_prev_retry_count
           )
    ) THEN
        RAISE EXCEPTION 'invalid retry images: must be failed, belong to task, and refunded at previous attempt'
            USING ERRCODE = 'P0002';
    END IF;

    -- 锁行 user_credits
    SELECT pay_to_use_balance, subscription_balance
    INTO v_pay_balance, v_sub_balance
    FROM public.user_credits
    WHERE user_id = p_user_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'user credits not found';
    END IF;

    -- 仅统计当前轮次尚未 freeze 的图片
    SELECT COALESCE(SUM(ti.credits), 0)
    INTO v_total_freeze
    FROM (
        SELECT DISTINCT unnest(p_image_ids) AS image_id
    ) req
    JOIN public.translation_images ti ON ti.id = req.image_id
    JOIN public.translation_tasks tt
        ON tt.id = ti.task_id
       AND tt.user_id = p_user_id
       AND tt.id = p_task_id
    WHERE ti.status = 'failed'
      AND ti.credits > 0
      AND NOT EXISTS (
          SELECT 1
          FROM public.credit_logs cl
          WHERE cl.image_id = ti.id
            AND cl.biz_type = 'IMAGE_RETRY_FREEZE'
            AND cl.retry_count = p_retry_cnt
      );

    -- 全部已 freeze（幂等 no-op）
    IF v_total_freeze = 0 THEN
        RETURN;
    END IF;

    IF (v_pay_balance + v_sub_balance) < v_total_freeze THEN
        RAISE EXCEPTION 'not enough credits' USING ERRCODE = 'U0001';
    END IF;

    -- 逐张冻结，每张写一条 credit_logs
    FOR r IN
        SELECT DISTINCT ON (ti.id)
            ti.id AS image_id,
            ti.task_id,
            ti.credits
        FROM (
            SELECT DISTINCT unnest(p_image_ids) AS image_id
        ) req
        JOIN public.translation_images ti ON ti.id = req.image_id
        JOIN public.translation_tasks tt
            ON tt.id = ti.task_id
           AND tt.user_id = p_user_id
           AND tt.id = p_task_id
        WHERE ti.status = 'failed'
          AND ti.credits > 0
          AND NOT EXISTS (
              SELECT 1
              FROM public.credit_logs cl
              WHERE cl.image_id = ti.id
                AND cl.biz_type = 'IMAGE_RETRY_FREEZE'
                AND cl.retry_count = p_retry_cnt
          )
        ORDER BY ti.id
    LOOP
        v_sub_freeze := 0;
        v_pay_freeze := 0;

        -- 与 freeze_task_credits 一致：优先冻结订阅积分
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
            user_id,
            task_id,
            image_id,
            biz_type,
            retry_count,
            subscription_credit_change,
            paytouse_credit_change,
            subscription_frozen_change,
            paytouse_frozen_change
        )
        VALUES (
            p_user_id,
            r.task_id,
            r.image_id,
            'IMAGE_RETRY_FREEZE',
            p_retry_cnt,
            -v_sub_freeze,
            -v_pay_freeze,
            v_sub_freeze,
            v_pay_freeze
        );
    END LOOP;

    -- 一次性更新 user_credits
    IF v_total_sub_freeze > 0 OR v_total_pay_freeze > 0 THEN
        UPDATE public.user_credits
        SET pay_to_use_balance = pay_to_use_balance - v_total_pay_freeze,
            pay_to_use_frozen = pay_to_use_frozen + v_total_pay_freeze,
            subscription_balance = subscription_balance - v_total_sub_freeze,
            subscription_frozen = subscription_frozen + v_total_sub_freeze
        WHERE user_id = p_user_id;
    END IF;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.handle_translate_image_failed(p_image_ids uuid[], p_err_message text)
 RETURNS TABLE(image_id uuid, should_retry boolean)
 LANGUAGE plpgsql
AS $function$
DECLARE
  v_max_retries constant integer := 0;  -- 对应 MAX_TRANSLATION_RETRIES
  v_expected_count integer;
  v_found_count integer;
  r record;
BEGIN
  -- 空数组直接返回
  IF p_image_ids IS NULL OR cardinality(p_image_ids) = 0 THEN
    RETURN;
  END IF;

  -- 去重后校验是否全部存在
  SELECT COUNT(DISTINCT x)
  INTO v_expected_count
  FROM unnest(p_image_ids) AS t(x);

  SELECT COUNT(*)
  INTO v_found_count
  FROM public.translation_images
  WHERE id = ANY(p_image_ids);

  IF v_found_count <> v_expected_count THEN
    RAISE EXCEPTION 'some images not found, expected %, found %', v_expected_count, v_found_count
      USING ERRCODE = 'P0002';
  END IF;

  -- 加行锁，仅处理 status=processing 的图片
  FOR r IN
    SELECT
      ti.id,
      LEAST(COALESCE(ti.retry_count, 0) + 1, v_max_retries) AS new_retry_count
    FROM public.translation_images ti
    WHERE ti.id = ANY(p_image_ids)
      AND ti.status = 'processing'
    ORDER BY ti.id
    FOR UPDATE
  LOOP
    UPDATE public.translation_images
    SET
      status = CASE
        WHEN r.new_retry_count < v_max_retries THEN 'pending'
        ELSE 'failed'
      END,
      error_message = p_err_message,
      retry_count = r.new_retry_count
    WHERE id = r.id
      AND status = 'processing';

    image_id := r.id;
    should_retry := r.new_retry_count < v_max_retries;
    RETURN NEXT;
  END LOOP;
END;
$function$
;


