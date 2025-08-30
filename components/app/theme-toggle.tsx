"use client"

import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const next = theme === "dark" ? "light" : "dark"
  return (
    <Button
      variant="outline"
      className="h-9 border-border text-foreground bg-transparent"
      onClick={() => setTheme(next)}
      aria-label="Toggle theme"
    >
      {theme === "dark" ? "Light" : "Dark"}
    </Button>
  )
}
