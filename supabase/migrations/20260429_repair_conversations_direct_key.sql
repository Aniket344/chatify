-- Repair migration for existing DBs where `public.conversations` was created
-- without `direct_key` (so rerunning 20260428_upgrade_chat.sql fails).

alter table public.conversations
  add column if not exists direct_key text;

-- 20260428 expects `is_direct` to exist too.
alter table public.conversations
  add column if not exists is_direct boolean not null default true;

-- 20260428 expects this index name.
create unique index if not exists conversations_direct_key_unique_idx
  on public.conversations (direct_key)
  where direct_key is not null;

