
  create policy "Users can insert images of their own tasks"
  on "public"."translation_images"
  as permissive
  for insert
  to public
with check ((EXISTS ( SELECT 1
   FROM public.translation_tasks
  WHERE ((translation_tasks.id = translation_images.task_id) AND (translation_tasks.user_id = auth.uid())))));


drop policy "Enable insert for authenticated users only" on "storage"."objects";

drop policy "Enable users to view their own data only" on "storage"."objects";


  create policy "Enable insert for authenticated users only"
  on "storage"."objects"
  as permissive
  for insert
  to authenticated
with check (((bucket_id = 'translation_storage'::text) AND ((storage.foldername(name))[1] = (auth.uid())::text)));



  create policy "Enable users to view their own data only"
  on "storage"."objects"
  as permissive
  for select
  to authenticated
using (((bucket_id = 'translation_storage'::text) AND ((storage.foldername(name))[1] = (auth.uid())::text)));



