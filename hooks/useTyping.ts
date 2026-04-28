"use client"

import { useCallback, useEffect, useMemo, useRef } from "react"
import { supabase } from "@/lib/supabaseClient"
import { useChatStore } from "@/store/chat-store"

interface UseTypingOptions {
  conversationId?: string | null
  currentUserId?: string
}

export function useTyping({ conversationId, currentUserId }: UseTypingOptions) {
  const setTypingState = useChatStore((state) => state.setTypingState)
  const typingByUserId = useChatStore((state) => state.typingByUserId)
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null)
  const isTypingRef = useRef(false)
  const stopTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const remoteTimersRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({})

  useEffect(() => {
    Object.values(remoteTimersRef.current).forEach(clearTimeout)
    remoteTimersRef.current = {}

    if (!conversationId || !currentUserId) {
      return
    }

    const channel = supabase.channel(`typing:${conversationId}`)
    channelRef.current = channel

    channel
      .on("broadcast", { event: "typing" }, ({ payload }) => {
        const userId = typeof payload?.userId === "string" ? payload.userId : null
        const isTyping = Boolean(payload?.isTyping)

        if (!userId || userId === currentUserId) {
          return
        }

        setTypingState(userId, isTyping)

        if (remoteTimersRef.current[userId]) {
          clearTimeout(remoteTimersRef.current[userId])
        }

        if (isTyping) {
          remoteTimersRef.current[userId] = setTimeout(() => {
            setTypingState(userId, false)
            delete remoteTimersRef.current[userId]
          }, 3000)
        }
      })
      .subscribe()

    return () => {
      if (stopTimerRef.current) {
        clearTimeout(stopTimerRef.current)
      }

      Object.values(remoteTimersRef.current).forEach(clearTimeout)
      remoteTimersRef.current = {}
      isTypingRef.current = false
      channelRef.current = null
      void supabase.removeChannel(channel)
    }
  }, [conversationId, currentUserId, setTypingState])

  const sendTypingEvent = useCallback(
    async (isTyping: boolean) => {
      if (!channelRef.current || !conversationId || !currentUserId) {
        return
      }

      isTypingRef.current = isTyping

      await channelRef.current.send({
        type: "broadcast",
        event: "typing",
        payload: {
          isTyping,
          userId: currentUserId,
        },
      })
    },
    [conversationId, currentUserId]
  )

  const broadcastTyping = useCallback(
    async (isTyping: boolean) => {
      if (!channelRef.current || !conversationId || !currentUserId) {
        return
      }

      if (isTypingRef.current === isTyping && isTyping) {
        if (stopTimerRef.current) {
          clearTimeout(stopTimerRef.current)
        }

        stopTimerRef.current = setTimeout(() => {
          void sendTypingEvent(false)
        }, 1500)

        return
      }

      await sendTypingEvent(isTyping)

      if (stopTimerRef.current) {
        clearTimeout(stopTimerRef.current)
      }

      if (isTyping) {
        stopTimerRef.current = setTimeout(() => {
          void sendTypingEvent(false)
        }, 1500)
      }
    },
    [conversationId, currentUserId, sendTypingEvent]
  )

  const typingUsers = useMemo(() => {
    return Object.entries(typingByUserId)
      .filter(([userId, isTyping]) => isTyping && userId !== currentUserId)
      .map(([userId]) => userId)
  }, [currentUserId, typingByUserId])

  return {
    broadcastTyping,
    typingUsers,
  }
}
