


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE EXTENSION IF NOT EXISTS "pg_net" WITH SCHEMA "extensions";






COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "moddatetime" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE OR REPLACE FUNCTION "public"."rls_auto_enable"() RETURNS "event_trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'pg_catalog'
    AS $$
DECLARE
  cmd record;
BEGIN
  FOR cmd IN
    SELECT *
    FROM pg_event_trigger_ddl_commands()
    WHERE command_tag IN ('CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO')
      AND object_type IN ('table','partitioned table')
  LOOP
     IF cmd.schema_name IS NOT NULL AND cmd.schema_name IN ('public') AND cmd.schema_name NOT IN ('pg_catalog','information_schema') AND cmd.schema_name NOT LIKE 'pg_toast%' AND cmd.schema_name NOT LIKE 'pg_temp%' THEN
      BEGIN
        EXECUTE format('alter table if exists %s enable row level security', cmd.object_identity);
        RAISE LOG 'rls_auto_enable: enabled RLS on %', cmd.object_identity;
      EXCEPTION
        WHEN OTHERS THEN
          RAISE LOG 'rls_auto_enable: failed to enable RLS on %', cmd.object_identity;
      END;
     ELSE
        RAISE LOG 'rls_auto_enable: skip % (either system schema or not in enforced list: %.)', cmd.object_identity, cmd.schema_name;
     END IF;
  END LOOP;
END;
$$;


ALTER FUNCTION "public"."rls_auto_enable"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."credits_transactions" (
    "id" bigint NOT NULL,
    "user_id" "uuid" NOT NULL,
    "amount" integer NOT NULL,
    "balance_after" integer NOT NULL,
    "transaction_type" character varying(20) NOT NULL,
    "description" "text",
    "task_id" bigint,
    "payment_id" bigint,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "credits_transactions_balance_after_check" CHECK (("balance_after" >= 0)),
    CONSTRAINT "credits_transactions_transaction_type_check" CHECK ((("transaction_type")::"text" = ANY ((ARRAY['earn'::character varying, 'spend'::character varying, 'refund'::character varying, 'bonus'::character varying, 'purchase'::character varying])::"text"[])))
);


ALTER TABLE "public"."credits_transactions" OWNER TO "postgres";


COMMENT ON TABLE "public"."credits_transactions" IS '积分交易记录表（审计日志）';



CREATE SEQUENCE IF NOT EXISTS "public"."credits_transactions_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."credits_transactions_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."credits_transactions_id_seq" OWNED BY "public"."credits_transactions"."id";



CREATE TABLE IF NOT EXISTS "public"."payment_history" (
    "id" bigint NOT NULL,
    "user_id" "uuid" NOT NULL,
    "amount" numeric(10,2) NOT NULL,
    "credits_purchased" integer NOT NULL,
    "plan_type" character varying(20),
    "payment_method" character varying(50),
    "payment_provider" character varying(50),
    "transaction_id" character varying(255),
    "status" character varying(20) DEFAULT 'pending'::character varying NOT NULL,
    "metadata" "jsonb" DEFAULT '{}'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "completed_at" timestamp with time zone,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "payment_history_amount_check" CHECK (("amount" > (0)::numeric)),
    CONSTRAINT "payment_history_credits_purchased_check" CHECK (("credits_purchased" > 0)),
    CONSTRAINT "payment_history_plan_type_check" CHECK ((("plan_type")::"text" = ANY ((ARRAY['basic'::character varying, 'pro'::character varying, 'ultra'::character varying, 'custom'::character varying])::"text"[]))),
    CONSTRAINT "payment_history_status_check" CHECK ((("status")::"text" = ANY ((ARRAY['pending'::character varying, 'completed'::character varying, 'failed'::character varying, 'refunded'::character varying])::"text"[])))
);


ALTER TABLE "public"."payment_history" OWNER TO "postgres";


COMMENT ON TABLE "public"."payment_history" IS '支付历史表';



COMMENT ON COLUMN "public"."payment_history"."metadata" IS '额外的支付信息，JSON格式';



CREATE SEQUENCE IF NOT EXISTS "public"."payment_history_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."payment_history_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."payment_history_id_seq" OWNED BY "public"."payment_history"."id";



CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" bigint NOT NULL,
    "user_id" "uuid" NOT NULL,
    "username" character varying(50),
    "email" character varying(255) NOT NULL,
    "avatar_url" "text",
    "display_name" character varying(100),
    "bio" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."profiles" OWNER TO "postgres";


