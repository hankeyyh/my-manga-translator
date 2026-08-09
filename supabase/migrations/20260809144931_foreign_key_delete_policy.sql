alter table "public"."credit_logs" drop constraint "credit_logs_transaction_id_fkey";

alter table "public"."credit_logs" drop constraint "credit_logs_user_id_fkey";

alter table "public"."translation_tasks" drop constraint "translation_tasks_user_id_fkey";

alter table "public"."user_credits" drop constraint "user_credits_user_id_fkey";

alter table "public"."user_subscriptions" drop constraint "user_subscriptions_topup_config_id_fkey";

alter table "public"."user_subscriptions" drop constraint "user_subscriptions_user_id_fkey";

alter table "public"."user_transactions" drop constraint "user_transactions_topup_config_id_fkey";

alter table "public"."user_transactions" drop constraint "user_transactions_user_id_fkey";

alter table "public"."credit_logs" add constraint "credit_logs_transaction_id_fkey" FOREIGN KEY (transaction_id) REFERENCES public.user_transactions(id) ON UPDATE CASCADE ON DELETE SET NULL not valid;

alter table "public"."credit_logs" validate constraint "credit_logs_transaction_id_fkey";

alter table "public"."credit_logs" add constraint "credit_logs_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON UPDATE CASCADE ON DELETE SET NULL not valid;

alter table "public"."credit_logs" validate constraint "credit_logs_user_id_fkey";

alter table "public"."translation_tasks" add constraint "translation_tasks_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON UPDATE CASCADE ON DELETE SET NULL not valid;

alter table "public"."translation_tasks" validate constraint "translation_tasks_user_id_fkey";

alter table "public"."user_credits" add constraint "user_credits_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON UPDATE CASCADE ON DELETE SET NULL not valid;

alter table "public"."user_credits" validate constraint "user_credits_user_id_fkey";

alter table "public"."user_subscriptions" add constraint "user_subscriptions_topup_config_id_fkey" FOREIGN KEY (topup_config_id) REFERENCES public.topup_config(id) ON UPDATE CASCADE ON DELETE SET NULL not valid;

alter table "public"."user_subscriptions" validate constraint "user_subscriptions_topup_config_id_fkey";

alter table "public"."user_subscriptions" add constraint "user_subscriptions_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON UPDATE CASCADE ON DELETE SET NULL not valid;

alter table "public"."user_subscriptions" validate constraint "user_subscriptions_user_id_fkey";

alter table "public"."user_transactions" add constraint "user_transactions_topup_config_id_fkey" FOREIGN KEY (topup_config_id) REFERENCES public.topup_config(id) ON UPDATE CASCADE ON DELETE SET NULL not valid;

alter table "public"."user_transactions" validate constraint "user_transactions_topup_config_id_fkey";

alter table "public"."user_transactions" add constraint "user_transactions_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON UPDATE CASCADE ON DELETE SET NULL not valid;

alter table "public"."user_transactions" validate constraint "user_transactions_user_id_fkey";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.grant_signup_bonus(p_user_id uuid, p_credits bigint)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
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

  -- 仅本人或 service_role 可发放
  IF auth.uid() IS DISTINCT FROM p_user_id
     AND coalesce(auth.role(), '') IS DISTINCT FROM 'service_role' THEN
    RAISE EXCEPTION 'not authorized';
  END IF;

  SELECT EXISTS (
    SELECT 1
    FROM public.credit_logs
    WHERE user_id = p_user_id
      AND biz_type = 'signup_bonus'
  )
  INTO v_exists;

  IF v_exists THEN
    -- 流水已有但余额行可能缺失时补齐，避免查询 .single() 失败
    INSERT INTO public.user_credits (user_id, pay_to_use_balance, subscription_balance)
    VALUES (p_user_id, 0, 0)
    ON CONFLICT (user_id) DO NOTHING;
    RETURN true;
  END IF;

  INSERT INTO public.user_credits (user_id, pay_to_use_balance, subscription_balance)
  VALUES (p_user_id, p_credits, 0)
  ON CONFLICT (user_id) DO UPDATE
  SET pay_to_use_balance = user_credits.pay_to_use_balance + EXCLUDED.pay_to_use_balance;

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
    INSERT INTO public.user_credits (user_id, pay_to_use_balance, subscription_balance)
    VALUES (p_user_id, 0, 0)
    ON CONFLICT (user_id) DO NOTHING;
    RETURN true;
END;
$function$
;


