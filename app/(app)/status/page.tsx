"use client"

import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { IconButton } from "@/components/ui/IconButton"
import { StatusComposer } from "@/components/status/StatusComposer"
import { StatusRail } from "@/components/status/StatusRail"
import { useAuth } from "@/hooks/useAuth"
import { useStatuses } from "@/hooks/useStatuses"

export default function StatusPage() {
  const router = useRouter()
  const { currentUser } = useAuth()
  const { mine, others, reload } = useStatuses(currentUser?.id)

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-[var(--bg-panel)]">
      <header className="flex items-center gap-2 border-b border-[var(--border)] px-2 py-2">
        <IconButton aria-label="Back" onClick={() => router.push("/chats")}>
          <ArrowLeft className="h-5 w-5" />
        </IconButton>
        <h1 className="text-sm font-semibold text-[var(--text-primary)]">Status</h1>
        <Link className="ml-auto text-xs font-medium text-[var(--accent)]" href="/chats">
          Chats
        </Link>
      </header>
      <div className="chat-scroll flex-1 overflow-y-auto p-4">
        <StatusComposer onCreated={() => void reload()} userId={currentUser?.id} />
        <StatusRail items={others} mine={mine} />
      </div>
    </div>
  )
}
