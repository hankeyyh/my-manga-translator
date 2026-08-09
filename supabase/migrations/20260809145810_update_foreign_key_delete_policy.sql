alter table "public"."credit_logs" drop constraint "credit_logs_user_id_fkey";

alter table "public"."translation_tasks" drop constraint "translation_tasks_user_id_fkey";

alter table "public"."user_credits" drop constraint "user_credits_user_id_fkey";

alter table "public"."user_subscriptions" drop constraint "user_subscriptions_user_id_fkey";

alter table "public"."user_transactions" drop constraint "user_transactions_user_id_fkey";

alter table "public"."credit_logs" add constraint "credit_logs_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."credit_logs" validate constraint "credit_logs_user_id_fkey";

alter table "public"."translation_tasks" add constraint "translation_tasks_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."translation_tasks" validate constraint "translation_tasks_user_id_fkey";

alter table "public"."user_credits" add constraint "user_credits_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."user_credits" validate constraint "user_credits_user_id_fkey";

alter table "public"."user_subscriptions" add constraint "user_subscriptions_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."user_subscriptions" validate constraint "user_subscriptions_user_id_fkey";

alter table "public"."user_transactions" add constraint "user_transactions_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."user_transactions" validate constraint "user_transactions_user_id_fkey";


