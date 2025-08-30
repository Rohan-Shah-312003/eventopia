"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

type Role = "student" | "club" | "committee"

type EventItem = {
  id: string
  title: string
  date: string
  venue: string
  quotas: { role: string; capacity: number; filled: number }[]
  circular?: string
  status?: "draft" | "submitted" | "approved" | "rejected"
}

const seed: EventItem[] = [
  {
    id: "e1",
    title: "Cultural Night",
    date: "Sep 12, 2025",
    venue: "Auditorium A",
    circular: "CIRC-2025-09",
    quotas: [
      { role: "Singer", capacity: 5, filled: 3 },
      { role: "Dancer", capacity: 8, filled: 8 },
      { role: "Volunteer", capacity: 10, filled: 2 },
    ],
    status: "approved",
  },
  {
    id: "e2",
    title: "Tech Talk: Web Security",
    date: "Sep 18, 2025",
    venue: "Hall 204",
    quotas: [
      { role: "Attendee", capacity: 120, filled: 45 },
      { role: "Volunteer", capacity: 8, filled: 6 },
    ],
    status: "submitted",
  },
]

export function EventsSection({ role }: { role: Role }) {
  const [events, setEvents] = useState<EventItem[]>(seed)
  const [active, setActive] = useState<EventItem | null>(null)
  const { toast } = useToast()

  const register = (ev: EventItem, quotaRole: string) => {
    // FCFS with quotas: if slot available -> success, else waitlist
    setEvents((prev) =>
      prev.map((e) => {
        if (e.id !== ev.id) return e
        const quotas = e.quotas.map((q) =>
          q.role === quotaRole && q.filled < q.capacity ? { ...q, filled: q.filled + 1 } : q,
        )
        return { ...e, quotas }
      }),
    )
    const q = ev.quotas.find((q) => q.role === quotaRole)
    const slotAvailable = q ? q.filled < q.capacity : false
    toast({
      title: slotAvailable ? "Registered (FCFS)" : "Added to waitlist",
      description: slotAvailable
        ? `You secured a ${quotaRole} slot.`
        : `Quota full for ${quotaRole}. You've been waitlisted.`,
    })
  }

  const submitForApproval = (ev: EventItem) => {
    setEvents((prev) => prev.map((e) => (e.id === ev.id ? { ...e, status: "submitted" } : e)))
    toast({ title: "Proposal submitted", description: `${ev.title} sent for committee approval.` })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Events</h2>
        {role === "club" && (
          <Button
            variant="outline"
            className="border-border text-foreground bg-transparent"
            onClick={() =>
              setEvents((e) => [
                {
                  id: `e${e.length + 1}`,
                  title: "New Club Event",
                  date: "TBD",
                  venue: "TBD",
                  quotas: [{ role: "Volunteer", capacity: 5, filled: 0 }],
                  status: "draft",
                },
                ...e,
              ])
            }
          >
            Create Event
          </Button>
        )}
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {events.map((ev) => (
          <motion.div
            key={ev.id}
            layout
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Card className="border-border bg-card">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base">{ev.title}</CardTitle>
                <span className="text-xs text-muted-foreground">{ev.status ?? "approved"}</span>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <div className="flex gap-3">
                  <span>{ev.date}</span>
                  <span className="text-muted-foreground">•</span>
                  <span>{ev.venue}</span>
                </div>
                <div className="grid gap-1.5">
                  {ev.quotas.map((q) => {
                    const full = q.filled >= q.capacity
                    return (
                      <div key={q.role} className="flex items-center justify-between">
                        <span className="text-foreground">{q.role}</span>
                        <div className="flex items-center gap-2">
                          <Progress
                            value={Math.min(100, Math.round((q.filled / q.capacity) * 100))}
                            aria-label={`${q.role} quota usage`}
                          />
                          <span className="w-[72px] text-right">
                            {q.filled}/{q.capacity}
                          </span>
                          {role === "student" && (
                            <Button
                              size="sm"
                              variant="outline"
                              className={cn("h-8 border-border", full && "opacity-60")}
                              onClick={() => register(ev, q.role)}
                            >
                              {full ? "Waitlist" : "Register"}
                            </Button>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" className="px-2" onClick={() => setActive(ev)}>
                    View Details
                  </Button>
                  {role === "club" && ev.status === "draft" && (
                    <Button
                      variant="outline"
                      className="border-border bg-transparent"
                      onClick={() => submitForApproval(ev)}
                    >
                      Submit for Approval
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Detail drawer/modal */}
      <AnimatePresence>
        {active && (
          <motion.div
            key="detail"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 md:items-center"
            onClick={() => setActive(null)}
          >
            <motion.div
              initial={{ y: 24, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 24, opacity: 0 }}
              transition={{ type: "spring", stiffness: 360, damping: 28 }}
              className="w-full max-w-lg rounded-t-md border border-border bg-background p-4 md:rounded-md"
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-label={`${active.title} details`}
            >
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-lg font-semibold">{active.title}</h3>
                <Button variant="ghost" className="px-2" onClick={() => setActive(null)} aria-label="Close details">
                  Close
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Circular: {active.circular ?? "—"} • Venue: {active.venue} • Date: {active.date}
              </p>
              <div className="mt-4 space-y-2">
                {active.quotas.map((q) => {
                  const full = q.filled >= q.capacity
                  return (
                    <div key={q.role} className="flex items-center justify-between">
                      <span className="text-foreground">{q.role}</span>
                      <div className="flex items-center gap-2">
                        <Progress
                          value={Math.min(100, Math.round((q.filled / q.capacity) * 100))}
                          aria-label={`${q.role} quota usage`}
                        />
                        <span className="w-[72px] text-right text-sm text-muted-foreground">
                          {q.filled}/{q.capacity}
                        </span>
                        <Button
                          size="sm"
                          variant="outline"
                          className={cn("h-8 border-border", full && "opacity-60")}
                          onClick={() => register(active, q.role)}
                        >
                          {full ? "Waitlist" : "Register"}
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function Progress({ value, "aria-label": ariaLabel }: { value: number; "aria-label"?: string }) {
  return (
    <div aria-label={ariaLabel} className="h-2 w-28 rounded-full border border-border bg-muted">
      <div className="h-full rounded-full bg-foreground transition-all" style={{ width: `${value}%` }} />
    </div>
  )
}
