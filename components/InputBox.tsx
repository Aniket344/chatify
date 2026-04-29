"use client"

import { useEffect, useRef, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import Picker from "@emoji-mart/react"
import data from "@emoji-mart/data"
import { Mic, Paperclip, SendHorizontal, Smile, X } from "lucide-react"
import { useVoiceRecorder } from "@/hooks/useVoiceRecorder"
import { uploadChatFile } from "@/lib/chat/storage"
import { useUiStore } from "@/store/ui-store"

interface InputBoxProps {
  conversationId?: string | null
  disabled?: boolean
  isSending?: boolean
  onSendMessage: (
    content: string,
    extras?: { replyToId?: string | null; fileUrl?: string | null; messageType?: "text" | "image" | "file" | "voice" }
  ) => Promise<void>
  onTypingChange: (isTyping: boolean) => void
}

export default function InputBox({
  conversationId,
  disabled = false,
  isSending = false,
  onSendMessage,
  onTypingChange,
}: InputBoxProps) {
  const [message, setMessage] = useState("")
  const [isFocused, setIsFocused] = useState(false)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const voice = useVoiceRecorder()
  const replyingTo = useUiStore((s) => s.replyingTo)
  const setReplyingTo = useUiStore((s) => s.setReplyingTo)

  const adjustHeight = () => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = "auto"
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`
    }
  }

  useEffect(() => {
    adjustHeight()
  }, [message])

  const sendMessage = async () => {
    const trimmedMessage = message.trim()
    if (!trimmedMessage || disabled || isSending) {
      return
    }

    await onSendMessage(trimmedMessage, {
      replyToId: replyingTo?.id ?? undefined,
    })
    setMessage("")
    setReplyingTo(null)
    onTypingChange(false)

    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
    }
  }

  const handleKeyDown = async (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      await sendMessage()
    }
  }

  const onFile = async (file: File | null) => {
    if (!file || !conversationId || disabled || isSending) {
      return
    }
    const isImage = file.type.startsWith("image/")
    const bucket = isImage ? "chat-attachments" : "chat-attachments"
    const { publicUrl } = await uploadChatFile(conversationId, file, bucket)
    await onSendMessage(isImage ? "Photo" : file.name || "File", {
      fileUrl: publicUrl,
      messageType: isImage ? "image" : "file",
      replyToId: replyingTo?.id ?? undefined,
    })
    setReplyingTo(null)
    onTypingChange(false)
    if (fileRef.current) {
      fileRef.current.value = ""
    }
  }

  const toggleVoice = async () => {
    if (!conversationId || disabled || isSending) {
      return
    }
    if (!voice.isRecording) {
      await voice.start()
      return
    }
    const blob = await voice.stop()
    if (!blob) {
      return
    }
    const file = new File([blob], "voice.webm", { type: "audio/webm" })
    const { publicUrl } = await uploadChatFile(conversationId, file, "voice-notes")
    await onSendMessage(".", {
      fileUrl: publicUrl,
      messageType: "voice",
      replyToId: replyingTo?.id ?? undefined,
    })
    setReplyingTo(null)
    onTypingChange(false)
  }

  return (
    <div className="border-t border-[var(--border)] bg-[var(--bg-panel)] px-3 py-3">
      {replyingTo ? (
        <div className="mb-2 flex items-center justify-between gap-2 rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] px-3 py-2 text-xs">
          <div className="min-w-0">
            <p className="font-semibold text-[var(--accent)]">Replying to</p>
            <p className="truncate text-[var(--text-secondary)]">{replyingTo.content}</p>
          </div>
          <button
            aria-label="Cancel reply"
            className="shrink-0 rounded-full p-1 text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]"
            onClick={() => setReplyingTo(null)}
            type="button"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : null}

      <div
        className={`relative rounded-2xl transition-all duration-200 ${
          isFocused ? "ring-2 ring-[var(--accent)]/40" : ""
        }`}
      >
        <div className="flex items-end gap-2 rounded-2xl border border-[var(--border)] bg-[var(--bg-elevated)] p-2">
          <input ref={fileRef} className="hidden" onChange={(e) => void onFile(e.target.files?.[0] ?? null)} type="file" />

          <motion.button
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[var(--text-secondary)] transition hover:bg-[var(--bg-hover)]"
            type="button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowEmojiPicker((v) => !v)}
          >
            <Smile className="h-5 w-5" />
          </motion.button>

          <textarea
            ref={textareaRef}
            className="max-h-32 min-h-[40px] flex-1 resize-none bg-transparent py-2 text-sm leading-6 text-[var(--text-primary)] outline-none placeholder:text-[var(--text-secondary)] disabled:cursor-not-allowed"
            disabled={disabled}
            onBlur={() => setIsFocused(false)}
            onChange={(e) => {
              const value = e.target.value
              setMessage(value)
              onTypingChange(value.trim().length > 0)
            }}
            onFocus={() => setIsFocused(true)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message"
            rows={1}
            value={message}
          />

          <motion.button
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[var(--text-secondary)] transition hover:bg-[var(--bg-hover)]"
            type="button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => fileRef.current?.click()}
          >
            <Paperclip className="h-5 w-5" />
          </motion.button>

          {message.trim() ? (
            <motion.button
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[var(--accent)] text-white shadow-md transition disabled:opacity-50"
              disabled={disabled || isSending}
              type="button"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => void sendMessage()}
            >
              {isSending ? (
                <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                <SendHorizontal className="h-5 w-5" />
              )}
            </motion.button>
          ) : (
            <motion.button
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-white shadow-md ${
                voice.isRecording ? "bg-rose-500" : "bg-[var(--accent)]"
              }`}
              disabled={disabled || isSending}
              type="button"
              whileTap={{ scale: 0.96 }}
              onClick={() => void toggleVoice()}
            >
              <Mic className="h-5 w-5" />
            </motion.button>
          )}
        </div>

        <AnimatePresence>
          {showEmojiPicker ? (
            <motion.div
              animate={{ opacity: 1, y: 0 }}
              className="absolute bottom-full left-0 z-50 mb-2 overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--bg-panel)] shadow-xl"
              exit={{ opacity: 0, y: 6 }}
              initial={{ opacity: 0, y: 6 }}
            >
              <Picker
                data={data}
                onEmojiSelect={(e: { native: string }) => {
                  setMessage((m) => m + e.native)
                  setShowEmojiPicker(false)
                  textareaRef.current?.focus()
                }}
                theme="light"
              />
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  )
}
