import { events } from "@/lib/sample-data"
import { EventList } from "@/components/events/event-list"

export const metadata = {
  title: "Events",
}

export default function EventsPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <header className="mb-6">
        <h1 className="text-xl font-semibold text-foreground text-balance">Events</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Browse available events. Click any event to open its details.
        </p>
      </header>
      <EventList items={events} />
    </main>
  )
}
