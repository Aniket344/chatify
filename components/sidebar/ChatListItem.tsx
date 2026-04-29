"use client"

import { formatDistanceToNowStrict } from "date-fns"
import { Pin } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Avatar } from "@/components/ui/Avatar"
import { Badge } from "@/components/ui/Badge"
import { cn } from "@/lib/cn"
import type { ChatListRow } from "@/lib/chat/chat-list"
import { useChatStore } from "@/store/chat-store"
import type { ChatUser } from "@/lib/chat/models"

export function ChatListItem({
  chat,
  active,
  isTyping,
}: {
  chat: ChatListRow
  active: boolean
  isTyping?: boolean
}) {
  const setSelectedChat = useChatStore((s) => s.setSelectedChat)
  const setSelectedGroup = useChatStore((s) => s.setSelectedGroup)

  const handleSelect = () => {
    if (chat.is_group) {
      setSelectedGroup(chat.conversation_id, chat.display_name, chat.display_avatar)
      return
    }

    if (chat.other_user_id) {
      const peer: ChatUser = {
        id: chat.other_user_id,
        fullName: chat.display_name,
        email: null,
        avatarUrl: chat.display_avatar,
      }
      setSelectedChat(peer, chat.conversation_id)
    }
  }

  const time =
    chat.last_message_at != null
      ? formatDistanceToNowStrict(new Date(chat.last_message_at), { addSuffix: false })
      : ""

  return (
    <motion.div layout whileTap={{ scale: 0.99 }}>
      <Link
        href={`/chats/${chat.conversation_id}`}
        onClick={handleSelect}
        className={cn(
          "relative flex items-center gap-3 rounded-xl px-2 py-2.5 transition-colors",
          active ? "bg-[var(--bg-elevated)]" : "hover:bg-[var(--bg-hover)]"
        )}
      >
        {active ? (
          <span className="absolute left-0 top-1/2 h-8 w-1 -translate-y-1/2 rounded-r-full bg-[var(--accent)]" />
        ) : null}
        <Avatar
          alt={chat.display_name}
          fallback={chat.display_name}
          online={false}
          size="md"
          src={chat.display_avatar}
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <span className="truncate font-medium text-[var(--text-primary)]">{chat.display_name}</span>
            <span className="shrink-0 text-[10px] text-[var(--text-secondary)]">{time}</span>
          </div>
          <div className="mt-0.5 flex items-center justify-between gap-2">
            <p
              className={cn(
                "truncate text-xs",
                isTyping ? "font-medium italic text-[var(--accent)]" : "text-[var(--text-secondary)]"
              )}
            >
              {isTyping ? "typing..." : chat.last_message_content ?? "No messages yet"}
            </p>
            <div className="flex shrink-0 items-center gap-1">
              {chat.is_pinned ? <Pin className="h-3.5 w-3.5 text-[var(--text-secondary)]" /> : null}
              {!isTyping && chat.unread_count > 0 ? (
                <Badge>{chat.unread_count > 99 ? "99+" : chat.unread_count}</Badge>
              ) : null}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
