const items = [
  "Integration with the official VIT-AP portal",
  "Mobile application for wider accessibility",
  "Analytics dashboards for participation and impact",
  "AI-driven event recommendations",
]

export function FutureScope() {
  return (
    <section id="future" aria-labelledby="future-title" className="bg-white">
      <div className="mx-auto max-w-5xl px-4 py-10">
        <h2 id="future-title" className="text-2xl font-semibold text-black">
          Future Scope
        </h2>
        <ul className="mt-4 grid gap-3">
          {items.map((c, i) => (
            <li key={i} className="rounded-lg border border-gray-200 p-4 text-gray-600">
              {c}
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
