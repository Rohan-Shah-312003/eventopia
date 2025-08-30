"use client"

import { EventCard } from "./event-card"
import type { EventItem } from "@/types/event"

export function EventList({ items }: { items: EventItem[] }) {
  if (!items?.length) {
    return (
      <div className="rounded-md border border-gray-200 dark:border-gray-800 p-6 text-center text-gray-600 dark:text-gray-400">
        No events yet.
      </div>
    )
  }
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {items.map((e) => (
        <EventCard key={e.id} event={e} />
      ))}
    </div>
  )
}
