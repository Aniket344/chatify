"use client"

import { useCallback, useMemo } from "react"
import { Camera, MoreVertical, Search } from "lucide-react"
import ChatWindow from "@/components/ChatWindow"
import { ChatListItem } from "@/components/sidebar/ChatListItem"
import { FilterPills } from "@/components/sidebar/FilterPills"
import { SearchBar } from "@/components/sidebar/SearchBar"
import { useAuth } from "@/hooks/useAuth"
import { useMessages } from "@/hooks/useMessages"
import { useNotifications } from "@/hooks/useNotifications"
import { useChats } from "@/hooks/useChats"
import { useTyping } from "@/hooks/useTyping"
import { useChatStore } from "@/store/chat-store"
import { useUiStore } from "@/store/ui-store"
import type { ChatListRow } from "@/lib/chat/chat-list"
import type { ChatUser } from "@/lib/chat/models"
import LoadingSkeleton from "@/components/ui/LoadingSkeleton"
import { IconButton } from "@/components/ui/IconButton"
export default function ChatsIndexPage() {
  const { currentUser, isLoading: isAuthLoading } = useAuth()
  const { chats, isLoading: isChatsLoading, error: chatsError, reload: reloadChats } = useChats(currentUser?.id)
  const isInitialLoading = isAuthLoading || isChatsLoading

  const chatFilter = useUiStore((s) => s.chatFilter)
  const searchQuery = useUiStore((s) => s.searchQuery)
  const setChatFilter = useUiStore((s) => s.setChatFilter)
  const setSearchQuery = useUiStore((s) => s.setSearchQuery)
  const setStartDirectChatOpen = useUiStore((s) => s.setStartDirectChatOpen)

  const presenceByUserId = useChatStore((s) => s.presenceByUserId)

  const filtered = useMemo(() => {
    let rows: ChatListRow[] = chats

    const q = searchQuery.trim().toLowerCase()
    if (q) {
      rows = rows.filter((c) => c.display_name.toLowerCase().includes(q))
    }

    if (chatFilter === "unread") {
      rows = rows.filter((c) => c.unread_count > 0)
    }
    if (chatFilter === "groups") {
      rows = rows.filter((c) => c.is_group)
    }
    if (chatFilter === "pinned") {
      rows = rows.filter((c) => c.is_pinned)
    }

    const pinned = rows.filter((c) => c.is_pinned)
    const rest = rows.filter((c) => !c.is_pinned)

    return [
      ...pinned.sort((a, b) => (b.last_message_at ?? "").localeCompare(a.last_message_at ?? "")),
      ...rest,
    ]
  }, [chats, chatFilter, searchQuery])

  const topChat = filtered[0] ?? null
  const conversationId = topChat?.conversation_id ?? null

  const isGroupConversation = Boolean(topChat?.is_group)

  const groupTitle = isGroupConversation ? topChat?.display_name ?? null : null
  const groupAvatarUrl = isGroupConversation ? topChat?.display_avatar ?? null : null

  const headerUser: ChatUser | null = useMemo(() => {
    if (!topChat) {
      return null
    }
    if (topChat.is_group) {
      return {
        id: topChat.conversation_id,
        fullName: topChat.display_name,
        email: null,
        avatarUrl: topChat.display_avatar,
      }
    }

    if (!topChat.other_user_id) {
      return null
    }

    return {
      id: topChat.other_user_id,
      fullName: topChat.display_name,
      email: null,
      avatarUrl: topChat.display_avatar,
    }
  }, [topChat])

  const directPeerId = useMemo(() => {
    if (!topChat || topChat.is_group) {
      return null
    }
    return topChat.other_user_id ?? null
  }, [topChat])

  const { notify } = useNotifications({
    enabled: Boolean(currentUser),
    currentUserId: currentUser?.id,
    activeConversationId: conversationId,
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

  const peerTyping =
    !isGroupConversation && headerUser ? typingUsers.includes(headerUser.id) : typingUsers.length > 0

  const handleSendMessage = useCallback(
    async (
      content: string,
      extras?: { replyToId?: string | null; fileUrl?: string | null; messageType?: "text" | "image" | "file" | "voice" }
    ) => {
      if (!currentUser || !conversationId) {
        return
      }

      await sendMessage({
        content,
        conversationId,
        receiverId: isGroupConversation ? null : directPeerId ?? headerUser?.id,
        senderId: currentUser.id,
        replyToId: extras?.replyToId ?? undefined,
        fileUrl: extras?.fileUrl ?? undefined,
        messageType: extras?.messageType ?? "text",
      })
      await broadcastTyping(false)
      void reloadChats()
    },
    [broadcastTyping, conversationId, currentUser, directPeerId, headerUser?.id, isGroupConversation, reloadChats, sendMessage]
  )

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-[var(--bg-panel)]">
      {/* Mobile: list on top, chat inbox below */}
      <div className="flex min-h-0 flex-1 flex-col lg:hidden">
        <header className="flex items-center justify-between px-3 py-3">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--accent)]/15 text-[var(--accent)]">
              <span className="text-lg">💬</span>
            </div>
            <h1 className="text-lg font-bold tracking-tight text-[var(--text-primary)]">Chatify</h1>
          </div>
          <div className="flex items-center gap-0.5">
            <IconButton aria-label="New chat" onClick={() => setStartDirectChatOpen(true)} title="New chat">
              <Camera className="h-5 w-5" />
            </IconButton>
            <IconButton aria-label="Search chats" title="Search">
              <Search className="h-5 w-5" />
            </IconButton>
            <IconButton aria-label="More options" title="More options">
              <MoreVertical className="h-5 w-5" />
            </IconButton>
          </div>
        </header>
        <SearchBar onChange={setSearchQuery} value={searchQuery} />
        <FilterPills active={chatFilter} onChange={setChatFilter} />
        <div className="chat-scroll flex-1 overflow-y-auto px-2 pb-20">
          {chatsError ? (
            <div className="mx-2 mt-2 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-700">
              Failed to load chats: {chatsError}
            </div>
          ) : null}

          {isAuthLoading || isChatsLoading ? (
            <div className="space-y-2 p-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex gap-3 rounded-xl p-2">
                  <div className="h-12 w-12 animate-shimmer rounded-full" />
                  <div className="flex-1 space-y-2 py-1">
                    <div className="h-3 w-32 animate-shimmer rounded-full" />
                    <div className="h-2 w-48 animate-shimmer rounded-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-[var(--text-secondary)]">No chats match your filters.</p>
          ) : (
            <div className="space-y-0.5">
              {filtered.map((chat) => (
                <ChatListItem
                  key={chat.conversation_id}
                  active={chat.conversation_id === conversationId}
                  chat={chat}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Desktop: sidebar handles the list; this shows the inbox */}
      <div className="hidden min-h-0 flex-1 lg:flex">
        {!conversationId && isInitialLoading ? (
          <LoadingSkeleton variant="full" />
        ) : (
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
          />
        )}
      </div>
    </div>
  )
}
