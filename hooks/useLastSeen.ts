"use client"

import { useEffect, useRef } from "react"
import { supabase } from "@/lib/supabaseClient"

export function useLastSeen(enabled: boolean) {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (!enabled) {
      return
    }

    const ping = () => {
      void supabase.rpc("update_last_seen")
    }

    ping()
    intervalRef.current = setInterval(ping, 60_000)

    const onUnload = () => {
      void supabase.rpc("update_last_seen")
    }
    window.addEventListener("beforeunload", onUnload)

    return () => {
      window.removeEventListener("beforeunload", onUnload)
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [enabled])
}
