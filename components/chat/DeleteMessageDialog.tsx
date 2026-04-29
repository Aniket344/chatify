"use client"

import { useState } from "react"
import { Modal } from "@/components/ui/Modal"
import type { MessageRow } from "@/lib/chat/models"
import { rpcDeleteMessage } from "@/lib/chat/messages"

export function DeleteMessageDialog({
  message,
  onClose,
  open,
}: {
  open: boolean
  message: MessageRow | null
  onClose: () => void
}) {
  const [busy, setBusy] = useState(false)

  const del = async (forEveryone: boolean) => {
    if (!message) {
      return
    }
    setBusy(true)
    try {
      await rpcDeleteMessage(message.id, forEveryone)
      onClose()
    } finally {
      setBusy(false)
    }
  }

  return (
    <Modal onClose={onClose} open={open} title="Delete message">
      <p className="text-sm text-[var(--text-secondary)]">Choose how to delete this message.</p>
      <div className="mt-4 flex flex-col gap-2">
        <button
          className="rounded-xl border border-[var(--border)] py-2.5 text-sm font-medium text-[var(--text-primary)] disabled:opacity-50"
          disabled={busy}
          onClick={() => void del(false)}
          type="button"
        >
          Delete for me
        </button>
        <button
          className="rounded-xl bg-rose-600 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
          disabled={busy}
          onClick={() => void del(true)}
          type="button"
        >
          Delete for everyone
        </button>
      </div>
    </Modal>
  )
}
