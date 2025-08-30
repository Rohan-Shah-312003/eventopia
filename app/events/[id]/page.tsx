import { notFound } from "next/navigation"
import { events } from "@/lib/sample-data"
import { EventDetails } from "@/components/events/event-details"

type Params = { params: { id: string } }

export function generateStaticParams() {
  return events.map((e) => ({ id: e.id }))
}

export default function EventDetailsPage({ params }: Params) {
  const event = events.find((e) => e.id === params.id)
  if (!event) return notFound()

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <EventDetails event={event} />
    </main>
  )
}
