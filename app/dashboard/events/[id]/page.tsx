import { redirect, notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import Link from "next/link"
import { Calendar, MapPin, Users, Clock, Package, User, Building2, Edit } from "lucide-react"

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EventDetailsPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()

  const { data: authData, error: authError } = await supabase.auth.getUser()
  if (authError || !authData?.user) {
    redirect("/auth/login")
  }

  // Get user profile
  const { data: userProfile } = await supabase.from("users").select("*").eq("id", authData.user.id).single()

  if (!userProfile) {
    redirect("/auth/login")
  }

  // Get event details
  const { data: event, error: eventError } = await supabase
    .from("events")
    .select(`
      *,
      clubs:event_owner_club (
        name,
        type,
        president_user,
        vice_president_user,
        faculty_coordinator_user
      ),
      creator:created_by (
        name,
        email
      )
    `)
    .eq("id", id)
    .single()

  if (eventError || !event) {
    notFound()
  }

  // Check if user can view this event
  const canView =
    userProfile.role === "admin" ||
    event.status === "approved" ||
    event.created_by === userProfile.id ||
    (userProfile.role === "club_admin" &&
      (event.clubs?.president_user === userProfile.id ||
        event.clubs?.vice_president_user === userProfile.id ||
        event.clubs?.faculty_coordinator_user === userProfile.id))

  if (!canView) {
    redirect("/dashboard/events")
  }

  // Check if user is registered
  const { data: registration } = await supabase
    .from("event_registrations")
    .select("*")
    .eq("event_id", id)
    .eq("user_id", userProfile.id)
    .single()

  // Get event registrations (for organizers and admins)
  let registrations = []
  if (userProfile.role === "admin" || event.created_by === userProfile.id) {
    const { data: eventRegistrations } = await supabase
      .from("event_registrations")
      .select(`
        *,
        users:user_id (
          name,
          email
        )
      `)
      .eq("event_id", id)
    registrations = eventRegistrations || []
  }

  const canEdit = userProfile.role === "admin" || event.created_by === userProfile.id

  const canRegister =
    event.status === "approved" &&
    new Date(event.date_time) > new Date() &&
    !registration &&
    userProfile.role !== "admin" &&
    (!event.max_participants || event.current_participants < event.max_participants) &&
    (!event.registration_deadline || new Date(event.registration_deadline) > new Date())

  const getStatusBadge = (status: string) => {
    const variants = {
      draft: "secondary",
      pending_approval: "default",
      approved: "default",
      rejected: "destructive",
      completed: "secondary",
      cancelled: "destructive",
    } as const

    const labels = {
      draft: "Draft",
      pending_approval: "Pending Approval",
      approved: "Approved",
      rejected: "Rejected",
      completed: "Completed",
      cancelled: "Cancelled",
    }

    return (
      <Badge variant={variants[status as keyof typeof variants] || "secondary"}>
        {labels[status as keyof typeof labels] || status}
      </Badge>
    )
  }

  const formatDateTime = (dateTime: string) => {
    const date = new Date(dateTime)
    return {
      date: date.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      time: date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    }
  }

  const { date, time } = formatDateTime(event.date_time)

  return (
    <DashboardLayout user={userProfile}>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-gray-900">{event.name}</h1>
              {getStatusBadge(event.status)}
            </div>
            <div className="flex items-center text-gray-600">
              <Building2 className="h-4 w-4 mr-2" />
              {event.clubs?.name} • {event.clubs?.type}
            </div>
          </div>
          <div className="flex gap-2">
            {canRegister && (
              <Button asChild>
                <Link href={`/dashboard/events/${event.id}/register`}>Register for Event</Link>
              </Button>
            )}
            {registration && (
              <Badge variant="default" className="px-4 py-2">
                Registered
              </Badge>
            )}
            {canEdit && (
              <Button variant="outline" asChild>
                <Link href={`/dashboard/events/${event.id}/edit`}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Event
                </Link>
              </Button>
            )}
            {(userProfile.role === "admin" || event.created_by === userProfile.id) && (
              <Button variant="outline" asChild>
                <Link href={`/dashboard/events/${event.id}/registrations`}>
                  <Users className="h-4 w-4 mr-2" />
                  Manage Registrations
                </Link>
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Event Details */}
            <Card>
              <CardHeader>
                <CardTitle>Event Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <p className="font-medium">{date}</p>
                      <p className="text-sm text-gray-600">{time}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <MapPin className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <p className="font-medium">{event.venue}</p>
                      <p className="text-sm text-gray-600">Event Location</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Users className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <p className="font-medium">
                        {event.current_participants || 0}
                        {event.max_participants && ` / ${event.max_participants}`} participants
                      </p>
                      <p className="text-sm text-gray-600">Current Registration</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <User className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <p className="font-medium">{event.creator?.name}</p>
                      <p className="text-sm text-gray-600">Event Organizer</p>
                    </div>
                  </div>
                </div>

                {event.registration_deadline && (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-center">
                      <Clock className="h-5 w-5 text-blue-600 mr-3" />
                      <div>
                        <p className="font-medium text-blue-900">Registration Deadline</p>
                        <p className="text-sm text-blue-700">
                          {formatDateTime(event.registration_deadline).date} at{" "}
                          {formatDateTime(event.registration_deadline).time}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {event.description && (
                  <>
                    <Separator />
                    <div>
                      <h4 className="font-medium mb-2">Description</h4>
                      <p className="text-gray-700 leading-relaxed">{event.description}</p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Equipment Requirements */}
            {event.equipments_json && Array.isArray(event.equipments_json) && event.equipments_json.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Package className="h-5 w-5 mr-2" />
                    Equipment Requirements
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {event.equipments_json.map((equipment: string, index: number) => (
                      <Badge key={index} variant="outline">
                        {equipment}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Registrations (for organizers) */}
            {registrations.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Event Registrations</CardTitle>
                  <CardDescription>{registrations.length} people registered</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {registrations.map((reg: any) => (
                      <div key={reg.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{reg.users?.name}</p>
                          <p className="text-sm text-gray-600">{reg.users?.email}</p>
                        </div>
                        <div className="text-right">
                          <Badge variant="outline">{reg.registration_type}</Badge>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(reg.registered_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full bg-transparent" asChild>
                  <Link href="/dashboard/events">← Back to Events</Link>
                </Button>
                {canRegister && (
                  <Button className="w-full" asChild>
                    <Link href={`/dashboard/events/${event.id}/register`}>Register Now</Link>
                  </Button>
                )}
                {canEdit && (
                  <Button variant="outline" className="w-full bg-transparent" asChild>
                    <Link href={`/dashboard/events/${event.id}/edit`}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Event
                    </Link>
                  </Button>
                )}
                {(userProfile.role === "admin" || event.created_by === userProfile.id) && (
                  <Button variant="outline" className="w-full bg-transparent" asChild>
                    <Link href={`/dashboard/events/${event.id}/registrations`}>
                      <Users className="h-4 w-4 mr-2" />
                      Manage Registrations
                    </Link>
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Event Status */}
            <Card>
              <CardHeader>
                <CardTitle>Event Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Status</span>
                  {getStatusBadge(event.status)}
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Created</span>
                  <span className="text-sm">{new Date(event.created_at).toLocaleDateString()}</span>
                </div>
                {event.approved_at && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Approved</span>
                    <span className="text-sm">{new Date(event.approved_at).toLocaleDateString()}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
