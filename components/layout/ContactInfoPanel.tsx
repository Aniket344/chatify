"use client"

import { useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { Image as ImageIcon, Search, ShieldOff, Video, Volume2, X } from "lucide-react"
import { Avatar } from "@/components/ui/Avatar"
import { IconButton } from "@/components/ui/IconButton"
import { Switch } from "@/components/ui/Switch"
import { getDisplayName, getInitials, type ChatUser } from "@/lib/chat/models"
import { useUiStore } from "@/store/ui-store"
import { supabase } from "@/lib/supabaseClient"

export function ContactInfoPanel({
  user,
  isGroup,
  conversationId,
}: {
  user: ChatUser | null
  isGroup?: boolean
  conversationId: string | null
}) {
  const open = useUiStore((s) => s.contactPanelOpen)
  const setOpen = useUiStore((s) => s.setContactPanelOpen)
  const [muted, setMuted] = useState(false)

  if (!user || !conversationId) {
    return null
  }

  return (
    <AnimatePresence>
      {open ? (
        <>
          <motion.button
            animate={{ opacity: 1 }}
            aria-label="Close overlay"
            className="fixed inset-0 z-[90] bg-black/30 backdrop-blur-sm lg:hidden"
            exit={{ opacity: 0 }}
            initial={{ opacity: 0 }}
            type="button"
            onClick={() => setOpen(false)}
          />
          <motion.aside
            animate={{ x: 0, opacity: 1 }}
            className="fixed inset-y-0 right-0 z-[95] flex h-full w-full max-w-md flex-col border-l border-[var(--border)] bg-[var(--bg-panel)] shadow-2xl lg:static lg:z-0 lg:max-w-[340px] lg:shrink-0 lg:shadow-none"
            exit={{ x: "100%", opacity: 0.8 }}
            initial={{ x: "100%", opacity: 0.8 }}
            transition={{ type: "spring", stiffness: 320, damping: 32 }}
          >
            <div className="flex items-center justify-between border-b border-[var(--border)] px-3 py-3">
              <h2 className="text-sm font-semibold text-[var(--text-primary)]">Contact Info</h2>
              <IconButton aria-label="Close" onClick={() => setOpen(false)} size="sm">
                <X className="h-5 w-5" />
              </IconButton>
            </div>
            <div className="chat-scroll flex-1 overflow-y-auto px-5 py-6 text-center">
              <div className="mx-auto mb-4">
                <Avatar alt={getDisplayName(user)} fallback={getInitials(user)} size="xl" src={user.avatarUrl} />
              </div>
              <h3 className="text-lg font-semibold text-[var(--text-primary)]">{getDisplayName(user)}</h3>
              <p className="mt-1 text-sm text-[var(--accent)]">
                {isGroup ? "Group" : user.statusText || "Hey there! I am using Chatify."}
              </p>
              <div className="mt-6 grid grid-cols-4 gap-2">
                {[
                  { icon: Volume2, label: "Audio" },
                  { icon: Video, label: "Video" },
                  { icon: Search, label: "Search" },
                  { icon: ImageIcon, label: "More" },
                ].map(({ icon: Icon, label }) => (
                  <button
                    key={label}
                    className="flex flex-col items-center gap-1 rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] py-3 text-[10px] text-[var(--text-secondary)] transition hover:bg-[var(--bg-hover)]"
                    type="button"
                  >
                    <Icon className="h-5 w-5 text-[var(--text-primary)]" />
                    {label}
                  </button>
                ))}
              </div>
              <div className="mt-8 rounded-2xl border border-[var(--border)] bg-[var(--bg-elevated)] p-4 text-left">
                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]">About</p>
                <p className="mt-1 text-sm text-[var(--text-primary)]">{user.bio || "No bio yet."}</p>
              </div>
              <div className="mt-6 text-left">
                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]">
                  Media, links and docs
                </p>
                <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="h-16 w-16 shrink-0 rounded-lg bg-[var(--bg-hover)] ring-1 ring-[var(--border)]"
                    />
                  ))}
                </div>
              </div>
              <div className="mt-6 space-y-3 rounded-2xl border border-[var(--border)] bg-[var(--bg-elevated)] p-4 text-left">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm text-[var(--text-primary)]">Starred messages</span>
                  <span className="text-xs text-[var(--text-secondary)]">—</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm text-[var(--text-primary)]">Mute notifications</span>
                  <Switch
                    checked={muted}
                    onCheckedChange={async (v) => {
                      setMuted(v)
                      await supabase.rpc("toggle_mute", { target_conversation_id: conversationId })
                    }}
                  />
                </div>
                <button className="w-full text-left text-sm text-[var(--text-primary)]" type="button">
                  Wallpaper &amp; Sound
                </button>
                <button
                  className="flex w-full items-center gap-2 text-left text-sm font-medium text-rose-600"
                  type="button"
                >
                  <ShieldOff className="h-4 w-4" />
                  Block contact
                </button>
              </div>
            </div>
          </motion.aside>
        </>
      ) : null}
    </AnimatePresence>
  )
}