COMMENT ON TABLE "public"."profiles" IS '用户业务信息表';



CREATE SEQUENCE IF NOT EXISTS "public"."profiles_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."profiles_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."profiles_id_seq" OWNED BY "public"."profiles"."id";



CREATE TABLE IF NOT EXISTS "public"."translation_cache" (
    "id" bigint NOT NULL,
    "image_hash" character varying(256) NOT NULL,
    "source_lang" character varying(10) NOT NULL,
    "target_lang" character varying(10) NOT NULL,
    "engine_type" character varying(20) NOT NULL,
    "ai_model" character varying(50),
    "result_url" "text" NOT NULL,
    "extracted_text" "jsonb" DEFAULT '[]'::"jsonb",
    "translated_text" "jsonb" DEFAULT '[]'::"jsonb",
    "hit_count" integer DEFAULT 1 NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "accessed_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."translation_cache" OWNER TO "postgres";


COMMENT ON TABLE "public"."translation_cache" IS '翻译结果缓存表';



COMMENT ON COLUMN "public"."translation_cache"."hit_count" IS '缓存命中次数';



COMMENT ON COLUMN "public"."translation_cache"."accessed_at" IS '最后访问时间';



CREATE SEQUENCE IF NOT EXISTS "public"."translation_cache_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."translation_cache_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."translation_cache_id_seq" OWNED BY "public"."translation_cache"."id";



CREATE TABLE IF NOT EXISTS "public"."translation_images" (
    "id" bigint NOT NULL,
    "task_id" bigint NOT NULL,
    "page_number" integer NOT NULL,
    "status" character varying(50) DEFAULT 'pending'::character varying NOT NULL,
    "original_url" "text" NOT NULL,
    "original_hash" character varying(256),
    "translated_url" "text",
    "extracted_text" "jsonb" DEFAULT '[]'::"jsonb",
    "translated_text" "jsonb" DEFAULT '[]'::"jsonb",
    "processing_time" integer,
    "error_message" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "translation_images_page_number_check" CHECK (("page_number" > 0)),
    CONSTRAINT "translation_images_status_check" CHECK ((("status")::"text" = ANY ((ARRAY['pending'::character varying, 'processing'::character varying, 'completed'::character varying, 'failed'::character varying])::"text"[])))
);


ALTER TABLE "public"."translation_images" OWNER TO "postgres";


COMMENT ON TABLE "public"."translation_images" IS '翻译图片表';



COMMENT ON COLUMN "public"."translation_images"."original_hash" IS '原图的SHA256哈希值，用于缓存匹配';



COMMENT ON COLUMN "public"."translation_images"."extracted_text" IS '提取的原文，JSON格式: [{"id":"bubble-1","text":"...","coordinates":{...}}]';



COMMENT ON COLUMN "public"."translation_images"."translated_text" IS '翻译后的文字，JSON格式同上';



CREATE SEQUENCE IF NOT EXISTS "public"."translation_images_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."translation_images_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."translation_images_id_seq" OWNED BY "public"."translation_images"."id";



CREATE TABLE IF NOT EXISTS "public"."translation_tasks" (
    "id" bigint NOT NULL,
    "user_id" "uuid" NOT NULL,
    "status" character varying(50) DEFAULT 'pending'::character varying NOT NULL,
    "source_lang" character varying(10) DEFAULT 'JPN'::character varying NOT NULL,
    "target_lang" character varying(10) DEFAULT 'ENG'::character varying NOT NULL,
    "engine_type" character varying(20) DEFAULT 'standard'::character varying NOT NULL,
    "ai_model" character varying(50),
    "credits_consumed" integer DEFAULT 0,
    "image_count" integer DEFAULT 0,
    "download_url" "text",
    "error_message" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "started_at" timestamp with time zone,
    "completed_at" timestamp with time zone,
    "expires_at" timestamp with time zone,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "check_lang_diff" CHECK ((("source_lang")::"text" <> ("target_lang")::"text")),
    CONSTRAINT "translation_tasks_credits_consumed_check" CHECK (("credits_consumed" >= 0)),
    CONSTRAINT "translation_tasks_engine_type_check" CHECK ((("engine_type")::"text" = ANY ((ARRAY['standard'::character varying, 'ai'::character varying])::"text"[]))),
    CONSTRAINT "translation_tasks_image_count_check" CHECK (("image_count" >= 0)),
    CONSTRAINT "translation_tasks_source_lang_check" CHECK ((("source_lang")::"text" = ANY ((ARRAY['JPN'::character varying, 'ENG'::character varying, 'KOR'::character varying, 'CHN'::character varying, 'SPA'::character varying, 'FRA'::character varying])::"text"[]))),
    CONSTRAINT "translation_tasks_status_check" CHECK ((("status")::"text" = ANY ((ARRAY['pending'::character varying, 'processing'::character varying, 'completed'::character varying, 'failed'::character varying, 'cancelled'::character varying])::"text"[]))),
    CONSTRAINT "translation_tasks_target_lang_check" CHECK ((("target_lang")::"text" = ANY ((ARRAY['JPN'::character varying, 'ENG'::character varying, 'KOR'::character varying, 'CHN'::character varying, 'SPA'::character varying, 'FRA'::character varying])::"text"[])))
);


ALTER TABLE "public"."translation_tasks" OWNER TO "postgres";


COMMENT ON TABLE "public"."translation_tasks" IS '翻译任务表';



COMMENT ON COLUMN "public"."translation_tasks"."status" IS '任务状态: pending/processing/completed/failed/cancelled';



COMMENT ON COLUMN "public"."translation_tasks"."engine_type" IS '翻译引擎类型: standard/ai';



COMMENT ON COLUMN "public"."translation_tasks"."expires_at" IS '下载链接过期时间（任务完成后1小时）';



CREATE SEQUENCE IF NOT EXISTS "public"."translation_tasks_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."translation_tasks_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."translation_tasks_id_seq" OWNED BY "public"."translation_tasks"."id";



CREATE TABLE IF NOT EXISTS "public"."user_credits" (
    "id" bigint NOT NULL,
    "user_id" "uuid" NOT NULL,
    "balance" integer DEFAULT 20 NOT NULL,
    "total_used" integer DEFAULT 0 NOT NULL,
    "total_earned" integer DEFAULT 20 NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "user_credits_balance_check" CHECK (("balance" >= 0)),
    CONSTRAINT "user_credits_total_earned_check" CHECK (("total_earned" >= 0)),
    CONSTRAINT "user_credits_total_used_check" CHECK (("total_used" >= 0))
);


ALTER TABLE "public"."user_credits" OWNER TO "postgres";


COMMENT ON TABLE "public"."user_credits" IS '用户积分表';



COMMENT ON COLUMN "public"."user_credits"."balance" IS '当前积分余额';



COMMENT ON COLUMN "public"."user_credits"."total_used" IS '累计使用的积分';



COMMENT ON COLUMN "public"."user_credits"."total_earned" IS '累计获得的积分';



CREATE SEQUENCE IF NOT EXISTS "public"."user_credits_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."user_credits_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."user_credits_id_seq" OWNED BY "public"."user_credits"."id";



ALTER TABLE ONLY "public"."credits_transactions" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."credits_transactions_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."payment_history" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."payment_history_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."profiles" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."profiles_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."translation_cache" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."translation_cache_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."translation_images" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."translation_images_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."translation_tasks" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."translation_tasks_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."user_credits" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."user_credits_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."credits_transactions"
    ADD CONSTRAINT "credits_transactions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."payment_history"
    ADD CONSTRAINT "payment_history_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."payment_history"
    ADD CONSTRAINT "payment_history_transaction_id_key" UNIQUE ("transaction_id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_username_key" UNIQUE ("username");



ALTER TABLE ONLY "public"."translation_cache"
    ADD CONSTRAINT "translation_cache_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."translation_images"
    ADD CONSTRAINT "translation_images_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."translation_tasks"
    ADD CONSTRAINT "translation_tasks_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "unique_profiles_user_id" UNIQUE ("user_id");



ALTER TABLE ONLY "public"."translation_images"
    ADD CONSTRAINT "unique_task_page" UNIQUE ("task_id", "page_number");



ALTER TABLE ONLY "public"."user_credits"
    ADD CONSTRAINT "unique_user_credits" UNIQUE ("user_id");



ALTER TABLE ONLY "public"."user_credits"
    ADD CONSTRAINT "user_credits_pkey" PRIMARY KEY ("id");



CREATE INDEX "idx_credits_transactions_created_at" ON "public"."credits_transactions" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_credits_transactions_task_id" ON "public"."credits_transactions" USING "btree" ("task_id") WHERE ("task_id" IS NOT NULL);



CREATE INDEX "idx_credits_transactions_user_id" ON "public"."credits_transactions" USING "btree" ("user_id");



CREATE INDEX "idx_payment_history_created_at" ON "public"."payment_history" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_payment_history_status" ON "public"."payment_history" USING "btree" ("status");



CREATE INDEX "idx_payment_history_transaction_id" ON "public"."payment_history" USING "btree" ("transaction_id") WHERE ("transaction_id" IS NOT NULL);



CREATE INDEX "idx_payment_history_user_id" ON "public"."payment_history" USING "btree" ("user_id");



CREATE INDEX "idx_profiles_email" ON "public"."profiles" USING "btree" ("email");



CREATE INDEX "idx_profiles_user_id" ON "public"."profiles" USING "btree" ("user_id");



CREATE INDEX "idx_profiles_username" ON "public"."profiles" USING "btree" ("username");



CREATE INDEX "idx_translation_cache_accessed_at" ON "public"."translation_cache" USING "btree" ("accessed_at");



CREATE UNIQUE INDEX "idx_translation_cache_hash_langs" ON "public"."translation_cache" USING "btree" ("image_hash", "source_lang", "target_lang", "engine_type", COALESCE("ai_model", ''::character varying));



CREATE INDEX "idx_translation_images_hash" ON "public"."translation_images" USING "btree" ("original_hash") WHERE ("original_hash" IS NOT NULL);



CREATE INDEX "idx_translation_images_status" ON "public"."translation_images" USING "btree" ("status");



CREATE INDEX "idx_translation_images_task_id" ON "public"."translation_images" USING "btree" ("task_id");



CREATE INDEX "idx_translation_tasks_created_at" ON "public"."translation_tasks" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_translation_tasks_expires_at" ON "public"."translation_tasks" USING "btree" ("expires_at") WHERE ("expires_at" IS NOT NULL);



CREATE INDEX "idx_translation_tasks_status" ON "public"."translation_tasks" USING "btree" ("status");



CREATE INDEX "idx_translation_tasks_user_id" ON "public"."translation_tasks" USING "btree" ("user_id");



CREATE INDEX "idx_user_credits_balance" ON "public"."user_credits" USING "btree" ("balance");



CREATE INDEX "idx_user_credits_user_id" ON "public"."user_credits" USING "btree" ("user_id");



CREATE OR REPLACE TRIGGER "handle_updated_at" BEFORE UPDATE ON "public"."credits_transactions" FOR EACH ROW EXECUTE FUNCTION "extensions"."moddatetime"('updated_at');



CREATE OR REPLACE TRIGGER "handle_updated_at" BEFORE UPDATE ON "public"."payment_history" FOR EACH ROW EXECUTE FUNCTION "extensions"."moddatetime"('updated_at');



CREATE OR REPLACE TRIGGER "handle_updated_at" BEFORE UPDATE ON "public"."profiles" FOR EACH ROW EXECUTE FUNCTION "extensions"."moddatetime"('updated_at');



CREATE OR REPLACE TRIGGER "handle_updated_at" BEFORE UPDATE ON "public"."translation_cache" FOR EACH ROW EXECUTE FUNCTION "extensions"."moddatetime"('updated_at');



CREATE OR REPLACE TRIGGER "handle_updated_at" BEFORE UPDATE ON "public"."translation_images" FOR EACH ROW EXECUTE FUNCTION "extensions"."moddatetime"('updated_at');



CREATE OR REPLACE TRIGGER "handle_updated_at" BEFORE UPDATE ON "public"."translation_tasks" FOR EACH ROW EXECUTE FUNCTION "extensions"."moddatetime"('updated_at');



CREATE OR REPLACE TRIGGER "handle_updated_at" BEFORE UPDATE ON "public"."user_credits" FOR EACH ROW EXECUTE FUNCTION "extensions"."moddatetime"('updated_at');



ALTER TABLE ONLY "public"."credits_transactions"
    ADD CONSTRAINT "credits_transactions_payment_id_fkey" FOREIGN KEY ("payment_id") REFERENCES "public"."payment_history"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."credits_transactions"
    ADD CONSTRAINT "credits_transactions_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "public"."translation_tasks"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."credits_transactions"
    ADD CONSTRAINT "credits_transactions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."payment_history"
    ADD CONSTRAINT "payment_history_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."translation_images"
    ADD CONSTRAINT "translation_images_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "public"."translation_tasks"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."translation_tasks"
    ADD CONSTRAINT "translation_tasks_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_credits"
    ADD CONSTRAINT "user_credits_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



CREATE POLICY "Authenticated users can view cache" ON "public"."translation_cache" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Service role can manage cache" ON "public"."translation_cache" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "Users can create their own tasks" ON "public"."translation_tasks" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can delete their own tasks" ON "public"."translation_tasks" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can insert images for their tasks" ON "public"."translation_images" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."translation_tasks"
  WHERE (("translation_tasks"."id" = "translation_images"."task_id") AND ("translation_tasks"."user_id" = "auth"."uid"())))));



