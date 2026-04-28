"use client"

import { useCallback, useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import { fetchCurrentChatUser } from "@/lib/chat/users"
import { useChatStore } from "@/store/chat-store"

export function useAuth() {
  const currentUser = useChatStore((state) => state.currentUser)
  const reset = useChatStore((state) => state.reset)
  const setCurrentUser = useChatStore((state) => state.setCurrentUser)
  const [isLoading, setIsLoading] = useState(true)

  const hydrateUser = useCallback(async () => {
    setIsLoading(true)

    const {
      data: { session },
      error,
    } = await supabase.auth.getSession()

    if (error || !session?.user) {
      setCurrentUser(null)
      setIsLoading(false)
      return
    }

    try {
      const user = await fetchCurrentChatUser(session.user)
      setCurrentUser(user)
    } finally {
      setIsLoading(false)
    }
  }, [setCurrentUser])

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void hydrateUser()
    }, 0)

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) {
        reset()
        setIsLoading(false)
        return
      }

      void fetchCurrentChatUser(session.user)
        .then(setCurrentUser)
        .finally(() => setIsLoading(false))
    })

    return () => {
      window.clearTimeout(timeoutId)
      subscription.unsubscribe()
    }
  }, [hydrateUser, reset, setCurrentUser])

  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
    reset()
  }, [reset])

  return {
    currentUser,
    isLoading,
    signOut,
  }
}
