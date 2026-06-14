drop trigger if exists "handle_updated_at" on "public"."credits_transactions";

drop trigger if exists "handle_updated_at" on "public"."payment_history";

drop trigger if exists "handle_updated_at" on "public"."translation_cache";

drop trigger if exists "handle_updated_at" on "public"."translation_images";

drop trigger if exists "handle_updated_at" on "public"."translation_tasks";

drop trigger if exists "handle_updated_at" on "public"."user_credits";

drop policy "Users can view their own transactions" on "public"."credits_transactions";

drop policy "Users can view their own payment history" on "public"."payment_history";

drop policy "Authenticated users can view cache" on "public"."translation_cache";

drop policy "Service role can manage cache" on "public"."translation_cache";

drop policy "Users can insert images for their tasks" on "public"."translation_images";

drop policy "Users can update images of their tasks" on "public"."translation_images";

drop policy "Users can view images of their tasks" on "public"."translation_images";

drop policy "Users can delete their own tasks" on "public"."translation_tasks";

drop policy "Users can update their own tasks" on "public"."translation_tasks";

drop policy "Users can insert their own credits" on "public"."user_credits";

drop policy "Users can update their own credits" on "public"."user_credits";

drop policy "Users can view their own credits" on "public"."user_credits";

revoke delete on table "public"."credits_transactions" from "anon";

revoke insert on table "public"."credits_transactions" from "anon";

revoke references on table "public"."credits_transactions" from "anon";

revoke select on table "public"."credits_transactions" from "anon";

revoke trigger on table "public"."credits_transactions" from "anon";

revoke truncate on table "public"."credits_transactions" from "anon";

revoke update on table "public"."credits_transactions" from "anon";

revoke delete on table "public"."credits_transactions" from "authenticated";

revoke insert on table "public"."credits_transactions" from "authenticated";

revoke references on table "public"."credits_transactions" from "authenticated";

revoke select on table "public"."credits_transactions" from "authenticated";

revoke trigger on table "public"."credits_transactions" from "authenticated";

revoke truncate on table "public"."credits_transactions" from "authenticated";

revoke update on table "public"."credits_transactions" from "authenticated";

revoke delete on table "public"."credits_transactions" from "service_role";

revoke insert on table "public"."credits_transactions" from "service_role";

revoke references on table "public"."credits_transactions" from "service_role";

revoke select on table "public"."credits_transactions" from "service_role";

revoke trigger on table "public"."credits_transactions" from "service_role";

revoke truncate on table "public"."credits_transactions" from "service_role";

revoke update on table "public"."credits_transactions" from "service_role";

revoke delete on table "public"."payment_history" from "anon";

revoke insert on table "public"."payment_history" from "anon";

revoke references on table "public"."payment_history" from "anon";

revoke select on table "public"."payment_history" from "anon";

revoke trigger on table "public"."payment_history" from "anon";

revoke truncate on table "public"."payment_history" from "anon";

revoke update on table "public"."payment_history" from "anon";

revoke delete on table "public"."payment_history" from "authenticated";

revoke insert on table "public"."payment_history" from "authenticated";

revoke references on table "public"."payment_history" from "authenticated";

revoke select on table "public"."payment_history" from "authenticated";

revoke trigger on table "public"."payment_history" from "authenticated";

revoke truncate on table "public"."payment_history" from "authenticated";

revoke update on table "public"."payment_history" from "authenticated";

revoke delete on table "public"."payment_history" from "service_role";

revoke insert on table "public"."payment_history" from "service_role";

revoke references on table "public"."payment_history" from "service_role";

revoke select on table "public"."payment_history" from "service_role";

revoke trigger on table "public"."payment_history" from "service_role";

revoke truncate on table "public"."payment_history" from "service_role";

revoke update on table "public"."payment_history" from "service_role";

revoke delete on table "public"."translation_cache" from "anon";

revoke insert on table "public"."translation_cache" from "anon";

revoke references on table "public"."translation_cache" from "anon";

revoke select on table "public"."translation_cache" from "anon";

revoke trigger on table "public"."translation_cache" from "anon";

revoke truncate on table "public"."translation_cache" from "anon";

revoke update on table "public"."translation_cache" from "anon";

revoke delete on table "public"."translation_cache" from "authenticated";

revoke insert on table "public"."translation_cache" from "authenticated";

revoke references on table "public"."translation_cache" from "authenticated";

revoke select on table "public"."translation_cache" from "authenticated";

revoke trigger on table "public"."translation_cache" from "authenticated";

revoke truncate on table "public"."translation_cache" from "authenticated";

