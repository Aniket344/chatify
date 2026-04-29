"use client"

import { useEffect, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import type { StatusRow } from "@/lib/chat/statuses"

export function StatusViewer({ status, onClose }: { status: StatusRow | null; onClose: () => void }) {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (!status) {
      setProgress(0)
      return
    }
    const start = Date.now()
    const duration = 5000
    const id = window.setInterval(() => {
      const p = Math.min(100, ((Date.now() - start) / duration) * 100)
      setProgress(p)
      if (p >= 100) {
        window.clearInterval(id)
        onClose()
      }
    }, 50)
    return () => window.clearInterval(id)
  }, [onClose, status])

  return (
    <AnimatePresence>
      {status ? (
        <motion.div
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-[120] flex flex-col bg-black/90"
          exit={{ opacity: 0 }}
          initial={{ opacity: 0 }}
        >
          <div className="h-1 w-full bg-white/20">
            <div className="h-full bg-[var(--accent)] transition-all" style={{ width: `${progress}%` }} />
          </div>
          <button className="ml-auto p-4 text-sm text-white" onClick={onClose} type="button">
            Close
          </button>
          <div
            className="flex flex-1 items-center justify-center p-6 text-center text-lg font-medium text-white"
            style={{ background: status.background ?? "#128C7E" }}
          >
            {status.caption}
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
