-- Ensure RPC function exists for the chat list UI.
-- Run this migration after applying 20260428_upgrade_chat.sql and 20260429_full_features.sql.

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

grant execute on function public.get_chat_list() to authenticated;