revoke update on table "public"."translation_cache" from "authenticated";

revoke delete on table "public"."translation_cache" from "service_role";

revoke insert on table "public"."translation_cache" from "service_role";

revoke references on table "public"."translation_cache" from "service_role";

revoke select on table "public"."translation_cache" from "service_role";

revoke trigger on table "public"."translation_cache" from "service_role";

revoke truncate on table "public"."translation_cache" from "service_role";

revoke update on table "public"."translation_cache" from "service_role";

revoke delete on table "public"."user_credits" from "anon";

revoke insert on table "public"."user_credits" from "anon";

revoke references on table "public"."user_credits" from "anon";

revoke select on table "public"."user_credits" from "anon";

revoke trigger on table "public"."user_credits" from "anon";

revoke truncate on table "public"."user_credits" from "anon";

revoke update on table "public"."user_credits" from "anon";

revoke delete on table "public"."user_credits" from "authenticated";

revoke insert on table "public"."user_credits" from "authenticated";

revoke references on table "public"."user_credits" from "authenticated";

revoke select on table "public"."user_credits" from "authenticated";

revoke trigger on table "public"."user_credits" from "authenticated";

revoke truncate on table "public"."user_credits" from "authenticated";

revoke update on table "public"."user_credits" from "authenticated";

revoke delete on table "public"."user_credits" from "service_role";

revoke insert on table "public"."user_credits" from "service_role";

revoke references on table "public"."user_credits" from "service_role";

revoke select on table "public"."user_credits" from "service_role";

revoke trigger on table "public"."user_credits" from "service_role";

revoke truncate on table "public"."user_credits" from "service_role";

revoke update on table "public"."user_credits" from "service_role";

alter table "public"."credits_transactions" drop constraint "credits_transactions_balance_after_check";

alter table "public"."credits_transactions" drop constraint "credits_transactions_payment_id_fkey";

alter table "public"."credits_transactions" drop constraint "credits_transactions_task_id_fkey";

alter table "public"."credits_transactions" drop constraint "credits_transactions_transaction_type_check";

alter table "public"."credits_transactions" drop constraint "credits_transactions_user_id_fkey";

alter table "public"."payment_history" drop constraint "payment_history_amount_check";

alter table "public"."payment_history" drop constraint "payment_history_credits_purchased_check";

alter table "public"."payment_history" drop constraint "payment_history_plan_type_check";

alter table "public"."payment_history" drop constraint "payment_history_status_check";

alter table "public"."payment_history" drop constraint "payment_history_transaction_id_key";

alter table "public"."payment_history" drop constraint "payment_history_user_id_fkey";

alter table "public"."translation_images" drop constraint "translation_images_page_number_check";

alter table "public"."translation_images" drop constraint "unique_task_page";

alter table "public"."translation_tasks" drop constraint "check_lang_diff";

alter table "public"."translation_tasks" drop constraint "translation_tasks_credits_consumed_check";

alter table "public"."translation_tasks" drop constraint "translation_tasks_engine_type_check";

alter table "public"."translation_tasks" drop constraint "translation_tasks_image_count_check";

alter table "public"."translation_tasks" drop constraint "translation_tasks_source_lang_check";

alter table "public"."translation_tasks" drop constraint "translation_tasks_target_lang_check";

alter table "public"."user_credits" drop constraint "unique_user_credits";

alter table "public"."user_credits" drop constraint "user_credits_balance_check";

alter table "public"."user_credits" drop constraint "user_credits_total_earned_check";

alter table "public"."user_credits" drop constraint "user_credits_total_used_check";

alter table "public"."user_credits" drop constraint "user_credits_user_id_fkey";

alter table "public"."translation_images" drop constraint "translation_images_status_check";

alter table "public"."translation_tasks" drop constraint "translation_tasks_status_check";

alter table "public"."credits_transactions" drop constraint "credits_transactions_pkey";

alter table "public"."payment_history" drop constraint "payment_history_pkey";

alter table "public"."translation_cache" drop constraint "translation_cache_pkey";

alter table "public"."user_credits" drop constraint "user_credits_pkey";

drop index if exists "public"."credits_transactions_pkey";

drop index if exists "public"."idx_credits_transactions_created_at";

drop index if exists "public"."idx_credits_transactions_task_id";

drop index if exists "public"."idx_credits_transactions_user_id";

drop index if exists "public"."idx_payment_history_created_at";

drop index if exists "public"."idx_payment_history_status";

drop index if exists "public"."idx_payment_history_transaction_id";

