"use client"

import { Filter, Search } from "lucide-react"
import { IconButton } from "@/components/ui/IconButton"

export function SearchBar({
  value,
  onChange,
  onFilterClick,
}: {
  value: string
  onChange: (v: string) => void
  onFilterClick?: () => void
}) {
  return (
    <div className="px-3 pb-2">
     <div
  className="flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] px-3 py-2 shadow-sm"
  style={{ margin: "10px" }}
>
        <Search className="h-4 w-4 shrink-0 text-[var(--text-secondary)]" />
        <input
          className="min-w-0 flex-1 bg-transparent text-sm text-[var(--text-primary)] outline-none placeholder:text-[var(--text-secondary)]"
          onChange={(e) => onChange(e.target.value)}
          placeholder="Search or start new chat"
          type="search"
          value={value}
        />
        <IconButton aria-label="Filters" className="h-8 w-8" onClick={onFilterClick} size="sm">
          <Filter className="h-4 w-4" />
        </IconButton>
      </div>
    </div>
  )
}
