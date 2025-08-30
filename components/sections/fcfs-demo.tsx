"use client"

import { useMemo, useState } from "react"

type Role = "performer" | "audience"
type Entry = { name: string; role: Role; time: number }

export function FCFSDemo() {
  const [name, setName] = useState("")
  const [role, setRole] = useState<Role>("performer")
  const [entries, setEntries] = useState<Entry[]>([])

  // Adjustable quotas (example)
  const capacity = { performer: 3, audience: 10 }

  const { accepted, waitlist } = useMemo(() => {
    const perf = entries.filter((e) => e.role === "performer").sort((a, b) => a.time - b.time)
    const aud = entries.filter((e) => e.role === "audience").sort((a, b) => a.time - b.time)

    const acceptedPerf = perf.slice(0, capacity.performer)
    const waitPerf = perf.slice(capacity.performer)

    const acceptedAud = aud.slice(0, capacity.audience)
    const waitAud = aud.slice(capacity.audience)

    return {
      accepted: [...acceptedPerf, ...acceptedAud].sort((a, b) => a.time - b.time),
      waitlist: [...waitPerf, ...waitAud].sort((a, b) => a.time - b.time),
    }
  }, [entries])

  function add() {
    const trimmed = name.trim()
    if (!trimmed) return
    setEntries((prev) => [...prev, { name: trimmed, role, time: Date.now() }])
    setName("")
  }

  function reset() {
    setEntries([])
  }

  return (
    <section id="fcfs" aria-labelledby="fcfs-title" className="bg-white">
      <div className="mx-auto max-w-5xl px-4 py-10">
        <h2 id="fcfs-title" className="text-2xl font-semibold text-black">
          FCFS Registration with Quotas
        </h2>
        <p className="mt-2 text-gray-600 leading-relaxed">
          This demo shows how the first students to register are accepted until category quotas are met. Later entries
          automatically move to a waitlist—simple and transparent.
        </p>

        <div className="mt-6 grid gap-4 md:grid-cols-[1.2fr_1fr]">
          <div className="rounded-lg border border-gray-200 p-5">
            <div className="flex flex-col gap-3 md:flex-row md:items-center">
              <label className="sr-only" htmlFor="name">
                Name
              </label>
              <input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Student name"
                className="w-full rounded border border-gray-200 px-3 py-2 text-black placeholder:text-gray-600"
              />
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-600">Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as Role)}
                  className="rounded border border-gray-200 px-2 py-2 text-black"
                >
                  <option value="performer">Performer</option>
                  <option value="audience">Audience</option>
                </select>
              </div>
              <button onClick={add} className="rounded bg-black px-4 py-2 text-sm text-white hover:opacity-90">
                Add
              </button>
              <button onClick={reset} className="rounded border border-gray-200 px-3 py-2 text-sm text-black">
                Reset
              </button>
            </div>

            <div className="mt-6">
              <h3 className="text-lg font-medium text-black">Incoming Queue</h3>
              <ul className="mt-2 grid gap-2">
                {entries.length === 0 ? (
                  <li className="text-gray-600 text-sm">No entries yet.</li>
                ) : (
                  entries
                    .slice()
                    .sort((a, b) => a.time - b.time)
                    .map((e, i) => (
                      <li
                        key={e.time}
                        className="flex items-center justify-between rounded border border-gray-200 px-3 py-2 text-sm"
                      >
                        <span className="text-black">
                          {i + 1}. {e.name}
                          <span className="ml-2 text-gray-600">({e.role})</span>
                        </span>
                        <span className="text-gray-600">{new Date(e.time).toLocaleTimeString()}</span>
                      </li>
                    ))
                )}
              </ul>
            </div>
          </div>

          <div className="grid gap-4">
            <div className="rounded-lg border border-gray-200 p-5">
              <h3 className="text-lg font-medium text-black">Accepted</h3>
              <p className="text-sm text-gray-600">
                Quotas — Performer: {capacity.performer}, Audience: {capacity.audience}
              </p>
              <ul className="mt-3 grid gap-2">
                {accepted.length === 0 ? (
                  <li className="text-gray-600 text-sm">No accepted yet.</li>
                ) : (
                  accepted.map((e, i) => (
                    <li key={e.time} className="rounded border border-gray-200 px-3 py-2 text-sm">
                      {i + 1}. {e.name} <span className="text-gray-600">({e.role})</span>
                    </li>
                  ))
                )}
              </ul>
            </div>

            <div className="rounded-lg border border-gray-200 p-5">
              <h3 className="text-lg font-medium text-black">Waitlist</h3>
              <ul className="mt-3 grid gap-2">
                {waitlist.length === 0 ? (
                  <li className="text-gray-600 text-sm">No waitlisted students.</li>
                ) : (
                  waitlist.map((e, i) => (
                    <li key={e.time} className="rounded border border-gray-200 px-3 py-2 text-sm">
                      {i + 1}. {e.name} <span className="text-gray-600">({e.role})</span>
                    </li>
                  ))
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
