import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"
import { Calendar, MapPin, Users, Clock, Plus, Search } from "lucide-react"

export default async function EventsPage() {
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

  // Get events based on user role
  let eventsQuery = supabase.from("events").select(`
    *,
    clubs:event_owner_club (
      name,
      type
    ),
    creator:created_by (
      name
    )
  `)

  if (userProfile.role === "visitor") {
    // Visitors can only see approved events
    eventsQuery = eventsQuery.eq("status", "approved")
  } else if (userProfile.role === "club_admin") {
    // Club admins can see their club events + approved events from other clubs
    const { data: userClubs } = await supabase
      .from("clubs")
      .select("id")
      .or(
        `president_user.eq.${userProfile.id},vice_president_user.eq.${userProfile.id},faculty_coordinator_user.eq.${userProfile.id}`,
      )

    const clubIds = userClubs?.map((club) => club.id) || []

    if (clubIds.length > 0) {
      eventsQuery = eventsQuery.or(`event_owner_club.in.(${clubIds.join(",")}),status.eq.approved`)
    } else {
      eventsQuery = eventsQuery.eq("status", "approved")
    }
  }
  // Admin can see all events (no additional filter needed)

  const { data: events } = await eventsQuery.order("date_time", { ascending: true })

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
      pending_approval: "Pending",
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
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    }
  }

  return (
    <DashboardLayout user={userProfile}>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Events</h1>
            <p className="text-gray-600 mt-2">
              {userProfile.role === "admin"
                ? "Manage all campus events"
                : userProfile.role === "club_admin"
                  ? "Manage your club events and browse others"
                  : "Discover and register for campus events"}
            </p>
          </div>
          {userProfile.role === "club_admin" && (
            <Button asChild>
              <Link href="/dashboard/events/new">
                <Plus className="h-4 w-4 mr-2" />
                Create Event
              </Link>
            </Button>
          )}
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Filter Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input placeholder="Search events..." className="pl-10" />
                </div>
              </div>
              <Select defaultValue="all">
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="pending_approval">Pending</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                </SelectContent>
              </Select>
              <Select defaultValue="all">
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Time" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="upcoming">Upcoming</SelectItem>
                  <SelectItem value="past">Past</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Events List */}
        <div className="space-y-6">
          {events && events.length > 0 ? (
            events.map((event) => {
              const { date, time } = formatDateTime(event.date_time)
              const isUpcoming = new Date(event.date_time) > new Date()

              return (
                <Card key={event.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="flex-1 space-y-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-xl font-semibold text-gray-900">{event.name}</h3>
                            <p className="text-gray-600 mt-1">{event.clubs?.name}</p>
                          </div>
                          {getStatusBadge(event.status)}
                        </div>

                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-2" />
                            {date} at {time}
                          </div>
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-2" />
                            {event.venue}
                          </div>
                          <div className="flex items-center">
                            <Users className="h-4 w-4 mr-2" />
                            {event.current_participants || 0}
                            {event.max_participants && ` / ${event.max_participants}`} participants
                          </div>
                          {!isUpcoming && (
                            <div className="flex items-center">
                              <Clock className="h-4 w-4 mr-2" />
                              Past Event
                            </div>
                          )}
                        </div>

                        {event.description && <p className="text-gray-700 line-clamp-2">{event.description}</p>}
                      </div>

                      <div className="flex flex-col sm:flex-row gap-2">
                        <Button variant="outline" asChild>
                          <Link href={`/dashboard/events/${event.id}`}>View Details</Link>
                        </Button>
                        {event.status === "approved" && isUpcoming && userProfile.role !== "admin" && (
                          <Button asChild>
                            <Link href={`/dashboard/events/${event.id}/register`}>Register</Link>
                          </Button>
                        )}
                        {(userProfile.role === "admin" ||
                          (userProfile.role === "club_admin" && event.created_by === userProfile.id)) && (
                          <Button variant="outline" asChild>
                            <Link href={`/dashboard/events/${event.id}/edit`}>Edit</Link>
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <Calendar className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No events found</h3>
                <p className="text-gray-600 mb-6">
                  {userProfile.role === "club_admin"
                    ? "Create your first event to get started"
                    : "Check back later for new events"}
                </p>
                {userProfile.role === "club_admin" && (
                  <Button asChild>
                    <Link href="/dashboard/events/new">
                      <Plus className="h-4 w-4 mr-2" />
                      Create Event
                    </Link>
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
