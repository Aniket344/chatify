"use client"

import { cn } from "@/lib/cn"

export function Switch({
  checked,
  onCheckedChange,
  id,
  disabled,
}: {
  checked: boolean
  onCheckedChange: (v: boolean) => void
  id?: string
  disabled?: boolean
}) {
  return (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onCheckedChange(!checked)}
      className={cn(
        "relative h-7 w-12 shrink-0 rounded-full transition-colors",
        checked ? "bg-[var(--accent)]" : "bg-[var(--bg-elevated)]",
        disabled && "opacity-50"
      )}
    >
      <span
        className={cn(
          "absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform",
          checked ? "translate-x-5" : "translate-x-0.5"
        )}
      />
    </button>
  )
}
