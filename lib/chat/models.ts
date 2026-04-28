import type { User } from "@supabase/supabase-js"
import type { Database } from "@/lib/database.types"

export type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"]
export type MessageRow = Database["public"]["Tables"]["messages"]["Row"]

export interface ChatUser {
  avatarUrl: string | null
  email: string | null
  fullName: string | null
  id: string
}

export interface SendMessageInput {
  content: string
  conversationId: string
  receiverId: string
  senderId: string
}

export function mapProfileRowToChatUser(profile: {
  avatar_url: string | null
  email: string | null
  full_name: string | null
  id: string
}): ChatUser {
  return {
    id: profile.id,
    email: profile.email,
    fullName: profile.full_name,
    avatarUrl: profile.avatar_url,
  }
}

export function mapAuthUserToChatUser(user: User): ChatUser {
  return {
    id: user.id,
    email: user.email ?? null,
    fullName:
      (typeof user.user_metadata?.display_name === "string" && user.user_metadata.display_name) ||
      (typeof user.user_metadata?.full_name === "string" && user.user_metadata.full_name) ||
      (typeof user.user_metadata?.name === "string" && user.user_metadata.name) ||
      user.email?.split("@")[0] ||
      "Unknown User",
    avatarUrl:
      (typeof user.user_metadata?.avatar_url === "string" && user.user_metadata.avatar_url) || null,
  }
}

export function getDisplayName(user: Pick<ChatUser, "email" | "fullName">) {
  return user.fullName || user.email || "Unknown User"
}

export function getInitials(user: Pick<ChatUser, "email" | "fullName">) {
  const name = getDisplayName(user).trim()
  const parts = name.split(/\s+/).slice(0, 2)

  return parts
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("")
    .slice(0, 2)
}
