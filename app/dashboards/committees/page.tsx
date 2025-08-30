export default function CommitteesDashboard() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="text-2xl font-semibold text-black">Committees Dashboard</h1>
      <p className="mt-2 text-gray-600 leading-relaxed">Review proposals, approve events, and publish circulars.</p>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <section className="rounded-lg border border-gray-200 p-5">
          <h2 className="text-lg font-medium text-black">Pending Reviews</h2>
          <ul className="mt-2 grid gap-2 text-sm text-gray-600">
            <li>• Cultural Fest 2025 — Needs Budget Clarification</li>
            <li>• Robotics Workshop — Schedule Conflict</li>
          </ul>
          <div className="mt-4 flex gap-2">
            <button className="rounded bg-black px-4 py-2 text-white text-sm hover:opacity-90">Approve Selected</button>
            <button className="rounded border border-gray-200 px-4 py-2 text-sm text-black">Request Changes</button>
          </div>
        </section>

        <section className="rounded-lg border border-gray-200 p-5">
          <h2 className="text-lg font-medium text-black">Circulars</h2>
          <ul className="mt-2 grid gap-2 text-sm text-gray-600">
            <li>• Music Night — Published</li>
            <li>• Tech Talk Series — Draft</li>
          </ul>
          <button className="mt-4 rounded bg-black px-4 py-2 text-white text-sm hover:opacity-90">New Circular</button>
        </section>
      </div>
    </main>
  )
}
