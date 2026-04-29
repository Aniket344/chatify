"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"
import { useAuth } from "@/hooks/useAuth"
import LoadingSkeleton from "@/components/ui/LoadingSkeleton"

export default function LoginPage() {
  const router = useRouter()
  const { currentUser, isLoading } = useAuth()
  const [email, setEmail] = useState("")
  const [fullName, setFullName] = useState("")
  const [password, setPassword] = useState("")
  const [formError, setFormError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [notice, setNotice] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<"login" | "signup">("login")

  useEffect(() => {
    if (!isLoading && currentUser) {
      router.replace("/chats")
    }
  }, [currentUser, isLoading, router])

  const redirectUrl = typeof window !== "undefined" ? `${window.location.origin}/auth/callback?next=/chats` : ""

  const handleGoogle = async () => {
    setIsSubmitting(true)
    setFormError(null)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: redirectUrl },
    })
    setIsSubmitting(false)
    if (error) {
      setFormError(error.message)
    }
  }

  const handleLogin = async () => {
    setIsSubmitting(true)
    setFormError(null)
    setNotice(null)

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    setIsSubmitting(false)

    if (error) {
      setFormError(error.message)
      return
    }

    router.replace("/chats")
  }

  const handleSignup = async () => {
    setIsSubmitting(true)
    setFormError(null)
    setNotice(null)

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: fullName,
        },
      },
    })

    setIsSubmitting(false)

    if (error) {
      setFormError(error.message)
      return
    }

    if (data.session) {
      router.replace("/chats")
      return
    }

    setNotice("Signup successful! Please check your email to confirm your account.")
    setActiveTab("login")
  }

  if (isLoading) {
    return <LoadingSkeleton variant="full" />
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--bg-app)] px-4 py-10">
      <div className="w-full max-w-md rounded-3xl border border-[var(--border)] bg-[var(--bg-panel)] p-8 shadow-lg">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--accent)]/15 text-2xl text-[var(--accent)]">
            💬
          </div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Chatify</h1>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">Sign in to continue</p>
        </div>

        <div className="mb-6 flex gap-1 rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] p-1">
          <button
            className={`flex-1 rounded-lg py-2 text-sm font-semibold transition-colors ${
              activeTab === "login"
                ? "bg-[var(--bg-panel)] text-[var(--text-primary)] shadow-sm"
                : "text-[var(--text-secondary)]"
            }`}
            onClick={() => setActiveTab("login")}
            type="button"
          >
            Login
          </button>
          <button
            className={`flex-1 rounded-lg py-2 text-sm font-semibold transition-colors ${
              activeTab === "signup"
                ? "bg-[var(--bg-panel)] text-[var(--text-primary)] shadow-sm"
                : "text-[var(--text-secondary)]"
            }`}
            onClick={() => setActiveTab("signup")}
            type="button"
          >
            Sign up
          </button>
        </div>

        <button
          className="mb-6 flex w-full items-center justify-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--bg-panel)] py-3 text-sm font-medium text-[var(--text-primary)] transition hover:bg-[var(--bg-hover)] disabled:opacity-50"
          disabled={isSubmitting}
          onClick={() => void handleGoogle()}
          type="button"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          Continue with Google
        </button>

        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[var(--border)]" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-[var(--bg-panel)] px-2 text-[var(--text-secondary)]">or email</span>
          </div>
        </div>

        <div className="space-y-3">
          {activeTab === "signup" ? (
            <div>
              <label className="mb-1 block text-xs font-medium text-[var(--text-secondary)]" htmlFor="fullName">
                Full name
              </label>
              <input
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] px-4 py-2.5 text-sm text-[var(--text-primary)] outline-none transition focus:border-[var(--accent)]"
                id="fullName"
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Your name"
                value={fullName}
              />
            </div>
          ) : null}

          <div>
            <label className="mb-1 block text-xs font-medium text-[var(--text-secondary)]" htmlFor="email">
              Email
            </label>
            <input
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] px-4 py-2.5 text-sm text-[var(--text-primary)] outline-none transition focus:border-[var(--accent)]"
              id="email"
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              type="email"
              value={email}
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-[var(--text-secondary)]" htmlFor="password">
              Password
            </label>
            <input
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] px-4 py-2.5 text-sm text-[var(--text-primary)] outline-none transition focus:border-[var(--accent)]"
              id="password"
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              type="password"
              value={password}
            />
          </div>
        </div>

        {formError ? (
          <div className="mt-4 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-600">{formError}</div>
        ) : null}

        {notice ? (
          <div className="mt-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-700">{notice}</div>
        ) : null}

        <div className="mt-6">
          {activeTab === "login" ? (
            <button
              className="w-full rounded-xl bg-[var(--accent)] py-3 text-sm font-semibold text-white shadow-md transition hover:bg-[var(--accent-hover)] disabled:opacity-50"
              disabled={isSubmitting}
              onClick={() => void handleLogin()}
              type="button"
            >
              {isSubmitting ? "Please wait…" : "Login"}
            </button>
          ) : (
            <button
              className="w-full rounded-xl bg-[var(--accent)] py-3 text-sm font-semibold text-white shadow-md transition hover:bg-[var(--accent-hover)] disabled:opacity-50"
              disabled={isSubmitting || !fullName.trim()}
              onClick={() => void handleSignup()}
              type="button"
            >
              {isSubmitting ? "Creating…" : "Create account"}
            </button>
          )}
        </div>
      </div>
    </main>
  )
}
