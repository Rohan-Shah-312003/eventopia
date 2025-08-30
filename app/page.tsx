"use client"

import { useState, useMemo } from "react"
import { AppShell } from "@/components/app/app-shell"
import { DashboardSection } from "@/components/app/sections/dashboard"
import { EventsSection } from "@/components/app/sections/events"
import { CircularsSection } from "@/components/app/sections/circulars"
import { ApprovalsSection } from "@/components/app/sections/approvals"
import { RegistrationsSection } from "@/components/app/sections/registrations"

type Role = "student" | "club" | "committee"
type SectionKey = "dashboard" | "events" | "circulars" | "approvals" | "registrations"

export default function Page() {
  const [role, setRole] = useState<Role>("student")
  const [section, setSection] = useState<SectionKey>("dashboard")

  const nav = useMemo(() => {
    const base: { key: SectionKey; label: string }[] = [
      { key: "dashboard", label: "Dashboard" },
      { key: "events", label: "Events" },
      { key: "circulars", label: "Circulars" },
      { key: "registrations", label: role === "student" ? "My Registrations" : "Registrations" },
    ]
    if (role === "committee") base.splice(3, 0, { key: "approvals", label: "Approvals" })
    return base
  }, [role])

  return (
    <AppShell role={role} onRoleChange={setRole} nav={nav} current={section} onNavigate={(k) => setSection(k)}>
      {section === "dashboard" && <DashboardSection role={role} />}
      {section === "events" && <EventsSection role={role} />}
      {section === "circulars" && <CircularsSection role={role} />}
      {section === "approvals" && role === "committee" && <ApprovalsSection />}
      {section === "registrations" && <RegistrationsSection role={role} />}
    </AppShell>
  )
}
