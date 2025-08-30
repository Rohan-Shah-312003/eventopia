export default function ClubsDashboard() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="text-2xl font-semibold text-black">Clubs Dashboard</h1>
      <p className="mt-2 text-gray-600 leading-relaxed">Submit proposals, track approvals, and manage registrations.</p>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <section className="rounded-lg border border-gray-200 p-5">
          <h2 className="text-lg font-medium text-black">Proposals</h2>
          <ul className="mt-2 grid gap-2 text-sm text-gray-600">
            <li>• Cultural Fest 2025 — Draft</li>
            <li>• Tech Talk Series — Under Review</li>
            <li>• Music Night — Approved</li>
          </ul>
          <button className="mt-4 rounded bg-black px-4 py-2 text-white text-sm hover:opacity-90">New Proposal</button>
        </section>

        <section className="rounded-lg border border-gray-200 p-5">
          <h2 className="text-lg font-medium text-black">Registrations</h2>
          <ul className="mt-2 grid gap-2 text-sm text-gray-600">
            <li>• Music Night — 120 / 150</li>
            <li>• Tech Talk — 80 / 100</li>
          </ul>
          <button className="mt-4 rounded border border-gray-200 px-4 py-2 text-sm text-black">Export CSV</button>
        </section>
      </div>
    </main>
  )
}
