import { supabase } from "@/lib/supabaseClient"

export async function getOrCreateDirectConversation(otherUserId: string) {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!otherUserId || (user?.id && user.id === otherUserId)) {
    throw new Error("Invalid user selected for direct chat")
  }

  const { data, error } = await supabase.rpc("get_or_create_direct_conversation", {
    other_user_id: otherUserId,
  })

  if (!error) {
    return data as string
  }

  const rawMessage =
    error instanceof Error
      ? error.message
      : typeof error === "object" && error && "message" in error
        ? String((error as { message?: unknown }).message ?? "")
        : String(error ?? "")

  if (rawMessage.toLowerCase().includes("invalid other user")) {
    throw new Error("Cannot start chat with this user")
  }

  throw new Error(rawMessage || "Could not open chat. Please check database RPC migrations.")
}

export async function createGroupConversation(groupName: string, memberIds: string[]) {
  const { data, error } = await supabase.rpc("create_group", {
    group_name: groupName,
    member_ids: memberIds,
  })

  if (error) {
    throw error
  }

  return data as string
}
