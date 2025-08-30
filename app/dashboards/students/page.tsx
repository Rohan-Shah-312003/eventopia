export default function StudentsDashboard() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="text-2xl font-semibold text-black">Students Dashboard</h1>
      <p className="mt-2 text-gray-600 leading-relaxed">Browse events, register via FCFS, and track your status.</p>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <section className="rounded-lg border border-gray-200 p-5">
          <h2 className="text-lg font-medium text-black">Upcoming Events</h2>
          <ul className="mt-2 grid gap-2 text-sm text-gray-600">
            <li>• Music Night — Registration Open</li>
            <li>• Tech Talk Series — Opens Tomorrow</li>
          </ul>
          <button className="mt-4 rounded bg-black px-4 py-2 text-white text-sm hover:opacity-90">
            Register (FCFS)
          </button>
        </section>

        <section className="rounded-lg border border-gray-200 p-5">
          <h2 className="text-lg font-medium text-black">My Status</h2>
          <ul className="mt-2 grid gap-2 text-sm text-gray-600">
            <li>• Music Night — Accepted (Audience)</li>
            <li>• Coding Contest — Waitlisted (Performer)</li>
          </ul>
          <button className="mt-4 rounded border border-gray-200 px-4 py-2 text-sm text-black">View All</button>
        </section>
      </div>
    </main>
  )
}
