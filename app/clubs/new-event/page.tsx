import { EventProposalForm } from "@/components/forms/event-proposal-form"

export const metadata = {
  title: "New Event Proposal",
}

export default function NewEventProposalPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <header className="mb-6">
        <h1 className="text-xl font-semibold text-foreground text-balance">Propose a New Event</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Fill out the details below. Your proposal will be sent for committee review.
        </p>
      </header>
      <EventProposalForm />
    </main>
  )
}
