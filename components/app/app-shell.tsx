"use client"

import type React from "react"

import { motion, AnimatePresence } from "framer-motion"
import { Sidebar } from "./sidebar"
import { ThemeToggle } from "./theme-toggle"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useState } from "react"

type Role = "student" | "club" | "committee"
type SectionKey = "dashboard" | "events" | "circulars" | "approvals" | "registrations"

export function AppShell(props: {
  role: Role
  onRoleChange: (r: Role) => void
  nav: { key: SectionKey; label: string }[]
  current: SectionKey
  onNavigate: (k: SectionKey) => void
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true)

  return (
    <div className="min-h-dvh bg-background text-foreground">
      {/* Top bar */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              className="h-9 px-2 text-foreground"
              onClick={() => setSidebarOpen((v) => !v)}
              aria-label="Toggle sidebar"
            >
              {/* Simple hamburger */}
              <span className="sr-only">Toggle sidebar</span>
              <div className="flex flex-col gap-1.5">
                <span className="h-[2px] w-5 bg-foreground" />
                <span className="h-[2px] w-5 bg-foreground" />
                <span className="h-[2px] w-5 bg-foreground" />
              </div>
            </Button>
            <div className="font-semibold tracking-tight">EventOpia</div>
          </div>
          <div className="flex items-center gap-2">
            <RoleSwitcher role={props.role} onChange={props.onRoleChange} />
            <ThemeToggle />
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-6xl grid-cols-1 md:grid-cols-[220px_1fr]">
        {/* Sidebar */}
        <AnimatePresence initial={false}>
          {sidebarOpen && (
            <motion.aside
              key="sidebar"
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ type: "spring", stiffness: 320, damping: 30 }}
              className="border-r border-border bg-background"
            >
              <Sidebar items={props.nav} current={props.current} onNavigate={props.onNavigate} />
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Main content with subtle page transition */}
        <main className={cn("min-h-[calc(100dvh-56px)] p-4 md:p-6", !sidebarOpen && "md:col-span-2")}>
          <motion.div
            key={props.current}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
            className="mx-auto max-w-5xl"
          >
            {props.children}
          </motion.div>
        </main>
      </div>
    </div>
  )
}

function RoleSwitcher({ role, onChange }: { role: Role; onChange: (r: Role) => void }) {
  return (
    <div className="flex items-center gap-2">
      <label className="text-sm text-muted-foreground" htmlFor="role">
        Role
      </label>
      <select
        id="role"
        className="h-9 rounded-md border border-border bg-background px-2 text-sm"
        value={role}
        onChange={(e) => onChange(e.target.value as Role)}
        aria-label="Select role"
      >
        <option value="student">Student</option>
        <option value="club">Club</option>
        <option value="committee">Committee</option>
      </select>
    </div>
  )
}
