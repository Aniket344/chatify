"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { createMessage, fetchConversationMessages, markConversationSeen } from "@/lib/chat/messages"
import type { MessageRow, SendMessageInput } from "@/lib/chat/models"
import { supabase } from "@/lib/supabaseClient"
import { useChatStore } from "@/store/chat-store"

interface UseMessagesOptions {
  conversationId?: string | null
  currentUserId?: string
}

interface LoadMessagesOptions {
  silent?: boolean
}

export function useMessages({ conversationId, currentUserId }: UseMessagesOptions) {
  const addMessage = useChatStore((state) => state.addMessage)
  const clearMessages = useChatStore((state) => state.clearMessages)
  const messages = useChatStore((state) => state.messages)
  const setMessages = useChatStore((state) => state.setMessages)
  const updateMessage = useChatStore((state) => state.updateMessage)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const hasLoadedRef = useRef(false)

  const loadMessages = useCallback(async (options?: LoadMessagesOptions) => {
    if (!conversationId) {
      hasLoadedRef.current = false
      clearMessages()
      return
    }

    const shouldShowLoading = !options?.silent && !hasLoadedRef.current

    if (shouldShowLoading) {
      setIsLoading(true)
    }

    if (!options?.silent) {
      setError(null)
    }

    try {
      const nextMessages = await fetchConversationMessages(conversationId)
      setMessages(nextMessages)
      hasLoadedRef.current = true

      if (currentUserId) {
        await markConversationSeen(conversationId, currentUserId)
      }
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load messages")
    } finally {
      if (shouldShowLoading) {
        setIsLoading(false)
      }
    }
  }, [clearMessages, conversationId, currentUserId, setMessages])

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

    const intervalId = window.setInterval(() => {
      void loadMessages({ silent: true })
    }, 3000)

    return () => {
      window.clearInterval(intervalId)
    }
  }, [conversationId, loadMessages])

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
  }, [addMessage, conversationId, currentUserId, updateMessage])

  const sendMessage = useCallback(async (input: SendMessageInput) => {
    setIsSending(true)
    setError(null)

    try {
      const message = await createMessage(input)
      addMessage(message)
      return message
    } catch (sendError) {
      const nextError = sendError instanceof Error ? sendError.message : "Unable to send message"
      setError(nextError)
      throw sendError
    } finally {
      setIsSending(false)
    }
  }, [addMessage])

  const markSeen = useCallback(async () => {
    if (!conversationId || !currentUserId) {
      return
    }

    await markConversationSeen(conversationId, currentUserId)
  }, [conversationId, currentUserId])

  return {
    error,
    isLoading,
    isSending,
    loadMessages,
    markSeen,
    messages,
    sendMessage,
  }
}
