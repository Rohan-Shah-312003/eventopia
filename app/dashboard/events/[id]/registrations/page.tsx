import { redirect, notFound } from "next/navigation"
import { createServerClient } from "@/lib/supabase/server"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { ArrowLeft, Users, Download, Search, Mail, Calendar } from "lucide-react"

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EventRegistrationsPage({ params }: PageProps) {
  const { id } = await params
  const supabase = createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  // Get user profile
  const { data: userProfile } = await supabase.from("users").select("*").eq("id", user.id).single()

  if (!userProfile) redirect("/auth/login")

  // Get event details
  const { data: event } = await supabase
    .from("events")
    .select(`
      *,
      clubs:event_owner_club (
        name,
        type,
        president_user,
        vice_president_user,
        faculty_coordinator_user
      )
    `)
    .eq("id", id)
    .single()

  if (!event) notFound()

  // Check permissions
  const canManage =
    userProfile.role === "admin" ||
    event.created_by === userProfile.id ||
    (userProfile.role === "club_admin" &&
      (event.clubs?.president_user === userProfile.id ||
        event.clubs?.vice_president_user === userProfile.id ||
        event.clubs?.faculty_coordinator_user === userProfile.id))

  if (!canManage) redirect(`/dashboard/events/${id}`)

  // Get registrations
  const { data: registrations } = await supabase
    .from("event_registrations")
    .select(`
      *,
      users:user_id (
        name,
        email,
        reg_no
      )
    `)
    .eq("event_id", id)
    .order("registered_at", { ascending: false })

  const totalRegistrations = registrations?.length || 0
  const participantRegistrations = registrations?.filter((r) => r.registration_type === "participant").length || 0
  const volunteerRegistrations = registrations?.filter((r) => r.registration_type === "volunteer").length || 0

  return (
    <DashboardLayout user={userProfile}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" asChild>
                <Link href={`/dashboard/events/${id}`}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Event
                </Link>
              </Button>
            </div>
            <h1 className="text-2xl font-bold">Event Registrations</h1>
            <p className="text-muted-foreground">{event.name}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
            <Button variant="outline" size="sm">
              <Mail className="h-4 w-4 mr-2" />
              Email All
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{totalRegistrations}</p>
                  <p className="text-sm text-muted-foreground">Total Registrations</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Users className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{participantRegistrations}</p>
                  <p className="text-sm text-muted-foreground">Participants</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Users className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{volunteerRegistrations}</p>
                  <p className="text-sm text-muted-foreground">Volunteers</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Calendar className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {event.max_participants ? `${totalRegistrations}/${event.max_participants}` : "∞"}
                  </p>
                  <p className="text-sm text-muted-foreground">Capacity</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Registrations List */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Registered Users</CardTitle>
                <CardDescription>{totalRegistrations} people registered for this event</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search registrations..." className="w-64" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {registrations && registrations.length > 0 ? (
              <div className="space-y-3">
                {registrations.map((registration: any) => (
                  <div
                    key={registration.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-primary">
                          {registration.users?.name?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium">{registration.users?.name}</p>
                        <p className="text-sm text-muted-foreground">{registration.users?.email}</p>
                        {registration.users?.reg_no && (
                          <p className="text-xs text-muted-foreground">Reg: {registration.users.reg_no}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={registration.registration_type === "participant" ? "default" : "secondary"}>
                        {registration.registration_type}
                      </Badge>
                      <div className="text-right">
                        <p className="text-sm font-medium">
                          {new Date(registration.registered_at).toLocaleDateString()}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(registration.registered_at).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No registrations yet</h3>
                <p className="text-muted-foreground">When people register for your event, they'll appear here.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
