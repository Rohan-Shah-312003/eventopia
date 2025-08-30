import Link from "next/link"

const roles = [
  {
    name: "Clubs",
    href: "/dashboards/clubs",
    desc: "Submit proposals, track status, and manage event registrations.",
  },
  {
    name: "Committees",
    href: "/dashboards/committees",
    desc: "Review proposals, approve events, and publish circulars.",
  },
  {
    name: "Students",
    href: "/dashboards/students",
    desc: "Browse events, register via FCFS, and track your status.",
  },
]

export function DashboardsOverview() {
  return (
    <section id="dashboards" aria-labelledby="dashboards-title" className="bg-white">
      <div className="mx-auto max-w-5xl px-4 py-10">
        <h2 id="dashboards-title" className="text-2xl font-semibold text-black">
          Role-Based Dashboards
        </h2>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {roles.map((r) => (
            <Link key={r.name} href={r.href} className="rounded-lg border border-gray-200 p-5 hover:opacity-90">
              <h3 className="text-lg font-medium text-black">{r.name}</h3>
              <p className="mt-2 text-gray-600 leading-relaxed">{r.desc}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
