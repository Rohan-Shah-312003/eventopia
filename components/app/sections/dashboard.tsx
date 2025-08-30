"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function DashboardSection({ role }: { role: "student" | "club" | "committee" }) {
  return (
    <div className="space-y-6">
      <h1 className="text-pretty text-2xl font-semibold">Welcome to EventOpia</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-base">Upcoming Events</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">4 this week</CardContent>
        </Card>
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-base">
              {role === "committee" ? "Pending Approvals" : "Active Registrations"}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            {role === "committee" ? "3 proposals" : "2 events"}
          </CardContent>
        </Card>
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-base">Circulars</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">Latest updates posted</CardContent>
        </Card>
      </div>
      <div className="rounded-md border border-border p-4">
        <p className="text-sm text-muted-foreground">
          Use the sidebar to navigate. Sections adapt based on your role: Clubs submit proposals and manage quotas,
          Committee approves, Students register via FCFS with performer quotas.
        </p>
      </div>
    </div>
  )
}
