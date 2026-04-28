import { supabase } from "@/lib/supabaseClient"
import type { SendMessageInput } from "@/lib/chat/models"

export async function fetchConversationMessages(conversationId: string) {
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true })

  if (error) {
    throw error
  }

  return data ?? []
}

export async function createMessage(input: SendMessageInput) {
  const { data, error } = await supabase
    .from("messages")
    .insert({
      content: input.content.trim(),
      conversation_id: input.conversationId,
      receiver_id: input.receiverId,
      sender_id: input.senderId,
    })
    .select("*")
    .single()

  if (error) {
    throw error
  }

  return data
}

export async function markConversationSeen(conversationId: string, currentUserId: string) {
  const { error } = await supabase
    .from("messages")
    .update({ seen_at: new Date().toISOString() })
    .eq("conversation_id", conversationId)
    .eq("receiver_id", currentUserId)
    .is("seen_at", null)

  if (error) {
    throw error
  }
}
