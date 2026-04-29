"use client"

import { forwardRef } from "react"
import { cn } from "@/lib/cn"

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "ghost" | "soft"
  size?: "sm" | "md"
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ className, variant = "ghost", size = "md", type = "button", ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      className={cn(
        "inline-flex items-center justify-center rounded-full transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]",
        size === "sm" ? "h-8 w-8" : "h-10 w-10",
        variant === "ghost" && "text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]",
        variant === "soft" && "bg-[var(--bg-elevated)] text-[var(--text-primary)] hover:bg-[var(--bg-hover)]",
        props.disabled && "pointer-events-none opacity-50",
        className
      )}
      {...props}
    />
  )
)
IconButton.displayName = "IconButton"