CREATE POLICY "Users can insert own profile" ON "public"."profiles" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can insert their own credits" ON "public"."user_credits" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update images of their tasks" ON "public"."translation_images" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."translation_tasks"
  WHERE (("translation_tasks"."id" = "translation_images"."task_id") AND ("translation_tasks"."user_id" = "auth"."uid"())))));



CREATE POLICY "Users can update own profile" ON "public"."profiles" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update their own credits" ON "public"."user_credits" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update their own tasks" ON "public"."translation_tasks" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view images of their tasks" ON "public"."translation_images" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."translation_tasks"
  WHERE (("translation_tasks"."id" = "translation_images"."task_id") AND ("translation_tasks"."user_id" = "auth"."uid"())))));



CREATE POLICY "Users can view own profile" ON "public"."profiles" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view their own credits" ON "public"."user_credits" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view their own payment history" ON "public"."payment_history" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view their own tasks" ON "public"."translation_tasks" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view their own transactions" ON "public"."credits_transactions" FOR SELECT USING (("auth"."uid"() = "user_id"));



ALTER TABLE "public"."credits_transactions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."payment_history" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."translation_cache" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."translation_images" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."translation_tasks" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_credits" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";





GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";


































































































































































GRANT ALL ON FUNCTION "public"."rls_auto_enable"() TO "anon";
GRANT ALL ON FUNCTION "public"."rls_auto_enable"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."rls_auto_enable"() TO "service_role";


















