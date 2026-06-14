alter table "public"."translation_images" drop constraint "translation_images_task_id_fkey";

alter table "public"."translation_tasks" drop constraint "translation_tasks_user_id_fkey";


  create table "public"."credit_logs" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid not null,
    "task_id" uuid,
    "transaction_id" uuid,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now(),
    "biz_type" text,
    "subscription_credit_change" bigint not null default '0'::bigint,
    "paytouse_credit_change" bigint not null default '0'::bigint,
    "total_credit_change" bigint not null default '0'::bigint,
    "subscription_frozen_change" bigint not null default '0'::bigint,
    "paytouse_frozen_change" bigint not null default '0'::bigint,
    "image_id" uuid
      );


alter table "public"."credit_logs" enable row level security;


  create table "public"."pricing_config" (
    "id" uuid not null default gen_random_uuid(),
    "model_name" text not null,
    "credit_per_image" bigint not null,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now(),
    "translator" text not null
      );


alter table "public"."pricing_config" enable row level security;


  create table "public"."topup_config" (
    "plan_tier" text,
    "billing_cycle" text,
    "price" numeric not null,
    "credits_included" bigint not null,
    "is_active" boolean not null default false,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now(),
    "id" uuid not null default gen_random_uuid(),
    "transaction_type" text not null,
    "stripe_price_id" text not null,
    "pack_tier" text
      );


alter table "public"."topup_config" enable row level security;


  create table "public"."user_credits" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now(),
    "user_id" uuid not null,
    "pay_to_use_balance" bigint not null default '0'::bigint,
    "subscription_balance" bigint not null default '0'::bigint,
    "pay_to_use_frozen" bigint not null default '0'::bigint,
    "subscription_frozen" bigint not null default '0'::bigint
      );


alter table "public"."user_credits" enable row level security;


  create table "public"."user_subscriptions" (
    "user_id" uuid not null,
    "plan_tier" text not null,
    "billing_cycle" text not null,
    "status" text not null,
    "current_period_started_at" timestamp with time zone not null,
    "current_period_ended_at" timestamp with time zone not null,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now(),
    "id" uuid not null default gen_random_uuid()
      );


alter table "public"."user_subscriptions" enable row level security;


  create table "public"."user_transactions" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now(),
    "user_id" uuid not null,
    "subscription_started_at" timestamp with time zone,
    "subscription_ended_at" timestamp with time zone,
    "recharge_amount" numeric not null,
    "credits" bigint,
    "transaction_type" text not null,
    "transaction_status" text not null,
    "plan_tier" text,
    "billing_cycle" text,
    "succeeded_at" timestamp with time zone,
    "failed_at" timestamp with time zone,
    "canceled_at" timestamp with time zone,
    "pack_tier" text,
    "stripe_session_id" text
      );


alter table "public"."user_transactions" enable row level security;

alter table "public"."translation_images" add column "credits" bigint not null default '0'::bigint;

alter table "public"."translation_images" add column "filename" text not null default ''''''::text;

alter table "public"."translation_tasks" add column "credit_per_image" bigint not null default '0'::bigint;

alter table "public"."translation_tasks" add column "total_credits" bigint not null default '0'::bigint;

CREATE UNIQUE INDEX credit_logs_pkey ON public.credit_logs USING btree (id);

CREATE UNIQUE INDEX pricing_config_pkey ON public.pricing_config USING btree (id);

CREATE UNIQUE INDEX subscription_plans_pkey ON public.topup_config USING btree (id);

CREATE UNIQUE INDEX user_credits_pkey ON public.user_credits USING btree (id);

CREATE UNIQUE INDEX user_credits_user_id_key ON public.user_credits USING btree (user_id);

CREATE UNIQUE INDEX user_subscriptions_pkey ON public.user_subscriptions USING btree (id);

CREATE UNIQUE INDEX user_subscriptions_user_id_key ON public.user_subscriptions USING btree (user_id);

