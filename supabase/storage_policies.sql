-- Run in Supabase SQL editor after migrations (or merge into a migration).
-- Creates buckets + RLS for Storage.

insert into storage.buckets (id, name, public)
values
  ('avatars', 'avatars', true),
  ('chat-attachments', 'chat-attachments', false),
  ('voice-notes', 'voice-notes', false),
  ('status-media', 'status-media', false)
on conflict (id) do nothing;

-- Avatars: public read; authenticated users upload own folder userId/...
create policy "avatars_public_read"
on storage.objects for select to public
using (bucket_id = 'avatars');

create policy "avatars_owner_write"
on storage.objects for insert to authenticated
with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "avatars_owner_update"
on storage.objects for update to authenticated
using (bucket_id = 'avatars' and owner = auth.uid());

create policy "avatars_owner_delete"
on storage.objects for delete to authenticated
using (bucket_id = 'avatars' and owner = auth.uid());

-- Attachments: path convention conversationId/filename
create policy "attachments_select_member"
on storage.objects for select to authenticated
using (
  bucket_id = 'chat-attachments'
  and exists (
    select 1 from public.conversation_participants cp
    where cp.conversation_id = ((storage.foldername(name))[1])::uuid
      and cp.user_id = auth.uid()
  )
);

create policy "attachments_insert_member"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'chat-attachments'
  and exists (
    select 1 from public.conversation_participants cp
    where cp.conversation_id = ((storage.foldername(name))[1])::uuid
      and cp.user_id = auth.uid()
  )
);

-- Voice notes: same path pattern
create policy "voice_select_member"
on storage.objects for select to authenticated
using (
  bucket_id = 'voice-notes'
  and exists (
    select 1 from public.conversation_participants cp
    where cp.conversation_id = ((storage.foldername(name))[1])::uuid
      and cp.user_id = auth.uid()
  )
);

create policy "voice_insert_member"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'voice-notes'
  and exists (
    select 1 from public.conversation_participants cp
    where cp.conversation_id = ((storage.foldername(name))[1])::uuid
      and cp.user_id = auth.uid()
  )
);

-- Status media: userId/...
create policy "status_media_select_auth"
on storage.objects for select to authenticated
using (bucket_id = 'status-media');

create policy "status_media_owner_write"
on storage.objects for insert to authenticated
with check (bucket_id = 'status-media' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "status_media_owner_delete"
on storage.objects for delete to authenticated
using (bucket_id = 'status-media' and owner = auth.uid());