GRANT ALL ON TABLE "public"."credits_transactions" TO "anon";
GRANT ALL ON TABLE "public"."credits_transactions" TO "authenticated";
GRANT ALL ON TABLE "public"."credits_transactions" TO "service_role";



GRANT ALL ON SEQUENCE "public"."credits_transactions_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."credits_transactions_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."credits_transactions_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."payment_history" TO "anon";
GRANT ALL ON TABLE "public"."payment_history" TO "authenticated";
GRANT ALL ON TABLE "public"."payment_history" TO "service_role";



GRANT ALL ON SEQUENCE "public"."payment_history_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."payment_history_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."payment_history_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";



GRANT ALL ON SEQUENCE "public"."profiles_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."profiles_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."profiles_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."translation_cache" TO "anon";
GRANT ALL ON TABLE "public"."translation_cache" TO "authenticated";
GRANT ALL ON TABLE "public"."translation_cache" TO "service_role";



GRANT ALL ON SEQUENCE "public"."translation_cache_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."translation_cache_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."translation_cache_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."translation_images" TO "anon";
GRANT ALL ON TABLE "public"."translation_images" TO "authenticated";
GRANT ALL ON TABLE "public"."translation_images" TO "service_role";



GRANT ALL ON SEQUENCE "public"."translation_images_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."translation_images_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."translation_images_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."translation_tasks" TO "anon";
GRANT ALL ON TABLE "public"."translation_tasks" TO "authenticated";
GRANT ALL ON TABLE "public"."translation_tasks" TO "service_role";



GRANT ALL ON SEQUENCE "public"."translation_tasks_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."translation_tasks_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."translation_tasks_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."user_credits" TO "anon";
GRANT ALL ON TABLE "public"."user_credits" TO "authenticated";
GRANT ALL ON TABLE "public"."user_credits" TO "service_role";



GRANT ALL ON SEQUENCE "public"."user_credits_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."user_credits_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."user_credits_id_seq" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";



































alter table "public"."credits_transactions" drop constraint "credits_transactions_transaction_type_check";

alter table "public"."payment_history" drop constraint "payment_history_plan_type_check";

alter table "public"."payment_history" drop constraint "payment_history_status_check";

alter table "public"."translation_images" drop constraint "translation_images_status_check";

alter table "public"."translation_tasks" drop constraint "translation_tasks_engine_type_check";

alter table "public"."translation_tasks" drop constraint "translation_tasks_source_lang_check";

alter table "public"."translation_tasks" drop constraint "translation_tasks_status_check";

alter table "public"."translation_tasks" drop constraint "translation_tasks_target_lang_check";

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


