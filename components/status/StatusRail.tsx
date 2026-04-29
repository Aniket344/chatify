"use client"

import { formatDistanceToNow } from "date-fns"
import { useState } from "react"
import type { StatusRow } from "@/lib/chat/statuses"
import { StatusViewer } from "@/components/status/StatusViewer"

export function StatusRail({ mine, items }: { mine: StatusRow[]; items: StatusRow[] }) {
  const [open, setOpen] = useState<StatusRow | null>(null)

  return (
    <div>
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]">Recent updates</p>
      <div className="flex gap-3 overflow-x-auto pb-2">
        {mine.map((s) => (
          <button
            key={s.id}
            className="flex w-24 shrink-0 flex-col items-center gap-1 text-center"
            onClick={() => setOpen(s)}
            type="button"
          >
            <div
              className="flex h-24 w-24 items-center justify-center rounded-2xl border-2 border-[var(--accent)] p-2 text-xs text-white shadow-inner"
              style={{ background: s.background ?? "var(--accent)" }}
            >
              {s.caption?.slice(0, 80)}
            </div>
            <span className="text-[10px] text-[var(--text-secondary)]">You</span>
          </button>
        ))}
        {items.map((s) => (
          <button
            key={s.id}
            className="flex w-24 shrink-0 flex-col items-center gap-1 text-center"
            onClick={() => setOpen(s)}
            type="button"
          >
            <div
              className="flex h-24 w-24 items-center justify-center rounded-2xl border border-[var(--border)] p-2 text-xs text-white shadow-inner"
              style={{ background: s.background ?? "#54656f" }}
            >
              {s.caption?.slice(0, 80)}
            </div>
            <span className="text-[10px] text-[var(--text-secondary)]">
              {formatDistanceToNow(new Date(s.created_at), { addSuffix: true })}
            </span>
          </button>
        ))}
      </div>
      <StatusViewer onClose={() => setOpen(null)} status={open} />
    </div>
  )
}
