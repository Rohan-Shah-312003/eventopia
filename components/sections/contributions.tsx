const contributions = [
  "Club-centric workflow: streamlined proposal-to-approval system.",
  "FCFS registration with performer quotas: transparent and inclusive.",
  "Circulars integration: notices linked directly to registrations and updates.",
  "Role-based dashboards aligned with VIT-AP governance.",
]

export function Contributions() {
  return (
    <section aria-labelledby="contrib-title" className="bg-white">
      <div className="mx-auto max-w-5xl px-4 py-10">
        <h2 id="contrib-title" className="text-2xl font-semibold text-black">
          Novel Contributions
        </h2>
        <ul className="mt-4 grid gap-3">
          {contributions.map((c, i) => (
            <li key={i} className="rounded-lg border border-gray-200 p-4 text-gray-600">
              {c}
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
