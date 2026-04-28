"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { formatMessageDay, isSameMessageGroup } from "@/lib/chat/format";
import { getDisplayName, type ChatUser, type MessageRow } from "@/lib/chat/models";
import InputBox from "./InputBox";
import MessageBubble from "./MessageBubble";
import UserAvatar from "./UserAvatar";

interface ChatWindowProps {
  currentUser: ChatUser | null;
  error?: string | null;
  isLoading?: boolean;
  isSending?: boolean;
  isTyping?: boolean;
  messages: MessageRow[];
  onSendMessage: (content: string) => Promise<void>;
  onTypingChange: (isTyping: boolean) => void;
  selectedUser: ChatUser | null;
}

export default function ChatWindow({
  currentUser,
  error = null,
  isLoading = false,
  isSending = false,
  isTyping = false,
  messages,
  onSendMessage,
  onTypingChange,
  selectedUser,
}: ChatWindowProps) {
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleScroll = () => {
    if (chatContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
      setShowScrollButton(scrollHeight - scrollTop - clientHeight > 200);
    }
  };

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const messageItems = useMemo(() => {
    return messages.map((message, index) => {
      const previous = messages[index - 1];
      const next = messages[index + 1];
      const isOwn = message.sender_id === currentUser?.id;
      const showDayLabel =
        !previous || formatMessageDay(previous.created_at) !== formatMessageDay(message.created_at);

      return {
        isGroupStart: !isSameMessageGroup(previous, message),
        isOwn,
        message,
        showDayLabel,
        showStatus: !next || next.sender_id !== message.sender_id,
      };
    });
  }, [currentUser?.id, messages]);

  if (!selectedUser) {
    return (
      <section className="flex h-screen flex-1 items-center justify-center px-6 py-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="relative max-w-xl overflow-hidden"
        >
          {/* Animated background effects */}
          <div className="absolute -inset-1 bg-gradient-to-r from-violet-600 via-blue-500 to-pink-500 opacity-30 blur-2xl" />
          
          <div className="relative glass-panel flex flex-col items-center px-12 py-16 text-center">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="mb-8 flex h-28 w-28 items-center justify-center rounded-3xl bg-gradient-to-br from-violet-600 to-blue-500 text-5xl shadow-2xl"
            >
              💬
            </motion.div>
            
            <h2 className="text-4xl font-bold bg-gradient-to-r from-violet-400 via-blue-400 to-pink-400 bg-clip-text text-transparent">
              Welcome to Chatify
            </h2>
            <p className="mt-4 max-w-md text-lg text-slate-300">
              Select a conversation from the sidebar to start your secure messaging experience
            </p>
            
            <div className="mt-8 flex gap-4">
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                Realtime
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <div className="h-2 w-2 rounded-full bg-violet-400" />
                End-to-end encrypted
              </div>
            </div>
          </div>
        </motion.div>
      </section>
    );
  }

  return (
    <section className="flex h-screen flex-1 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="glass-panel flex h-full min-w-0 flex-1 flex-col overflow-hidden"
        style={{ minHeight: "85vh" }}
      >
        {/* Premium Header */}
        <header className="relative border-b border-white/10 bg-gradient-to-r from-violet-600/5 to-blue-500/5 px-6 py-5 backdrop-blur">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <motion.div
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <UserAvatar size="lg" user={selectedUser} showStatus isOnline={true} />
              </motion.div>
              
              <div>
                <h2 className="text-xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                  {getDisplayName(selectedUser)}
                </h2>
                <div className="mt-1 flex items-center gap-2">
                  <div className="relative">
                    <div className="h-2 w-2 rounded-full bg-emerald-400">
                      <div className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-75" />
                    </div>
                  </div>
                  <p className="text-sm text-slate-400">
                    {isTyping ? (
                      <span className="flex items-center gap-2 text-violet-400">
                        <span className="typing-indicator">
                          <span />
                          <span />
                          <span />
                        </span>
                        Typing...
                      </span>
                    ) : (
                      "Active now"
                    )}
                  </p>
                </div>
              </div>
            </div>

            <div className="hidden items-center gap-3 md:flex">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium text-slate-300 backdrop-blur"
              >
                🔒 Private
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="rounded-2xl border border-violet-500/20 bg-violet-500/10 px-4 py-2 text-xs font-medium text-violet-300 backdrop-blur"
              >
                ⚡ Realtime
              </motion.div>
            </div>
          </div>

          {/* Decorative gradient line */}
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-500 to-transparent" />
        </header>

        {/* Messages Area */}
        <div
          ref={chatContainerRef}
          onScroll={handleScroll}
          className="chat-scroll relative flex-1 overflow-y-auto px-6 py-6"
        >
          <AnimatePresence>
            {isLoading ? (
              <div className="flex h-full items-center justify-center">
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="h-10 w-10 animate-shimmer rounded-2xl bg-slate-800" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 w-24 animate-shimmer rounded-full bg-slate-800" />
                        <div className="h-16 w-64 animate-shimmer rounded-2xl bg-slate-800" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <>
                {messageItems.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex h-full items-center justify-center"
                  >
                    <div className="text-center">
                      <div className="mb-4 text-6xl">💫</div>
                      <p className="text-lg text-slate-300">
                        Say hello to {getDisplayName(selectedUser)}
                      </p>
                      <p className="mt-2 text-sm text-slate-500">
                        Start the conversation with a message
                      </p>
                    </div>
                  </motion.div>
                ) : (
                  <div className="space-y-6">
                    {messageItems.map((item, idx) => (
                      <div key={item.message.id}>
                        {item.showDayLabel && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex justify-center py-4"
                          >
                            <span className="rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium text-slate-300 backdrop-blur">
                              {formatMessageDay(item.message.created_at)}
                            </span>
                          </motion.div>
                        )}
                        
                        <MessageBubble
                          isGroupStart={item.isGroupStart}
                          isOwn={item.isOwn}
                          message={item.message}
                          showStatus={item.showStatus}
                          user={item.isOwn ? currentUser ?? selectedUser : selectedUser}
                        />
                      </div>
                    ))}
                  </div>
                )}

                {isTyping && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="pl-12"
                  >
                    <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 backdrop-blur">
                      <div className="typing-indicator">
                        <span />
                        <span />
                        <span />
                      </div>
                      <span className="text-xs text-slate-400">
                        {getDisplayName(selectedUser)} is typing...
                      </span>
                    </div>
                  </motion.div>
                )}
              </>
            )}
          </AnimatePresence>
          <div ref={bottomRef} />
        </div>

        {/* Scroll to bottom button */}
        <AnimatePresence>
          {showScrollButton && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              whileHover={{ scale: 1.1 }}
              onClick={scrollToBottom}
              className="absolute bottom-24 right-8 rounded-full bg-gradient-to-r from-violet-600 to-blue-500 p-3 shadow-2xl"
            >
              <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </motion.button>
          )}
        </AnimatePresence>

        <InputBox
          disabled={!currentUser}
          isSending={isSending}
          onSendMessage={onSendMessage}
          onTypingChange={onTypingChange}
        />
      </motion.div>
    </section>
  );
}