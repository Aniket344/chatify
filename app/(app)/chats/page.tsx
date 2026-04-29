"use client"

import { Menu } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import { IconButton } from "@/components/ui/IconButton"
import { useUiStore } from "@/store/ui-store"

export default function ChatsIndexPage() {
  const setSidebarOpen = useUiStore((s) => s.setSidebarOpen)

  return (
    <div className="relative flex h-full min-h-0 flex-1 flex-col bg-[var(--bg-panel)]">
      <header className="flex items-center gap-2 border-b border-[var(--border)] px-3 py-2 lg:hidden">
        <IconButton aria-label="Open menu" onClick={() => setSidebarOpen(true)}>
          <Menu className="h-5 w-5" />
        </IconButton>
        <span className="text-sm font-semibold text-[var(--text-primary)]">Chats</span>
      </header>
      <div className="chat-wallpaper flex flex-1 flex-col items-center justify-center px-6 text-center">
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md rounded-3xl border border-[var(--border)] bg-[var(--bg-panel)]/90 p-10 shadow-lg backdrop-blur"
          initial={{ opacity: 0, y: 12 }}
        >
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--accent)]/15 text-3xl">
            💬
          </div>
          <h2 className="text-xl font-bold text-[var(--text-primary)]">Welcome to Chatify</h2>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">
            Select a chat from the list or start a new conversation.
          </p>
          <p className="mt-6 text-xs text-[var(--text-secondary)] lg:hidden">
            Use the menu to open your chat list.
          </p>
          <Link
            className="mt-6 inline-flex rounded-full bg-[var(--accent)] px-5 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-[var(--accent-hover)]"
            href="/settings"
          >
            Edit profile
          </Link>
        </motion.div>
      </div>
    </div>
  )
}
