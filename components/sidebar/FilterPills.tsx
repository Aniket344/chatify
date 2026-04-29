"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/cn"
import type { ChatFilter } from "@/store/ui-store"

const FILTERS: { id: ChatFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "unread", label: "Unread" },
  { id: "groups", label: "Groups" },
  { id: "pinned", label: "Pinned" },
]

export function FilterPills({
  active,
  onChange,
}: {
  active: ChatFilter
  onChange: (f: ChatFilter) => void
}) {
  return (
    <div className="flex gap-2 overflow-x-auto px-3 pb-3 scrollbar-none">
      {FILTERS.map((f) => {
        const isActive = active === f.id
        return (
          <motion.button
            key={f.id}
            layout
            type="button"
            onClick={() => onChange(f.id)}
            className={cn(
              "shrink-0 rounded-full px-4 py-1.5 text-xs font-semibold transition-colors",
              isActive
                ? "bg-[var(--accent)] text-white shadow-sm"
                : "bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]"
            )}
            whileTap={{ scale: 0.97 }}
          >
            {f.label}
          </motion.button>
        )
      })}
    </div>
  )
}
