drop trigger if exists "handle_updated_at" on "public"."profiles";

drop policy "Users can insert own profile" on "public"."profiles";

drop policy "Users can update own profile" on "public"."profiles";

drop policy "Users can view own profile" on "public"."profiles";

revoke delete on table "public"."profiles" from "anon";

revoke insert on table "public"."profiles" from "anon";

revoke references on table "public"."profiles" from "anon";

revoke select on table "public"."profiles" from "anon";

revoke trigger on table "public"."profiles" from "anon";

revoke truncate on table "public"."profiles" from "anon";

revoke update on table "public"."profiles" from "anon";

revoke delete on table "public"."profiles" from "authenticated";

revoke insert on table "public"."profiles" from "authenticated";

revoke references on table "public"."profiles" from "authenticated";

revoke select on table "public"."profiles" from "authenticated";

revoke trigger on table "public"."profiles" from "authenticated";

revoke truncate on table "public"."profiles" from "authenticated";

revoke update on table "public"."profiles" from "authenticated";

revoke delete on table "public"."profiles" from "service_role";

revoke insert on table "public"."profiles" from "service_role";

revoke references on table "public"."profiles" from "service_role";

revoke select on table "public"."profiles" from "service_role";

revoke trigger on table "public"."profiles" from "service_role";

revoke truncate on table "public"."profiles" from "service_role";

revoke update on table "public"."profiles" from "service_role";

alter table "public"."profiles" drop constraint "profiles_user_id_fkey";

alter table "public"."profiles" drop constraint "profiles_username_key";

alter table "public"."profiles" drop constraint "unique_profiles_user_id";

alter table "public"."credits_transactions" drop constraint "credits_transactions_transaction_type_check";

alter table "public"."payment_history" drop constraint "payment_history_plan_type_check";

alter table "public"."payment_history" drop constraint "payment_history_status_check";

alter table "public"."translation_images" drop constraint "translation_images_status_check";

alter table "public"."translation_tasks" drop constraint "translation_tasks_engine_type_check";

alter table "public"."translation_tasks" drop constraint "translation_tasks_source_lang_check";

alter table "public"."translation_tasks" drop constraint "translation_tasks_status_check";

alter table "public"."translation_tasks" drop constraint "translation_tasks_target_lang_check";

alter table "public"."profiles" drop constraint "profiles_pkey";

drop index if exists "public"."idx_profiles_email";

drop index if exists "public"."idx_profiles_user_id";

drop index if exists "public"."idx_profiles_username";

drop index if exists "public"."profiles_pkey";

drop index if exists "public"."profiles_username_key";

drop index if exists "public"."unique_profiles_user_id";

drop table "public"."profiles";

drop sequence if exists "public"."profiles_id_seq";

alter table "public"."credits_transactions" add constraint "credits_transactions_transaction_type_check" CHECK (((transaction_type)::text = ANY ((ARRAY['earn'::character varying, 'spend'::character varying, 'refund'::character varying, 'bonus'::character varying, 'purchase'::character varying])::text[]))) not valid;

alter table "public"."credits_transactions" validate constraint "credits_transactions_transaction_type_check";

alter table "public"."payment_history" add constraint "payment_history_plan_type_check" CHECK (((plan_type)::text = ANY ((ARRAY['basic'::character varying, 'pro'::character varying, 'ultra'::character varying, 'custom'::character varying])::text[]))) not valid;

alter table "public"."payment_history" validate constraint "payment_history_plan_type_check";

alter table "public"."payment_history" add constraint "payment_history_status_check" CHECK (((status)::text = ANY ((ARRAY['pending'::character varying, 'completed'::character varying, 'failed'::character varying, 'refunded'::character varying])::text[]))) not valid;

alter table "public"."payment_history" validate constraint "payment_history_status_check";

alter table "public"."translation_images" add constraint "translation_images_status_check" CHECK (((status)::text = ANY ((ARRAY['pending'::character varying, 'processing'::character varying, 'completed'::character varying, 'failed'::character varying])::text[]))) not valid;

alter table "public"."translation_images" validate constraint "translation_images_status_check";

alter table "public"."translation_tasks" add constraint "translation_tasks_engine_type_check" CHECK (((engine_type)::text = ANY ((ARRAY['standard'::character varying, 'ai'::character varying])::text[]))) not valid;

alter table "public"."translation_tasks" validate constraint "translation_tasks_engine_type_check";

alter table "public"."translation_tasks" add constraint "translation_tasks_source_lang_check" CHECK (((source_lang)::text = ANY ((ARRAY['JPN'::character varying, 'ENG'::character varying, 'KOR'::character varying, 'CHN'::character varying, 'SPA'::character varying, 'FRA'::character varying])::text[]))) not valid;

alter table "public"."translation_tasks" validate constraint "translation_tasks_source_lang_check";

alter table "public"."translation_tasks" add constraint "translation_tasks_status_check" CHECK (((status)::text = ANY ((ARRAY['pending'::character varying, 'processing'::character varying, 'completed'::character varying, 'failed'::character varying, 'cancelled'::character varying])::text[]))) not valid;

alter table "public"."translation_tasks" validate constraint "translation_tasks_status_check";

alter table "public"."translation_tasks" add constraint "translation_tasks_target_lang_check" CHECK (((target_lang)::text = ANY ((ARRAY['JPN'::character varying, 'ENG'::character varying, 'KOR'::character varying, 'CHN'::character varying, 'SPA'::character varying, 'FRA'::character varying])::text[]))) not valid;

alter table "public"."translation_tasks" validate constraint "translation_tasks_target_lang_check";


