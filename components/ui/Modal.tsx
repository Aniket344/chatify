"use client"

import { AnimatePresence, motion } from "framer-motion"
import { X } from "lucide-react"
import { IconButton } from "./IconButton"
import { cn } from "@/lib/cn"

export function Modal({
  open,
  onClose,
  title,
  children,
  className,
}: {
  open: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
          exit={{ opacity: 0 }}
          initial={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className={cn(
              "relative max-h-[90vh] w-full max-w-lg overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--bg-panel)] shadow-xl",
              className
            )}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            onClick={(e) => e.stopPropagation()}
            transition={{ type: "spring", stiffness: 380, damping: 28 }}
          >
            <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-3">
              {title ? <h2 className="text-sm font-semibold text-[var(--text-primary)]">{title}</h2> : <span />}
              <IconButton aria-label="Close" onClick={onClose} size="sm">
                <X className="h-4 w-4" />
              </IconButton>
            </div>
            <div className="max-h-[calc(90vh-3.5rem)] overflow-y-auto p-4">{children}</div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
