alter table "public"."user_transactions" add column "stripe_invoice_id" text;

CREATE UNIQUE INDEX user_transactions_stripe_invoice_id_key ON public.user_transactions USING btree (stripe_invoice_id);

alter table "public"."user_transactions" add constraint "user_transactions_stripe_invoice_id_key" UNIQUE using index "user_transactions_stripe_invoice_id_key";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.expire_subscription_cycle(p_stripe_subscription_id text)
 RETURNS boolean
 LANGUAGE plpgsql
AS $function$
declare
  v_user_id uuid;
  v_status text;
  v_old_balance int8;
begin
  if p_stripe_subscription_id is null or length(trim(p_stripe_subscription_id)) = 0 then
    raise exception 'stripe_subscription_id is required';
  end if;

  -- 锁订阅行
  select user_id, status
  into v_user_id, v_status
  from user_subscriptions
  where stripe_subscription_id = p_stripe_subscription_id
  for update;

  if v_user_id is null then
    -- 本地无记录：重试无意义，视为已处理（避免 webhook 死循环）
    return true;
  end if;

  -- 锁积分行（可能尚无 credits 行）
  select subscription_balance
  into v_old_balance
  from user_credits
  where user_id = v_user_id
  for update;

  if not found then
    insert into user_credits (user_id, pay_to_use_balance, subscription_balance)
    values (v_user_id, 0, 0);
    v_old_balance := 0;
  end if;

  -- 幂等：已过期且可用余额已为 0 → 直接成功
  -- （frozen 可能仍 > 0，留给任务核销/退回自然消化）
  if v_status = 'expired' and coalesce(v_old_balance, 0) = 0 then
    return true;
  end if;

  update user_subscriptions
  set
    status = 'expired',
    updated_at = now()
  where stripe_subscription_id = p_stripe_subscription_id;

  -- 只清可用订阅积分；不动 subscription_frozen / pay_to_use_*
  if coalesce(v_old_balance, 0) <> 0 then
    update user_credits
    set subscription_balance = 0
    where user_id = v_user_id;

    insert into credit_logs (
      user_id,
      transaction_id,
      biz_type,
      paytouse_credit_change,
      subscription_credit_change
    )
    values (
      v_user_id,
      null,
      'subscription_expire',
      0,
      -v_old_balance
    );
  end if;

  return true;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.renew_subscription_cycle(p_stripe_subscription_id text, p_stripe_invoice_id text, p_period_started_at timestamp with time zone, p_period_ended_at timestamp with time zone)
 RETURNS uuid
 LANGUAGE plpgsql
AS $function$
declare
  v_user_id uuid;
  v_topup_config_id uuid;
  v_plan_tier text;
  v_billing_cycle text;
  v_credits int8;
  v_price numeric;
  v_old_balance int8;
  v_delta int8;
  v_transaction_id uuid;
begin
  if p_stripe_subscription_id is null or length(trim(p_stripe_subscription_id)) = 0 then
    raise exception 'stripe_subscription_id is required';
  end if;
  if p_stripe_invoice_id is null or length(trim(p_stripe_invoice_id)) = 0 then
    raise exception 'stripe_invoice_id is required';
  end if;
  if p_period_started_at is null or p_period_ended_at is null then
    raise exception 'period bounds are required';
  end if;
  -- 幂等：同一 invoice 已成功处理过则直接返回
  select id into v_transaction_id
  from user_transactions
  where stripe_invoice_id = p_stripe_invoice_id
  limit 1;
  if v_transaction_id is not null then
    return v_transaction_id;
  end if;
  -- 锁订阅行，解析用户与当前套餐配置
  select user_id, topup_config_id, plan_tier, billing_cycle
  into v_user_id, v_topup_config_id, v_plan_tier, v_billing_cycle
  from user_subscriptions
  where stripe_subscription_id = p_stripe_subscription_id
  for update;
  if v_user_id is null then
    raise exception 'subscription not found for stripe_subscription_id=%', p_stripe_subscription_id;
  end if;
  select credits_included, price
  into v_credits, v_price
  from topup_config
  where id = v_topup_config_id;
  if v_credits is null then
    raise exception 'topup_config not found: %', v_topup_config_id;
  end if;

  -- 锁积分行
  select subscription_balance
  into v_old_balance
  from user_credits
  where user_id = v_user_id
  for update;
  if not found then
    insert into user_credits (user_id, pay_to_use_balance, subscription_balance)
    values (v_user_id, 0, 0);
    v_old_balance := 0;
  end if;
  v_delta := v_credits - coalesce(v_old_balance, 0);
  -- 账单：直接 success（续费无 pending 前置）
  insert into user_transactions (
    user_id,
    transaction_type,
    transaction_status,
    plan_tier,
    billing_cycle,
    credits,
    recharge_amount,
    subscription_started_at,
    subscription_ended_at,
    topup_config_id,
    stripe_subscription_id,
    stripe_invoice_id,
    succeeded_at
  )
  values (
    v_user_id,
    'subscription_renewal',
    'success',
    v_plan_tier,
    v_billing_cycle,
    v_credits,
    v_price,
    p_period_started_at,
    p_period_ended_at,
    v_topup_config_id,
    p_stripe_subscription_id,
    p_stripe_invoice_id,
    now()
  )
  returning id into v_transaction_id;
  -- 覆盖可用订阅积分（frozen 保持不动，随任务核销/退回）
  update user_credits
  set subscription_balance = v_credits
  where user_id = v_user_id;
  -- 滚周期；确保仍为 active（若本地曾标 canceled 待取消，续费成功应回到 active——按产品可再收紧）
  update user_subscriptions
  set
    status = 'active',
    current_period_started_at = p_period_started_at,
    current_period_ended_at = p_period_ended_at,
    updated_at = now()
  where stripe_subscription_id = p_stripe_subscription_id;
  -- 流水：记真实 delta（旧剩 200、新额 1000 → +800；旧剩 1500 → -500）
  insert into credit_logs (
    user_id,
    transaction_id,
    biz_type,
    paytouse_credit_change,
    subscription_credit_change
  )
  values (
    v_user_id,
    v_transaction_id,
    'subscription_renewal',
    0,
    v_delta
  );
  return v_transaction_id;
exception
  when unique_violation then
    -- 并发 webhook：唯一约束冲突后读已有行
    select id into v_transaction_id
    from user_transactions
    where stripe_invoice_id = p_stripe_invoice_id
    limit 1;
    return v_transaction_id;
end;
$function$
;


