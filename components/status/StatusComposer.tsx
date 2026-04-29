"use client"

import { useState } from "react"
import { createStatus } from "@/lib/chat/statuses"

export function StatusComposer({ userId, onCreated }: { userId?: string; onCreated: () => void }) {
  const [caption, setCaption] = useState("")
  const [bg, setBg] = useState("#128C7E")
  const [busy, setBusy] = useState(false)

  const submit = async () => {
    if (!userId || !caption.trim()) {
      return
    }
    setBusy(true)
    try {
      await createStatus({
        userId,
        contentType: "text",
        caption: caption.trim(),
        background: bg,
      })
      setCaption("")
      onCreated()
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mb-6 rounded-2xl border border-[var(--border)] bg-[var(--bg-elevated)] p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]">My status</p>
      <div className="mt-2 flex gap-2">
        <input
          className="h-10 w-20 cursor-pointer rounded-lg border border-[var(--border)]"
          onChange={(e) => setBg(e.target.value)}
          title="Background"
          type="color"
          value={bg}
        />
        <input
          className="flex-1 rounded-xl border border-[var(--border)] bg-[var(--bg-panel)] px-3 py-2 text-sm text-[var(--text-primary)] outline-none"
          onChange={(e) => setCaption(e.target.value)}
          placeholder="What's on your mind?"
          value={caption}
        />
        <button
          className="rounded-xl bg-[var(--accent)] px-4 text-sm font-semibold text-white disabled:opacity-50"
          disabled={busy || !caption.trim()}
          onClick={() => void submit()}
          type="button"
        >
          Post
        </button>
      </div>
    </div>
  )
}
