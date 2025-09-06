import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"
import { Users, Calendar, Building2, CheckCircle, XCircle, Clock, TrendingUp } from "lucide-react"

export default async function AdminPage() {
  const supabase = await createClient()

  const { data: authData, error: authError } = await supabase.auth.getUser()
  if (authError || !authData?.user) {
    redirect("/auth/login")
  }

  // Get user profile and check admin access
  const { data: userProfile } = await supabase.from("users").select("*").eq("id", authData.user.id).single()

  if (!userProfile || userProfile.role !== "admin") {
    redirect("/dashboard")
  }

  // Get pending events for approval
  const { data: pendingEvents } = await supabase
    .from("events")
    .select(`
      *,
      clubs:event_owner_club (
        name,
        type
      ),
      creator:created_by (
        name,
        email
      )
    `)
    .eq("status", "pending_approval")
    .order("created_at", { ascending: true })

  // Get recent approvals/rejections
  const { data: recentDecisions } = await supabase
    .from("events")
    .select(`
      *,
      clubs:event_owner_club (
        name
      ),
      approver:approved_by (
        name
      )
    `)
    .in("status", ["approved", "rejected"])
    .not("approved_at", "is", null)
    .order("approved_at", { ascending: false })
    .limit(10)

  // Get admin statistics
  const { count: totalEvents } = await supabase.from("events").select("*", { count: "exact", head: true })
  const { count: pendingCount } = await supabase
    .from("events")
    .select("*", { count: "exact", head: true })
    .eq("status", "pending_approval")
  const { count: approvedCount } = await supabase
    .from("events")
    .select("*", { count: "exact", head: true })
    .eq("status", "approved")
  const { count: rejectedCount } = await supabase
    .from("events")
    .select("*", { count: "exact", head: true })
    .eq("status", "rejected")

  const { count: totalUsers } = await supabase.from("users").select("*", { count: "exact", head: true })
  const { count: totalClubs } = await supabase.from("clubs").select("*", { count: "exact", head: true })
  const { count: activeClubs } = await supabase
    .from("clubs")
    .select("*", { count: "exact", head: true })
    .eq("status", "active")

  const getStatusBadge = (status: string) => {
    const variants = {
      pending_approval: "default",
      approved: "default",
      rejected: "destructive",
    } as const

    const labels = {
      pending_approval: "Pending",
      approved: "Approved",
      rejected: "Rejected",
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
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Administration</h1>
          <p className="text-gray-600 mt-2">Manage events, clubs, and user approvals</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{pendingCount || 0}</div>
              <p className="text-xs text-muted-foreground">Events awaiting review</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Events</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalEvents || 0}</div>
              <p className="text-xs text-muted-foreground">All events in system</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Clubs</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeClubs || 0}</div>
              <p className="text-xs text-muted-foreground">
                {totalClubs ? `of ${totalClubs} total` : "registered clubs"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalUsers || 0}</div>
              <p className="text-xs text-muted-foreground">Registered users</p>
            </CardContent>
          </Card>
        </div>

        {/* Approval Statistics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="h-5 w-5 mr-2" />
              Approval Statistics
            </CardTitle>
            <CardDescription>Event approval breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">{approvedCount || 0}</div>
                <div className="text-sm text-gray-600">Approved Events</div>
                <div className="text-xs text-gray-500">
                  {totalEvents ? Math.round(((approvedCount || 0) / totalEvents) * 100) : 0}% of total
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600">{pendingCount || 0}</div>
                <div className="text-sm text-gray-600">Pending Review</div>
                <div className="text-xs text-gray-500">
                  {totalEvents ? Math.round(((pendingCount || 0) / totalEvents) * 100) : 0}% of total
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-red-600">{rejectedCount || 0}</div>
                <div className="text-sm text-gray-600">Rejected Events</div>
                <div className="text-xs text-gray-500">
                  {totalEvents ? Math.round(((rejectedCount || 0) / totalEvents) * 100) : 0}% of total
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content Tabs */}
        <Tabs defaultValue="pending" className="space-y-6">
          <TabsList>
            <TabsTrigger value="pending">
              Pending Approvals
              {pendingCount && pendingCount > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {pendingCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="recent">Recent Decisions</TabsTrigger>
          </TabsList>

          {/* Pending Approvals */}
          <TabsContent value="pending">
            <Card>
              <CardHeader>
                <CardTitle>Events Awaiting Approval</CardTitle>
                <CardDescription>Review and approve or reject event submissions</CardDescription>
              </CardHeader>
              <CardContent>
                {pendingEvents && pendingEvents.length > 0 ? (
                  <div className="space-y-4">
                    {pendingEvents.map((event) => {
                      const { date, time } = formatDateTime(event.date_time)
                      const isUrgent = new Date(event.date_time) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // Within 7 days

                      return (
                        <div
                          key={event.id}
                          className={`p-6 border rounded-lg ${isUrgent ? "border-orange-200 bg-orange-50" : ""}`}
                        >
                          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                            <div className="space-y-3">
                              <div className="flex items-start justify-between">
                                <div>
                                  <h4 className="text-lg font-semibold text-gray-900">{event.name}</h4>
                                  <p className="text-gray-600">
                                    {event.clubs?.name} • {event.clubs?.type}
                                  </p>
                                </div>
                                <div className="flex gap-2">
                                  {getStatusBadge(event.status)}
                                  {isUrgent && <Badge variant="destructive">Urgent</Badge>}
                                </div>
                              </div>

                              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                                <div className="flex items-center">
                                  <Calendar className="h-4 w-4 mr-2" />
                                  {date} at {time}
                                </div>
                                <div className="flex items-center">
                                  <Building2 className="h-4 w-4 mr-2" />
                                  {event.venue}
                                </div>
                                <div className="flex items-center">
                                  <Users className="h-4 w-4 mr-2" />
                                  {event.creator?.name}
                                </div>
                              </div>

                              {event.description && <p className="text-gray-700 line-clamp-2">{event.description}</p>}

                              <div className="text-xs text-gray-500">
                                Submitted {new Date(event.created_at).toLocaleDateString()} at{" "}
                                {new Date(event.created_at).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </div>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-2 lg:flex-col">
                              <Button size="sm" asChild>
                                <Link href={`/dashboard/admin/events/${event.id}/review`}>Review Event</Link>
                              </Button>
                              <Button variant="outline" size="sm" asChild>
                                <Link href={`/dashboard/events/${event.id}`}>View Details</Link>
                              </Button>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <CheckCircle className="h-16 w-16 mx-auto mb-4 text-green-500" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">All caught up!</h3>
                    <p className="text-gray-600">No events are currently pending approval.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Recent Decisions */}
          <TabsContent value="recent">
            <Card>
              <CardHeader>
                <CardTitle>Recent Approval Decisions</CardTitle>
                <CardDescription>Latest approved and rejected events</CardDescription>
              </CardHeader>
              <CardContent>
                {recentDecisions && recentDecisions.length > 0 ? (
                  <div className="space-y-4">
                    {recentDecisions.map((event) => (
                      <div key={event.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="space-y-1">
                          <h4 className="font-medium">{event.name}</h4>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span>{event.clubs?.name}</span>
                            <span>
                              {event.status === "approved" ? "Approved" : "Rejected"} by {event.approver?.name}
                            </span>
                            <span>{new Date(event.approved_at).toLocaleDateString()}</span>
                          </div>
                          {event.approval_notes && (
                            <p className="text-sm text-gray-600 italic">"{event.approval_notes}"</p>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          {event.status === "approved" ? (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-500" />
                          )}
                          {getStatusBadge(event.status)}
                          <Button size="sm" variant="outline" asChild>
                            <Link href={`/dashboard/events/${event.id}`}>View</Link>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No recent approval decisions</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
