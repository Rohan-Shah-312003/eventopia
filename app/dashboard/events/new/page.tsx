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
import { Badge } from "@/components/ui/badge"
import { Calendar, MapPin, Users, Package, X } from "lucide-react"

interface Club {
  id: string
  name: string
  type: string
}

export default function NewEventPage() {
  const router = useRouter()
  const supabase = createClient()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [userClubs, setUserClubs] = useState<Club[]>([])
  const [equipments, setEquipments] = useState<string[]>([])
  const [newEquipment, setNewEquipment] = useState("")

  const [formData, setFormData] = useState({
    name: "",
    type: "",
    event_owner_club: "",
    venue: "",
    date_time: "",
    description: "",
    max_participants: "",
    registration_deadline: "",
  })

  useEffect(() => {
    loadUserClubs()
  }, [])

  const loadUserClubs = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      const { data: clubs } = await supabase
        .from("clubs")
        .select("id, name, type")
        .or(`president_user.eq.${user.id},vice_president_user.eq.${user.id},faculty_coordinator_user.eq.${user.id}`)

      setUserClubs(clubs || [])
    } catch (error) {
      console.error("Error loading clubs:", error)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const addEquipment = () => {
    if (newEquipment.trim() && !equipments.includes(newEquipment.trim())) {
      setEquipments((prev) => [...prev, newEquipment.trim()])
      setNewEquipment("")
    }
  }

  const removeEquipment = (equipment: string) => {
    setEquipments((prev) => prev.filter((eq) => eq !== equipment))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error("Not authenticated")

      // Validate required fields
      if (!formData.name || !formData.type || !formData.event_owner_club || !formData.venue || !formData.date_time) {
        throw new Error("Please fill in all required fields")
      }

      // Validate date is in the future
      if (new Date(formData.date_time) <= new Date()) {
        throw new Error("Event date must be in the future")
      }

      // Validate registration deadline is before event date
      if (formData.registration_deadline && new Date(formData.registration_deadline) >= new Date(formData.date_time)) {
        throw new Error("Registration deadline must be before the event date")
      }

      const eventData = {
        name: formData.name,
        type: formData.type,
        event_owner_club: formData.event_owner_club,
        venue: formData.venue,
        date_time: formData.date_time,
        description: formData.description || null,
        max_participants: formData.max_participants ? Number.parseInt(formData.max_participants) : null,
        registration_deadline: formData.registration_deadline || null,
        equipments_json: equipments,
        created_by: user.id,
        status: "draft",
      }

      const { data, error } = await supabase.from("events").insert([eventData]).select().single()

      if (error) throw error

      router.push(`/dashboard/events/${data.id}`)
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
          <h1 className="text-3xl font-bold text-gray-900">Create New Event</h1>
          <p className="text-gray-600 mt-2">Plan and submit your event for approval</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                Basic Information
              </CardTitle>
              <CardDescription>Essential details about your event</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Event Name *</Label>
                  <Input
                    id="name"
                    placeholder="Annual Tech Conference"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Event Type *</Label>
                  <Select value={formData.type} onValueChange={(value) => handleInputChange("type", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select event type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="conference">Conference</SelectItem>
                      <SelectItem value="workshop">Workshop</SelectItem>
                      <SelectItem value="seminar">Seminar</SelectItem>
                      <SelectItem value="competition">Competition</SelectItem>
                      <SelectItem value="social">Social Event</SelectItem>
                      <SelectItem value="fundraiser">Fundraiser</SelectItem>
                      <SelectItem value="meeting">Meeting</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="club">Organizing Club *</Label>
                <Select
                  value={formData.event_owner_club}
                  onValueChange={(value) => handleInputChange("event_owner_club", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select your club" />
                  </SelectTrigger>
                  <SelectContent>
                    {userClubs.map((club) => (
                      <SelectItem key={club.id} value={club.id}>
                        {club.name} ({club.type})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe your event, its purpose, and what attendees can expect..."
                  rows={4}
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Date, Time & Location */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MapPin className="h-5 w-5 mr-2" />
                Date, Time & Location
              </CardTitle>
              <CardDescription>When and where your event will take place</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="date_time">Event Date & Time *</Label>
                  <Input
                    id="date_time"
                    type="datetime-local"
                    value={formData.date_time}
                    onChange={(e) => handleInputChange("date_time", e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="venue">Venue *</Label>
                  <Input
                    id="venue"
                    placeholder="Main Auditorium, Building A"
                    value={formData.venue}
                    onChange={(e) => handleInputChange("venue", e.target.value)}
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Registration & Capacity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2" />
                Registration & Capacity
              </CardTitle>
              <CardDescription>Manage event capacity and registration settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="max_participants">Maximum Participants</Label>
                  <Input
                    id="max_participants"
                    type="number"
                    placeholder="100"
                    min="1"
                    value={formData.max_participants}
                    onChange={(e) => handleInputChange("max_participants", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="registration_deadline">Registration Deadline</Label>
                  <Input
                    id="registration_deadline"
                    type="datetime-local"
                    value={formData.registration_deadline}
                    onChange={(e) => handleInputChange("registration_deadline", e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Equipment Requirements */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Package className="h-5 w-5 mr-2" />
                Equipment Requirements
              </CardTitle>
              <CardDescription>List any equipment or resources needed for your event</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Add equipment (e.g., Projector, Microphone, Tables)"
                  value={newEquipment}
                  onChange={(e) => setNewEquipment(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addEquipment())}
                />
                <Button type="button" onClick={addEquipment} variant="outline">
                  Add
                </Button>
              </div>
              {equipments.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {equipments.map((equipment) => (
                    <Badge key={equipment} variant="secondary" className="flex items-center gap-1">
                      {equipment}
                      <X className="h-3 w-3 cursor-pointer" onClick={() => removeEquipment(equipment)} />
                    </Badge>
                  ))}
                </div>
              )}
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
              {isLoading ? "Creating Event..." : "Create Event"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
