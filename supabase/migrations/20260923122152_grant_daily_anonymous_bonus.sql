set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.credit_log_shanghai_date(p_created_at timestamp with time zone)
 RETURNS date
 LANGUAGE sql
 IMMUTABLE
AS $function$
  SELECT (p_created_at AT TIME ZONE 'Asia/Shanghai')::date;
$function$
;

CREATE UNIQUE INDEX credit_logs_guest_daily_user_day_unique ON public.credit_logs USING btree (user_id, public.credit_log_shanghai_date(created_at)) WHERE (biz_type = 'guest_daily'::text);

CREATE OR REPLACE FUNCTION public.grant_daily_anonymous_bonus(p_user_id uuid, p_credits bigint)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_balance bigint;
  v_delta bigint;
  v_exists boolean;
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

  INSERT INTO public.user_credits (user_id, pay_to_use_balance, subscription_balance)
  VALUES (p_user_id, 0, 0)
  ON CONFLICT (user_id) DO NOTHING;

  SELECT pay_to_use_balance
  INTO v_balance
  FROM public.user_credits
  WHERE user_id = p_user_id
  FOR UPDATE;

  SELECT EXISTS (
    SELECT 1
    FROM public.credit_logs
    WHERE user_id = p_user_id
      AND biz_type = 'guest_daily'
      AND public.credit_log_shanghai_date(created_at) = public.credit_log_shanghai_date(now())
  )
  INTO v_exists;

  IF v_exists THEN
    RETURN true;
  END IF;

  v_delta := p_credits - v_balance;

  UPDATE public.user_credits
  SET pay_to_use_balance = p_credits
  WHERE user_id = p_user_id;

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

  RETURN true;
EXCEPTION
  WHEN unique_violation THEN
    RETURN true;
END;
$function$
;


