"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"

type Proposal = {
  id: string
  title: string
  club: string
  date: string
  status: "submitted" | "approved" | "rejected"
}

const seed: Proposal[] = [
  { id: "p1", title: "Hackathon 2025", club: "CSI", date: "Oct 02, 2025", status: "submitted" },
  { id: "p2", title: "Photography Walk", club: "Lens Club", date: "Sep 25, 2025", status: "submitted" },
  { id: "p3", title: "Drama Fest", club: "Dramatics", date: "Nov 10, 2025", status: "submitted" },
]

export function ApprovalsSection() {
  const [proposals, setProposals] = useState<Proposal[]>(seed)
  const { toast } = useToast()

  const setStatus = (id: string, status: Proposal["status"]) => {
    setProposals((prev) => prev.map((p) => (p.id === id ? { ...p, status } : p)))
    toast({
      title: status === "approved" ? "Proposal approved" : "Proposal rejected",
      description: `Proposal ${id} has been ${status}.`,
    })
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Committee Approvals</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        {proposals.map((p) => (
          <Card key={p.id} className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-base">{p.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <div className="flex gap-3">
                <span>Club: {p.club}</span>
                <span>•</span>
                <span>{p.date}</span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  className="border-border bg-transparent"
                  onClick={() => setStatus(p.id, "approved")}
                >
                  Approve
                </Button>
                <Button
                  variant="outline"
                  className="border-border bg-transparent"
                  onClick={() => setStatus(p.id, "rejected")}
                >
                  Reject
                </Button>
                <span className="ml-auto text-xs">Status: {p.status}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
