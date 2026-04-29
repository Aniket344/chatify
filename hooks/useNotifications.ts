"use client"

import { useCallback, useEffect, useRef } from "react"
import { toast } from "sonner"
import type { MessageRow } from "@/lib/chat/models"
import { playIncomingSound } from "@/services/audioPing"

export function useNotifications({
  enabled,
  currentUserId,
  activeConversationId,
  onIncoming: _onIncoming,
}: {
  enabled: boolean
  currentUserId?: string
  activeConversationId?: string | null
  onIncoming?: (message: MessageRow) => void
}) {
  const permissionRef = useRef<NotificationPermission>("default")

  useEffect(() => {
    if (!enabled || typeof window === "undefined" || !("Notification" in window)) {
      return
    }
    permissionRef.current = Notification.permission
    if (Notification.permission === "default") {
      void Notification.requestPermission().then((p) => {
        permissionRef.current = p
      })
    }
  }, [enabled])

  const notify = useCallback(
    (message: MessageRow) => {
      if (!currentUserId || message.sender_id === currentUserId) {
        return
      }

      _onIncoming?.(message)

      const preview = message.content || "Attachment"
      const hidden = typeof document !== "undefined" && document.visibilityState === "hidden"
      const otherChat = message.conversation_id !== activeConversationId

      if (otherChat) {
        toast.message("New message", { description: preview.slice(0, 120) })
      }

      if (permissionRef.current === "granted" && (hidden || otherChat)) {
        try {
          new Notification("Chatify", { body: preview.slice(0, 120) })
        } catch {
          /* ignore */
        }
      }

      if (hidden || otherChat) {
        playIncomingSound()
      }
    },
    [activeConversationId, currentUserId, _onIncoming]
  )

  return { notify }
}
