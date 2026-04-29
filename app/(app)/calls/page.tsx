"use client"

import { ArrowLeft, Phone } from "lucide-react"
import { useRouter } from "next/navigation"
import { IconButton } from "@/components/ui/IconButton"

export default function CallsPage() {
  const router = useRouter()

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-[var(--bg-panel)]">
      <header className="flex items-center gap-2 border-b border-[var(--border)] px-2 py-2">
        <IconButton aria-label="Back" onClick={() => router.push("/chats")}>
          <ArrowLeft className="h-5 w-5" />
        </IconButton>
        <h1 className="text-sm font-semibold text-[var(--text-primary)]">Calls</h1>
      </header>
      <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[var(--accent)]/15 text-[var(--accent)]">
          <Phone className="h-10 w-10" />
        </div>
        <div>
          <p className="text-lg font-semibold text-[var(--text-primary)]">Calls coming soon</p>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            Voice and video calling will be available in a future update.
          </p>
        </div>
      </div>
    </div>
  )
}
