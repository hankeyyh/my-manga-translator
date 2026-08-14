
  create table "public"."blog_posts" (
    "id" uuid not null default gen_random_uuid(),
    "slug" text not null,
    "title" text not null,
    "description" text not null default ''::text,
    "cover" text not null default ''::text,
    "content" text not null,
    "author" text,
    "status" text not null default 'draft'::text,
    "published_at" timestamp with time zone,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
      );


alter table "public"."blog_posts" enable row level security;


  create table "public"."legal_docs" (
    "id" uuid not null default gen_random_uuid(),
    "slug" text not null,
    "kind" text not null,
    "title" text not null,
    "content" text not null,
    "status" text not null default 'draft'::text,
    "effective_at" timestamp with time zone,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
      );


alter table "public"."legal_docs" enable row level security;

CREATE UNIQUE INDEX blog_posts_pkey ON public.blog_posts USING btree (id);

CREATE UNIQUE INDEX blog_posts_slug_key ON public.blog_posts USING btree (slug);

CREATE INDEX blog_posts_status_published_at_idx ON public.blog_posts USING btree (status, published_at DESC);

CREATE UNIQUE INDEX legal_docs_pkey ON public.legal_docs USING btree (id);

CREATE UNIQUE INDEX legal_docs_slug_key ON public.legal_docs USING btree (slug);

CREATE INDEX legal_docs_status_kind_idx ON public.legal_docs USING btree (status, kind);

alter table "public"."blog_posts" add constraint "blog_posts_pkey" PRIMARY KEY using index "blog_posts_pkey";

alter table "public"."legal_docs" add constraint "legal_docs_pkey" PRIMARY KEY using index "legal_docs_pkey";

alter table "public"."blog_posts" add constraint "blog_posts_slug_key" UNIQUE using index "blog_posts_slug_key";

alter table "public"."blog_posts" add constraint "blog_posts_status_check" CHECK ((status = ANY (ARRAY['draft'::text, 'published'::text, 'archived'::text]))) not valid;

alter table "public"."blog_posts" validate constraint "blog_posts_status_check";

alter table "public"."legal_docs" add constraint "legal_docs_kind_check" CHECK ((kind = ANY (ARRAY['about'::text, 'terms'::text, 'privacy'::text, 'refund'::text, 'dmca'::text, 'other'::text]))) not valid;

alter table "public"."legal_docs" validate constraint "legal_docs_kind_check";

alter table "public"."legal_docs" add constraint "legal_docs_slug_key" UNIQUE using index "legal_docs_slug_key";

alter table "public"."legal_docs" add constraint "legal_docs_status_check" CHECK ((status = ANY (ARRAY['draft'::text, 'published'::text, 'archived'::text]))) not valid;

alter table "public"."legal_docs" validate constraint "legal_docs_status_check";

grant delete on table "public"."blog_posts" to "anon";

grant insert on table "public"."blog_posts" to "anon";

grant references on table "public"."blog_posts" to "anon";

grant select on table "public"."blog_posts" to "anon";

grant trigger on table "public"."blog_posts" to "anon";

grant truncate on table "public"."blog_posts" to "anon";

grant update on table "public"."blog_posts" to "anon";

grant delete on table "public"."blog_posts" to "authenticated";

grant insert on table "public"."blog_posts" to "authenticated";

grant references on table "public"."blog_posts" to "authenticated";

grant select on table "public"."blog_posts" to "authenticated";

grant trigger on table "public"."blog_posts" to "authenticated";

grant truncate on table "public"."blog_posts" to "authenticated";

grant update on table "public"."blog_posts" to "authenticated";

grant delete on table "public"."blog_posts" to "service_role";

grant insert on table "public"."blog_posts" to "service_role";

grant references on table "public"."blog_posts" to "service_role";

grant select on table "public"."blog_posts" to "service_role";

grant trigger on table "public"."blog_posts" to "service_role";

grant truncate on table "public"."blog_posts" to "service_role";

grant update on table "public"."blog_posts" to "service_role";

grant delete on table "public"."legal_docs" to "anon";

grant insert on table "public"."legal_docs" to "anon";

grant references on table "public"."legal_docs" to "anon";

grant select on table "public"."legal_docs" to "anon";

grant trigger on table "public"."legal_docs" to "anon";

grant truncate on table "public"."legal_docs" to "anon";

grant update on table "public"."legal_docs" to "anon";

grant delete on table "public"."legal_docs" to "authenticated";

grant insert on table "public"."legal_docs" to "authenticated";

grant references on table "public"."legal_docs" to "authenticated";

grant select on table "public"."legal_docs" to "authenticated";

grant trigger on table "public"."legal_docs" to "authenticated";

grant truncate on table "public"."legal_docs" to "authenticated";

grant update on table "public"."legal_docs" to "authenticated";

grant delete on table "public"."legal_docs" to "service_role";

grant insert on table "public"."legal_docs" to "service_role";

grant references on table "public"."legal_docs" to "service_role";

grant select on table "public"."legal_docs" to "service_role";

grant trigger on table "public"."legal_docs" to "service_role";

grant truncate on table "public"."legal_docs" to "service_role";

grant update on table "public"."legal_docs" to "service_role";


  create policy "Public can read published blog posts"
  on "public"."blog_posts"
  as permissive
  for select
  to anon, authenticated
using ((status = 'published'::text));



  create policy "Public can read published legal docs"
  on "public"."legal_docs"
  as permissive
  for select
  to anon, authenticated
using ((status = 'published'::text));


CREATE TRIGGER update_blog_posts_updated_at BEFORE UPDATE ON public.blog_posts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_legal_docs_updated_at BEFORE UPDATE ON public.legal_docs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


