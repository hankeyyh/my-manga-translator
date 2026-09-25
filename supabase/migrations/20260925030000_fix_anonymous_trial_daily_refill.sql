-- 匿名试用跨日补发：
-- 1. 不要用 IMMUTABLE 的 credit_log_shanghai_date(now()) 取“今天”。
--    该函数包在 PL/pgSQL 里会被缓存执行计划，计划期可能把 now() 折成常量，
--    之后每一天的存在性检查仍等于首次发放日，函数在重置余额前就 RETURN true。
-- 2. 不要让 credit_logs 的 unique_violation 回滚已经写上的 pay_to_use_balance。
--    外层 EXCEPTION 会撤销当日重置，却仍然返回成功，接口读到的还是昨日剩余。

CREATE OR REPLACE FUNCTION public.grant_daily_anonymous_bonus(p_user_id uuid, p_credits bigint, p_ip_hash text DEFAULT NULL::text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_balance bigint;
  v_delta bigint;
  v_exists boolean;
  v_grant_id uuid;
  v_owner uuid;
  v_grant_date date;
BEGIN
  IF coalesce(auth.role(), '') IS DISTINCT FROM 'service_role' THEN
    RAISE EXCEPTION 'not authorized';
  END IF;
  IF p_user_id IS NULL THEN
    RAISE EXCEPTION 'user_id is required';
  END IF;
  IF p_credits IS NULL OR p_credits <= 0 THEN
    RAISE EXCEPTION 'credits must be positive';
  END IF;
  IF NOT EXISTS (
    SELECT 1
    FROM auth.users
    WHERE id = p_user_id
      AND is_anonymous IS TRUE
  ) THEN
    RAISE EXCEPTION 'not an anonymous user';
  END IF;

  -- 与 biz/utils/time.ts 的 shanghaiGrantDate 同一日历日（Asia/Shanghai，无夏令时）。
  v_grant_date := (now() AT TIME ZONE 'Asia/Shanghai')::date;

  SELECT EXISTS (
    SELECT 1
    FROM public.credit_logs
    WHERE user_id = p_user_id
      AND biz_type = 'guest_daily'
      AND (created_at AT TIME ZONE 'Asia/Shanghai')::date = v_grant_date
  )
  INTO v_exists;

  IF v_exists THEN
    RETURN true;
  END IF;

  INSERT INTO public.user_credits (user_id, pay_to_use_balance, subscription_balance)
  VALUES (p_user_id, 0, 0)
  ON CONFLICT (user_id) DO NOTHING;

  SELECT pay_to_use_balance
  INTO v_balance
  FROM public.user_credits
  WHERE user_id = p_user_id
  FOR UPDATE;

  IF p_ip_hash IS NOT NULL AND btrim(p_ip_hash) <> '' THEN
    INSERT INTO public.anonymous_trial_grants (ip_hash, grant_date, user_id)
    VALUES (p_ip_hash, v_grant_date, p_user_id)
    ON CONFLICT (ip_hash, grant_date) DO NOTHING
    RETURNING id INTO v_grant_id;

    IF v_grant_id IS NULL THEN
      SELECT user_id
      INTO v_owner
      FROM public.anonymous_trial_grants
      WHERE ip_hash = p_ip_hash
        AND grant_date = v_grant_date;

      IF v_owner IS DISTINCT FROM p_user_id THEN
        RETURN false;
      END IF;
    END IF;
  END IF;

  v_delta := p_credits - coalesce(v_balance, 0);

  UPDATE public.user_credits
  SET pay_to_use_balance = p_credits
  WHERE user_id = p_user_id;

  -- 余额重置放在异常块外面：当日流水冲突只跳过插日志，不撤销重置。
  BEGIN
    INSERT INTO public.credit_logs (
      user_id,
      transaction_id,
      biz_type,
      paytouse_credit_change,
      subscription_credit_change
    )
    VALUES (
      p_user_id,
      NULL,
      'guest_daily',
      v_delta,
      0
    );
  EXCEPTION
    WHEN unique_violation THEN
      NULL;
  END;

  RETURN true;
END;
$function$
;
