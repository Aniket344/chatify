"use client"

import { useCallback, useEffect, useState } from "react"
import type { ChatUser } from "@/lib/chat/models"
import { fetchChatUsers } from "@/lib/chat/users"

export function useUsers(currentUserId?: string) {
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [users, setUsers] = useState<ChatUser[]>([])

  const loadUsers = useCallback(async () => {
    if (!currentUserId) {
      setUsers([])
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const data = await fetchChatUsers(currentUserId)
      setUsers(data)
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load users")
    } finally {
      setIsLoading(false)
    }
  }, [currentUserId])

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadUsers()
    }, 0)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [loadUsers])

  return {
    error,
    isLoading,
    loadUsers,
    users,
  }
}
