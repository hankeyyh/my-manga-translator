CREATE UNIQUE INDEX credit_logs_signup_bonus_user_unique ON public.credit_logs USING btree (user_id) WHERE (biz_type = 'signup_bonus'::text);

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.grant_signup_bonus(p_user_id uuid, p_credits bigint)
 RETURNS boolean
 LANGUAGE plpgsql
AS $function$
DECLARE
  v_exists boolean;
BEGIN
  IF p_user_id IS NULL THEN
    RAISE EXCEPTION 'user_id is required';
  END IF;
  IF p_credits IS NULL OR p_credits <= 0 THEN
    RAISE EXCEPTION 'credits must be positive';
  END IF;
  -- 已发放过：幂等成功
  SELECT EXISTS (
    SELECT 1
    FROM public.credit_logs
    WHERE user_id = p_user_id
      AND biz_type = 'signup_bonus'
  )
  INTO v_exists;
  IF v_exists THEN
    RETURN true;
  END IF;
  -- 入账到 pay_to_use（无 user_credits 行则创建）
  INSERT INTO public.user_credits (user_id, pay_to_use_balance, subscription_balance)
  VALUES (p_user_id, p_credits, 0)
  ON CONFLICT (user_id) DO UPDATE
  SET pay_to_use_balance = user_credits.pay_to_use_balance + EXCLUDED.pay_to_use_balance;
  -- 记录log
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
    'signup_bonus',
    p_credits,
    0
  );
  RETURN true;
EXCEPTION
  WHEN unique_violation THEN
    -- 并发下另一事务已写入 signup_bonus，视为已成功
    RETURN true;
END;
$function$
;


