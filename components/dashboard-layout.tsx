"use client"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Calendar, Building2, Users, Settings, LogOut, Home, Plus } from "lucide-react"
import type { ReactNode } from "react"

interface User {
  id: string
  name: string
  email: string
  role: string
  position?: string
}

interface DashboardLayoutProps {
  children: ReactNode
  user: User
}

export function DashboardLayout({ children, user }: DashboardLayoutProps) {
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/")
  }

  const getRoleDisplay = (role: string, position?: string) => {
    if (role === "admin") return "Administrator"
    if (role === "club_admin" && position) {
      return position.charAt(0).toUpperCase() + position.slice(1).replace("_", " ")
    }
    return "Student"
  }

  const getRoleBadgeVariant = (role: string) => {
    if (role === "admin") return "destructive"
    if (role === "club_admin") return "default"
    return "secondary"
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard" className="flex items-center space-x-2">
                <Calendar className="h-8 w-8 text-primary" />
                <h1 className="text-2xl font-bold text-gray-900">Event Manager</h1>
              </Link>
            </div>

            <div className="flex items-center space-x-4">
              {/* Quick Actions */}
              {user.role === "club_admin" && (
                <Button size="sm" asChild>
                  <Link href="/dashboard/events/new">
                    <Plus className="h-4 w-4 mr-2" />
                    New Event
                  </Link>
                </Button>
              )}

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src="/placeholder.svg" alt={user.name} />
                      <AvatarFallback>{user.name.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-2">
                      <p className="text-sm font-medium leading-none">{user.name}</p>
                      <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                      <Badge variant={getRoleBadgeVariant(user.role)} className="w-fit">
                        {getRoleDisplay(user.role, user.position)}
                      </Badge>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/profile">
                      <Settings className="mr-2 h-4 w-4" />
                      Profile Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <Link
              href="/dashboard"
              className="border-b-2 border-transparent hover:border-gray-300 py-4 px-1 text-sm font-medium text-gray-500 hover:text-gray-700"
            >
              <Home className="h-4 w-4 inline mr-2" />
              Dashboard
            </Link>
            <Link
              href="/dashboard/events"
              className="border-b-2 border-transparent hover:border-gray-300 py-4 px-1 text-sm font-medium text-gray-500 hover:text-gray-700"
            >
              <Calendar className="h-4 w-4 inline mr-2" />
              Events
            </Link>
            {user.role !== "visitor" && (
              <Link
                href="/dashboard/clubs"
                className="border-b-2 border-transparent hover:border-gray-300 py-4 px-1 text-sm font-medium text-gray-500 hover:text-gray-700"
              >
                <Building2 className="h-4 w-4 inline mr-2" />
                Clubs
              </Link>
            )}
            {user.role === "admin" && (
              <Link
                href="/dashboard/admin"
                className="border-b-2 border-transparent hover:border-gray-300 py-4 px-1 text-sm font-medium text-gray-500 hover:text-gray-700"
              >
                <Users className="h-4 w-4 inline mr-2" />
                Administration
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="py-8">
        <div className="px-4 sm:px-6 lg:px-8">{children}</div>
      </main>
    </div>
  )
}
