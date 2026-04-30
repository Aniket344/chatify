"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { useInView } from "react-intersection-observer"
import { ChatHeader } from "@/components/chat/ChatHeader"
import { DeleteMessageDialog } from "@/components/chat/DeleteMessageDialog"
import { EditMessageModal } from "@/components/chat/EditMessageModal"
import { ForwardModal } from "@/components/chat/ForwardModal"
import { formatMessageDay, isSameMessageGroup } from "@/lib/chat/format"
import type { ChatListRow } from "@/lib/chat/chat-list"
import { getDisplayName, type ChatUser, type MessageRow } from "@/lib/chat/models"
import { useReactions } from "@/hooks/useReactions"
import { useUiStore } from "@/store/ui-store"
import InputBox from "./InputBox"
import MessageBubble from "./MessageBubble"

interface ChatWindowProps {
  chatList?: ChatListRow[]
  conversationId?: string | null
  currentUser: ChatUser | null
  error?: string | null
  groupAvatarUrl?: string | null
  groupTitle?: string | null
  hasMoreOlder?: boolean
  isGroup?: boolean
  isLoading?: boolean
  isLoadingOlder?: boolean
  isSending?: boolean
  isTyping?: boolean
  loadOlderMessages?: () => Promise<void>
  onBack?: () => void
  messages: MessageRow[]
  onSendMessage: (
    content: string,
    extras?: { replyToId?: string | null; fileUrl?: string | null; messageType?: "text" | "image" | "file" | "voice" }
  ) => Promise<void>
  onTypingChange: (isTyping: boolean) => void
  presenceByUserId?: Record<string, boolean>
  selectedUser: ChatUser | null
}