drop index if exists "public"."idx_payment_history_user_id";

drop index if exists "public"."idx_translation_cache_accessed_at";

drop index if exists "public"."idx_translation_cache_hash_langs";

drop index if exists "public"."idx_translation_images_hash";

drop index if exists "public"."idx_translation_tasks_expires_at";

drop index if exists "public"."idx_user_credits_balance";

drop index if exists "public"."idx_user_credits_user_id";

drop index if exists "public"."payment_history_pkey";

drop index if exists "public"."payment_history_transaction_id_key";

drop index if exists "public"."translation_cache_pkey";

drop index if exists "public"."unique_task_page";

drop index if exists "public"."unique_user_credits";

drop index if exists "public"."user_credits_pkey";

drop table "public"."credits_transactions";

drop table "public"."payment_history";

drop table "public"."translation_cache";

drop table "public"."user_credits";

alter table "public"."translation_images" drop column "extracted_text";

alter table "public"."translation_images" drop column "original_hash";

alter table "public"."translation_images" drop column "original_url";

alter table "public"."translation_images" drop column "page_number";

alter table "public"."translation_images" drop column "processing_time";

alter table "public"."translation_images" drop column "translated_text";

alter table "public"."translation_images" drop column "translated_url";

alter table "public"."translation_images" add column "completed_at" timestamp with time zone;

alter table "public"."translation_images" add column "folder_name" text;

alter table "public"."translation_images" add column "image_index" integer not null;

alter table "public"."translation_images" add column "max_retries" integer default 3;

alter table "public"."translation_images" add column "metadata" jsonb default '{}'::jsonb;

alter table "public"."translation_images" add column "original_image_height" integer;

alter table "public"."translation_images" add column "original_image_size" integer;

alter table "public"."translation_images" add column "original_image_url" text not null;

alter table "public"."translation_images" add column "original_image_width" integer;

alter table "public"."translation_images" add column "result_image_url" text;

alter table "public"."translation_images" add column "retry_count" integer default 0;

alter table "public"."translation_images" add column "started_at" timestamp with time zone;

alter table "public"."translation_images" alter column "created_at" drop not null;

alter table "public"."translation_images" alter column "id" drop default;

alter table "public"."translation_images" alter column "id" set data type uuid using md5("id"::text)::uuid;

alter table "public"."translation_images" alter column "id" set default gen_random_uuid();

alter table "public"."translation_images" alter column "status" drop default;

alter table "public"."translation_images" alter column "status" set data type text using "status"::text;

alter table "public"."translation_images" drop constraint if exists "translation_images_task_id_fkey";

alter table "public"."translation_images" alter column "task_id" set data type uuid using md5("task_id"::text)::uuid;

alter table "public"."translation_images" alter column "updated_at" drop not null;

alter table "public"."translation_tasks" drop column "ai_model";

alter table "public"."translation_tasks" drop column "credits_consumed";

alter table "public"."translation_tasks" drop column "download_url";

alter table "public"."translation_tasks" drop column "engine_type";

alter table "public"."translation_tasks" drop column "error_message";

alter table "public"."translation_tasks" drop column "expires_at";

alter table "public"."translation_tasks" drop column "image_count";

alter table "public"."translation_tasks" drop column "source_lang";

alter table "public"."translation_tasks" drop column "target_lang";

alter table "public"."translation_tasks" add column "completed_images" integer not null default 0;

alter table "public"."translation_tasks" add column "config" jsonb not null default '{}'::jsonb;

alter table "public"."translation_tasks" add column "failed_images" integer not null default 0;

alter table "public"."translation_tasks" add column "metadata" jsonb default '{}'::jsonb;

alter table "public"."translation_tasks" add column "progress" integer default 0;

alter table "public"."translation_tasks" add column "total_images" integer not null default 0;

alter table "public"."translation_tasks" alter column "created_at" drop not null;

alter table "public"."translation_tasks" alter column "id" drop default;

alter table "public"."translation_tasks" alter column "id" set data type uuid using md5("id"::text)::uuid;

alter table "public"."translation_tasks" alter column "id" set default gen_random_uuid();

alter table "public"."translation_tasks" alter column "status" drop default;

alter table "public"."translation_tasks" alter column "status" set data type text using "status"::text;

alter table "public"."translation_tasks" alter column "updated_at" drop not null;

alter table "public"."translation_tasks" alter column "user_id" drop not null;

drop sequence if exists "public"."credits_transactions_id_seq";

drop sequence if exists "public"."payment_history_id_seq";

drop sequence if exists "public"."translation_cache_id_seq";

