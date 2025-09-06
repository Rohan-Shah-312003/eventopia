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
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Calendar, MapPin, Users, Clock, CheckCircle, XCircle, UserPlus } from "lucide-react"

interface Event {
  id: string
  name: string
  type: string
  venue: string
  date_time: string
  description: string
  max_participants: number
  current_participants: number
  registration_deadline: string
  status: string
  clubs: {
    name: string
    type: string
  }
}

interface PageProps {
  params: Promise<{ id: string }>
}

export default function RegisterEventPage({ params }: PageProps) {
  const router = useRouter()
  const supabase = createClient()
  const [event, setEvent] = useState<Event | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [existingRegistration, setExistingRegistration] = useState<any>(null)

  const [formData, setFormData] = useState({
    registration_type: "participant",
    additional_info: "",
    dietary_restrictions: "",
    emergency_contact: "",
    terms_accepted: false,
  })

  useEffect(() => {
    loadEventAndRegistration()
  }, [])

  const loadEventAndRegistration = async () => {
    try {
      const resolvedParams = await params

      // Get event details
      const { data: eventData, error: eventError } = await supabase
        .from("events")
        .select(`
          *,
          clubs:event_owner_club (
            name,
            type
          )
        `)
        .eq("id", resolvedParams.id)
        .single()

      if (eventError) throw eventError
      if (!eventData) throw new Error("Event not found")

      setEvent(eventData)

      // Check if user is already registered
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user) {
        const { data: registration } = await supabase
          .from("event_registrations")
          .select("*")
          .eq("event_id", resolvedParams.id)
          .eq("user_id", user.id)
          .single()

        setExistingRegistration(registration)
      }
    } catch (error: any) {
      setError(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!event) return

    setIsSubmitting(true)
    setError(null)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error("Not authenticated")

      // Validate terms acceptance
      if (!formData.terms_accepted) {
        throw new Error("Please accept the terms and conditions")
      }

      // Check if registration is still open
      if (event.registration_deadline && new Date(event.registration_deadline) < new Date()) {
        throw new Error("Registration deadline has passed")
      }

      // Check if event is full
      if (event.max_participants && event.current_participants >= event.max_participants) {
        throw new Error("Event is full")
      }

      // Check if event date has passed
      if (new Date(event.date_time) < new Date()) {
        throw new Error("Cannot register for past events")
      }

      const registrationData = {
        event_id: event.id,
        user_id: user.id,
        registration_type: formData.registration_type,
        registration_data: {
          additional_info: formData.additional_info || null,
          dietary_restrictions: formData.dietary_restrictions || null,
          emergency_contact: formData.emergency_contact || null,
        },
        status: "registered",
      }

      const { error } = await supabase.from("event_registrations").insert([registrationData])

      if (error) throw error

      setSuccess(true)
    } catch (error: any) {
      setError(error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancelRegistration = async () => {
    if (!existingRegistration) return

    setIsSubmitting(true)
    setError(null)

    try {
      const { error } = await supabase.from("event_registrations").delete().eq("id", existingRegistration.id)

      if (error) throw error

      router.push(`/dashboard/events/${event?.id}`)
    } catch (error: any) {
      setError(error.message)
    } finally {
      setIsSubmitting(false)
    }
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

  const getRegistrationStatus = () => {
    if (!event) return null

    const now = new Date()
    const eventDate = new Date(event.date_time)
    const registrationDeadline = event.registration_deadline ? new Date(event.registration_deadline) : null

    if (eventDate < now) return { status: "closed", message: "Event has already occurred" }
    if (registrationDeadline && registrationDeadline < now)
      return { status: "closed", message: "Registration deadline has passed" }
    if (event.max_participants && event.current_participants >= event.max_participants)
      return { status: "full", message: "Event is full" }
    if (event.status !== "approved") return { status: "unavailable", message: "Event is not yet approved" }

    return { status: "open", message: "Registration is open" }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading event details...</p>
        </div>
      </div>
    )
  }

  if (error && !event) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Error Loading Event</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <Button onClick={() => router.back()}>Go Back</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Registration Successful!</h3>
              <p className="text-gray-600 mb-6">You have successfully registered for {event?.name}.</p>
              <div className="space-y-2">
                <Button className="w-full" onClick={() => router.push(`/dashboard/events/${event?.id}`)}>
                  View Event Details
                </Button>
                <Button
                  variant="outline"
                  className="w-full bg-transparent"
                  onClick={() => router.push("/dashboard/events")}
                >
                  Browse More Events
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!event) return null

  const { date, time } = formatDateTime(event.date_time)
  const registrationStatus = getRegistrationStatus()

  // If user is already registered, show cancellation option
  if (existingRegistration) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 max-w-2xl">
          <Card>
            <CardHeader className="text-center">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <CardTitle className="text-2xl">Already Registered</CardTitle>
              <CardDescription>You are already registered for this event</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-2">{event.name}</h3>
                <p className="text-gray-600">{event.clubs?.name}</p>
                <p className="text-sm text-gray-500 mt-2">
                  {date} at {time} • {event.venue}
                </p>
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-medium text-green-900 mb-2">Registration Details</h4>
                <div className="text-sm text-green-800 space-y-1">
                  <p>Registration Type: {existingRegistration.registration_type}</p>
                  <p>Status: {existingRegistration.status}</p>
                  <p>Registered: {new Date(existingRegistration.registered_at).toLocaleDateString()}</p>
                </div>
              </div>

              {error && (
                <Alert className="border-red-200 bg-red-50">
                  <XCircle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800">{error}</AlertDescription>
                </Alert>
              )}

              <div className="flex flex-col sm:flex-row gap-4">
                <Button variant="outline" className="flex-1 bg-transparent" onClick={() => router.back()}>
                  Go Back
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1"
                  onClick={handleCancelRegistration}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Cancelling..." : "Cancel Registration"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Register for Event</h1>
          <p className="text-gray-600 mt-2">Complete your registration for this event</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Registration Form */}
          <div className="lg:col-span-2">
            {/* Registration Status Alert */}
            {registrationStatus && registrationStatus.status !== "open" && (
              <Alert className="mb-6 border-red-200 bg-red-50">
                <XCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  <strong>Registration Unavailable:</strong> {registrationStatus.message}
                </AlertDescription>
              </Alert>
            )}

            {registrationStatus?.status === "open" && (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Registration Type */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <UserPlus className="h-5 w-5 mr-2" />
                      Registration Type
                    </CardTitle>
                    <CardDescription>How would you like to participate in this event?</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Select
                      value={formData.registration_type}
                      onValueChange={(value) => handleInputChange("registration_type", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select participation type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="participant">Participant</SelectItem>
                        <SelectItem value="volunteer">Volunteer</SelectItem>
                      </SelectContent>
                    </Select>
                  </CardContent>
                </Card>

                {/* Additional Information */}
                <Card>
                  <CardHeader>
                    <CardTitle>Additional Information</CardTitle>
                    <CardDescription>Help us better prepare for your participation</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="additional_info">Special Requirements or Comments</Label>
                      <Textarea
                        id="additional_info"
                        placeholder="Any special accommodations, questions, or additional information..."
                        rows={3}
                        value={formData.additional_info}
                        onChange={(e) => handleInputChange("additional_info", e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="dietary_restrictions">Dietary Restrictions</Label>
                      <Input
                        id="dietary_restrictions"
                        placeholder="e.g., Vegetarian, Vegan, Allergies..."
                        value={formData.dietary_restrictions}
                        onChange={(e) => handleInputChange("dietary_restrictions", e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="emergency_contact">Emergency Contact</Label>
                      <Input
                        id="emergency_contact"
                        placeholder="Name and phone number"
                        value={formData.emergency_contact}
                        onChange={(e) => handleInputChange("emergency_contact", e.target.value)}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Terms and Conditions */}
                <Card>
                  <CardHeader>
                    <CardTitle>Terms and Conditions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="bg-gray-50 p-4 rounded-lg text-sm text-gray-700">
                      <p className="mb-2">By registering for this event, you agree to:</p>
                      <ul className="list-disc list-inside space-y-1">
                        <li>Attend the event at the scheduled time and location</li>
                        <li>Follow all event rules and guidelines</li>
                        <li>Respect other participants and organizers</li>
                        <li>Notify organizers if you cannot attend</li>
                        <li>Allow photography/videography for promotional purposes</li>
                      </ul>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="terms"
                        checked={formData.terms_accepted}
                        onCheckedChange={(checked) => handleInputChange("terms_accepted", checked as boolean)}
                      />
                      <Label htmlFor="terms" className="text-sm">
                        I accept the terms and conditions
                      </Label>
                    </div>
                  </CardContent>
                </Card>

                {/* Error Display */}
                {error && (
                  <Alert className="border-red-200 bg-red-50">
                    <XCircle className="h-4 w-4 text-red-600" />
                    <AlertDescription className="text-red-800">{error}</AlertDescription>
                  </Alert>
                )}

                {/* Submit Button */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button type="button" variant="outline" onClick={() => router.back()} disabled={isSubmitting}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting || !formData.terms_accepted} className="flex-1">
                    {isSubmitting ? "Registering..." : "Complete Registration"}
                  </Button>
                </div>
              </form>
            )}

            {registrationStatus?.status !== "open" && (
              <div className="text-center py-8">
                <Button variant="outline" onClick={() => router.back()}>
                  Go Back
                </Button>
              </div>
            )}
          </div>

          {/* Event Summary Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Event Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg">{event.name}</h3>
                  <p className="text-gray-600">{event.clubs?.name}</p>
                  <Badge variant="outline" className="mt-2">
                    {event.type}
                  </Badge>
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                    <span>{date}</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-2 text-gray-400" />
                    <span>{time}</span>
                  </div>
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                    <span>{event.venue}</span>
                  </div>
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-2 text-gray-400" />
                    <span>
                      {event.current_participants || 0}
                      {event.max_participants && ` / ${event.max_participants}`} registered
                    </span>
                  </div>
                </div>

                {event.registration_deadline && (
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="text-sm font-medium text-blue-900">Registration Deadline</p>
                    <p className="text-sm text-blue-700">{formatDateTime(event.registration_deadline).date}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {event.description && (
              <Card>
                <CardHeader>
                  <CardTitle>About This Event</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-700 leading-relaxed">{event.description}</p>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Registration Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  {registrationStatus?.status === "open" ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}
                  <span className="text-sm">{registrationStatus?.message}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
