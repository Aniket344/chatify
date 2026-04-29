"use client"

import { AnimatePresence, motion } from "framer-motion"
import { useMemo } from "react"
import { usePathname } from "next/navigation"
import { ChatListItem } from "@/components/sidebar/ChatListItem"
import { FilterPills } from "@/components/sidebar/FilterPills"
import { SearchBar } from "@/components/sidebar/SearchBar"
import { SidebarHeader } from "@/components/sidebar/SidebarHeader"
import type { ChatListRow } from "@/lib/chat/chat-list"
import { useUiStore } from "@/store/ui-store"
export function Sidebar({
  chats,
  isLoading,
  error,
  typingByConversationId = {},
  onNewDirectChat,
  onOpenCreateGroup,
}: {
  chats: ChatListRow[]
  isLoading: boolean
  error?: string | null
  typingByConversationId?: Record<string, boolean>
  onNewDirectChat?: () => void
  onOpenCreateGroup?: () => void
}) {
  const pathname = usePathname()
  const activeId = pathname.startsWith("/chats/") ? pathname.split("/")[2] ?? null : null
  const chatFilter = useUiStore((s) => s.chatFilter)
  const searchQuery = useUiStore((s) => s.searchQuery)
  const setChatFilter = useUiStore((s) => s.setChatFilter)
  const setSearchQuery = useUiStore((s) => s.setSearchQuery)
  const sidebarOpen = useUiStore((s) => s.sidebarOpen)
  const setSidebarOpen = useUiStore((s) => s.setSidebarOpen)

  const filtered = useMemo(() => {
    let rows = chats

    const q = searchQuery.trim().toLowerCase()
    if (q) {
      rows = rows.filter((c) => c.display_name.toLowerCase().includes(q))
    }

    if (chatFilter === "unread") {
      rows = rows.filter((c) => c.unread_count > 0)
    }
    if (chatFilter === "groups") {
      rows = rows.filter((c) => c.is_group)
    }
    if (chatFilter === "pinned") {
      rows = rows.filter((c) => c.is_pinned)
    }

    const pinned = rows.filter((c) => c.is_pinned)
    const rest = rows.filter((c) => !c.is_pinned)
    return [...pinned.sort((a, b) => (b.last_message_at ?? "").localeCompare(a.last_message_at ?? "")), ...rest]
  }, [chats, chatFilter, searchQuery])

  return (
    <>
      <AnimatePresence>
        {sidebarOpen ? (
          <motion.button
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
            exit={{ opacity: 0 }}
            initial={{ opacity: 0 }}
            type="button"
            aria-label="Close sidebar"
            onClick={() => setSidebarOpen(false)}
          />
        ) : null}
      </AnimatePresence>

      <aside
        className={[
          "fixed inset-y-0 left-0 z-50 flex w-full max-w-[min(100%,420px)] flex-col border-r border-[var(--border)] bg-[var(--bg-sidebar)] shadow-xl transition-transform duration-300 lg:static lg:z-0 lg:max-w-[380px] lg:translate-x-0 lg:shadow-none",
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        ].join(" ")}
      >
        <SidebarHeader onMenu={onOpenCreateGroup} onNewChat={onNewDirectChat} />
        <SearchBar onChange={setSearchQuery} value={searchQuery} />
        <FilterPills active={chatFilter} onChange={setChatFilter} />

        <div className="chat-scroll flex-1 overflow-y-auto px-2 pb-20 lg:pb-4">
          {error ? (
            <div className="mx-2 mt-2 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-700">
              Failed to load chats: {error}
            </div>
          ) : null}
          {isLoading ? (
            <div className="space-y-2 p-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex gap-3 rounded-xl p-2">
                  <div className="h-12 w-12 animate-shimmer rounded-full" />
                  <div className="flex-1 space-y-2 py-1">
                    <div className="h-3 w-32 animate-shimmer rounded-full" />
                    <div className="h-2 w-48 animate-shimmer rounded-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-[var(--text-secondary)]">No chats match your filters.</p>
          ) : (
            <div className="space-y-0.5">
              {filtered.map((chat) => (
                <div
                  key={chat.conversation_id}
                  onClick={() => setSidebarOpen(false)}
                  role="presentation"
                >
                  <ChatListItem
                    active={activeId === chat.conversation_id}
                    chat={chat}
                    isTyping={Boolean(typingByConversationId[chat.conversation_id])}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </aside>
    </>
  )
}
