"use client"

import type React from "react"

import { useState } from "react"
import { toast } from "sonner"

type FormState = {
  title: string
  club: string
  date: string
  time: string
  venue: string
  quota: number
  description: string
  eligibility: string
  budget: string
}

const initial: FormState = {
  title: "",
  club: "",
  date: "",
  time: "",
  venue: "",
  quota: 50,
  description: "",
  eligibility: "",
  budget: "",
}

export function EventProposalForm() {
  const [form, setForm] = useState<FormState>(initial)
  const [submitting, setSubmitting] = useState(false)

  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setForm((prev) => ({
      ...prev,
      [name]: name === "quota" ? Number(value) : value,
    }))
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      // In a future step, post to an API route here
      await new Promise((r) => setTimeout(r, 600))
      toast("Proposal submitted", {
        description: "Your event proposal was sent for committee review. This is a demo submission.",
      })
      setForm(initial)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Event Title</label>
          <input
            name="title"
            value={form.title}
            onChange={onChange}
            required
            className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-background text-foreground px-3 py-2 text-sm"
            placeholder="e.g., Annual Tech Symposium"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Club</label>
          <input
            name="club"
            value={form.club}
            onChange={onChange}
            required
            className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-background text-foreground px-3 py-2 text-sm"
            placeholder="e.g., Tech Club"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Date</label>
          <input
            type="date"
            name="date"
            value={form.date}
            onChange={onChange}
            required
            className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-background text-foreground px-3 py-2 text-sm"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Time</label>
          <input
            type="time"
            name="time"
            value={form.time}
            onChange={onChange}
            required
            className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-background text-foreground px-3 py-2 text-sm"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Venue</label>
          <input
            name="venue"
            value={form.venue}
            onChange={onChange}
            required
            className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-background text-foreground px-3 py-2 text-sm"
            placeholder="e.g., Auditorium A"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Quota</label>
          <input
            type="number"
            min={1}
            name="quota"
            value={form.quota}
            onChange={onChange}
            required
            className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-background text-foreground px-3 py-2 text-sm"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Eligibility</label>
        <input
          name="eligibility"
          value={form.eligibility}
          onChange={onChange}
          className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-background text-foreground px-3 py-2 text-sm"
          placeholder="e.g., Open to 2nd & 3rd year students"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Budget (optional)</label>
        <input
          name="budget"
          value={form.budget}
          onChange={onChange}
          className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-background text-foreground px-3 py-2 text-sm"
          placeholder="e.g., 10,000"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Description</label>
        <textarea
          name="description"
          value={form.description}
          onChange={onChange}
          rows={5}
          className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-background text-foreground px-3 py-2 text-sm leading-relaxed"
          placeholder="Brief overview, agenda, expected outcomes, resource requirements..."
        />
      </div>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center justify-center rounded-md px-3 py-2 text-sm font-medium border border-gray-300 dark:border-gray-700
                     bg-black text-white hover:bg-gray-900 disabled:opacity-50
                     dark:bg-white dark:text-black dark:hover:bg-gray-200 transition-colors"
        >
          {submitting ? "Submitting..." : "Submit Proposal"}
        </button>
        <button
          type="button"
          onClick={() => setForm(initial)}
          className="inline-flex items-center justify-center rounded-md px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 text-foreground hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
        >
          Reset
        </button>
      </div>
    </form>
  )
}