drop sequence if exists "public"."translation_images_id_seq";

drop sequence if exists "public"."translation_tasks_id_seq";

drop sequence if exists "public"."user_credits_id_seq";

CREATE INDEX idx_translation_images_pending ON public.translation_images USING btree (status, created_at) WHERE (status = ANY (ARRAY['pending'::text, 'processing'::text]));

CREATE INDEX idx_translation_images_task_status ON public.translation_images USING btree (task_id, status);

CREATE UNIQUE INDEX translation_images_task_id_image_index_key ON public.translation_images USING btree (task_id, image_index);

alter table "public"."translation_images" add constraint "translation_images_task_id_image_index_key" UNIQUE using index "translation_images_task_id_image_index_key";

alter table "public"."translation_tasks" add constraint "translation_tasks_progress_check" CHECK (((progress >= 0) AND (progress <= 100))) not valid;

alter table "public"."translation_tasks" validate constraint "translation_tasks_progress_check";

alter table "public"."translation_images" add constraint "translation_images_status_check" CHECK ((status = ANY (ARRAY['pending'::text, 'processing'::text, 'completed'::text, 'failed'::text]))) not valid;

alter table "public"."translation_images" validate constraint "translation_images_status_check";

alter table "public"."translation_images" add constraint "translation_images_task_id_fkey" foreign key ("task_id") references "public"."translation_tasks"("id") on delete cascade;

alter table "public"."translation_tasks" add constraint "translation_tasks_status_check" CHECK ((status = ANY (ARRAY['pending'::text, 'processing'::text, 'completed'::text, 'failed'::text, 'partial'::text]))) not valid;

alter table "public"."translation_tasks" validate constraint "translation_tasks_status_check";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.update_task_aggregate_status()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE
  v_total INTEGER;
  v_completed INTEGER;
  v_failed INTEGER;
  v_processing INTEGER;
  v_new_status TEXT;
  v_progress INTEGER;
BEGIN
  -- 统计当前任务的图片状态
  SELECT
    COUNT(*),
    COUNT(*) FILTER (WHERE status = 'completed'),
    COUNT(*) FILTER (WHERE status = 'failed'),
    COUNT(*) FILTER (WHERE status = 'processing')
  INTO v_total, v_completed, v_failed, v_processing
  FROM translation_images
  WHERE task_id = COALESCE(NEW.task_id, OLD.task_id);

  -- 计算新状态
  IF v_completed = v_total THEN
    v_new_status := 'completed';
  ELSIF v_failed = v_total THEN
    v_new_status := 'failed';
  ELSIF v_completed > 0 OR v_failed > 0 THEN
    v_new_status := 'processing';  -- 部分完成
  ELSIF v_processing > 0 THEN
    v_new_status := 'processing';
  ELSE
    v_new_status := 'pending';
  END IF;

  -- 计算进度
  v_progress := ROUND((v_completed::FLOAT / v_total) * 100);

  -- 更新任务表
  UPDATE translation_tasks
  SET
    status = v_new_status,
    completed_images = v_completed,
    failed_images = v_failed,
    progress = v_progress,
    started_at = CASE
      WHEN started_at IS NULL AND v_processing > 0 THEN NOW()
      ELSE started_at
    END,
    completed_at = CASE
      WHEN v_new_status IN ('completed', 'failed') THEN NOW()
      ELSE completed_at
    END
  WHERE id = COALESCE(NEW.task_id, OLD.task_id);

  RETURN COALESCE(NEW, OLD);
END;
$function$
;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$
;


  create policy "Service role can manage all images"
  on "public"."translation_images"
  as permissive
  for all
  to public
using ((auth.role() = 'service_role'::text));



  create policy "Users can view images of their own tasks"
  on "public"."translation_images"
  as permissive
  for select
  to public
using ((EXISTS ( SELECT 1
   FROM public.translation_tasks
  WHERE ((translation_tasks.id = translation_images.task_id) AND (translation_tasks.user_id = auth.uid())))));



  create policy "Service role can update all tasks"
  on "public"."translation_tasks"
  as permissive
  for update
  to public
using ((auth.role() = 'service_role'::text));


CREATE TRIGGER update_task_aggregate_on_image_change AFTER INSERT OR DELETE OR UPDATE OF status ON public.translation_images FOR EACH ROW EXECUTE FUNCTION public.update_task_aggregate_status();

CREATE TRIGGER update_translation_images_updated_at BEFORE UPDATE ON public.translation_images FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_translation_tasks_updated_at BEFORE UPDATE ON public.translation_tasks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


