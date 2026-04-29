"use client"

import { useCallback, useEffect, useState } from "react"
import { fetchChatList, type ChatListRow } from "@/lib/chat/chat-list"
import { supabase } from "@/lib/supabaseClient"

export function useChats(currentUserId?: string) {
  const [chats, setChats] = useState<ChatListRow[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!currentUserId) {
      setChats([])
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const rows = await fetchChatList()
      setChats(rows)
    } catch (e) {
      if (e instanceof Error) {
        setError(e.message)
      } else {
        setError((e as any)?.message ?? (e as any)?.error_description ?? String(e))
      }
      setChats([])
    } finally {
      setIsLoading(false)
    }
  }, [currentUserId])

  useEffect(() => {
    void load()
  }, [load])

  useEffect(() => {
    if (!currentUserId) {
      return
    }

    const channelName = `chat-list-updates:${currentUserId}:${Date.now()}`
    const channel = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "messages" },
        () => void load()
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "conversation_participants" },
        () => void load()
      )
      .subscribe()

    return () => {
      void supabase.removeChannel(channel)
    }
  }, [currentUserId, load])

  return { chats, error, isLoading, reload: load }
}
