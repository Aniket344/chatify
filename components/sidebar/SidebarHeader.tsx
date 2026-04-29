"use client"

import { MessageCircleMore, MoreVertical, SquarePen } from "lucide-react"
import { IconButton } from "@/components/ui/IconButton"
import { ThemeToggle } from "@/components/ui/ThemeToggle"

export function SidebarHeader({
  onNewChat,
  onMenu,
}: {
  onNewChat?: () => void
  onMenu?: () => void
}) {
  return (
    <header className="flex items-center justify-between px-3 py-3">
      <div className="flex items-center gap-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--accent)]/15 text-[var(--accent)]">
          <MessageCircleMore className="h-6 w-6" strokeWidth={2} />
        </div>
        <div>
          <h1 className="text-lg font-bold tracking-tight text-[var(--text-primary)]">Chatify</h1>
        </div>
      </div>
      <div className="flex items-center gap-0.5">
        <IconButton aria-label="New chat" onClick={onNewChat} title="New chat">
          <SquarePen className="h-5 w-5" />
        </IconButton>
        <ThemeToggle />
        <IconButton aria-label="Menu" onClick={onMenu} title="Menu">
          <MoreVertical className="h-5 w-5" />
        </IconButton>
      </div>
    </header>
  )
}
