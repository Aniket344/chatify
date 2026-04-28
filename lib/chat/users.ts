import type { User } from "@supabase/supabase-js"
import { supabase } from "@/lib/supabaseClient"
import { mapAuthUserToChatUser, mapProfileRowToChatUser, type ChatUser } from "@/lib/chat/models"

function getMetadataName(user: User) {
  return (
    (typeof user.user_metadata?.display_name === "string" && user.user_metadata.display_name) ||
    (typeof user.user_metadata?.full_name === "string" && user.user_metadata.full_name) ||
    (typeof user.user_metadata?.name === "string" && user.user_metadata.name) ||
    user.email?.split("@")[0] ||
    null
  )
}

export async function ensureProfile(user: User) {
  const payload = {
    id: user.id,
    email: user.email ?? null,
    full_name: getMetadataName(user),
    avatar_url:
      (typeof user.user_metadata?.avatar_url === "string" && user.user_metadata.avatar_url) || null,
  }

  const { error } = await supabase.from("profiles").upsert(payload, { onConflict: "id" })

  if (error) {
    throw error
  }
}

export async function fetchCurrentChatUser(user: User): Promise<ChatUser> {
  await ensureProfile(user)

  const { data, error } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  if (error || !data) {
    return mapAuthUserToChatUser(user)
  }

  return mapProfileRowToChatUser(data)
}

export async function fetchChatUsers(currentUserId: string) {
  const { data, error } = await supabase.rpc("get_chat_users")

  if (error) {
    const fallback = await supabase.from("profiles").select("*").neq("id", currentUserId).order("full_name")

    if (fallback.error) {
      throw fallback.error
    }

    return (fallback.data ?? []).map(mapProfileRowToChatUser)
  }

  return (data ?? [])
    .filter((user) => user.id !== currentUserId)
    .map(mapProfileRowToChatUser)
}
