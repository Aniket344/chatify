"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { fetchReactionsForMessages, type ReactionRow } from "@/lib/chat/reactions"
import { supabase } from "@/lib/supabaseClient"
import type { MessageRow } from "@/lib/chat/models"

export function useReactions(messages: MessageRow[]) {
  const [rows, setRows] = useState<ReactionRow[]>([])

  const messageIds = useMemo(() => messages.map((m) => m.id), [messages])
  const key = useMemo(() => [...messageIds].sort().join(","), [messageIds])

  const load = useCallback(async () => {
    if (messageIds.length === 0) {
      setRows([])
      return
    }
    try {
      const data = await fetchReactionsForMessages(messageIds)
      setRows(data)
    } catch {
      setRows([])
    }
  }, [messageIds])

  useEffect(() => {
    void load()
  }, [key, load])

  useEffect(() => {
    const ch = supabase
      .channel("reactions-live")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "message_reactions" },
        () => void load()
      )
      .subscribe()

    return () => {
      void supabase.removeChannel(ch)
    }
  }, [load])

  const byMessage = useMemo(() => {
    const map: Record<string, ReactionRow[]> = {}
    for (const r of rows) {
      map[r.message_id] = map[r.message_id] ? [...map[r.message_id], r] : [r]
    }
    return map
  }, [rows])

  return { byMessage, reload: load }
}
