alter table "public"."translation_images" drop column "original_image_url";

alter table "public"."translation_images" drop column "result_image_url";

alter table "public"."translation_images" add column "original_image_path" text not null;

alter table "public"."translation_images" add column "result_image_path" text;


  create policy "Enable insert for authenticated users only"
  on "storage"."objects"
  as permissive
  for insert
  to authenticated
with check ((bucket_id = 'translation_storage'::text));



  create policy "Enable users to view their own data only"
  on "storage"."objects"
  as permissive
  for select
  to authenticated
using (((bucket_id = 'translation_storage'::text) AND (owner_id = ( SELECT (auth.uid())::text AS uid))));



