const features = [
  {
    title: "Unified System",
    desc: "Circulars, proposals, approvals, and registrations in one place—reduces redundancy and speeds up communication.",
  },
  {
    title: "FCFS with Quotas",
    desc: "Transparent First-Come-First-Serve registration with performer quotas for inclusive participation.",
  },
  {
    title: "Role-Based Dashboards",
    desc: "Tailored views for clubs, committees, and students aligned with VIT-AP governance.",
  },
  {
    title: "MySQL-backed",
    desc: "Structured storage of proposals, circulars, and registrations with scalable APIs.",
  },
]

export function Features() {
  return (
    <section id="features" aria-labelledby="features-title" className="bg-white">
      <div className="mx-auto max-w-5xl px-4 py-10">
        <h2 id="features-title" className="text-2xl font-semibold text-black">
          Key Functions
        </h2>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {features.map((f) => (
            <div key={f.title} className="rounded-lg border border-gray-200 p-5">
              <h3 className="text-lg font-medium text-black">{f.title}</h3>
              <p className="mt-2 text-gray-600 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
