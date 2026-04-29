import { supabase } from "@/lib/supabaseClient"

export type ChatListRow = {
  conversation_id: string
  is_direct: boolean
  is_group: boolean
  display_name: string
  display_avatar: string | null
  other_user_id: string | null
  last_message_content: string | null
  last_message_at: string | null
  unread_count: number
  is_pinned: boolean
  is_muted: boolean
}

export async function fetchChatList(): Promise<ChatListRow[]> {
  const { data, error } = await supabase.rpc("get_chat_list")

  if (error) {
    const message = [error.message, error.details, error.hint].filter(Boolean).join(" | ")
    throw new Error(message || "get_chat_list failed")
  }

  return (data ?? []).map((row) => ({
    ...row,
    unread_count: Number(row.unread_count ?? 0),
  })) as ChatListRow[]
}
