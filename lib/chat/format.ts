import type { MessageRow } from "@/lib/chat/models"

const timeFormatter = new Intl.DateTimeFormat("en-US", {
  hour: "numeric",
  minute: "2-digit",
})

const dayFormatter = new Intl.DateTimeFormat("en-US", {
  day: "numeric",
  month: "short",
})

export function formatMessageTime(iso: string) {
  return timeFormatter.format(new Date(iso))
}

export function formatMessageDay(iso: string) {
  return dayFormatter.format(new Date(iso))
}

export function isSameMessageGroup(previous: MessageRow | undefined, current: MessageRow) {
  if (!previous) {
    return false
  }

  const previousTime = new Date(previous.created_at).getTime()
  const currentTime = new Date(current.created_at).getTime()

  return previous.sender_id === current.sender_id && currentTime - previousTime < 5 * 60 * 1000
}

export type MessageDeliveryStatus = "Sending" | "Sent" | "Delivered" | "Read" | null

export function getMessageStatus(message: MessageRow, isOwn: boolean): MessageDeliveryStatus {
  if (!isOwn) {
    return null
  }

  if (message.seen_at) {
    return "Read"
  }

  if (message.receiver_id) {
    return "Delivered"
  }

  return "Sent"
}