CREATE UNIQUE INDEX user_transactions_pkey ON public.user_transactions USING btree (id);

CREATE UNIQUE INDEX user_transactions_stripe_session_id_key ON public.user_transactions USING btree (stripe_session_id);

alter table "public"."credit_logs" add constraint "credit_logs_pkey" PRIMARY KEY using index "credit_logs_pkey";

alter table "public"."pricing_config" add constraint "pricing_config_pkey" PRIMARY KEY using index "pricing_config_pkey";

alter table "public"."topup_config" add constraint "subscription_plans_pkey" PRIMARY KEY using index "subscription_plans_pkey";

alter table "public"."user_credits" add constraint "user_credits_pkey" PRIMARY KEY using index "user_credits_pkey";

alter table "public"."user_subscriptions" add constraint "user_subscriptions_pkey" PRIMARY KEY using index "user_subscriptions_pkey";

alter table "public"."user_transactions" add constraint "user_transactions_pkey" PRIMARY KEY using index "user_transactions_pkey";

alter table "public"."credit_logs" add constraint "credit_logs_transaction_id_fkey" FOREIGN KEY (transaction_id) REFERENCES public.user_transactions(id) ON UPDATE CASCADE not valid;

alter table "public"."credit_logs" validate constraint "credit_logs_transaction_id_fkey";

alter table "public"."credit_logs" add constraint "credit_logs_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON UPDATE CASCADE not valid;

alter table "public"."credit_logs" validate constraint "credit_logs_user_id_fkey";

alter table "public"."user_credits" add constraint "user_credits_pay_to_use_balance_check" CHECK ((pay_to_use_balance >= 0)) not valid;

alter table "public"."user_credits" validate constraint "user_credits_pay_to_use_balance_check";

alter table "public"."user_credits" add constraint "user_credits_subscription_balance_check" CHECK ((subscription_balance >= 0)) not valid;

alter table "public"."user_credits" validate constraint "user_credits_subscription_balance_check";

alter table "public"."user_credits" add constraint "user_credits_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON UPDATE CASCADE not valid;

alter table "public"."user_credits" validate constraint "user_credits_user_id_fkey";

alter table "public"."user_credits" add constraint "user_credits_user_id_key" UNIQUE using index "user_credits_user_id_key";

alter table "public"."user_subscriptions" add constraint "user_subscriptions_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON UPDATE CASCADE not valid;

alter table "public"."user_subscriptions" validate constraint "user_subscriptions_user_id_fkey";

alter table "public"."user_subscriptions" add constraint "user_subscriptions_user_id_key" UNIQUE using index "user_subscriptions_user_id_key";

alter table "public"."user_transactions" add constraint "user_transactions_stripe_session_id_key" UNIQUE using index "user_transactions_stripe_session_id_key";

alter table "public"."user_transactions" add constraint "user_transactions_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON UPDATE CASCADE not valid;

alter table "public"."user_transactions" validate constraint "user_transactions_user_id_fkey";

