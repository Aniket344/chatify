"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { createMessage, fetchConversationMessages, markConversationSeen } from "@/lib/chat/messages"
import type { MessageRow, SendMessageInput } from "@/lib/chat/models"
import { supabase } from "@/lib/supabaseClient"
import { useChatStore } from "@/store/chat-store"

interface UseMessagesOptions {
  conversationId?: string | null
  currentUserId?: string
  onMessageInsert?: (message: MessageRow) => void
}

interface LoadMessagesOptions {
  silent?: boolean
  before?: string
  prepend?: boolean
}

export function useMessages({ conversationId, currentUserId, onMessageInsert }: UseMessagesOptions) {
  const addMessage = useChatStore((state) => state.addMessage)
  const clearMessages = useChatStore((state) => state.clearMessages)
  const messages = useChatStore((state) => state.messages)
  const setMessages = useChatStore((state) => state.setMessages)
  const updateMessage = useChatStore((state) => state.updateMessage)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [hasMoreOlder, setHasMoreOlder] = useState(true)
  const [isLoadingOlder, setIsLoadingOlder] = useState(false)
  const hasLoadedRef = useRef(false)

  const loadMessages = useCallback(
    async (options?: LoadMessagesOptions) => {
      if (!conversationId) {
        hasLoadedRef.current = false
        clearMessages()
        setHasMoreOlder(false)
        return
      }

      const shouldShowLoading = !options?.silent && !hasLoadedRef.current && !options?.prepend

      if (shouldShowLoading) {
        setIsLoading(true)
      }

      if (!options?.silent) {
        setError(null)
      }

      try {
        const nextMessages = await fetchConversationMessages(conversationId, options?.before)

        if (options?.prepend && options.before) {
          const existing = useChatStore.getState().messages
          const merged = [...nextMessages.filter((m) => !existing.some((e) => e.id === m.id)), ...existing]
          setMessages(merged)
          setHasMoreOlder(nextMessages.length >= 40)
        } else {
          setMessages(nextMessages)
          hasLoadedRef.current = true
          setHasMoreOlder(nextMessages.length >= 40)

          if (currentUserId) {
            await markConversationSeen(conversationId, currentUserId)
          }
        }
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Unable to load messages")
      } finally {
        if (shouldShowLoading) {
          setIsLoading(false)
        }
      }
    },
    [clearMessages, conversationId, currentUserId, setMessages]
  )

  const loadOlder = useCallback(async () => {
    if (!conversationId || !hasMoreOlder || isLoadingOlder) {
      return
    }

    const oldest = useChatStore.getState().messages[0]
    if (!oldest) {
      setHasMoreOlder(false)
      return
    }

    setIsLoadingOlder(true)
    try {
      await loadMessages({ before: oldest.created_at, prepend: true, silent: true })
    } finally {
      setIsLoadingOlder(false)
    }
  }, [conversationId, hasMoreOlder, isLoadingOlder, loadMessages])

  useEffect(() => {
    hasLoadedRef.current = false
    setHasMoreOlder(true)
  }, [conversationId])

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadMessages()
    }, 0)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [loadMessages])

  useEffect(() => {
    if (!conversationId) {
      return
    }

    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        async (payload) => {
          const nextMessage = payload.new as MessageRow
          addMessage(nextMessage)
          onMessageInsert?.(nextMessage)

          if (nextMessage.receiver_id === currentUserId && currentUserId) {
            await markConversationSeen(conversationId, currentUserId)
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          updateMessage(payload.new as MessageRow)
        }
      )
      .subscribe()

    return () => {
      void supabase.removeChannel(channel)
    }
  }, [addMessage, conversationId, currentUserId, onMessageInsert, updateMessage])

  const sendMessage = useCallback(
    async (input: SendMessageInput) => {
      setIsSending(true)
      setError(null)

      try {
        const message = await createMessage(input)
        addMessage(message)
        return message
      } catch (sendError) {
        const nextError = sendError instanceof Error ? sendError.message : "Unable to send message"
        setError(nextError)
        // Swallow to avoid unhandled promise rejection from UI callers.
        return
      } finally {
        setIsSending(false)
      }
    },
    [addMessage]
  )

  const markSeen = useCallback(async () => {
    if (!conversationId || !currentUserId) {
      return
    }

    await markConversationSeen(conversationId, currentUserId)
  }, [conversationId, currentUserId])

  return {
    error,
    hasMoreOlder,
    isLoading,
    isLoadingOlder,
    isSending,
    loadMessages,
    loadOlder,
    markSeen,
    messages,
    sendMessage,
  }
}
