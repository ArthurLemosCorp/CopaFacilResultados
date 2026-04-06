"use client"

import { useTheme } from "next-themes"
import { Moon, Sun } from "lucide-react"
import { useEffect, useState } from "react"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <button
        className="fixed bottom-20 right-4 z-50 p-3 rounded-full bg-card border border-border shadow-lg"
        aria-label="Alternar tema"
      >
        <div className="w-5 h-5" />
      </button>
    )
  }

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="fixed bottom-20 right-4 z-50 p-3 rounded-full bg-card border border-border shadow-lg hover:bg-secondary transition-colors group"
      aria-label={theme === "dark" ? "Mudar para tema claro" : "Mudar para tema escuro"}
    >
      {theme === "dark" ? (
        <Sun className="w-5 h-5 text-accent group-hover:text-foreground transition-colors" />
      ) : (
        <Moon className="w-5 h-5 text-accent group-hover:text-foreground transition-colors" />
      )}
    </button>
  )
}
