"use client"

import { cn } from "@/lib/cn"

export function Badge({
  children,
  className,
  variant = "accent",
}: {
  children: React.ReactNode
  className?: string
  variant?: "accent" | "muted"
}) {
  return (
    <span
      className={cn(
        "inline-flex min-w-[1.25rem] items-center justify-center rounded-full px-1.5 py-0.5 text-[10px] font-bold leading-none",
        variant === "accent" && "bg-[var(--unread-badge)] text-white",
        variant === "muted" && "bg-[var(--bg-elevated)] text-[var(--text-secondary)]",
        className
      )}
    >
      {children}
    </span>
  )
}