alter table "public"."translation_images" add constraint "translation_images_task_id_fkey" FOREIGN KEY (task_id) REFERENCES public.translation_tasks(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."translation_images" validate constraint "translation_images_task_id_fkey";

alter table "public"."translation_tasks" add constraint "translation_tasks_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON UPDATE CASCADE not valid;

alter table "public"."translation_tasks" validate constraint "translation_tasks_user_id_fkey";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.capture_image_credits(p_user_id uuid, p_task_id uuid, p_image_id uuid, p_consume_credits bigint)
 RETURNS void
 LANGUAGE plpgsql
AS $function$DECLARE
	v_sub_freeze int8;
	v_pay_freeze int8;
	v_sub_capture int8 := 0;
	v_pay_capture int8 := 0;
BEGIN
	-- 锁行user_credits，判断冻结积分是否足够核销
	SELECT pay_to_use_frozen, subscription_frozen
	INTO v_pay_freeze, v_sub_freeze
	FROM user_credits
	WHERE user_id = p_user_id
	FOR UPDATE;

	IF (v_pay_freeze + v_sub_freeze) < p_consume_credits THEN
		RAISE EXCEPTION 'not enough frozen credits' USING ERRCODE = 'U0002';
	END IF;

	-- user_credits 核销已冻结积分，优先核销订阅积分
	IF v_sub_freeze >= p_consume_credits THEN
		v_sub_capture = p_consume_credits;
	ELSE
		v_sub_capture = v_sub_freeze;
		v_pay_capture = p_consume_credits - v_sub_freeze;
	END IF;

	-- 更新user_credits
	UPDATE user_credits
	SET subscription_frozen = subscription_frozen - v_sub_capture,
		pay_to_use_frozen = pay_to_use_frozen - v_pay_capture
	WHERE user_id = p_user_id;

	-- 插入credit_logs流水
	INSERT INTO credit_logs (user_id, task_id, image_id, biz_type, subscription_credit_change, 
		paytouse_credit_change, subscription_frozen_change, paytouse_frozen_change)
	VALUES (p_user_id, p_task_id, p_image_id, 'IMAGE_CAPTURE', 0, 0, -v_sub_capture, -v_pay_capture);
END;$function$
;

CREATE OR REPLACE FUNCTION public.freeze_task_credits(p_user_id uuid, p_task_id uuid, p_credits bigint)
 RETURNS void
 LANGUAGE plpgsql
AS $function$DECLARE
	v_sub_balance int8;
	v_pay_balance int8;
	v_sub_freeze int8 := 0;
	v_pay_freeze int8 := 0;
BEGIN
	-- 锁定user_credits，判断积分是否足够
	SELECT pay_to_use_balance, subscription_balance 
	INTO v_pay_balance, v_sub_balance
	FROM user_credits
	WHERE user_id = p_user_id
	FOR UPDATE;

	IF (v_pay_balance + v_sub_balance) < p_credits THEN
		RAISE EXCEPTION 'not enough credits' USING ERRCODE = 'U0001';
	END IF;

	-- 优先扣订阅积分
	IF v_sub_balance >= p_credits THEN
		v_sub_freeze = p_credits;
	ELSE
		v_sub_freeze = v_sub_balance;
		v_pay_freeze = p_credits - v_sub_balance;
	END IF;

	-- 冻结用户积分
	UPDATE user_credits
	SET pay_to_use_balance = pay_to_use_balance - v_pay_freeze,
		pay_to_use_frozen = pay_to_use_frozen + v_pay_freeze,
		subscription_balance = subscription_balance - v_sub_freeze,
		subscription_frozen = subscription_frozen + v_sub_freeze
	WHERE user_id = p_user_id;

	-- credit_logs 流水
	INSERT INTO credit_logs (user_id, task_id, biz_type, subscription_credit_change, paytouse_credit_change, subscription_frozen_change, paytouse_frozen_change)
	VALUES (p_user_id, p_task_id, 'TASK_FREEZE', -v_sub_freeze, -v_pay_freeze, v_sub_freeze, v_pay_freeze);
END;$function$
;

CREATE OR REPLACE FUNCTION public.refund_image_credits(p_user_id uuid, p_task_id uuid, p_image_id uuid, p_refund_credits bigint)
 RETURNS void
 LANGUAGE plpgsql
AS $function$DECLARE
	v_sub_freeze int8;
	v_pay_freeze int8;
	v_sub_refund int8 := 0;
	v_pay_refund int8 := 0;
BEGIN
	-- 锁行user_credits 检查冻结积分是否足够退款
	SELECT pay_to_use_frozen, subscription_frozen
	INTO v_pay_freeze, v_sub_freeze
	FROM user_credits
	WHERE user_id = p_user_id
	FOR UPDATE;

	IF (v_pay_freeze + v_sub_freeze) < p_refund_credits THEN
		RAISE EXCEPTION 'not enough frozen credits to refund' USING ERRCODE = 'U0003';
	END IF;

	-- 扣款时优先扣订阅，这里也优先回退订阅积分
	IF v_sub_freeze >= p_refund_credits THEN
		v_sub_refund = p_refund_credits;
	ELSE
		v_sub_refund = v_sub_freeze;
		v_pay_refund = p_refund_credits - v_sub_freeze;
	END IF;

	-- user_credits 增加积分
	UPDATE user_credits
	SET pay_to_use_balance = pay_to_use_balance + v_pay_refund,
		subscription_balance = subscription_balance + v_sub_refund,
		pay_to_use_frozen = pay_to_use_frozen - v_pay_refund,
		subscription_frozen = subscription_frozen - v_sub_freeze
	WHERE user_id = p_user_id;

	-- credit_logs 记录流水
	INSERT INTO credit_logs (user_id, task_id, image_id, biz_type, subscription_credit_change, 
		paytouse_credit_change, subscription_frozen_change, paytouse_frozen_change)
	VALUES (p_user_id, p_task_id, p_image_id, 'IMAGE_REFUND', v_sub_refund, 
		v_pay_refund, -v_sub_refund, -v_pay_refund);
END;$function$
;

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
BEGIN
	-- 1. 锁住这行订单数据，并捞出当前状态和用户ID（SELECT ... FOR UPDATE 强行排他锁，防止并发重试）
	SELECT transaction_status, transaction_type, user_id, credits, plan_tier, billing_cycle, subscription_started_at, subscription_ended_at
	INTO v_current_status, v_transaction_type, v_user_id, v_credits, v_plan_tier, v_billing_cycle, v_subscription_started_at, v_subscription_ended_at
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
		INSERT INTO user_subscriptions (user_id, plan_tier, billing_cycle, status, current_period_started_at, current_period_ended_at)
		VALUES (v_user_id, v_plan_tier, v_billing_cycle, 'active', v_subscription_started_at, v_subscription_ended_at)
		ON CONFLICT (user_id) DO UPDATE
		SET
			plan_tier = v_plan_tier,
			billing_cycle = v_billing_cycle,
			status = 'active',
			current_period_started_at = v_subscription_started_at,
			current_period_ended_at = v_subscription_ended_at;

		-- 7. 记录积分流水
		INSERT INTO credit_logs (user_id, transaction_id, biz_type, paytouse_credit_change, subscription_credit_change)
		VALUES (v_user_id, p_transaction_id, 'recharge', 0, v_credits);
	END IF;

	RETURN true;
END;$function$
;

CREATE OR REPLACE FUNCTION public.update_total_credit_change()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    -- 在写入前，自动将两个变动字段相加，赋值给 total_credit_change
    -- NEW 代表当前准备插入的那一行数据
    NEW.total_credit_change := COALESCE(NEW.subscription_credit_change, 0) + COALESCE(NEW.paytouse_credit_change, 0);    
    
    -- 必须返回 NEW，否则这一行数据会被数据库丢弃
    RETURN NEW;
END;
$function$
;

grant delete on table "public"."credit_logs" to "anon";

grant insert on table "public"."credit_logs" to "anon";

grant references on table "public"."credit_logs" to "anon";

grant select on table "public"."credit_logs" to "anon";

grant trigger on table "public"."credit_logs" to "anon";

grant truncate on table "public"."credit_logs" to "anon";

grant update on table "public"."credit_logs" to "anon";

grant delete on table "public"."credit_logs" to "authenticated";

grant insert on table "public"."credit_logs" to "authenticated";

grant references on table "public"."credit_logs" to "authenticated";

grant select on table "public"."credit_logs" to "authenticated";

grant trigger on table "public"."credit_logs" to "authenticated";

grant truncate on table "public"."credit_logs" to "authenticated";

grant update on table "public"."credit_logs" to "authenticated";

grant delete on table "public"."credit_logs" to "service_role";

grant insert on table "public"."credit_logs" to "service_role";

grant references on table "public"."credit_logs" to "service_role";

grant select on table "public"."credit_logs" to "service_role";

grant trigger on table "public"."credit_logs" to "service_role";

grant truncate on table "public"."credit_logs" to "service_role";

grant update on table "public"."credit_logs" to "service_role";

grant delete on table "public"."pricing_config" to "anon";

grant insert on table "public"."pricing_config" to "anon";

grant references on table "public"."pricing_config" to "anon";

grant select on table "public"."pricing_config" to "anon";

grant trigger on table "public"."pricing_config" to "anon";

grant truncate on table "public"."pricing_config" to "anon";

grant update on table "public"."pricing_config" to "anon";

grant delete on table "public"."pricing_config" to "authenticated";

grant insert on table "public"."pricing_config" to "authenticated";

grant references on table "public"."pricing_config" to "authenticated";

grant select on table "public"."pricing_config" to "authenticated";

grant trigger on table "public"."pricing_config" to "authenticated";

grant truncate on table "public"."pricing_config" to "authenticated";

grant update on table "public"."pricing_config" to "authenticated";

grant delete on table "public"."pricing_config" to "service_role";

grant insert on table "public"."pricing_config" to "service_role";

grant references on table "public"."pricing_config" to "service_role";

grant select on table "public"."pricing_config" to "service_role";

grant trigger on table "public"."pricing_config" to "service_role";

grant truncate on table "public"."pricing_config" to "service_role";

grant update on table "public"."pricing_config" to "service_role";

grant delete on table "public"."topup_config" to "anon";

grant insert on table "public"."topup_config" to "anon";

grant references on table "public"."topup_config" to "anon";

grant select on table "public"."topup_config" to "anon";

grant trigger on table "public"."topup_config" to "anon";

grant truncate on table "public"."topup_config" to "anon";

grant update on table "public"."topup_config" to "anon";

grant delete on table "public"."topup_config" to "authenticated";

grant insert on table "public"."topup_config" to "authenticated";

grant references on table "public"."topup_config" to "authenticated";

grant select on table "public"."topup_config" to "authenticated";

grant trigger on table "public"."topup_config" to "authenticated";

grant truncate on table "public"."topup_config" to "authenticated";

grant update on table "public"."topup_config" to "authenticated";

grant delete on table "public"."topup_config" to "service_role";

grant insert on table "public"."topup_config" to "service_role";

grant references on table "public"."topup_config" to "service_role";

grant select on table "public"."topup_config" to "service_role";

grant trigger on table "public"."topup_config" to "service_role";

grant truncate on table "public"."topup_config" to "service_role";

grant update on table "public"."topup_config" to "service_role";

grant delete on table "public"."user_credits" to "anon";

grant insert on table "public"."user_credits" to "anon";

grant references on table "public"."user_credits" to "anon";

grant select on table "public"."user_credits" to "anon";

grant trigger on table "public"."user_credits" to "anon";

grant truncate on table "public"."user_credits" to "anon";

grant update on table "public"."user_credits" to "anon";

grant delete on table "public"."user_credits" to "authenticated";

grant insert on table "public"."user_credits" to "authenticated";

grant references on table "public"."user_credits" to "authenticated";

grant select on table "public"."user_credits" to "authenticated";

grant trigger on table "public"."user_credits" to "authenticated";

grant truncate on table "public"."user_credits" to "authenticated";

grant update on table "public"."user_credits" to "authenticated";

grant delete on table "public"."user_credits" to "service_role";

grant insert on table "public"."user_credits" to "service_role";

grant references on table "public"."user_credits" to "service_role";

grant select on table "public"."user_credits" to "service_role";

grant trigger on table "public"."user_credits" to "service_role";

grant truncate on table "public"."user_credits" to "service_role";

grant update on table "public"."user_credits" to "service_role";

grant delete on table "public"."user_subscriptions" to "anon";

grant insert on table "public"."user_subscriptions" to "anon";

grant references on table "public"."user_subscriptions" to "anon";

grant select on table "public"."user_subscriptions" to "anon";

grant trigger on table "public"."user_subscriptions" to "anon";

grant truncate on table "public"."user_subscriptions" to "anon";

grant update on table "public"."user_subscriptions" to "anon";

grant delete on table "public"."user_subscriptions" to "authenticated";

grant insert on table "public"."user_subscriptions" to "authenticated";

grant references on table "public"."user_subscriptions" to "authenticated";

grant select on table "public"."user_subscriptions" to "authenticated";

grant trigger on table "public"."user_subscriptions" to "authenticated";

grant truncate on table "public"."user_subscriptions" to "authenticated";

grant update on table "public"."user_subscriptions" to "authenticated";

grant delete on table "public"."user_subscriptions" to "service_role";

grant insert on table "public"."user_subscriptions" to "service_role";

grant references on table "public"."user_subscriptions" to "service_role";

grant select on table "public"."user_subscriptions" to "service_role";

grant trigger on table "public"."user_subscriptions" to "service_role";

grant truncate on table "public"."user_subscriptions" to "service_role";

grant update on table "public"."user_subscriptions" to "service_role";

grant delete on table "public"."user_transactions" to "anon";

grant insert on table "public"."user_transactions" to "anon";

grant references on table "public"."user_transactions" to "anon";

grant select on table "public"."user_transactions" to "anon";

grant trigger on table "public"."user_transactions" to "anon";

grant truncate on table "public"."user_transactions" to "anon";

grant update on table "public"."user_transactions" to "anon";

grant delete on table "public"."user_transactions" to "authenticated";

grant insert on table "public"."user_transactions" to "authenticated";

grant references on table "public"."user_transactions" to "authenticated";

grant select on table "public"."user_transactions" to "authenticated";

grant trigger on table "public"."user_transactions" to "authenticated";

grant truncate on table "public"."user_transactions" to "authenticated";

grant update on table "public"."user_transactions" to "authenticated";

grant delete on table "public"."user_transactions" to "service_role";

grant insert on table "public"."user_transactions" to "service_role";

grant references on table "public"."user_transactions" to "service_role";

grant select on table "public"."user_transactions" to "service_role";

grant trigger on table "public"."user_transactions" to "service_role";

grant truncate on table "public"."user_transactions" to "service_role";

grant update on table "public"."user_transactions" to "service_role";


  create policy "Enable read access for all users"
  on "public"."pricing_config"
  as permissive
  for select
  to public
using (true);



  create policy "Enable read access for all users"
  on "public"."topup_config"
  as permissive
  for select
  to public
using (true);



  create policy "Enable users to view their own data only"
  on "public"."user_credits"
  as permissive
  for select
  to authenticated
using ((( SELECT auth.uid() AS uid) = user_id));



  create policy "Enable users to view their own data only"
  on "public"."user_subscriptions"
  as permissive
  for select
  to authenticated
using ((( SELECT auth.uid() AS uid) = user_id));



  create policy "Enable insert for users based on user_id"
  on "public"."user_transactions"
  as permissive
  for insert
  to public
with check ((( SELECT auth.uid() AS uid) = user_id));



  create policy "Enable update for users based on user_id"
  on "public"."user_transactions"
  as permissive
  for update
  to public
using ((( SELECT auth.uid() AS uid) = user_id))
with check ((( SELECT auth.uid() AS uid) = user_id));



  create policy "Enable users to view their own data only"
  on "public"."user_transactions"
  as permissive
  for select
  to authenticated
using ((( SELECT auth.uid() AS uid) = user_id));


CREATE TRIGGER calc_total_credit_change BEFORE INSERT ON public.credit_logs FOR EACH ROW EXECUTE FUNCTION public.update_total_credit_change();

CREATE TRIGGER update_pricing_config_updated_at BEFORE UPDATE ON public.pricing_config FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_credits_updated_at BEFORE UPDATE ON public.user_credits FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_transactions_updated_at BEFORE UPDATE ON public.user_transactions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


