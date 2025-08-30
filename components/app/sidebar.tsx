"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

type SectionKey = "dashboard" | "events" | "circulars" | "approvals" | "registrations"

export function Sidebar({
  items,
  current,
  onNavigate,
}: {
  items: { key: SectionKey; label: string }[]
  current: SectionKey
  onNavigate: (k: SectionKey) => void
}) {
  return (
    <nav aria-label="Primary" className="p-3">
      <ul className="flex flex-col gap-1">
        {items.map((it) => {
          const active = it.key === current
          return (
            <li key={it.key}>
              <button
                onClick={() => onNavigate(it.key)}
                className={cn(
                  "relative w-full rounded-md px-3 py-2 text-left text-sm",
                  "hover:bg-muted transition-colors",
                  active && "bg-muted",
                )}
                aria-current={active ? "page" : undefined}
              >
                <span>{it.label}</span>
                {active && (
                  <motion.span
                    layoutId="sidebar-active"
                    className="pointer-events-none absolute inset-0 -z-10 rounded-md border border-border"
                    transition={{ type: "spring", stiffness: 380, damping: 32 }}
                  />
                )}
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
