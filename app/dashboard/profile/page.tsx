import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { User, Mail, Shield, Calendar } from "lucide-react"

export default async function ProfilePage() {
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

  // Get user's clubs if they're a club admin
  let userClubs = []
  if (userProfile.role === "club_admin") {
    const { data: clubs } = await supabase
      .from("clubs")
      .select("*")
      .or(
        `president_user.eq.${userProfile.id},vice_president_user.eq.${userProfile.id},faculty_coordinator_user.eq.${userProfile.id}`,
      )
    userClubs = clubs || []
  }

  const getRoleDisplay = (role: string, position?: string) => {
    if (role === "admin") return "System Administrator"
    if (role === "club_admin" && position) {
      return position.charAt(0).toUpperCase() + position.slice(1).replace("_", " ")
    }
    return "Student/Visitor"
  }

  const getRoleBadgeVariant = (role: string) => {
    if (role === "admin") return "destructive"
    if (role === "club_admin") return "default"
    return "secondary"
  }

  return (
    <DashboardLayout user={userProfile}>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
          <p className="text-gray-600 mt-2">Manage your account information and preferences</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Information */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>Your basic account details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center">
                      <User className="h-8 w-8 text-primary" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-lg font-medium">{userProfile.name}</h3>
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600">{userProfile.email}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Role</label>
                    <div className="mt-1">
                      <Badge variant={getRoleBadgeVariant(userProfile.role)}>
                        <Shield className="h-3 w-3 mr-1" />
                        {getRoleDisplay(userProfile.role, userProfile.position)}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Member Since</label>
                    <div className="mt-1 flex items-center text-gray-600">
                      <Calendar className="h-4 w-4 mr-2" />
                      {new Date(userProfile.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Club Affiliations */}
            {userProfile.role === "club_admin" && userClubs.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Club Affiliations</CardTitle>
                  <CardDescription>Organizations you help manage</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {userClubs.map((club) => {
                      let position = "Member"
                      if (club.president_user === userProfile.id) position = "President"
                      else if (club.vice_president_user === userProfile.id) position = "Vice President"
                      else if (club.faculty_coordinator_user === userProfile.id) position = "Faculty Coordinator"

                      return (
                        <div key={club.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <h4 className="font-medium">{club.name}</h4>
                            <p className="text-sm text-gray-600">{club.type}</p>
                          </div>
                          <Badge variant="outline">{position}</Badge>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Account Stats */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Account Statistics</CardTitle>
                <CardDescription>Your activity summary</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Events Created</span>
                  <span className="font-medium">-</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Events Attended</span>
                  <span className="font-medium">-</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Clubs Managed</span>
                  <span className="font-medium">{userClubs.length}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Account Security</CardTitle>
                <CardDescription>Manage your account security</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Email Verified</p>
                    <p className="text-xs text-gray-600">Your email is confirmed</p>
                  </div>
                  <Badge variant="secondary">Verified</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Two-Factor Auth</p>
                    <p className="text-xs text-gray-600">Not enabled</p>
                  </div>
                  <Badge variant="outline">Disabled</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
