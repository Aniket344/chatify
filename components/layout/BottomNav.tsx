"use client"

import { MessageCircle, Phone, Settings, Sparkles } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/cn"

const items = [
  { href: "/chats", label: "Chats", icon: MessageCircle },
  { href: "/status", label: "Status", icon: Sparkles },
  { href: "/calls", label: "Calls", icon: Phone },
  { href: "/settings", label: "Settings", icon: Settings },
] as const

export function BottomNav() {
  const pathname = usePathname()
  const shouldShow = pathname === "/chats"

  if (!shouldShow) {
    return null
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 flex border-t border-[var(--border)] bg-[var(--bg-panel)]/95 px-2 py-1 backdrop-blur-md lg:hidden">
      {items.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || pathname.startsWith(`${href}/`)
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex flex-1 flex-col items-center gap-0.5 rounded-lg py-2 text-[10px] font-medium transition-colors",
              active ? "text-[var(--accent)]" : "text-[var(--text-secondary)]"
            )}
          >
            <Icon className="h-5 w-5" strokeWidth={active ? 2.5 : 2} />
            {label}
          </Link>
        )
      })}
    </nav>
  )
}
