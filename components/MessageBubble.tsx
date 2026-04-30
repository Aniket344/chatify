"use client"

import { useMemo, useRef, useState } from "react"
import { motion } from "framer-motion"
import Image from "next/image"
import { Copy, CornerUpLeft, Pause, Pencil, Play, Share2, SmilePlus, Trash2 } from "lucide-react"
import { formatMessageTime, getMessageStatus } from "@/lib/chat/format"
import type { ChatUser, MessageRow } from "@/lib/chat/models"
import type { ReactionRow } from "@/lib/chat/reactions"
import { addReaction, removeReaction } from "@/lib/chat/reactions"
import { cn } from "@/lib/cn"
import { useAuth } from "@/hooks/useAuth"

const QUICK = ["👍", "❤️", "😂", "😮", "😢", "🙏"]

function formatAudioTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) {
    return "0:00"
  }
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, "0")}`
}

function VoiceNotePlayer({ src, isOwn }: { src: string; isOwn: boolean }) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const waveBars = useMemo(() => [4, 8, 6, 10, 5, 8, 7, 9, 4, 7, 6, 9, 5, 8, 7, 9], [])

  const progress = useMemo(() => {
    if (!duration) return 0
    return Math.min(100, (currentTime / duration) * 100)
  }, [currentTime, duration])

  const togglePlay = async () => {
    const audio = audioRef.current
    if (!audio) return
    if (audio.paused) {
      await audio.play()
      return
    }
    audio.pause()
  }

  return (
    <div className="min-w-[190px] max-w-[250px]">
      <audio
        ref={audioRef}
        preload="metadata"
        src={src}
        onEnded={() => setIsPlaying(false)}
        onPause={() => setIsPlaying(false)}
        onPlay={() => setIsPlaying(true)}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration || 0)}
        onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
      />
      <div className="flex items-center gap-4">
        <button
          className={cn(
            "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-white shadow-sm",
            isOwn ? "bg-[var(--accent)]" : "bg-[var(--text-secondary)]"
          )}
          onClick={() => void togglePlay()}
          type="button"
        >
          {isPlaying ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
        </button>
        <div className="flex h-4 flex-1 items-center gap-[2px]">
          {waveBars.map((bar, idx) => {
            const barProgress = (idx + 1) / waveBars.length
            const active = progress / 100 >= barProgress
            return (
              <span
                key={`${idx}-${bar}`}
                className={cn(
                  "block w-[2px] rounded-full transition-colors",
                  active ? "bg-[var(--accent)]" : "bg-black/20"
                )}
                style={{ height: `${bar}px` }}
              />
            )
          })}
        </div>
      </div>
      <div className="mt-0.5 text-[10px] text-[var(--text-secondary)] tabular-nums">
        {formatAudioTime(duration || currentTime)}
      </div>
    </div>
  )
}

function Ticks({ status }: { status: ReturnType<typeof getMessageStatus> }) {
  if (status === "Read") {
    return (
      <span className="inline-flex translate-y-[1px] text-[var(--tick-read)]" title="Read">
        <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20">
          <path
            clipRule="evenodd"
            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
            fillRule="evenodd"
          />
        </svg>
        <svg className="-ml-1.5 h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20">
          <path
            clipRule="evenodd"
            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
            fillRule="evenodd"
          />
        </svg>
      </span>
    )
  }

  if (status === "Delivered" || status === "Sent") {
    return (
      <span className="inline-flex translate-y-[1px] text-[var(--text-secondary)]" title={status}>
        <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20">
          <path
            clipRule="evenodd"
            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
            fillRule="evenodd"
          />
        </svg>
        <svg className="-ml-1.5 h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20">
          <path
            clipRule="evenodd"
            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
            fillRule="evenodd"
          />
        </svg>
      </span>
    )
  }

  if (status === "Sending") {
    return (
      <svg className="h-3 w-3 animate-spin text-[var(--text-secondary)]" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" fill="currentColor" />
      </svg>
    )
  }

  return null
}

interface MessageBubbleProps {
  isGroupStart: boolean
  isOwn: boolean
  message: MessageRow
  reactions?: ReactionRow[]
  showStatus: boolean
  user: Pick<ChatUser, "avatarUrl" | "email" | "fullName">
  onReply?: (m: MessageRow) => void
  onForward?: (m: MessageRow) => void
  onEdit?: (m: MessageRow) => void
  onDelete?: (m: MessageRow) => void
}

export default function MessageBubble({
  isGroupStart: _isGroupStart,
  isOwn,
  message,
  reactions = [],
  showStatus,
  user: _user,
  onReply,
  onForward,
  onEdit,
  onDelete,
}: MessageBubbleProps) {
  const { currentUser } = useAuth()
  const [menu, setMenu] = useState(false)
  const status = getMessageStatus(message, isOwn)
  const isDeleted = Boolean(message.deleted_at && message.deleted_for_everyone)
  const showImage = message.message_type === "image" && message.file_url
  const showFile = message.message_type === "file" && message.file_url
  const showVoice = message.message_type === "voice" && message.file_url

  const grouped = reactions.reduce<Record<string, number>>((acc, r) => {
    acc[r.emoji] = (acc[r.emoji] ?? 0) + 1
    return acc
  }, {})

  const toggleReact = async (emoji: string) => {
    const mine = reactions.some((x) => x.user_id === currentUser?.id && x.emoji === emoji)
    try {
      if (mine) {
        await removeReaction(message.id, emoji)
      } else {
        await addReaction(message.id, emoji)
      }
    } catch {
      /* ignore */
    }
  }

  const bubbleRadius = cn(
    "relative max-w-[min(100%,520px)] px-2.5 py-1.5 text-sm leading-relaxed shadow-sm",
    isOwn
      ? "rounded-[10px] rounded-br-[4px] bg-[var(--bg-bubble-sent)] text-[var(--text-primary)]"
      : "rounded-[10px] rounded-bl-[4px] bg-[var(--bg-bubble-received)] text-[var(--text-primary)] ring-1 ring-black/[0.04]"
  )

  return (
    <motion.div
      animate={{ opacity: 1, x: 0, scale: 1 }}
      className={cn("group relative flex", isOwn ? "justify-end" : "justify-start")}
      initial={{ opacity: 0, x: isOwn ? 12 : -12, scale: 0.98 }}
      transition={{ type: "spring", stiffness: 520, damping: 34 }}
    >
      <div className={cn("flex max-w-[85%] flex-col sm:max-w-[70%]", isOwn ? "items-end" : "items-start")}>
        <div
          className={bubbleRadius}
          onContextMenu={(e) => {
            e.preventDefault()
            setMenu(true)
          }}
        >
          {message.reply_to_id ? (
            <div className="mb-1 rounded-lg border-l-4 border-[var(--accent)] bg-black/[0.04] px-2 py-1 text-xs text-[var(--text-secondary)] dark:bg-white/[0.06]">
              Replying to a message
            </div>
          ) : null}
          {message.edited_at ? (
            <span className="mb-1 block text-[10px] font-medium text-[var(--text-secondary)]">Edited</span>
          ) : null}
          {showImage ? (
            <div className="relative -mx-0.5 overflow-hidden rounded-lg">
              <Image
                alt=""
                className="max-h-64 w-full object-cover"
                height={256}
                src={message.file_url!}
                unoptimized
                width={400}
              />
            </div>
          ) : null}
          {showFile ? (
            <a
              className="flex items-center gap-2 text-[var(--accent)] underline"
              href={message.file_url!}
              rel="noreferrer"
              target="_blank"
            >
              File attachment
            </a>
          ) : null}
          {showVoice ? <VoiceNotePlayer isOwn={isOwn} src={message.file_url!} /> : null}
          {!showImage && !showFile && !showVoice ? (
            <p className="whitespace-pre-wrap break-words">
              {isDeleted ? (
                <span className="italic text-[var(--text-secondary)]">This message was deleted</span>
              ) : (
                message.content
              )}
            </p>
          ) : null}
          <div className="mt-0.5 flex items-end justify-end gap-1.5 text-[11px] text-[var(--text-secondary)]">
            <span className="pt-0.5 tabular-nums">{formatMessageTime(message.created_at)}</span>
            {showStatus && isOwn ? <Ticks status={status} /> : null}
          </div>
        </div>

        {Object.keys(grouped).length > 0 ? (
          <div className="mt-1 flex flex-wrap gap-1">
            {Object.entries(grouped).map(([emoji, count]) => (
              <button
                key={emoji}
                className="rounded-full border border-[var(--border)] bg-[var(--bg-panel)] px-2 py-0.5 text-[11px] shadow-sm transition hover:bg-[var(--bg-hover)]"
                onClick={() => void toggleReact(emoji)}
                type="button"
              >
                {emoji} {count > 1 ? count : ""}
              </button>
            ))}
          </div>
        ) : null}

        <div className="mt-1 flex flex-wrap gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          {QUICK.map((e) => (
            <button
              key={e}
              className="rounded-full bg-[var(--bg-panel)] p-1 text-sm shadow ring-1 ring-[var(--border)]"
              onClick={() => void toggleReact(e)}
              type="button"
            >
              {e}
            </button>
          ))}
          <button
            className="rounded-full bg-[var(--bg-panel)] p-1 shadow ring-1 ring-[var(--border)]"
            title="More"
            type="button"
            onClick={() => setMenu(true)}
          >
            <SmilePlus className="h-4 w-4 text-[var(--text-secondary)]" />
          </button>
        </div>
      </div>

      {menu ? (
        <>
          <button
            aria-label="Close menu"
            className="fixed inset-0 z-[80]"
            type="button"
            onClick={() => setMenu(false)}
          />
          <div
            className={cn(
              "absolute z-[85] min-w-[180px] rounded-xl border border-[var(--border)] bg-[var(--bg-panel)] py-1 text-sm shadow-xl",
              isOwn ? "bottom-full right-0 mb-1" : "bottom-full left-0 mb-1"
            )}
          >
            <button
              className="flex w-full items-center gap-2 px-3 py-2 text-left hover:bg-[var(--bg-hover)]"
              onClick={() => {
                onReply?.(message)
                setMenu(false)
              }}
              type="button"
            >
              <CornerUpLeft className="h-4 w-4" /> Reply
            </button>
            <button
              className="flex w-full items-center gap-2 px-3 py-2 text-left hover:bg-[var(--bg-hover)]"
              onClick={() => {
                onForward?.(message)
                setMenu(false)
              }}
              type="button"
            >
              <Share2 className="h-4 w-4" /> Forward
            </button>
            <button
              className="flex w-full items-center gap-2 px-3 py-2 text-left hover:bg-[var(--bg-hover)]"
              onClick={() => {
                void navigator.clipboard.writeText(message.content)
                setMenu(false)
              }}
              type="button"
            >
              <Copy className="h-4 w-4" /> Copy
            </button>
            {isOwn && message.message_type === "text" && !isDeleted ? (
              <button
                className="flex w-full items-center gap-2 px-3 py-2 text-left hover:bg-[var(--bg-hover)]"
                onClick={() => {
                  onEdit?.(message)
                  setMenu(false)
                }}
                type="button"
              >
                <Pencil className="h-4 w-4" /> Edit
              </button>
            ) : null}
            {!isDeleted ? (
              <button
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-rose-600 hover:bg-[var(--bg-hover)]"
                onClick={() => {
                  onDelete?.(message)
                  setMenu(false)
                }}
                type="button"
              >
                <Trash2 className="h-4 w-4" /> Delete
              </button>
            ) : null}
          </div>
        </>
      ) : null}
    </motion.div>
  )
}
