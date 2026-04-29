"use client"

import { Toaster } from "sonner"
import { ThemeProvider } from "./theme-provider"

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="data-theme" defaultTheme="system" enableSystem disableTransitionOnChange>
      {children}
      <Toaster richColors position="top-center" closeButton />
    </ThemeProvider>
  )
}
