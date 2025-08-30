"use client"

import Link from "next/link"
import type { EventItem } from "@/types/event"

export function EventCard({ event }: { event: EventItem }) {
  const spotsLeft = Math.max(event.quota - event.registered, 0)
  const isFull = spotsLeft === 0

  return (
    <Link
      href={`/events/${event.id}`}
      className="block rounded-md border border-gray-200 dark:border-gray-800 p-4 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
      aria-label={`Open details for ${event.title}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h3 className="text-base font-medium text-foreground">{event.title}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">{event.club}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {event.date} · {event.time} · {event.venue}
          </p>
        </div>
        <div className="shrink-0 text-right">
          <div
            className={`text-xs px-2 py-1 rounded border ${
              isFull
                ? "border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-400"
                : "border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100"
            }`}
          >
            {isFull ? "Full" : `${spotsLeft} left`}
          </div>
        </div>
      </div>
    </Link>
  )
}
