drop function if exists "public"."grant_daily_anonymous_bonus"(p_user_id uuid, p_credits bigint);


  create table "public"."anonymous_trial_grants" (
    "id" uuid not null default gen_random_uuid(),
    "ip_hash" text not null,
    "grant_date" date not null,
    "user_id" uuid not null,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
      );


alter table "public"."anonymous_trial_grants" enable row level security;

CREATE UNIQUE INDEX anonymous_trial_grants_ip_hash_grant_date_key ON public.anonymous_trial_grants USING btree (ip_hash, grant_date);

CREATE UNIQUE INDEX anonymous_trial_grants_pkey ON public.anonymous_trial_grants USING btree (id);

alter table "public"."anonymous_trial_grants" add constraint "anonymous_trial_grants_pkey" PRIMARY KEY using index "anonymous_trial_grants_pkey";

alter table "public"."anonymous_trial_grants" add constraint "anonymous_trial_grants_ip_hash_grant_date_key" UNIQUE using index "anonymous_trial_grants_ip_hash_grant_date_key";

alter table "public"."anonymous_trial_grants" add constraint "anonymous_trial_grants_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."anonymous_trial_grants" validate constraint "anonymous_trial_grants_user_id_fkey";

set check_function_bodies = off;

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

  v_grant_date := public.credit_log_shanghai_date(now());

  SELECT EXISTS (
    SELECT 1
    FROM public.credit_logs
    WHERE user_id = p_user_id
      AND biz_type = 'guest_daily'
      AND public.credit_log_shanghai_date(created_at) = v_grant_date
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

grant delete on table "public"."anonymous_trial_grants" to "anon";

grant insert on table "public"."anonymous_trial_grants" to "anon";

grant references on table "public"."anonymous_trial_grants" to "anon";

grant select on table "public"."anonymous_trial_grants" to "anon";

grant trigger on table "public"."anonymous_trial_grants" to "anon";

grant truncate on table "public"."anonymous_trial_grants" to "anon";

grant update on table "public"."anonymous_trial_grants" to "anon";

grant delete on table "public"."anonymous_trial_grants" to "authenticated";

grant insert on table "public"."anonymous_trial_grants" to "authenticated";

grant references on table "public"."anonymous_trial_grants" to "authenticated";

grant select on table "public"."anonymous_trial_grants" to "authenticated";

grant trigger on table "public"."anonymous_trial_grants" to "authenticated";

grant truncate on table "public"."anonymous_trial_grants" to "authenticated";

grant update on table "public"."anonymous_trial_grants" to "authenticated";

grant delete on table "public"."anonymous_trial_grants" to "service_role";

grant insert on table "public"."anonymous_trial_grants" to "service_role";

grant references on table "public"."anonymous_trial_grants" to "service_role";

grant select on table "public"."anonymous_trial_grants" to "service_role";

grant trigger on table "public"."anonymous_trial_grants" to "service_role";

grant truncate on table "public"."anonymous_trial_grants" to "service_role";

grant update on table "public"."anonymous_trial_grants" to "service_role";

CREATE TRIGGER update_anonymous_trial_grants_updated_at BEFORE UPDATE ON public.anonymous_trial_grants FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


