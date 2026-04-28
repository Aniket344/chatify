create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text unique,
  full_name text,
  avatar_url text,
  created_at timestamptz not null default timezone('utc'::text, now())
);

create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  direct_key text,
  is_direct boolean not null default true,
  created_at timestamptz not null default timezone('utc'::text, now())
);

create table if not exists public.conversation_participants (
  conversation_id uuid not null references public.conversations (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default timezone('utc'::text, now()),
  primary key (conversation_id, user_id)
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations (id) on delete cascade,
  sender_id uuid not null references auth.users (id) on delete cascade,
  receiver_id uuid not null references auth.users (id) on delete cascade,
  content text not null check (char_length(trim(content)) > 0),
  message_type text not null default 'text' check (message_type in ('text', 'image', 'file')),
  file_url text,
  seen_at timestamptz,
  created_at timestamptz not null default timezone('utc'::text, now())
);

create unique index if not exists conversation_participants_user_pair_idx
  on public.conversation_participants (user_id, conversation_id);

create unique index if not exists conversations_direct_key_unique_idx
  on public.conversations (direct_key)
  where direct_key is not null;

create index if not exists messages_conversation_created_at_idx
  on public.messages (conversation_id, created_at desc);

create index if not exists messages_sender_receiver_created_at_idx
  on public.messages (sender_id, receiver_id, created_at desc);

alter publication supabase_realtime add table public.messages;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(
      new.raw_user_meta_data ->> 'display_name',
      new.raw_user_meta_data ->> 'full_name',
      new.raw_user_meta_data ->> 'name'
    ),
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do update
  set
    email = excluded.email,
    full_name = coalesce(excluded.full_name, public.profiles.full_name),
    avatar_url = coalesce(excluded.avatar_url, public.profiles.avatar_url);

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

create or replace function public.get_chat_users()
returns table (
  id uuid,
  email text,
  full_name text,
  avatar_url text
)
language sql
security definer
set search_path = public
as $$
  select
    p.id,
    p.email,
    p.full_name,
    p.avatar_url
  from public.profiles p
  where p.id <> auth.uid()
  order by coalesce(p.full_name, p.email);
$$;

create or replace function public.build_direct_conversation_key(first_user_id uuid, second_user_id uuid)
returns text
language sql
immutable
as $$
  select case
    when first_user_id::text < second_user_id::text
      then first_user_id::text || ':' || second_user_id::text
    else second_user_id::text || ':' || first_user_id::text
  end;
$$;

create or replace function public.get_or_create_direct_conversation(other_user_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  direct_conversation_key text;
  existing_conversation_id uuid;
  new_conversation_id uuid;
begin
  if other_user_id is null or other_user_id = auth.uid() then
    raise exception 'invalid other user';
  end if;

  direct_conversation_key := public.build_direct_conversation_key(auth.uid(), other_user_id);

  perform pg_advisory_xact_lock(hashtext(direct_conversation_key));

  select c.id
  into existing_conversation_id
  from public.conversations c
  where c.is_direct = true
    and c.direct_key = direct_conversation_key
  order by c.created_at asc
  limit 1;

  if existing_conversation_id is not null then
    return existing_conversation_id;
  end if;

  insert into public.conversations (is_direct, direct_key)
  values (true, direct_conversation_key)
  on conflict (direct_key) do update
    set direct_key = excluded.direct_key
  returning id into new_conversation_id;

  insert into public.conversation_participants (conversation_id, user_id)
  values
    (new_conversation_id, auth.uid()),
    (new_conversation_id, other_user_id)
  on conflict do nothing;

  return new_conversation_id;
end;
$$;

create or replace function public.is_conversation_member(target_conversation_id uuid, target_user_id uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.conversation_participants
    where conversation_id = target_conversation_id
      and user_id = target_user_id
  );
$$;

alter table public.profiles enable row level security;
alter table public.conversations enable row level security;
alter table public.conversation_participants enable row level security;
alter table public.messages enable row level security;

drop policy if exists "profiles_select_authenticated" on public.profiles;
create policy "profiles_select_authenticated"
on public.profiles
for select
to authenticated
using (true);

drop policy if exists "profiles_upsert_self" on public.profiles;
create policy "profiles_upsert_self"
on public.profiles
for all
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists "conversations_select_members" on public.conversations;
create policy "conversations_select_members"
on public.conversations
for select
to authenticated
using (public.is_conversation_member(id, auth.uid()));

drop policy if exists "conversation_participants_select_members" on public.conversation_participants;
create policy "conversation_participants_select_members"
on public.conversation_participants
for select
to authenticated
using (public.is_conversation_member(conversation_id, auth.uid()));

drop policy if exists "messages_select_members" on public.messages;
create policy "messages_select_members"
on public.messages
for select
to authenticated
using (public.is_conversation_member(conversation_id, auth.uid()));

drop policy if exists "messages_insert_members" on public.messages;
create policy "messages_insert_members"
on public.messages
for insert
to authenticated
with check (
  sender_id = auth.uid()
  and public.is_conversation_member(conversation_id, auth.uid())
  and public.is_conversation_member(conversation_id, receiver_id)
);

drop policy if exists "messages_update_receiver_seen" on public.messages;
create policy "messages_update_receiver_seen"
on public.messages
for update
to authenticated
using (receiver_id = auth.uid() or sender_id = auth.uid())
with check (
  receiver_id = auth.uid() or sender_id = auth.uid()
);

grant execute on function public.get_chat_users() to authenticated;
grant execute on function public.build_direct_conversation_key(uuid, uuid) to authenticated;
grant execute on function public.get_or_create_direct_conversation(uuid) to authenticated;
grant execute on function public.is_conversation_member(uuid, uuid) to authenticated;
