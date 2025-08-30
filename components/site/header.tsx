"use client"

import Link from "next/link"
import { useState } from "react"
import { cn } from "@/lib/utils"

export function Header() {
  const [open, setOpen] = useState(false)
  const nav = [
    { href: "#features", label: "Features" },
    { href: "#workflow", label: "Workflow" },
    { href: "#fcfs", label: "FCFS" },
    { href: "#dashboards", label: "Dashboards" },
    { href: "#future", label: "Future" },
  ]
  return (
    <header className="w-full border-b border-gray-200 bg-white">
      <div className="mx-auto max-w-5xl px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="font-semibold tracking-tight text-black">
            EventOpia
            <span className="sr-only">EventOpia Home</span>
          </Link>
          <button
            className="md:hidden rounded border border-gray-200 px-3 py-2 text-sm text-black"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-nav"
          >
            Menu
          </button>
          <nav className="hidden md:flex items-center gap-6">
            {nav.map((n) => (
              <a key={n.href} href={n.href} className="text-sm text-gray-600 hover:opacity-80">
                {n.label}
              </a>
            ))}
            <Link
              href="#get-started"
              className="rounded bg-black px-3 py-2 text-sm text-white transition-opacity hover:opacity-90"
            >
              Get Started
            </Link>
          </nav>
        </div>
        <nav id="mobile-nav" className={cn("md:hidden mt-3 grid gap-2", open ? "grid-rows-[1fr]" : "hidden")}>
          {nav.map((n) => (
            <a
              key={n.href}
              href={n.href}
              className="rounded px-3 py-2 text-sm text-black border border-gray-200"
              onClick={() => setOpen(false)}
            >
              {n.label}
            </a>
          ))}
          <Link
            href="#get-started"
            className="rounded bg-black px-3 py-2 text-sm text-white transition-opacity hover:opacity-90"
            onClick={() => setOpen(false)}
          >
            Get Started
          </Link>
        </nav>
      </div>
    </header>
  )
}
