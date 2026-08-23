alter table "public"."legal_docs" drop constraint "legal_docs_slug_key";

drop index if exists "public"."legal_docs_slug_key";

alter table "public"."legal_docs" add column "locale" text not null default 'en'::text;

CREATE UNIQUE INDEX legal_docs_slug_locale_key ON public.legal_docs USING btree (slug, locale);

alter table "public"."legal_docs" add constraint "legal_docs_locale_check" CHECK ((locale = ANY (ARRAY['en'::text, 'zh-cn'::text, 'zh-tw'::text]))) not valid;

alter table "public"."legal_docs" validate constraint "legal_docs_locale_check";

alter table "public"."legal_docs" add constraint "legal_docs_slug_locale_key" UNIQUE using index "legal_docs_slug_locale_key";


