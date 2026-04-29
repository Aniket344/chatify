"use client"

import { useEffect, useState } from "react"
import { Modal } from "@/components/ui/Modal"
import type { MessageRow } from "@/lib/chat/models"
import { rpcEditMessage } from "@/lib/chat/messages"

export function EditMessageModal({
  message,
  onClose,
  open,
}: {
  open: boolean
  message: MessageRow | null
  onClose: () => void
}) {
  const [text, setText] = useState("")
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (open && message) {
      setText(message.content)
    }
  }, [open, message])

  const save = async () => {
    if (!message) {
      return
    }
    setBusy(true)
    try {
      await rpcEditMessage(message.id, text)
      onClose()
    } finally {
      setBusy(false)
    }
  }

  return (
    <Modal onClose={onClose} open={open} title="Edit message">
      <textarea
        className="min-h-[100px] w-full rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] p-3 text-sm text-[var(--text-primary)] outline-none"
        onChange={(e) => setText(e.target.value)}
        value={text}
      />
      <button
        className="mt-4 w-full rounded-xl bg-[var(--accent)] py-2.5 text-sm font-semibold text-white disabled:opacity-50"
        disabled={busy || !text.trim()}
        onClick={() => void save()}
        type="button"
      >
        Save
      </button>
    </Modal>
  )
}
