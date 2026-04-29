"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Modal } from "@/components/ui/Modal"
import { Avatar } from "@/components/ui/Avatar"
import { getDisplayName, getInitials, type ChatUser } from "@/lib/chat/models"
import { getOrCreateDirectConversation } from "@/lib/chat/conversations"
export function StartDirectChatModal({
  open,
  onClose,
  users,
}: {
  open: boolean
  onClose: () => void
  users: ChatUser[]
}) {
  const router = useRouter()
  const [q, setQ] = useState("")
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  const filtered = users.filter(
    (u) =>
      getDisplayName(u).toLowerCase().includes(q.toLowerCase()) ||
      (u.email ?? "").toLowerCase().includes(q.toLowerCase())
  )

  const pick = async (user: ChatUser) => {
    setBusy(true)
    setErr(null)
    try {
      const id = await getOrCreateDirectConversation(user.id)
      onClose()
      router.push(`/chats/${id}`)
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Could not open chat")
    } finally {
      setBusy(false)
    }
  }

  return (
    <Modal onClose={onClose} open={open} title="New chat">
      <input
        className="mb-3 w-full rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] px-3 py-2 text-sm text-[var(--text-primary)] outline-none"
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search name or email"
        value={q}
      />
      {err ? <p className="mb-2 text-sm text-rose-600">{err}</p> : null}
      <div className="max-h-72 space-y-1 overflow-y-auto">
        {filtered.map((u) => (
          <button
            key={u.id}
            className="flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left transition hover:bg-[var(--bg-hover)] disabled:opacity-50"
            disabled={busy}
            onClick={() => void pick(u)}
            type="button"
          >
            <Avatar alt={getDisplayName(u)} fallback={getInitials(u)} size="sm" src={u.avatarUrl} />
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-[var(--text-primary)]">{getDisplayName(u)}</p>
              <p className="truncate text-xs text-[var(--text-secondary)]">{u.email}</p>
            </div>
          </button>
        ))}
        {filtered.length === 0 ? (
          <p className="py-6 text-center text-sm text-[var(--text-secondary)]">No contacts found.</p>
        ) : null}
      </div>
    </Modal>
  )
}
