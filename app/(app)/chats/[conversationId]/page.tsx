"use client"

import { useCallback, useEffect, useMemo } from "react"
import { useParams, useRouter } from "next/navigation"
import ChatWindow from "@/components/ChatWindow"
import { useAuth } from "@/hooks/useAuth"
import { useMessages } from "@/hooks/useMessages"
import { useTyping } from "@/hooks/useTyping"
import { useChats } from "@/hooks/useChats"
import type { ChatUser } from "@/lib/chat/models"
import { useChatStore } from "@/store/chat-store"
import { useNotifications } from "@/hooks/useNotifications"

export default function ConversationPage() {
  const params = useParams()
  const router = useRouter()
  const conversationId = typeof params.conversationId === "string" ? params.conversationId : null

  const { currentUser, isLoading: isAuthLoading } = useAuth()
  const { chats, isLoading: isChatsLoading, reload: reloadChats } = useChats(currentUser?.id)

  const selectedUser = useChatStore((s) => s.selectedUser)
  const isGroupConversation = useChatStore((s) => s.isGroupConversation)
  const groupTitle = useChatStore((s) => s.groupTitle)
  const groupAvatarUrl = useChatStore((s) => s.groupAvatarUrl)
  const activeConversationId = useChatStore((s) => s.activeConversationId)
  const setSelectedChat = useChatStore((s) => s.setSelectedChat)
  const setSelectedGroup = useChatStore((s) => s.setSelectedGroup)

  const { notify } = useNotifications({
    activeConversationId: conversationId,
    currentUserId: currentUser?.id,
    enabled: Boolean(currentUser),
  })

  const {
    error: messageError,
    hasMoreOlder,
    isLoading: isMessagesLoading,
    isLoadingOlder,
    isSending,
    loadOlder,
    messages,
    sendMessage,
  } = useMessages({
    conversationId,
    currentUserId: currentUser?.id,
    onMessageInsert: notify,
  })

  const { broadcastTyping, typingUsers } = useTyping({
    conversationId,
    currentUserId: currentUser?.id,
  })

  const presenceByUserId = useChatStore((s) => s.presenceByUserId)

  const row = useMemo(
    () => chats.find((c) => c.conversation_id === conversationId) ?? null,
    [chats, conversationId]
  )

  const directPeerId = useMemo(() => {
    if (!row || row.is_group) return null
    return row.other_user_id ?? null
  }, [row])

  useEffect(() => {
    if (!conversationId || !currentUser || !row) {
      return
    }

    if (row.is_group) {
      // Avoid resetting state (messages) on every chat-list refresh.
      if (
        isGroupConversation &&
        activeConversationId === conversationId &&
        groupTitle === row.display_name
      ) {
        return
      }
      setSelectedGroup(conversationId, row.display_name, row.display_avatar)
    } else if (row.other_user_id) {
      // Avoid resetting state (messages) on every chat-list refresh.
      if (
        !isGroupConversation &&
        activeConversationId === conversationId &&
        selectedUser?.id === row.other_user_id
      ) {
        return
      }
      const peer: ChatUser = {
        id: row.other_user_id,
        fullName: row.display_name,
        email: null,
        avatarUrl: row.display_avatar,
      }
      setSelectedChat(peer, conversationId)
    }
  }, [
    activeConversationId,
    conversationId,
    currentUser,
    groupTitle,
    isGroupConversation,
    row,
    selectedUser?.id,
    setSelectedChat,
    setSelectedGroup,
  ])

  useEffect(() => {
    if (!isAuthLoading && !currentUser) {
      router.replace("/login")
    }
  }, [currentUser, isAuthLoading, router])

  useEffect(() => {
    if (!conversationId || isAuthLoading || !currentUser || isChatsLoading) {
      return
    }

    if (chats.length > 0 && !row) {
      router.replace("/chats")
    }
  }, [chats.length, conversationId, currentUser, isAuthLoading, isChatsLoading, row, router])

  const handleSendMessage = useCallback(
    async (content: string, extras?: { replyToId?: string | null; fileUrl?: string | null; messageType?: "text" | "image" | "file" | "voice" }) => {
      if (!currentUser || !conversationId) {
        return
      }

      await sendMessage({
        content,
        conversationId,
        // Use RPC row's other_user_id as a reliable fallback immediately after navigation.
        receiverId: isGroupConversation ? null : directPeerId ?? selectedUser?.id,
        senderId: currentUser.id,
        replyToId: extras?.replyToId ?? undefined,
        fileUrl: extras?.fileUrl ?? undefined,
        messageType: extras?.messageType ?? "text",
      })
      await broadcastTyping(false)
      void reloadChats()
    },
    [
      broadcastTyping,
      conversationId,
      currentUser,
      isGroupConversation,
      reloadChats,
      directPeerId,
      selectedUser?.id,
      sendMessage,
    ]
  )

  const peerTyping =
    !isGroupConversation && selectedUser ? typingUsers.includes(selectedUser.id) : typingUsers.length > 0

  if (isAuthLoading || !currentUser) {
    return null
  }

  const headerUser: ChatUser | null = isGroupConversation
    ? {
        id: conversationId ?? "group",
        fullName: groupTitle ?? "Group",
        email: null,
        avatarUrl: groupAvatarUrl,
      }
    : selectedUser

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col">
      {messageError ? (
        <div className="border-b border-rose-500/30 bg-rose-500/10 px-4 py-2 text-xs text-rose-600 dark:text-rose-300">
          {messageError}
        </div>
      ) : null}

      <ChatWindow
        chatList={chats}
        conversationId={conversationId}
        currentUser={currentUser}
        error={messageError}
        groupAvatarUrl={groupAvatarUrl}
        groupTitle={groupTitle}
        hasMoreOlder={hasMoreOlder}
        isGroup={isGroupConversation}
        isLoading={isMessagesLoading}
        isLoadingOlder={isLoadingOlder}
        isSending={isSending}
        isTyping={peerTyping}
        loadOlderMessages={loadOlder}
        messages={messages}
        onSendMessage={handleSendMessage}
        onTypingChange={(isTyping) => void broadcastTyping(isTyping)}
        presenceByUserId={presenceByUserId}
        selectedUser={headerUser}
        onBack={() => router.push("/chats")}
      />
    </div>
  )
}
