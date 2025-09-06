"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Building2, Users, DollarSign, Crown, UserCheck, GraduationCap } from "lucide-react"

interface User {
  id: string
  name: string
  email: string
}

export default function NewClubPage() {
  const router = useRouter()
  const supabase = createClient()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [users, setUsers] = useState<User[]>([])

  const [formData, setFormData] = useState({
    name: "",
    type: "",
    description: "",
    budget_amount: "",
    total_members: "",
    president_user: "",
    vice_president_user: "",
    faculty_coordinator_user: "",
  })

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      const { data } = await supabase.from("users").select("id, name, email").order("name", { ascending: true })
      setUsers(data || [])
    } catch (error) {
      console.error("Error loading users:", error)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      // Validate required fields
      if (!formData.name || !formData.type) {
        throw new Error("Please fill in all required fields")
      }

      // Validate that leadership roles are different people
      const roles = [formData.president_user, formData.vice_president_user, formData.faculty_coordinator_user].filter(
        Boolean,
      )
      if (roles.length !== new Set(roles).size) {
        throw new Error("Leadership roles must be assigned to different people")
      }

      const clubData = {
        name: formData.name,
        type: formData.type,
        description: formData.description || null,
        budget_amount: formData.budget_amount ? Number.parseFloat(formData.budget_amount) : 0,
        total_members: formData.total_members ? Number.parseInt(formData.total_members) : 0,
        president_user: formData.president_user || null,
        vice_president_user: formData.vice_president_user || null,
        faculty_coordinator_user: formData.faculty_coordinator_user || null,
        status: "active",
      }

      const { data, error } = await supabase.from("clubs").insert([clubData]).select().single()

      if (error) throw error

      router.push(`/dashboard/clubs/${data.id}`)
    } catch (error: any) {
      setError(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Create New Club</h1>
          <p className="text-gray-600 mt-2">Register a new student organization</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Building2 className="h-5 w-5 mr-2" />
                Basic Information
              </CardTitle>
              <CardDescription>Essential details about the club</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Club Name *</Label>
                  <Input
                    id="name"
                    placeholder="Computer Science Society"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Club Type *</Label>
                  <Select value={formData.type} onValueChange={(value) => handleInputChange("type", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select club type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="academic">Academic</SelectItem>
                      <SelectItem value="cultural">Cultural</SelectItem>
                      <SelectItem value="sports">Sports</SelectItem>
                      <SelectItem value="technical">Technical</SelectItem>
                      <SelectItem value="social">Social</SelectItem>
                      <SelectItem value="volunteer">Volunteer/Service</SelectItem>
                      <SelectItem value="professional">Professional</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe the club's mission, activities, and goals..."
                  rows={4}
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Leadership */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2" />
                Leadership Team
              </CardTitle>
              <CardDescription>Assign leadership roles to club members</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="president" className="flex items-center">
                    <Crown className="h-4 w-4 mr-2 text-yellow-600" />
                    President
                  </Label>
                  <Select
                    value={formData.president_user}
                    onValueChange={(value) => handleInputChange("president_user", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select president" />
                    </SelectTrigger>
                    <SelectContent>
                      {users.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.name} ({user.email})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="vice_president" className="flex items-center">
                    <UserCheck className="h-4 w-4 mr-2 text-blue-600" />
                    Vice President
                  </Label>
                  <Select
                    value={formData.vice_president_user}
                    onValueChange={(value) => handleInputChange("vice_president_user", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select VP" />
                    </SelectTrigger>
                    <SelectContent>
                      {users.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.name} ({user.email})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="faculty_coordinator" className="flex items-center">
                    <GraduationCap className="h-4 w-4 mr-2 text-green-600" />
                    Faculty Coordinator
                  </Label>
                  <Select
                    value={formData.faculty_coordinator_user}
                    onValueChange={(value) => handleInputChange("faculty_coordinator_user", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select faculty" />
                    </SelectTrigger>
                    <SelectContent>
                      {users.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.name} ({user.email})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Club Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <DollarSign className="h-5 w-5 mr-2" />
                Club Details
              </CardTitle>
              <CardDescription>Additional information about the club</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="budget_amount">Budget Amount</Label>
                  <Input
                    id="budget_amount"
                    type="number"
                    placeholder="5000.00"
                    min="0"
                    step="0.01"
                    value={formData.budget_amount}
                    onChange={(e) => handleInputChange("budget_amount", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="total_members">Total Members</Label>
                  <Input
                    id="total_members"
                    type="number"
                    placeholder="25"
                    min="0"
                    value={formData.total_members}
                    onChange={(e) => handleInputChange("total_members", e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Error Display */}
          {error && (
            <Card className="border-destructive">
              <CardContent className="pt-6">
                <div className="text-sm text-destructive">{error}</div>
              </CardContent>
            </Card>
          )}

          {/* Submit Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-end">
            <Button type="button" variant="outline" onClick={() => router.back()} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Creating Club..." : "Create Club"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
