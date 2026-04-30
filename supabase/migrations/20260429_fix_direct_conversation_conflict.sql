-- Fix direct conversation creation failures:
-- "there is no unique or exclusion constraint matching the ON CONFLICT specification"

-- Ensure a real unique constraint exists for direct_key so conflict handling is valid.
do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'conversations_direct_key_unique'
      and conrelid = 'public.conversations'::regclass
  ) then
    alter table public.conversations
      add constraint conversations_direct_key_unique unique (direct_key);
  end if;
end $$;

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

  begin
    insert into public.conversations (is_direct, direct_key)
    values (true, direct_conversation_key)
    returning id into new_conversation_id;
  exception
    when unique_violation then
      select c.id
      into new_conversation_id
      from public.conversations c
      where c.is_direct = true
        and c.direct_key = direct_conversation_key
      order by c.created_at asc
      limit 1;
  end;

  if new_conversation_id is null then
    raise exception 'unable to create direct conversation';
  end if;

  insert into public.conversation_participants (conversation_id, user_id)
  values
    (new_conversation_id, auth.uid()),
    (new_conversation_id, other_user_id)
  on conflict do nothing;

  return new_conversation_id;
end;
$$;

grant execute on function public.get_or_create_direct_conversation(uuid) to authenticated;
