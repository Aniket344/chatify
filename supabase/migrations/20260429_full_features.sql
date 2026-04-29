-- Chatify full features: profiles, conversations, messages extensions + reactions + statuses + RPCs + RLS

-- ---------------------------------------------------------------------------
-- Profiles
-- ---------------------------------------------------------------------------
alter table public.profiles
  add column if not exists bio text,
  add column if not exists last_seen_at timestamptz,
  add column if not exists status_text text,
  add column if not exists phone text;

-- ---------------------------------------------------------------------------
-- Conversations
-- ---------------------------------------------------------------------------
alter table public.conversations
  add column if not exists is_group boolean not null default false,
  add column if not exists name text,
  add column if not exists avatar_url text,
  add column if not exists created_by uuid references auth.users (id) on delete set null,
  add column if not exists updated_at timestamptz not null default timezone('utc'::text, now()),
  add column if not exists last_message_id uuid;

-- ---------------------------------------------------------------------------
-- Conversation participants
-- ---------------------------------------------------------------------------
alter table public.conversation_participants
  add column if not exists role text not null default 'member' check (role in ('member', 'admin')),
  add column if not exists is_pinned boolean not null default false,
  add column if not exists is_muted boolean not null default false,
  add column if not exists is_archived boolean not null default false,
  add column if not exists last_read_at timestamptz,
  add column if not exists joined_at timestamptz not null default timezone('utc'::text, now());

-- ---------------------------------------------------------------------------
-- Messages: nullable receiver for group broadcasts; extra columns; message_type
-- ---------------------------------------------------------------------------
alter table public.messages alter column receiver_id drop not null;

alter table public.messages
  add column if not exists reply_to_id uuid references public.messages (id) on delete set null,
  add column if not exists forward_of_id uuid references public.messages (id) on delete set null,
  add column if not exists edited_at timestamptz,
  add column if not exists deleted_at timestamptz,
  add column if not exists deleted_for_everyone boolean not null default false;

alter table public.messages drop constraint if exists messages_message_type_check;
alter table public.messages add constraint messages_message_type_check
  check (message_type in ('text', 'image', 'file', 'voice', 'system'));

