set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.succeed_transaction(p_transaction_id uuid, p_stripe_subscription_id text DEFAULT NULL::text)
 RETURNS boolean
 LANGUAGE plpgsql
AS $function$
DECLARE
  v_current_status text;
  v_transaction_type text;
  v_user_id uuid;
  v_credits int8;
  v_plan_tier text;
  v_billing_cycle text;
  v_subscription_started_at timestamptz;
  v_subscription_ended_at timestamptz;
  v_topup_config_id uuid;
  v_old_balance int8;
  v_delta int8;
BEGIN
  SELECT transaction_status, transaction_type, user_id, credits, plan_tier, billing_cycle,
         subscription_started_at, subscription_ended_at, topup_config_id
  INTO v_current_status, v_transaction_type, v_user_id, v_credits, v_plan_tier, v_billing_cycle,
       v_subscription_started_at, v_subscription_ended_at, v_topup_config_id
  FROM user_transactions
  WHERE id = p_transaction_id
  FOR UPDATE;

  IF v_current_status IS NULL THEN
    RETURN false;
  END IF;

  IF v_current_status != 'pending' THEN
    RETURN true;
  END IF;

  UPDATE user_transactions
  SET
    transaction_status = 'success',
    succeeded_at = NOW(),
    stripe_subscription_id = COALESCE(p_stripe_subscription_id, stripe_subscription_id)
  WHERE id = p_transaction_id;

  IF v_transaction_type = 'pay-to-use' THEN
    INSERT INTO user_credits (user_id, pay_to_use_balance, subscription_balance)
    VALUES (v_user_id, v_credits, 0)
    ON CONFLICT (user_id) DO UPDATE
    SET pay_to_use_balance = user_credits.pay_to_use_balance + v_credits;

    INSERT INTO credit_logs (user_id, transaction_id, biz_type, paytouse_credit_change, subscription_credit_change)
    VALUES (v_user_id, p_transaction_id, 'recharge', v_credits, 0);

  ELSIF v_transaction_type IN ('subscription', 'subscription_change') THEN
    -- 锁积分行，计算覆盖 delta
    SELECT subscription_balance
    INTO v_old_balance
    FROM user_credits
    WHERE user_id = v_user_id
    FOR UPDATE;

    IF NOT FOUND THEN
      v_old_balance := 0;
    END IF;

    v_delta := v_credits - coalesce(v_old_balance, 0);

    -- 覆盖可用订阅积分（不动 pay_to_use / subscription_frozen）
    INSERT INTO user_credits (user_id, pay_to_use_balance, subscription_balance)
    VALUES (v_user_id, 0, v_credits)
    ON CONFLICT (user_id) DO UPDATE
    SET subscription_balance = v_credits;

    INSERT INTO user_subscriptions (
      user_id, plan_tier, billing_cycle, status,
      current_period_started_at, current_period_ended_at, topup_config_id,
      stripe_subscription_id
    )
    VALUES (
      v_user_id, v_plan_tier, v_billing_cycle, 'active',
      v_subscription_started_at, v_subscription_ended_at, v_topup_config_id,
      p_stripe_subscription_id
    )
    ON CONFLICT (user_id) DO UPDATE
    SET
      plan_tier = v_plan_tier,
      billing_cycle = v_billing_cycle,
      status = 'active',
      current_period_started_at = v_subscription_started_at,
      current_period_ended_at = v_subscription_ended_at,
      topup_config_id = v_topup_config_id,
      stripe_subscription_id = COALESCE(p_stripe_subscription_id, user_subscriptions.stripe_subscription_id);

    INSERT INTO credit_logs (user_id, transaction_id, biz_type, paytouse_credit_change, subscription_credit_change)
    VALUES (v_user_id, p_transaction_id, 'recharge', 0, v_delta);
  END IF;

  RETURN true;
END;
$function$
;


