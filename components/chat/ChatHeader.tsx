"use client"

import { ArrowLeft, MoreVertical, Phone, Search, Video } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { motion } from "framer-motion"
import { Avatar } from "@/components/ui/Avatar"
import { IconButton } from "@/components/ui/IconButton"
import { getDisplayName, getInitials, type ChatUser } from "@/lib/chat/models"
import { useUiStore } from "@/store/ui-store"

export function ChatHeader({
  user,
  isGroup,
  isTyping,
  isOnline,
  lastSeenAt,
  onBack,
}: {
  user: ChatUser
  isGroup?: boolean
  isTyping?: boolean
  isOnline?: boolean
  lastSeenAt?: string | null
  onBack?: () => void
}) {
  const setContactPanelOpen = useUiStore((s) => s.setContactPanelOpen)

  const subtitle = (() => {
    if (isTyping) {
      return (
        <span className="flex items-center gap-1.5 font-medium text-[var(--accent)]">
          <span className="typing-indicator">
            <span />
            <span />
            <span />
          </span>
          typing...
        </span>
      )
    }
    if (isGroup) {
      return <span className="text-[var(--text-secondary)]">Group · Tap info for details</span>
    }
    if (isOnline) {
      return <span className="text-[var(--accent)]">Online</span>
    }
    if (lastSeenAt) {
      return (
        <span className="text-[var(--text-secondary)]">
          last seen {formatDistanceToNow(new Date(lastSeenAt), { addSuffix: true })}
        </span>
      )
    }
    return <span className="text-[var(--text-secondary)]">Offline</span>
  })()

  return (
    <header className="flex shrink-0 items-center justify-between gap-3 border-b border-[var(--border)] bg-[var(--bg-panel)] px-3 py-2.5">
      <div className="flex min-w-0 items-center gap-3">
        {onBack ? (
          <div className="lg:hidden">
            <IconButton aria-label="Back" onClick={onBack} size="sm">
              <ArrowLeft className="h-5 w-5" />
            </IconButton>
          </div>
        ) : null}
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Avatar
            alt={getDisplayName(user)}
            fallback={getInitials(user)}
            online={Boolean(isOnline)}
            size="md"
            src={user.avatarUrl}
          />
        </motion.div>
        <div className="min-w-0">
          <h2 className="truncate text-base font-semibold text-[var(--text-primary)]">{getDisplayName(user)}</h2>
          <div className="truncate text-xs">{subtitle}</div>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-0.5">
        <IconButton aria-label="Video call">
          <Video className="h-5 w-5" />
        </IconButton>
        <IconButton aria-label="Voice call">
          <Phone className="h-5 w-5" />
        </IconButton>
        <IconButton aria-label="Search">
          <Search className="h-5 w-5" />
        </IconButton>
        <IconButton aria-label="Contact info" onClick={() => setContactPanelOpen(true)}>
          <MoreVertical className="h-5 w-5" />
        </IconButton>
      </div>
    </header>
  )
}
