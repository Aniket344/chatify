"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Modal } from "@/components/ui/Modal"
import { Avatar } from "@/components/ui/Avatar"
import { getDisplayName, getInitials, type ChatUser } from "@/lib/chat/models"
import { createGroupConversation } from "@/lib/chat/conversations"

export function CreateGroupModal({
  open,
  onClose,
  users,
}: {
  open: boolean
  onClose: () => void
  users: ChatUser[]
}) {
  const router = useRouter()
  const [name, setName] = useState("")
  const [selected, setSelected] = useState<Record<string, boolean>>({})
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  const memberIds = useMemo(() => Object.keys(selected).filter((id) => selected[id]), [selected])

  const toggle = (id: string) => {
    setSelected((s) => ({ ...s, [id]: !s[id] }))
  }

  const submit = async () => {
    if (!name.trim()) {
      setErr("Enter a group name")
      return
    }
    if (memberIds.length === 0) {
      setErr("Select at least one member")
      return
    }
    setBusy(true)
    setErr(null)
    try {
      const id = await createGroupConversation(name.trim(), memberIds)
      onClose()
      setName("")
      setSelected({})
      router.push(`/chats/${id}`)
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Could not create group")
    } finally {
      setBusy(false)
    }
  }

  return (
    <Modal onClose={onClose} open={open} title="New group">
      <label className="mb-1 block text-xs font-medium text-[var(--text-secondary)]">Group name</label>
      <input
        className="mb-4 w-full rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] px-3 py-2 text-sm text-[var(--text-primary)] outline-none"
        onChange={(e) => setName(e.target.value)}
        placeholder="e.g. React Developers"
        value={name}
      />
      <p className="mb-2 text-xs font-medium text-[var(--text-secondary)]">Members</p>
      <div className="mb-4 max-h-52 space-y-1 overflow-y-auto rounded-xl border border-[var(--border)] p-1">
        {users.map((u) => (
          <button
            key={u.id}
            className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left transition hover:bg-[var(--bg-hover)]"
            onClick={() => toggle(u.id)}
            type="button"
          >
            <input readOnly checked={Boolean(selected[u.id])} className="accent-[var(--accent)]" type="checkbox" />
            <Avatar alt={getDisplayName(u)} fallback={getInitials(u)} size="sm" src={u.avatarUrl} />
            <span className="truncate text-sm text-[var(--text-primary)]">{getDisplayName(u)}</span>
          </button>
        ))}
      </div>
      {err ? <p className="mb-2 text-sm text-rose-600">{err}</p> : null}
      <button
        className="w-full rounded-xl bg-[var(--accent)] py-2.5 text-sm font-semibold text-white disabled:opacity-50"
        disabled={busy}
        onClick={() => void submit()}
        type="button"
      >
        {busy ? "Creating…" : "Create group"}
      </button>
    </Modal>
  )
}
