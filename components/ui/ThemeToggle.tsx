"use client"

import { Monitor, Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
import { IconButton } from "./IconButton"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <span className="inline-block h-10 w-10" />
  }

  const cycle = () => {
    if (theme === "light") setTheme("dark")
    else if (theme === "dark") setTheme("system")
    else setTheme("light")
  }

  const Icon = theme === "light" ? Sun : theme === "dark" ? Moon : Monitor

  return (
    <IconButton aria-label="Toggle theme" onClick={cycle} title={`Theme: ${theme}`}>
      <Icon className="h-5 w-5" />
    </IconButton>
  )
}