export default function ChatWindow({
  chatList = [],
  conversationId = null,
  currentUser,
  error = null,
  groupAvatarUrl = null,
  groupTitle = null,
  hasMoreOlder = false,
  isGroup = false,
  isLoading = false,
  isLoadingOlder = false,
  isSending = false,
  isTyping = false,
  loadOlderMessages,
  onBack,
  messages,
  onSendMessage,
  onTypingChange,
  presenceByUserId = {},
  selectedUser,
}: ChatWindowProps) {
  const { byMessage } = useReactions(messages)
  const setReplyingTo = useUiStore((s) => s.setReplyingTo)
  const setForwardMessageId = useUiStore((s) => s.setForwardMessageId)
  const setEditingMessage = useUiStore((s) => s.setEditingMessage)
  const setDeleteTarget = useUiStore((s) => s.setDeleteTarget)
  const forwardMessageId = useUiStore((s) => s.forwardMessageId)
  const editingMessage = useUiStore((s) => s.editingMessage)
  const deleteTarget = useUiStore((s) => s.deleteTarget)

  const bottomRef = useRef<HTMLDivElement | null>(null)
  const [showScrollButton, setShowScrollButton] = useState(false)
  const chatContainerRef = useRef<HTMLDivElement>(null)
  const { ref: topSentinelRef, inView: topInView } = useInView({ threshold: 0 })

  useEffect(() => {
    if (topInView && hasMoreOlder && loadOlderMessages && !isLoadingOlder) {
      void loadOlderMessages()
    }
  }, [topInView, hasMoreOlder, isLoadingOlder, loadOlderMessages])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleScroll = () => {
    if (chatContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current
      setShowScrollButton(scrollHeight - scrollTop - clientHeight > 200)
    }
  }

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const headerUser: ChatUser | null = useMemo(() => {
    if (!selectedUser) {
      return null
    }
    if (isGroup) {
      return {
        id: selectedUser.id,
        fullName: groupTitle ?? selectedUser.fullName,
        email: null,
        avatarUrl: groupAvatarUrl ?? selectedUser.avatarUrl,
      }
    }
    return selectedUser
  }, [groupAvatarUrl, groupTitle, isGroup, selectedUser])

  const messageItems = useMemo(() => {
    return messages.map((message, index) => {
      const previous = messages[index - 1]
      const next = messages[index + 1]
      const isOwn = message.sender_id === currentUser?.id
      const showDayLabel =
        !previous || formatMessageDay(previous.created_at) !== formatMessageDay(message.created_at)

      return {
        isGroupStart: !isSameMessageGroup(previous, message),
        isOwn,
        message,
        showDayLabel,
        showStatus: !next || next.sender_id !== message.sender_id,
      }
    })
  }, [currentUser?.id, messages])

  if (!headerUser) {
    return (
      <section className="flex flex-1 items-center justify-center px-6 py-6">
        <p className="text-sm text-[var(--text-secondary)]">Open a chat to start messaging.</p>
      </section>
    )
  }

  const peerOnline = !isGroup && selectedUser ? Boolean(presenceByUserId[selectedUser.id]) : false

  return (
    <section className="flex min-h-0 min-w-0 flex-1 flex-col bg-[var(--bg-panel)] lg:rounded-2xl lg:border lg:border-[var(--border)] lg:shadow-sm">
      <ChatHeader
        isGroup={isGroup}
        isOnline={peerOnline}
        isTyping={isTyping}
        lastSeenAt={!isGroup ? selectedUser?.lastSeenAt ?? null : null}
        user={headerUser}
        onBack={onBack}
      />

      <div
        ref={chatContainerRef}
        className="chat-wallpaper chat-scroll relative min-h-0 flex-1 overflow-y-auto px-3 py-4"
        onScroll={handleScroll}
      >
        <div ref={topSentinelRef} className="h-1 w-full shrink-0" />
        {isLoadingOlder ? (
          <div className="py-2 text-center text-xs text-[var(--text-secondary)]">Loading older messages…</div>
        ) : null}

        <AnimatePresence>
          {isLoading ? (
            <div className="flex h-full items-center justify-center py-12">
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="h-10 w-10 animate-shimmer rounded-full" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 w-24 animate-shimmer rounded-full" />
                      <div className="h-14 w-56 max-w-[70%] animate-shimmer rounded-2xl" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <>
              {messageItems.length === 0 ? (
                <motion.div
                  animate={{ opacity: 1, y: 0 }}
                  className="flex h-full items-center justify-center py-12"
                  initial={{ opacity: 0, y: 12 }}
                >
                  <div className="text-center">
                    <div className="mb-3 text-5xl">💬</div>
                    <p className="text-base font-medium text-[var(--text-primary)]">
                      Say hi to {getDisplayName(headerUser)}
                    </p>
                    <p className="mt-1 text-sm text-[var(--text-secondary)]">Send a message to start the chat.</p>
                  </div>
                </motion.div>
              ) : (
                <div className="space-y-4">
                  {messageItems.map((item) => (
                    <div key={item.message.id}>
                      {item.showDayLabel ? (
                        <div className="flex justify-center py-3">
                          <span className="rounded-lg bg-[var(--bg-panel)]/90 px-3 py-1 text-[11px] font-medium uppercase tracking-wide text-[var(--text-secondary)] shadow-sm">
                            {formatMessageDay(item.message.created_at)}
                          </span>
                        </div>
                      ) : null}
                      <MessageBubble
                        isGroupStart={item.isGroupStart}
                        isOwn={item.isOwn}
                        message={item.message}
                        reactions={byMessage[item.message.id] ?? []}
                        showStatus={item.showStatus}
                        user={item.isOwn ? currentUser ?? headerUser : headerUser}
                        onDelete={(m) => setDeleteTarget(m)}
                        onEdit={(m) => setEditingMessage(m)}
                        onForward={(m) => setForwardMessageId(m.id)}
                        onReply={(m) => setReplyingTo(m)}
                      />
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </AnimatePresence>

        <div ref={bottomRef} />
      </div>

      <AnimatePresence>
        {showScrollButton ? (
          <motion.button
            animate={{ opacity: 1, scale: 1 }}
            className="fixed bottom-28 right-6 z-30 rounded-full bg-[var(--accent)] p-3 text-white shadow-lg lg:absolute lg:bottom-24 lg:right-8"
            exit={{ opacity: 0, scale: 0.85 }}
            initial={{ opacity: 0, scale: 0.85 }}
            type="button"
            onClick={scrollToBottom}
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.95 }}
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </motion.button>
        ) : null}
      </AnimatePresence>

      {error ? (
        <div className="border-t border-rose-500/30 bg-rose-500/10 px-4 py-2 text-center text-xs text-rose-600">
          {error}
        </div>
      ) : null}

      <InputBox
        conversationId={conversationId}
        disabled={!currentUser}
        isSending={isSending}
        onSendMessage={onSendMessage}
        onTypingChange={onTypingChange}
      />

      <ForwardModal
        chats={chatList}
        message={messages.find((m) => m.id === forwardMessageId) ?? null}
        onClose={() => setForwardMessageId(null)}
        open={Boolean(forwardMessageId)}
      />
      <EditMessageModal
        message={editingMessage}
        onClose={() => setEditingMessage(null)}
        open={Boolean(editingMessage)}
      />
      <DeleteMessageDialog
        message={deleteTarget}
        onClose={() => setDeleteTarget(null)}
        open={Boolean(deleteTarget)}
      />
    </section>
  )
}
