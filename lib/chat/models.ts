import type { User } from "@supabase/supabase-js"
import type { Database } from "@/lib/database.types"

export type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"]
export type MessageRow = Database["public"]["Tables"]["messages"]["Row"]

export interface ChatUser {
  avatarUrl: string | null
  email: string | null
  fullName: string | null
  id: string
  bio?: string | null
  statusText?: string | null
  lastSeenAt?: string | null
}

export interface SendMessageInput {
  content: string
  conversationId: string
  /** Direct messages require receiver; group messages omit */
  receiverId?: string | null
  senderId: string
  messageType?: MessageRow["message_type"]
  fileUrl?: string | null
  replyToId?: string | null
  forwardOfId?: string | null
}

export function mapProfileRowToChatUser(profile: {
  avatar_url: string | null
  email: string | null
  full_name: string | null
  id: string
  bio?: string | null
  status_text?: string | null
  last_seen_at?: string | null
}): ChatUser {
  return {
    id: profile.id,
    email: profile.email,
    fullName: profile.full_name,
    avatarUrl: profile.avatar_url,
    bio: profile.bio ?? null,
    statusText: profile.status_text ?? null,
    lastSeenAt: profile.last_seen_at ?? null,
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
