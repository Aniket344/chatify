import { supabase } from "@/lib/supabaseClient"

export type ReactionRow = {
  id: string
  message_id: string
  user_id: string
  emoji: string
  created_at: string
}

export async function fetchReactionsForMessages(messageIds: string[]) {
  if (messageIds.length === 0) {
    return [] as ReactionRow[]
  }

  const { data, error } = await supabase.from("message_reactions").select("*").in("message_id", messageIds)

  if (error) {
    throw error
  }

  return (data ?? []) as ReactionRow[]
}

export async function addReaction(messageId: string, emoji: string) {
  const { error } = await supabase.rpc("react_to_message", {
    target_message_id: messageId,
    emoji,
  })
  if (error) {
    throw error
  }
}

export async function removeReaction(messageId: string, emoji: string) {
  const { error } = await supabase.rpc("unreact_message", {
    target_message_id: messageId,
    emoji,
  })
  if (error) {
    throw error
  }
}
