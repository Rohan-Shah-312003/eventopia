"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function RegistrationsSection({ role }: { role: "student" | "club" | "committee" }) {
  const items =
    role === "student"
      ? [
          { id: "r1", title: "Cultural Night", role: "Singer", status: "Confirmed" },
          { id: "r2", title: "Tech Talk: Web Security", role: "Attendee", status: "Waitlisted" },
        ]
      : [{ id: "r3", title: "Volunteer Roster - Cultural Night", role: "Volunteer", status: "12/15 filled" }]

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">{role === "student" ? "My Registrations" : "Registrations"}</h2>
      <div className="grid gap-4">
        {items.map((i) => (
          <Card key={i.id} className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-base">{i.title}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              {role === "student" ? (
                <div className="flex gap-2">
                  <span>Role: {i.role}</span>
                  <span>•</span>
                  <span>Status: {i.status}</span>
                </div>
              ) : (
                <div>{i.status}</div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
