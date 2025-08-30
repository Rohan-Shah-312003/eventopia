import Link from "next/link"
import { events } from "@/lib/sample-data"

export const metadata = {
  title: "Dashboard",
}

export default function DashboardPage() {
  const top = events.slice(0, 2)

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 space-y-8">
      <header>
        <h1 className="text-xl font-semibold text-foreground text-balance">Student Dashboard</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400">Quick access to your activities.</p>
      </header>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Link
          href="/events"
          className="rounded-md border border-gray-200 dark:border-gray-800 p-4 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
        >
          <h3 className="text-base font-medium text-foreground">Browse Events</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Explore and register. FCFS applies.</p>
        </Link>

        <Link
          href="/clubs/new-event"
          className="rounded-md border border-gray-200 dark:border-gray-800 p-4 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
        >
          <h3 className="text-base font-medium text-foreground">Propose Event (Clubs)</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Submit details for committee approval.</p>
        </Link>

        <Link
          href="/events/e-101"
          className="rounded-md border border-gray-200 dark:border-gray-800 p-4 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
        >
          <h3 className="text-base font-medium text-foreground">Event Spotlight</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Open the latest event’s details.</p>
        </Link>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-medium text-foreground">Recommended</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {top.map((e) => (
            <Link
              key={e.id}
              href={`/events/${e.id}`}
              className="rounded-md border border-gray-200 dark:border-gray-800 p-4 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-sm font-medium text-foreground">{e.title}</h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {e.date} · {e.time} · {e.venue}
                  </p>
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">{e.club}</div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  )
}
