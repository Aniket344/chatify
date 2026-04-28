"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/hooks/useAuth";
import LoadingSkeleton from "@/components/ui/LoadingSkeleton";

export default function LoginPage() {
  const router = useRouter();
  const { currentUser, isLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"login" | "signup">("login");

  useEffect(() => {
    if (!isLoading && currentUser) {
      router.replace("/chat");
    }
  }, [currentUser, isLoading, router]);

  const handleLogin = async () => {
    setIsSubmitting(true);
    setFormError(null);
    setNotice(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setIsSubmitting(false);

    if (error) {
      setFormError(error.message);
      return;
    }

    router.replace("/chat");
  };

  const handleSignup = async () => {
    setIsSubmitting(true);
    setFormError(null);
    setNotice(null);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: fullName,
        },
      },
    });

    setIsSubmitting(false);

    if (error) {
      setFormError(error.message);
      return;
    }

    if (data.session) {
      router.replace("/chat");
      return;
    }

    setNotice("Signup successful! Please check your email to confirm your account.");
    setActiveTab("login");
  };

  if (isLoading) {
    return <LoadingSkeleton variant="full" />;
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center bg-[#090d18] px-4">
      {/* Animated background gradient */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -left-1/4 -top-1/4 h-[500px] w-[500px] rounded-full bg-violet-600/20 blur-[100px]" />
        <div className="absolute -bottom-1/4 -right-1/4 h-[500px] w-[500px] rounded-full bg-blue-600/20 blur-[100px]" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Tab switcher */}
        <div className="mb-6 flex gap-2 rounded-2xl border border-white/8 bg-white/5 p-1">
          <button
            className={`flex-1 rounded-xl px-4 py-2 text-sm font-medium transition-all ${
              activeTab === "login"
                ? "bg-gradient-to-r from-violet-600 to-blue-500 text-white shadow-lg"
                : "text-slate-400 hover:text-white"
            }`}
            onClick={() => setActiveTab("login")}
            type="button"
          >
            Login
          </button>
          <button
            className={`flex-1 rounded-xl px-4 py-2 text-sm font-medium transition-all ${
              activeTab === "signup"
                ? "bg-gradient-to-r from-violet-600 to-blue-500 text-white shadow-lg"
                : "text-slate-400 hover:text-white"
            }`}
            onClick={() => setActiveTab("signup")}
            type="button"
          >
            Create Account
          </button>
        </div>

        <div className="glass-panel rounded-3xl p-6 shadow-2xl sm:p-8">
          <div className="mb-8 space-y-2 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-blue-500 text-2xl shadow-lg">
              💬
            </div>
            <h1 className="text-3xl font-semibold">Chatify</h1>
            <p className="text-sm text-slate-400">
              Secure 1-to-1 messaging with realtime updates.
            </p>
          </div>

          <div className="space-y-4">
            {activeTab === "signup" && (
              <div>
                <label className="mb-2 block text-sm text-slate-300" htmlFor="fullName">
                  Full name
                </label>
                <input
                  className="w-full rounded-2xl border border-white/8 bg-[#0b0f1b] px-4 py-3 text-sm outline-none transition focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
                  id="fullName"
                  onChange={(event) => setFullName(event.target.value)}
                  placeholder="Riya Sharma"
                  value={fullName}
                />
              </div>
            )}

            <div>
              <label className="mb-2 block text-sm text-slate-300" htmlFor="email">
                Email
              </label>
              <input
                className="w-full rounded-2xl border border-white/8 bg-[#0b0f1b] px-4 py-3 text-sm outline-none transition focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
                id="email"
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                type="email"
                value={email}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-slate-300" htmlFor="password">
                Password
              </label>
              <input
                className="w-full rounded-2xl border border-white/8 bg-[#0b0f1b] px-4 py-3 text-sm outline-none transition focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
                id="password"
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Minimum 6 characters"
                type="password"
                value={password}
              />
            </div>
          </div>

          {formError && (
            <div className="mt-4 rounded-xl border border-rose-500/20 bg-rose-500/10 p-3 text-sm text-rose-400">
              {formError}
            </div>
          )}
          
          {notice && (
            <div className="mt-4 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-sm text-emerald-400">
              {notice}
            </div>
          )}

          <div className="mt-6 space-y-3">
            {activeTab === "login" ? (
              <button
                className="w-full rounded-2xl bg-gradient-to-r from-violet-600 to-blue-500 px-4 py-3 text-sm font-medium text-white transition-all hover:scale-[1.02] hover:brightness-110 disabled:opacity-60"
                disabled={isSubmitting}
                onClick={() => void handleLogin()}
                type="button"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Please wait...
                  </span>
                ) : (
                  "Login"
                )}
              </button>
            ) : (
              <button
                className="w-full rounded-2xl bg-gradient-to-r from-violet-600 to-blue-500 px-4 py-3 text-sm font-medium text-white transition-all hover:scale-[1.02] hover:brightness-110 disabled:opacity-60"
                disabled={isSubmitting || !fullName.trim()}
                onClick={() => void handleSignup()}
                type="button"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Creating account...
                  </span>
                ) : (
                  "Create Account"
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
