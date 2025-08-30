export function Hero() {
  return (
    <section aria-labelledby="hero-title" className="bg-white">
      <div className="mx-auto max-w-5xl px-4 py-12 md:py-16">
        <h1 id="hero-title" className="text-pretty text-3xl font-semibold tracking-tight text-black md:text-5xl">
          EventOpia — Club-Centric Events for VIT-AP
        </h1>
        <p className="mt-4 max-w-2xl text-gray-600 leading-relaxed">
          A unified platform that streamlines circulars, proposals, approvals, and student registrations. Featuring
          transparent First-Come-First-Serve (FCFS) registration with performer quotas and role-aligned dashboards.
        </p>
        <div className="mt-6 flex items-center gap-3">
          <a
            href="#features"
            className="rounded bg-black px-4 py-2 text-white text-sm transition-opacity hover:opacity-90"
          >
            Explore Features
          </a>
          <a href="#workflow" className="rounded border border-gray-200 px-4 py-2 text-sm text-black">
            View Workflow
          </a>
        </div>
      </div>
    </section>
  )
}