-- ---------------------------------------------------------------------------
-- Per-user hide (delete for me)
-- ---------------------------------------------------------------------------
create table if not exists public.message_user_deletions (
  message_id uuid not null references public.messages (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default timezone('utc'::text, now()),
  primary key (message_id, user_id)
);

-- ---------------------------------------------------------------------------
-- Reactions
-- ---------------------------------------------------------------------------
create table if not exists public.message_reactions (
  id uuid primary key default gen_random_uuid(),
  message_id uuid not null references public.messages (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  emoji text not null check (char_length(trim(emoji)) > 0),
  created_at timestamptz not null default timezone('utc'::text, now()),
  unique (message_id, user_id, emoji)
);

create index if not exists message_reactions_message_id_idx on public.message_reactions (message_id);

-- ---------------------------------------------------------------------------
-- Read receipts (groups + optional 1:1 sync)
-- ---------------------------------------------------------------------------
create table if not exists public.message_receipts (
  message_id uuid not null references public.messages (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  seen_at timestamptz not null default timezone('utc'::text, now()),
  primary key (message_id, user_id)
);

create index if not exists message_receipts_message_id_idx on public.message_receipts (message_id);

-- ---------------------------------------------------------------------------
-- Status / stories
-- ---------------------------------------------------------------------------
create table if not exists public.statuses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  content_url text,
  content_type text not null default 'text' check (content_type in ('text', 'image', 'video')),
  caption text,
  background text,
  created_at timestamptz not null default timezone('utc'::text, now()),
  expires_at timestamptz not null default (timezone('utc'::text, now()) + interval '24 hours')
);

create index if not exists statuses_user_expires_idx on public.statuses (user_id, expires_at desc);

create table if not exists public.status_views (
  status_id uuid not null references public.statuses (id) on delete cascade,
  viewer_id uuid not null references auth.users (id) on delete cascade,
  viewed_at timestamptz not null default timezone('utc'::text, now()),
  primary key (status_id, viewer_id)
);

-- ---------------------------------------------------------------------------
-- Triggers: conversation updated + last_message_id
-- ---------------------------------------------------------------------------
create or replace function public.on_message_insert_update_conversation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.conversations
  set
    updated_at = timezone('utc'::text, now()),
    last_message_id = new.id
  where id = new.conversation_id;
  return new;
end;
$$;

drop trigger if exists messages_after_insert_conversation on public.messages;
create trigger messages_after_insert_conversation
  after insert on public.messages
  for each row execute procedure public.on_message_insert_update_conversation();

-- Sync legacy seen_at for direct chats when receipt inserted for receiver
create or replace function public.on_message_receipt_sync_seen()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  msg record;
begin
  select m.*, c.is_direct
  into msg
  from public.messages m
  join public.conversations c on c.id = m.conversation_id
  where m.id = new.message_id;

  if msg is null then
    return new;
  end if;

  if msg.is_direct and new.user_id = msg.receiver_id then
    update public.messages
    set seen_at = coalesce(seen_at, new.seen_at)
    where id = new.message_id and seen_at is null;
  end if;

  return new;
end;
$$;

drop trigger if exists message_receipts_after_insert on public.message_receipts;
create trigger message_receipts_after_insert
  after insert on public.message_receipts
  for each row execute procedure public.on_message_receipt_sync_seen();

-- ---------------------------------------------------------------------------
-- RPC: get_or_create_direct already exists; add helpers
-- ---------------------------------------------------------------------------

create or replace function public.update_last_seen()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.profiles
  set last_seen_at = timezone('utc'::text, now())
  where id = auth.uid();
end;
$$;

create or replace function public.get_chat_list()
returns table (
  conversation_id uuid,
  is_direct boolean,
  is_group boolean,
  display_name text,
  display_avatar text,
  other_user_id uuid,
  last_message_content text,
  last_message_at timestamptz,
  unread_count bigint,
  is_pinned boolean,
  is_muted boolean
)
language sql
security definer
set search_path = public
as $$
  with my_participation as (
    select
      cp.conversation_id,
      cp.is_pinned,
      cp.is_muted,
      cp.last_read_at
    from public.conversation_participants cp
    where cp.user_id = auth.uid()
  ),
  convo as (
    select
      c.id,
      c.is_direct,
      c.is_group,
      c.name,
      c.avatar_url,
      mp.is_pinned,
      mp.is_muted,
      mp.last_read_at
    from public.conversations c
    join my_participation mp on mp.conversation_id = c.id
  ),
  other_user as (
    select
      c.id as conversation_id,
      p.id as other_user_id,
      coalesce(p.full_name, p.email, 'User') as display_name,
      p.avatar_url as display_avatar
    from convo c
    join public.conversation_participants cp2
      on cp2.conversation_id = c.id and cp2.user_id <> auth.uid()
    join public.profiles p on p.id = cp2.user_id
    where c.is_direct = true
  ),
  last_msg as (
    select distinct on (m.conversation_id)
      m.conversation_id,
      case
        when m.deleted_at is not null and m.deleted_for_everyone then 'This message was deleted'
        else left(m.content, 200)
      end as preview,
      m.created_at as at
    from public.messages m
    order by m.conversation_id, m.created_at desc
  ),
  unread as (
    select
      m.conversation_id,
      count(*)::bigint as cnt
    from public.messages m
    join convo c on c.id = m.conversation_id
    left join public.message_user_deletions mud
      on mud.message_id = m.id and mud.user_id = auth.uid()
    where m.sender_id <> auth.uid()
      and m.deleted_at is null
      and mud.message_id is null
      and (
        (c.is_direct = true and m.receiver_id = auth.uid() and m.seen_at is null)
        or
        (c.is_direct = false and (c.last_read_at is null or m.created_at > c.last_read_at))
      )
    group by m.conversation_id
  )
  select
    c.id as conversation_id,
    c.is_direct,
    c.is_group,
    case
      when c.is_group then coalesce(c.name, 'Group')
      else ou.display_name
    end as display_name,
    case
      when c.is_group then c.avatar_url
      else ou.display_avatar
    end as display_avatar,
    ou.other_user_id,
    lm.preview as last_message_content,
    lm.at as last_message_at,
    coalesce(u.cnt, 0) as unread_count,
    c.is_pinned,
    c.is_muted
  from convo c
  left join other_user ou on ou.conversation_id = c.id
  left join last_msg lm on lm.conversation_id = c.id
  left join unread u on u.conversation_id = c.id
  order by c.is_pinned desc nulls last, lm.at desc nulls last;
$$;

create or replace function public.create_group(group_name text, member_ids uuid[])
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  new_id uuid;
  uid uuid;
begin
  if group_name is null or trim(group_name) = '' then
    raise exception 'invalid group name';
  end if;

  insert into public.conversations (is_direct, is_group, name, created_by, direct_key)
  values (false, true, trim(group_name), auth.uid(), null)
  returning id into new_id;

  insert into public.conversation_participants (conversation_id, user_id, role)
  values (new_id, auth.uid(), 'admin')
  on conflict do nothing;

  foreach uid in array member_ids
  loop
    if uid is not null and uid <> auth.uid() then
      insert into public.conversation_participants (conversation_id, user_id, role)
      values (new_id, uid, 'member')
      on conflict do nothing;
    end if;
  end loop;

  return new_id;
end;
$$;

create or replace function public.toggle_pin(target_conversation_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_conversation_member(target_conversation_id, auth.uid()) then
    raise exception 'not a member';
  end if;

  update public.conversation_participants
  set is_pinned = not is_pinned
  where conversation_id = target_conversation_id and user_id = auth.uid();
end;
$$;

create or replace function public.toggle_mute(target_conversation_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_conversation_member(target_conversation_id, auth.uid()) then
    raise exception 'not a member';
  end if;

  update public.conversation_participants
  set is_muted = not is_muted
  where conversation_id = target_conversation_id and user_id = auth.uid();
end;
$$;

create or replace function public.mark_conversation_read(target_conversation_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_conversation_member(target_conversation_id, auth.uid()) then
    raise exception 'not a member';
  end if;

  update public.conversation_participants
  set last_read_at = timezone('utc'::text, now())
  where conversation_id = target_conversation_id and user_id = auth.uid();

  update public.messages
  set seen_at = timezone('utc'::text, now())
  where conversation_id = target_conversation_id
    and receiver_id = auth.uid()
    and seen_at is null;
end;
$$;

create or replace function public.edit_message(target_message_id uuid, new_content text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  msg record;
begin
  if new_content is null or trim(new_content) = '' then
    raise exception 'invalid content';
  end if;

  select * into msg from public.messages where id = target_message_id;

  if msg.sender_id <> auth.uid() then
    raise exception 'not owner';
  end if;

  if msg.message_type <> 'text' then
    raise exception 'only text editable';
  end if;

  if msg.deleted_at is not null then
    raise exception 'deleted';
  end if;

  update public.messages
  set content = trim(new_content), edited_at = timezone('utc'::text, now())
  where id = target_message_id;
end;
$$;

create or replace function public.delete_message(target_message_id uuid, for_everyone boolean)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  msg record;
begin
  select * into msg from public.messages where id = target_message_id;

  if msg is null then
    raise exception 'not found';
  end if;

  if for_everyone then
    if msg.sender_id <> auth.uid() then
      raise exception 'not owner';
    end if;
    if msg.created_at < timezone('utc'::text, now()) - interval '1 hour' then
      raise exception 'too late to delete for everyone';
    end if;
    update public.messages
    set deleted_at = timezone('utc'::text, now()), deleted_for_everyone = true, content = ''
    where id = target_message_id;
  else
    insert into public.message_user_deletions (message_id, user_id)
    values (target_message_id, auth.uid())
    on conflict do nothing;
  end if;
end;
$$;

create or replace function public.react_to_message(target_message_id uuid, emoji text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  conv uuid;
begin
  select conversation_id into conv from public.messages where id = target_message_id;
  if conv is null or not public.is_conversation_member(conv, auth.uid()) then
    raise exception 'not allowed';
  end if;

  insert into public.message_reactions (message_id, user_id, emoji)
  values (target_message_id, auth.uid(), trim(emoji))
  on conflict (message_id, user_id, emoji) do nothing;
end;
$$;

create or replace function public.unreact_message(target_message_id uuid, emoji text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  delete from public.message_reactions
  where message_id = target_message_id and user_id = auth.uid() and emoji = trim(emoji);
end;
$$;

-- ---------------------------------------------------------------------------
-- RLS new tables
-- ---------------------------------------------------------------------------
alter table public.message_user_deletions enable row level security;
alter table public.message_reactions enable row level security;
alter table public.message_receipts enable row level security;
alter table public.statuses enable row level security;
alter table public.status_views enable row level security;

drop policy if exists "message_user_deletions_own" on public.message_user_deletions;
create policy "message_user_deletions_own"
on public.message_user_deletions for all to authenticated
using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "message_reactions_select_members" on public.message_reactions;
create policy "message_reactions_select_members"
on public.message_reactions for select to authenticated
using (
  exists (
    select 1 from public.messages m
    where m.id = message_id and public.is_conversation_member(m.conversation_id, auth.uid())
  )
);

drop policy if exists "message_reactions_insert_self" on public.message_reactions;
create policy "message_reactions_insert_self"
on public.message_reactions for insert to authenticated
with check (user_id = auth.uid());

drop policy if exists "message_reactions_delete_self" on public.message_reactions;
create policy "message_reactions_delete_self"
on public.message_reactions for delete to authenticated
using (user_id = auth.uid());

drop policy if exists "message_receipts_select_members" on public.message_receipts;
create policy "message_receipts_select_members"
on public.message_receipts for select to authenticated
using (
  exists (
    select 1 from public.messages m
    where m.id = message_id and public.is_conversation_member(m.conversation_id, auth.uid())
  )
);

drop policy if exists "message_receipts_insert_self" on public.message_receipts;
create policy "message_receipts_insert_self"
on public.message_receipts for insert to authenticated
with check (user_id = auth.uid());

drop policy if exists "statuses_select_authenticated" on public.statuses;
create policy "statuses_select_authenticated"
on public.statuses for select to authenticated
using (expires_at > timezone('utc'::text, now()));

drop policy if exists "statuses_insert_self" on public.statuses;
create policy "statuses_insert_self"
on public.statuses for insert to authenticated
with check (user_id = auth.uid());

drop policy if exists "statuses_delete_self" on public.statuses;
create policy "statuses_delete_self"
on public.statuses for delete to authenticated
using (user_id = auth.uid());

drop policy if exists "status_views_all_authenticated" on public.status_views;
drop policy if exists "status_views_select" on public.status_views;
drop policy if exists "status_views_insert_self" on public.status_views;

create policy "status_views_select"
on public.status_views for select to authenticated using (true);

create policy "status_views_insert_self"
on public.status_views for insert to authenticated
with check (viewer_id = auth.uid());

-- Allow update profiles last_seen and bio for self (already profiles_upsert_self)

-- Messages: allow update for edit (sender) - extend policy
drop policy if exists "messages_update_sender_edit" on public.messages;
create policy "messages_update_sender_edit"
on public.messages for update to authenticated
using (sender_id = auth.uid())
with check (sender_id = auth.uid());

-- Insert messages: allow group (receiver_id null) when member
drop policy if exists "messages_insert_members" on public.messages;
create policy "messages_insert_members"
on public.messages for insert to authenticated
with check (
  sender_id = auth.uid()
  and public.is_conversation_member(conversation_id, auth.uid())
  and (
    receiver_id is null
    or (
      receiver_id is not null
      and public.is_conversation_member(conversation_id, receiver_id)
    )
  )
);

-- Conversation participants: allow insert for create_group (only via RPC security definer) -
-- direct inserts blocked except through trigger. Add policy for select only already exists.
-- Allow users to update their own participant row (pin, mute, last_read)
drop policy if exists "conversation_participants_update_self" on public.conversation_participants;
create policy "conversation_participants_update_self"
on public.conversation_participants for update to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- Realtime publication
-- ---------------------------------------------------------------------------
do $$
begin
  alter publication supabase_realtime add table public.message_reactions;
exception when duplicate_object then null;
end $$;

do $$
begin
  alter publication supabase_realtime add table public.conversation_participants;
exception when duplicate_object then null;
end $$;

do $$
begin
  alter publication supabase_realtime add table public.statuses;
exception when duplicate_object then null;
end $$;

do $$
begin
  alter publication supabase_realtime add table public.profiles;
exception when duplicate_object then null;
end $$;

-- Grants
grant execute on function public.update_last_seen() to authenticated;
grant execute on function public.get_chat_list() to authenticated;
grant execute on function public.create_group(text, uuid[]) to authenticated;
grant execute on function public.toggle_pin(uuid) to authenticated;
grant execute on function public.toggle_mute(uuid) to authenticated;
grant execute on function public.mark_conversation_read(uuid) to authenticated;
grant execute on function public.edit_message(uuid, text) to authenticated;
grant execute on function public.delete_message(uuid, boolean) to authenticated;
grant execute on function public.react_to_message(uuid, text) to authenticated;
grant execute on function public.unreact_message(uuid, text) to authenticated;
