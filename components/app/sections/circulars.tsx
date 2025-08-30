"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const items = [
  { id: "c1", title: "CIRC-2025-09: Cultural Night Registration Window", date: "Sep 01, 2025" },
  { id: "c2", title: "CIRC-2025-10: Tech Talk Guidelines", date: "Sep 05, 2025" },
]

export function CircularsSection({ role }: { role: "student" | "club" | "committee" }) {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Circulars</h2>
      <div className="grid gap-4">
        {items.map((c) => (
          <Card key={c.id} className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-base">{c.title}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Posted on {c.date} • Linked registrations available in Events
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
