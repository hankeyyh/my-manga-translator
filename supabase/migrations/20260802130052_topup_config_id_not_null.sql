alter table "public"."user_subscriptions" alter column "topup_config_id" set not null;

alter table "public"."user_transactions" alter column "topup_config_id" set not null;


