# Chatify

WhatsApp-style realtime chat (Next.js App Router + Supabase).

## Setup

1. **Environment** — copy `.env.local` with:

   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

2. **Database** — in the Supabase SQL editor, run migrations in order:

   - [`supabase/migrations/20260428_upgrade_chat.sql`](supabase/migrations/20260428_upgrade_chat.sql)
   - [`supabase/migrations/20260429_full_features.sql`](supabase/migrations/20260429_full_features.sql)

3. **Storage** — run [`supabase/storage_policies.sql`](supabase/storage_policies.sql) (creates buckets `avatars`, `chat-attachments`, `voice-notes`, `status-media` and policies). Adjust if policies already exist.

4. **Google login** — enable Google provider in Supabase Auth and add redirect URL:  
   `https://<your-host>/auth/callback` (local: `http://localhost:3000/auth/callback`).

## Dev

```bash
npm install
npm run dev
```

Open `/` — you are redirected to `/login` or `/chats`.

## Stack

Next.js 16, TypeScript, Tailwind v4, Supabase (Auth, Postgres, Realtime, Storage), Zustand, Framer Motion, emoji-mart, Sonner, next-themes.
