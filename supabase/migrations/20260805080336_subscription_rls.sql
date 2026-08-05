
  create policy "Enable update for users based on user_id"
  on "public"."user_subscriptions"
  as permissive
  for update
  to authenticated
using ((( SELECT auth.uid() AS uid) = user_id))
with check ((( SELECT auth.uid() AS uid) = user_id));



