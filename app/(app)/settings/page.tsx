"use client"

import { useEffect, useState } from "react"
import { ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import { IconButton } from "@/components/ui/IconButton"
import { ThemeToggle } from "@/components/ui/ThemeToggle"
import { useAuth } from "@/hooks/useAuth"
import { getDisplayName } from "@/lib/chat/models"
import { supabase } from "@/lib/supabaseClient"

export default function SettingsPage() {
  const router = useRouter()
  const { currentUser, signOut } = useAuth()
  const [fullName, setFullName] = useState(currentUser?.fullName ?? "")
  const [bio, setBio] = useState(currentUser?.bio ?? "")
  const [statusText, setStatusText] = useState(currentUser?.statusText ?? "")
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)

  useEffect(() => {
    if (currentUser) {
      setFullName(currentUser.fullName ?? "")
      setBio(currentUser.bio ?? "")
      setStatusText(currentUser.statusText ?? "")
    }
  }, [currentUser])

  const saveProfile = async () => {
    if (!currentUser) {
      return
    }
    setSaving(true)
    setMsg(null)
    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: fullName.trim() || null,
        bio: bio.trim() || null,
        status_text: statusText.trim() || null,
      })
      .eq("id", currentUser.id)

    setSaving(false)
    if (error) {
      setMsg(error.message)
      return
    }
    setMsg("Profile saved.")
    window.location.reload()
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-[var(--bg-panel)]">
      <header className="flex items-center gap-2 border-b border-[var(--border)] px-2 py-2">
        <IconButton aria-label="Back" onClick={() => router.push("/chats")}>
          <ArrowLeft className="h-5 w-5" />
        </IconButton>
        <h1 className="text-sm font-semibold text-[var(--text-primary)]">Settings</h1>
        <div className="ml-auto">
          <ThemeToggle />
        </div>
      </header>
      <div className="chat-scroll flex-1 space-y-6 overflow-y-auto p-4">
        <section className="rounded-2xl border border-[var(--border)] bg-[var(--bg-elevated)] p-4">
          <h2 className="text-xs font-bold uppercase tracking-wide text-[var(--text-secondary)]">Profile</h2>
          <p className="mt-1 text-sm text-[var(--text-primary)]">{currentUser ? getDisplayName(currentUser) : ""}</p>
          <p className="text-xs text-[var(--text-secondary)]">{currentUser?.email}</p>
          <label className="mt-4 mb-1 block text-xs font-medium text-[var(--text-secondary)]">Display name</label>
          <input
            className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg-panel)] px-3 py-2 text-sm text-[var(--text-primary)] outline-none"
            onChange={(e) => setFullName(e.target.value)}
            value={fullName}
          />
          <label className="mt-3 mb-1 block text-xs font-medium text-[var(--text-secondary)]">Bio</label>
          <textarea
            className="min-h-[80px] w-full rounded-xl border border-[var(--border)] bg-[var(--bg-panel)] px-3 py-2 text-sm text-[var(--text-primary)] outline-none"
            onChange={(e) => setBio(e.target.value)}
            value={bio}
          />
          <label className="mt-3 mb-1 block text-xs font-medium text-[var(--text-secondary)]">Status</label>
          <input
            className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg-panel)] px-3 py-2 text-sm text-[var(--text-primary)] outline-none"
            onChange={(e) => setStatusText(e.target.value)}
            placeholder="Available"
            value={statusText}
          />
          {msg ? <p className="mt-2 text-xs text-[var(--accent)]">{msg}</p> : null}
          <button
            className="mt-4 w-full rounded-xl bg-[var(--accent)] py-2.5 text-sm font-semibold text-white disabled:opacity-50"
            disabled={saving}
            onClick={() => void saveProfile()}
            type="button"
          >
            {saving ? "Saving…" : "Save changes"}
          </button>
        </section>

        <button
          className="w-full rounded-xl border border-[var(--border)] py-3 text-sm font-medium text-rose-600"
          onClick={() => void signOut().then(() => router.replace("/login"))}
          type="button"
        >
          Log out
        </button>
      </div>
    </div>
  )
}
