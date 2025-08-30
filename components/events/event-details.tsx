"use client"

import { useState } from "react"
import type { EventItem } from "@/types/event"
import { toast } from "sonner"

export function EventDetails({ event }: { event: EventItem }) {
  const [registered, setRegistered] = useState(false)

  const handleRegister = () => {
    setRegistered(true)
    toast("Registered", {
      description: `You’re registered for “${event.title}”.`,
    })
  }

  const spotsLeft = Math.max(event.quota - event.registered - (registered ? 1 : 0), 0)
  const isFull = spotsLeft === 0

  return (
    <article className="space-y-4">
      <header className="space-y-1">
        <h1 className="text-xl font-semibold text-foreground">{event.title}</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400">{event.club}</p>
      </header>

      <section className="rounded-md border border-gray-200 dark:border-gray-800 p-4">
        <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
          <li>
            <strong className="font-medium text-foreground">Date:</strong> {event.date}
          </li>
          <li>
            <strong className="font-medium text-foreground">Time:</strong> {event.time}
          </li>
          <li>
            <strong className="font-medium text-foreground">Venue:</strong> {event.venue}
          </li>
          <li>
            <strong className="font-medium text-foreground">Quota:</strong> {event.quota}
          </li>
          <li>
            <strong className="font-medium text-foreground">Currently Registered:</strong>{" "}
            {event.registered + (registered ? 1 : 0)}
          </li>
          <li>
            <strong className="font-medium text-foreground">Spots Left:</strong> {spotsLeft}
          </li>
        </ul>
      </section>

      <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">{event.description}</p>

      <div className="flex items-center gap-3">
        <button
          type="button"
          disabled={registered || isFull}
          onClick={handleRegister}
          className="inline-flex items-center justify-center rounded-md px-3 py-2 text-sm font-medium border border-gray-300 dark:border-gray-700
                     bg-black text-white hover:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed
                     dark:bg-white dark:text-black dark:hover:bg-gray-200 transition-colors"
        >
          {registered ? "Registered" : isFull ? "Full" : "Register"}
        </button>
        <span className="text-xs text-gray-600 dark:text-gray-400">
          FCFS applies. Registration is illustrative (no backend yet).
        </span>
      </div>
    </article>
  )
}
