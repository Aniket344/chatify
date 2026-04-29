"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Modal } from "@/components/ui/Modal"
import type { ChatListRow } from "@/lib/chat/chat-list"
import type { MessageRow } from "@/lib/chat/models"
import { createMessage } from "@/lib/chat/messages"
import { useAuth } from "@/hooks/useAuth"

export function ForwardModal({
  open,
  onClose,
  chats,
  message,
}: {
  open: boolean
  onClose: () => void
  chats: ChatListRow[]
  message: MessageRow | null
}) {
  const router = useRouter()
  const { currentUser } = useAuth()
  const [busy, setBusy] = useState(false)

  const forwardTo = async (row: ChatListRow) => {
    if (!message || !currentUser) {
      return
    }
    setBusy(true)
    try {
      await createMessage({
        content: message.content || "Forwarded",
        conversationId: row.conversation_id,
        receiverId: row.is_group ? null : row.other_user_id,
        senderId: currentUser.id,
        messageType: message.message_type,
        fileUrl: message.file_url,
        forwardOfId: message.id,
      })
      onClose()
      router.push(`/chats/${row.conversation_id}`)
    } finally {
      setBusy(false)
    }
  }

  return (
    <Modal onClose={onClose} open={open} title="Forward to">
      <div className="max-h-72 space-y-1 overflow-y-auto">
        {chats.map((c) => (
          <button
            key={c.conversation_id}
            className="flex w-full rounded-xl px-3 py-2 text-left text-sm text-[var(--text-primary)] transition hover:bg-[var(--bg-hover)] disabled:opacity-50"
            disabled={busy}
            onClick={() => void forwardTo(c)}
            type="button"
          >
            {c.display_name}
          </button>
        ))}
      </div>
    </Modal>
  )
}
