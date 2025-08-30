const steps = [
  {
    title: "1) Proposal",
    desc: "Clubs submit structured event proposals with details, resources, and timelines.",
  },
  {
    title: "2) Approval",
    desc: "Committees review and approve proposals, accelerating decisions and governance.",
  },
  {
    title: "3) Circulars",
    desc: "Approved events publish circulars linked to registrations and live updates.",
  },
  {
    title: "4) Registration",
    desc: "Students register via FCFS with clear quotas for performers and attendees.",
  },
]

export function Workflow() {
  return (
    <section id="workflow" aria-labelledby="workflow-title" className="bg-white">
      <div className="mx-auto max-w-5xl px-4 py-10">
        <h2 id="workflow-title" className="text-2xl font-semibold text-black">
          Proposal → Approval → Circulars → Registration
        </h2>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {steps.map((s) => (
            <div key={s.title} className="rounded-lg border border-gray-200 p-5">
              <h3 className="text-lg font-medium text-black">{s.title}</h3>
              <p className="mt-2 text-gray-600 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
