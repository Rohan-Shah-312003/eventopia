import { redirect, notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import Link from "next/link"
import { Building2, Calendar, Crown, UserCheck, GraduationCap, Edit, Plus, TrendingUp } from "lucide-react"

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function ClubDetailsPage({ params }: PageProps) {
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

  // Get club details
  const { data: club, error: clubError } = await supabase
    .from("clubs")
    .select(`
      *,
      president:president_user (
        name,
        email
      ),
      vice_president:vice_president_user (
        name,
        email
      ),
      faculty_coordinator:faculty_coordinator_user (
        name,
        email
      )
    `)
    .eq("id", id)
    .single()

  if (clubError || !club) {
    notFound()
  }

  // Check if user can view this club
  const canView =
    userProfile.role === "admin" ||
    club.status === "active" ||
    club.president_user === userProfile.id ||
    club.vice_president_user === userProfile.id ||
    club.faculty_coordinator_user === userProfile.id

  if (!canView) {
    redirect("/dashboard/clubs")
  }

  // Get club events
  const { data: clubEvents } = await supabase
    .from("events")
    .select("*")
    .eq("event_owner_club", id)
    .order("date_time", { ascending: false })
    .limit(5)

  // Get club statistics
  const { count: totalEvents } = await supabase
    .from("events")
    .select("*", { count: "exact", head: true })
    .eq("event_owner_club", id)

  const { count: upcomingEvents } = await supabase
    .from("events")
    .select("*", { count: "exact", head: true })
    .eq("event_owner_club", id)
    .eq("status", "approved")
    .gte("date_time", new Date().toISOString())

  const { count: completedEvents } = await supabase
    .from("events")
    .select("*", { count: "exact", head: true })
    .eq("event_owner_club", id)
    .eq("status", "completed")

  const canEdit =
    userProfile.role === "admin" ||
    club.president_user === userProfile.id ||
    club.vice_president_user === userProfile.id ||
    club.faculty_coordinator_user === userProfile.id

  const canCreateEvent =
    club.status === "active" &&
    (club.president_user === userProfile.id ||
      club.vice_president_user === userProfile.id ||
      club.faculty_coordinator_user === userProfile.id)

  const getStatusBadge = (status: string) => {
    const variants = {
      active: "default",
      inactive: "secondary",
      pending: "default",
    } as const

    return <Badge variant={variants[status as keyof typeof variants] || "secondary"}>{status}</Badge>
  }

  const getUserRole = () => {
    if (club.president_user === userProfile.id) return "President"
    if (club.vice_president_user === userProfile.id) return "Vice President"
    if (club.faculty_coordinator_user === userProfile.id) return "Faculty Coordinator"
    return null
  }

  return (
    <DashboardLayout user={userProfile}>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-gray-900">{club.name}</h1>
              {getStatusBadge(club.status)}
            </div>
            <div className="flex items-center text-gray-600">
              <Building2 className="h-4 w-4 mr-2" />
              {club.type} Club
              {getUserRole() && (
                <>
                  <span className="mx-2">•</span>
                  <Badge variant="outline">{getUserRole()}</Badge>
                </>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            {canCreateEvent && (
              <Button asChild>
                <Link href="/dashboard/events/new">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Event
                </Link>
              </Button>
            )}
            {canEdit && (
              <Button variant="outline" asChild>
                <Link href={`/dashboard/clubs/${club.id}/edit`}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Club
                </Link>
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Club Information */}
            <Card>
              <CardHeader>
                <CardTitle>About This Club</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {club.description && (
                  <div>
                    <p className="text-gray-700 leading-relaxed">{club.description}</p>
                  </div>
                )}

                <Separator />

                {/* Club Statistics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">{club.total_members || 0}</div>
                    <div className="text-sm text-gray-600">Members</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">{totalEvents || 0}</div>
                    <div className="text-sm text-gray-600">Total Events</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">{upcomingEvents || 0}</div>
                    <div className="text-sm text-gray-600">Upcoming</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">${club.budget_amount?.toFixed(2) || "0.00"}</div>
                    <div className="text-sm text-gray-600">Budget</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Leadership Team */}
            <Card>
              <CardHeader>
                <CardTitle>Leadership Team</CardTitle>
                <CardDescription>Current club officers and coordinators</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {club.president && (
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <Crown className="h-8 w-8 text-yellow-600" />
                      </div>
                      <div>
                        <h4 className="font-medium">{club.president.name}</h4>
                        <p className="text-sm text-gray-600">{club.president.email}</p>
                      </div>
                    </div>
                    <Badge variant="outline">President</Badge>
                  </div>
                )}

                {club.vice_president && (
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <UserCheck className="h-8 w-8 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-medium">{club.vice_president.name}</h4>
                        <p className="text-sm text-gray-600">{club.vice_president.email}</p>
                      </div>
                    </div>
                    <Badge variant="outline">Vice President</Badge>
                  </div>
                )}

                {club.faculty_coordinator && (
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <GraduationCap className="h-8 w-8 text-green-600" />
                      </div>
                      <div>
                        <h4 className="font-medium">{club.faculty_coordinator.name}</h4>
                        <p className="text-sm text-gray-600">{club.faculty_coordinator.email}</p>
                      </div>
                    </div>
                    <Badge variant="outline">Faculty Coordinator</Badge>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Events */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Recent Events</CardTitle>
                    <CardDescription>Latest events organized by this club</CardDescription>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/dashboard/events?club=${club.id}`}>View All</Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {clubEvents && clubEvents.length > 0 ? (
                  <div className="space-y-4">
                    {clubEvents.map((event) => (
                      <div key={event.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="space-y-1">
                          <h4 className="font-medium">{event.name}</h4>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span>{new Date(event.date_time).toLocaleDateString()}</span>
                            <span>{event.venue}</span>
                            <Badge variant="outline">{event.status}</Badge>
                          </div>
                        </div>
                        <Button size="sm" variant="outline" asChild>
                          <Link href={`/dashboard/events/${event.id}`}>View</Link>
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No events found</p>
                    <p className="text-sm">This club hasn&apos;t organized any events yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
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
                  <Link href="/dashboard/clubs">← Back to Clubs</Link>
                </Button>
                {canCreateEvent && (
                  <Button className="w-full" asChild>
                    <Link href="/dashboard/events/new">
                      <Plus className="h-4 w-4 mr-2" />
                      Create Event
                    </Link>
                  </Button>
                )}
                {canEdit && (
                  <Button variant="outline" className="w-full bg-transparent" asChild>
                    <Link href={`/dashboard/clubs/${club.id}/edit`}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Club
                    </Link>
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Club Status */}
            <Card>
              <CardHeader>
                <CardTitle>Club Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Status</span>
                  {getStatusBadge(club.status)}
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Type</span>
                  <span className="text-sm font-medium">{club.type}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Created</span>
                  <span className="text-sm">{new Date(club.created_at).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Budget</span>
                  <span className="text-sm font-medium">${club.budget_amount?.toFixed(2) || "0.00"}</span>
                </div>
              </CardContent>
            </Card>

            {/* Performance Metrics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Performance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Events This Year</span>
                  <span className="text-sm font-medium">{totalEvents || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Completed Events</span>
                  <span className="text-sm font-medium">{completedEvents || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Success Rate</span>
                  <span className="text-sm font-medium">
                    {totalEvents ? Math.round(((completedEvents || 0) / totalEvents) * 100) : 0}%
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
