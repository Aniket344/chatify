"use client"

import Image from "next/image"
import { cn } from "@/lib/cn"

const sizes = { xs: 32, sm: 40, md: 48, lg: 56, xl: 96 } as const

export interface AvatarProps {
  src?: string | null
  alt: string
  fallback: string
  size?: keyof typeof sizes
  className?: string
  online?: boolean
}

export function Avatar({ src, alt, fallback, size = "md", className, online }: AvatarProps) {
  const px = sizes[size]

  return (
    <div
      className={cn("relative shrink-0 rounded-full bg-[var(--bg-elevated)] ring-1 ring-[var(--border)]", className)}
      style={{ width: px, height: px }}
    >
      {src ? (
        <Image
          alt={alt}
          className="h-full w-full rounded-full object-cover"
          height={px}
          src={src}
          unoptimized
          width={px}
        />
      ) : (
        <span className="flex h-full w-full items-center justify-center text-sm font-semibold text-[var(--text-secondary)]">
          {fallback.slice(0, 2).toUpperCase()}
        </span>
      )}
      {online ? (
      <span className="absolute bottom-0.5 -right-1 h-3.5 w-3.5 rounded-full border-2 border-[var(--bg-elevated)] bg-[var(--accent)]" />
      ) : null}
    </div>
  )
}
