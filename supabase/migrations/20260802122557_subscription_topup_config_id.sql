alter table "public"."user_subscriptions" add column "topup_config_id" uuid;

alter table "public"."user_transactions" add column "topup_config_id" uuid;

alter table "public"."user_subscriptions" add constraint "user_subscriptions_topup_config_id_fkey" FOREIGN KEY (topup_config_id) REFERENCES public.topup_config(id) ON UPDATE CASCADE not valid;

alter table "public"."user_subscriptions" validate constraint "user_subscriptions_topup_config_id_fkey";

alter table "public"."user_transactions" add constraint "user_transactions_topup_config_id_fkey" FOREIGN KEY (topup_config_id) REFERENCES public.topup_config(id) ON UPDATE CASCADE not valid;

alter table "public"."user_transactions" validate constraint "user_transactions_topup_config_id_fkey";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.succeed_transaction(p_transaction_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
AS $function$DECLARE
	v_current_status text;
	v_transaction_type text;
	v_user_id uuid;
	v_credits int8;
	v_plan_tier text;
	v_billing_cycle text;
	v_subscription_started_at timestamptz;
	v_subscription_ended_at timestamptz;
	v_topup_config_id uuid;
BEGIN
	-- 1. 锁住这行订单数据，并捞出当前状态和用户ID（SELECT ... FOR UPDATE 强行排他锁，防止并发重试）
	SELECT transaction_status, transaction_type, user_id, credits, plan_tier, billing_cycle, subscription_started_at, subscription_ended_at, topup_config_id
	INTO v_current_status, v_transaction_type, v_user_id, v_credits, v_plan_tier, v_billing_cycle, v_subscription_started_at, v_subscription_ended_at, v_topup_config_id
	FROM user_transactions
	WHERE id = p_transaction_id
	FOR UPDATE;

	-- 2. 边界情况校验：如果订单不存在，直接返回 false
	IF v_current_status IS NULL THEN
		RETURN false;
	END IF;

	-- 3. 幂等校验：如果状态不是pending，说明系统已经处理过
	IF v_current_status != 'pending' THEN
		RETURN true;
	END IF;

	-- 4. 更新交易流水状态为 success
	UPDATE user_transactions
	SET 
		transaction_status = 'success',
		succeeded_at = NOW()
	WHERE id = p_transaction_id;

	IF v_transaction_type = 'pay-to-use' THEN
		-- 5. 更新用户积分余额
		INSERT INTO user_credits (user_id, pay_to_use_balance, subscription_balance) 
		VALUES (v_user_id, v_credits, 0)
		ON CONFLICT (user_id) DO UPDATE
		SET pay_to_use_balance = user_credits.pay_to_use_balance + v_credits;

		-- 6. 记录积分流水
		INSERT INTO credit_logs (user_id, transaction_id, biz_type, paytouse_credit_change, subscription_credit_change)
		VALUES (v_user_id, p_transaction_id, 'recharge', v_credits, 0);
	ELSIF v_transaction_type = 'subscription' THEN
		-- 5. 更新用户积分余额
		INSERT INTO user_credits (user_id, pay_to_use_balance, subscription_balance) 
		VALUES (v_user_id, 0, v_credits)
		ON CONFLICT (user_id) DO UPDATE
		SET subscription_balance = user_credits.subscription_balance + v_credits;

		-- 6. 更新用户订阅
		INSERT INTO user_subscriptions (user_id, plan_tier, billing_cycle, status, current_period_started_at, current_period_ended_at, topup_config_id)
		VALUES (v_user_id, v_plan_tier, v_billing_cycle, 'active', v_subscription_started_at, v_subscription_ended_at, v_topup_config_id)
		ON CONFLICT (user_id) DO UPDATE
		SET
			plan_tier = v_plan_tier,
			billing_cycle = v_billing_cycle,
			status = 'active',
			current_period_started_at = v_subscription_started_at,
			current_period_ended_at = v_subscription_ended_at,
			topup_config_id = v_topup_config_id;

		-- 7. 记录积分流水
		INSERT INTO credit_logs (user_id, transaction_id, biz_type, paytouse_credit_change, subscription_credit_change)
		VALUES (v_user_id, p_transaction_id, 'recharge', 0, v_credits);
	END IF;

	RETURN true;
END;$function$
;


