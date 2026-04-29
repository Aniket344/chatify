import { supabase } from "@/lib/supabaseClient"
import type { SendMessageInput } from "@/lib/chat/models"

const PAGE_SIZE = 40

export async function fetchConversationMessages(conversationId: string, before?: string) {
  let query = supabase
    .from("messages")
    .select("*")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: false })
    .limit(PAGE_SIZE)

  if (before) {
    query = query.lt("created_at", before)
  }

  const { data, error } = await query

  if (error) {
    throw error
  }

  return (data ?? []).reverse()
}

export async function createMessage(input: SendMessageInput) {
  const row = {
    content: input.content.trim(),
    conversation_id: input.conversationId,
    receiver_id: input.receiverId ?? null,
    sender_id: input.senderId,
    message_type: input.messageType ?? "text",
    file_url: input.fileUrl ?? null,
    reply_to_id: input.replyToId ?? null,
    forward_of_id: input.forwardOfId ?? null,
  }

  const { data, error } = await supabase.from("messages").insert(row).select("*").single()

  if (error) {
    throw error
  }

  return data
}

export async function markConversationSeen(conversationId: string, currentUserId: string) {
  const { error: rpcError } = await supabase.rpc("mark_conversation_read", {
    target_conversation_id: conversationId,
  })

  if (!rpcError) {
    return
  }

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

export async function rpcEditMessage(targetMessageId: string, newContent: string) {
  const { error } = await supabase.rpc("edit_message", {
    target_message_id: targetMessageId,
    new_content: newContent,
  })

  if (error) {
    throw error
  }
}

export async function rpcDeleteMessage(targetMessageId: string, forEveryone: boolean) {
  const { error } = await supabase.rpc("delete_message", {
    target_message_id: targetMessageId,
    for_everyone: forEveryone,
  })

  if (error) {
    throw error
  }
}
