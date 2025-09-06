import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Calendar, Building2, Users, TrendingUp, Clock, CheckCircle } from "lucide-react"

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data: authData, error: authError } = await supabase.auth.getUser()
  if (authError || !authData?.user) {
    redirect("/auth/login")
  }

  let { data: userProfile } = await supabase.from("users").select("*").eq("id", authData.user.id).single()

  // If profile doesn't exist, create it from auth data
  if (!userProfile) {
    console.log("[v0] User profile not found, creating from auth data")
    const { data: newProfile, error: createError } = await supabase
      .from("users")
      .insert({
        id: authData.user.id,
        name: authData.user.user_metadata?.name || authData.user.email?.split("@")[0] || "User",
        email: authData.user.email!,
        role: "visitor", // Default role
        position: null,
      })
      .select()
      .single()

    if (createError) {
      console.error("[v0] Error creating user profile:", createError)
      // Still redirect to login if we can't create profile
      redirect("/auth/login")
    }

    userProfile = newProfile
  }

  console.log("[v0] User profile loaded:", userProfile)

  // Get dashboard stats based on user role
  let stats = {
    totalEvents: 0,
    upcomingEvents: 0,
    myRegistrations: 0,
    pendingApprovals: 0,
  }

  if (userProfile.role === "admin") {
    // Admin stats
    const { count: totalEvents } = await supabase.from("events").select("*", { count: "exact", head: true })
    const { count: pendingApprovals } = await supabase
      .from("events")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending_approval")
    const { count: upcomingEvents } = await supabase
      .from("events")
      .select("*", { count: "exact", head: true })
      .eq("status", "approved")
      .gte("date_time", new Date().toISOString())

    stats = {
      totalEvents: totalEvents || 0,
      upcomingEvents: upcomingEvents || 0,
      myRegistrations: 0,
      pendingApprovals: pendingApprovals || 0,
    }
  } else if (userProfile.role === "club_admin") {
    // Club admin stats - events for their clubs
    const { data: userClubs } = await supabase
      .from("clubs")
      .select("id")
      .or(
        `president_user.eq.${userProfile.id},vice_president_user.eq.${userProfile.id},faculty_coordinator_user.eq.${userProfile.id}`,
      )

    const clubIds = userClubs?.map((club) => club.id) || []

    if (clubIds.length > 0) {
      const { count: totalEvents } = await supabase
        .from("events")
        .select("*", { count: "exact", head: true })
        .in("event_owner_club", clubIds)
      const { count: upcomingEvents } = await supabase
        .from("events")
        .select("*", { count: "exact", head: true })
        .in("event_owner_club", clubIds)
        .eq("status", "approved")
        .gte("date_time", new Date().toISOString())
      const { count: pendingApprovals } = await supabase
        .from("events")
        .select("*", { count: "exact", head: true })
        .in("event_owner_club", clubIds)
        .eq("status", "pending_approval")

      stats.totalEvents = totalEvents || 0
      stats.upcomingEvents = upcomingEvents || 0
      stats.pendingApprovals = pendingApprovals || 0
    }
  }

  // Get user's event registrations
  const { count: myRegistrations } = await supabase
    .from("event_registrations")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userProfile.id)

  stats.myRegistrations = myRegistrations || 0

  // Get recent events
  const { data: recentEvents } = await supabase
    .from("events")
    .select(
      `
      *,
      clubs:event_owner_club (
        name
      )
    `,
    )
    .eq("status", "approved")
    .gte("date_time", new Date().toISOString())
    .order("date_time", { ascending: true })
    .limit(5)

  return (
    <DashboardLayout user={userProfile}>
      <div className="space-y-8">
        {/* Welcome Section */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Welcome back, {userProfile.name.split(" ")[0]}!</h1>
          <p className="text-gray-600 mt-2">Here&apos;s what&apos;s happening with your events</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Events</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalEvents}</div>
              <p className="text-xs text-muted-foreground">
                {userProfile.role === "admin" ? "All events" : "Your club events"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Upcoming Events</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.upcomingEvents}</div>
              <p className="text-xs text-muted-foreground">Approved & scheduled</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">My Registrations</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.myRegistrations}</div>
              <p className="text-xs text-muted-foreground">Events you&apos;re attending</p>
            </CardContent>
          </Card>

          {(userProfile.role === "admin" || userProfile.role === "club_admin") && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.pendingApprovals}</div>
                <p className="text-xs text-muted-foreground">
                  {userProfile.role === "admin" ? "Awaiting your review" : "Awaiting admin review"}
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Recent Events */}
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Events</CardTitle>
            <CardDescription>Events happening soon that you might be interested in</CardDescription>
          </CardHeader>
          <CardContent>
            {recentEvents && recentEvents.length > 0 ? (
              <div className="space-y-4">
                {recentEvents.map((event) => (
                  <div key={event.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <h4 className="font-medium">{event.name}</h4>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>{event.clubs?.name}</span>
                        <span>{new Date(event.date_time).toLocaleDateString()}</span>
                        <span>{event.venue}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="secondary">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Approved
                      </Badge>
                      <Button size="sm" variant="outline" asChild>
                        <Link href={`/dashboard/events/${event.id}`}>View Details</Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No upcoming events found</p>
                <p className="text-sm">Check back later for new events</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Browse Events</CardTitle>
              <CardDescription>Discover and register for upcoming events</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link href="/dashboard/events">
                  <Calendar className="h-4 w-4 mr-2" />
                  View All Events
                </Link>
              </Button>
            </CardContent>
          </Card>

          {userProfile.role === "club_admin" && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Create Event</CardTitle>
                <CardDescription>Plan and submit a new event for approval</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full">
                  <Link href="/dashboard/events/new">
                    <Calendar className="h-4 w-4 mr-2" />
                    New Event
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}

          {userProfile.role !== "visitor" && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Manage Clubs</CardTitle>
                <CardDescription>
                  {userProfile.role === "admin" ? "Oversee all student organizations" : "Manage your club"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full bg-transparent" variant="outline">
                  <Link href="/dashboard/clubs">
                    <Building2 className="h-4 w-4 mr-2" />
                    View Clubs
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
