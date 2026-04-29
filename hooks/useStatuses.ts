"use client"

import { useCallback, useEffect, useState } from "react"
import { fetchMyStatuses, fetchRecentStatuses, type StatusRow } from "@/lib/chat/statuses"
import { supabase } from "@/lib/supabaseClient"

export function useStatuses(userId?: string) {
  const [mine, setMine] = useState<StatusRow[]>([])
  const [others, setOthers] = useState<StatusRow[]>([])
  const [loading, setLoading] = useState(true)

  const reload = useCallback(async () => {
    if (!userId) {
      setMine([])
      setOthers([])
      setLoading(false)
      return
    }

    setLoading(true)
    try {
      const [m, o] = await Promise.all([fetchMyStatuses(userId), fetchRecentStatuses(userId)])
      setMine(m)
      setOthers(o)
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    void reload()
  }, [reload])

  useEffect(() => {
    if (!userId) {
      return
    }

    const ch = supabase
      .channel("statuses-feed")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "statuses" },
        () => void reload()
      )
      .subscribe()

    return () => {
      void supabase.removeChannel(ch)
    }
  }, [reload, userId])

  return { loading, mine, others, reload }
}
