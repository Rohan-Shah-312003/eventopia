import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"
import { Building2, Search, Plus, Crown, UserCheck, GraduationCap } from "lucide-react"

export default async function ClubsPage() {
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

  // Get clubs based on user role
  let clubsQuery = supabase.from("clubs").select(`
    *,
    president:president_user (
      name
    ),
    vice_president:vice_president_user (
      name
    ),
    faculty_coordinator:faculty_coordinator_user (
      name
    )
  `)

  if (userProfile.role === "visitor") {
    // Visitors can only see active clubs
    clubsQuery = clubsQuery.eq("status", "active")
  } else if (userProfile.role === "club_admin") {
    // Club admins can see their clubs + active clubs from others
    clubsQuery = clubsQuery.or(
      `president_user.eq.${userProfile.id},vice_president_user.eq.${userProfile.id},faculty_coordinator_user.eq.${userProfile.id},status.eq.active`,
    )
  }
  // Admin can see all clubs (no additional filter needed)

  const { data: clubs } = await clubsQuery.order("name", { ascending: true })

  // Get club statistics
  const clubStats = await Promise.all(
    (clubs || []).map(async (club) => {
      const { count: eventCount } = await supabase
        .from("events")
        .select("*", { count: "exact", head: true })
        .eq("event_owner_club", club.id)

      const { count: upcomingEvents } = await supabase
        .from("events")
        .select("*", { count: "exact", head: true })
        .eq("event_owner_club", club.id)
        .eq("status", "approved")
        .gte("date_time", new Date().toISOString())

      return {
        clubId: club.id,
        totalEvents: eventCount || 0,
        upcomingEvents: upcomingEvents || 0,
      }
    }),
  )

  const getStatsForClub = (clubId: string) => {
    return clubStats.find((stat) => stat.clubId === clubId) || { totalEvents: 0, upcomingEvents: 0 }
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      active: "default",
      inactive: "secondary",
      pending: "default",
    } as const

    return <Badge variant={variants[status as keyof typeof variants] || "secondary"}>{status}</Badge>
  }

  const getRoleIcon = (role: "president" | "vice_president" | "faculty_coordinator") => {
    switch (role) {
      case "president":
        return <Crown className="h-4 w-4" />
      case "vice_president":
        return <UserCheck className="h-4 w-4" />
      case "faculty_coordinator":
        return <GraduationCap className="h-4 w-4" />
    }
  }

  return (
    <DashboardLayout user={userProfile}>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Student Clubs</h1>
            <p className="text-gray-600 mt-2">
              {userProfile.role === "admin"
                ? "Manage all student organizations"
                : userProfile.role === "club_admin"
                  ? "Manage your clubs and discover others"
                  : "Discover student organizations and their events"}
            </p>
          </div>
          {userProfile.role === "admin" && (
            <Button asChild>
              <Link href="/dashboard/clubs/new">
                <Plus className="h-4 w-4 mr-2" />
                Create Club
              </Link>
            </Button>
          )}
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Filter Clubs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input placeholder="Search clubs..." className="pl-10" />
                </div>
              </div>
              <Select defaultValue="all">
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Club Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="academic">Academic</SelectItem>
                  <SelectItem value="cultural">Cultural</SelectItem>
                  <SelectItem value="sports">Sports</SelectItem>
                  <SelectItem value="technical">Technical</SelectItem>
                  <SelectItem value="social">Social</SelectItem>
                </SelectContent>
              </Select>
              <Select defaultValue="all">
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Clubs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {clubs && clubs.length > 0 ? (
            clubs.map((club) => {
              const stats = getStatsForClub(club.id)
              const userRole =
                club.president_user === userProfile.id
                  ? "president"
                  : club.vice_president_user === userProfile.id
                    ? "vice_president"
                    : club.faculty_coordinator_user === userProfile.id
                      ? "faculty_coordinator"
                      : null

              return (
                <Card key={club.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-lg">{club.name}</CardTitle>
                        <CardDescription>{club.type}</CardDescription>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        {getStatusBadge(club.status)}
                        {userRole && (
                          <Badge variant="outline" className="flex items-center gap-1">
                            {getRoleIcon(userRole)}
                            {userRole.replace("_", " ")}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {club.description && <p className="text-sm text-gray-600 line-clamp-2">{club.description}</p>}

                    {/* Club Leadership */}
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-gray-900">Leadership</h4>
                      <div className="space-y-1 text-sm">
                        {club.president && (
                          <div className="flex items-center gap-2">
                            <Crown className="h-3 w-3 text-yellow-600" />
                            <span className="text-gray-600">President:</span>
                            <span>{club.president.name}</span>
                          </div>
                        )}
                        {club.vice_president && (
                          <div className="flex items-center gap-2">
                            <UserCheck className="h-3 w-3 text-blue-600" />
                            <span className="text-gray-600">VP:</span>
                            <span>{club.vice_president.name}</span>
                          </div>
                        )}
                        {club.faculty_coordinator && (
                          <div className="flex items-center gap-2">
                            <GraduationCap className="h-3 w-3 text-green-600" />
                            <span className="text-gray-600">Faculty:</span>
                            <span>{club.faculty_coordinator.name}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Club Stats */}
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                      <div className="text-center">
                        <div className="text-lg font-semibold text-gray-900">{club.total_members || 0}</div>
                        <div className="text-xs text-gray-600">Members</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-semibold text-gray-900">{stats.upcomingEvents}</div>
                        <div className="text-xs text-gray-600">Upcoming Events</div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                      <Button variant="outline" size="sm" className="flex-1 bg-transparent" asChild>
                        <Link href={`/dashboard/clubs/${club.id}`}>View Details</Link>
                      </Button>
                      {(userProfile.role === "admin" || userRole) && (
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/dashboard/clubs/${club.id}/edit`}>Edit</Link>
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })
          ) : (
            <div className="col-span-full">
              <Card>
                <CardContent className="text-center py-12">
                  <Building2 className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No clubs found</h3>
                  <p className="text-gray-600 mb-6">
                    {userProfile.role === "admin"
                      ? "Create the first student club to get started"
                      : "Check back later for new clubs"}
                  </p>
                  {userProfile.role === "admin" && (
                    <Button asChild>
                      <Link href="/dashboard/clubs/new">
                        <Plus className="h-4 w-4 mr-2" />
                        Create Club
                      </Link>
                    </Button>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Quick Stats */}
        {clubs && clubs.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Club Overview</CardTitle>
              <CardDescription>Summary of all student organizations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{clubs.length}</div>
                  <div className="text-sm text-gray-600">Total Clubs</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">
                    {clubs.filter((club) => club.status === "active").length}
                  </div>
                  <div className="text-sm text-gray-600">Active Clubs</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">
                    {clubs.reduce((sum, club) => sum + (club.total_members || 0), 0)}
                  </div>
                  <div className="text-sm text-gray-600">Total Members</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">
                    {clubStats.reduce((sum, stat) => sum + stat.upcomingEvents, 0)}
                  </div>
                  <div className="text-sm text-gray-600">Upcoming Events</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
