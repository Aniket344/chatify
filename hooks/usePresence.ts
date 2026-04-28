"use client"

import { useEffect } from "react"
import { supabase } from "@/lib/supabaseClient"
import { useChatStore } from "@/store/chat-store"

export function usePresence(currentUserId?: string) {
  const setPresenceMap = useChatStore((state) => state.setPresenceMap)

  useEffect(() => {
    if (!currentUserId) {
      setPresenceMap({})
      return
    }

    const channel = supabase.channel("global-presence", {
      config: {
        presence: {
          key: currentUserId,
        },
      },
    })

    channel
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState<{ online_at: string; user_id: string }>()
        const nextPresenceMap = Object.values(state).reduce<Record<string, boolean>>(
          (accumulator, entries) => {
            entries.forEach((entry) => {
              accumulator[entry.user_id] = true
            })

            return accumulator
          },
          {}
        )

        setPresenceMap(nextPresenceMap)
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await channel.track({
            user_id: currentUserId,
            online_at: new Date().toISOString(),
          })
        }
      })

    return () => {
      void supabase.removeChannel(channel)
    }
  }, [currentUserId, setPresenceMap])
}
