"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Calendar, MapPin, Users, Package, User, CheckCircle, XCircle, AlertTriangle } from "lucide-react"

interface Event {
  id: string
  name: string
  type: string
  venue: string
  date_time: string
  description: string
  max_participants: number
  registration_deadline: string
  equipments_json: string[]
  status: string
  created_at: string
  clubs: {
    name: string
    type: string
  }
  creator: {
    name: string
    email: string
  }
}

interface PageProps {
  params: Promise<{ id: string }>
}

export default function ReviewEventPage({ params }: PageProps) {
  const router = useRouter()
  const supabase = createClient()
  const [event, setEvent] = useState<Event | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [approvalNotes, setApprovalNotes] = useState("")
  const [decision, setDecision] = useState<"approve" | "reject" | null>(null)

  useEffect(() => {
    loadEvent()
  }, [])

  const loadEvent = async () => {
    try {
      const resolvedParams = await params
      const { data, error } = await supabase
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
        .eq("id", resolvedParams.id)
        .single()

      if (error) throw error
      if (!data) throw new Error("Event not found")

      setEvent(data)
    } catch (error: any) {
      setError(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDecision = async (action: "approve" | "reject") => {
    if (!event) return

    setIsSubmitting(true)
    setError(null)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error("Not authenticated")

      const updateData = {
        status: action === "approve" ? "approved" : "rejected",
        approval_notes: approvalNotes.trim() || null,
        approved_by: user.id,
        approved_at: new Date().toISOString(),
      }

      const { error } = await supabase.from("events").update(updateData).eq("id", event.id)

      if (error) throw error

      router.push("/dashboard/admin")
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

  const getUrgencyLevel = () => {
    if (!event) return null
    const eventDate = new Date(event.date_time)
    const now = new Date()
    const daysUntilEvent = Math.ceil((eventDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

    if (daysUntilEvent <= 3) return { level: "high", message: "Event is in 3 days or less!" }
    if (daysUntilEvent <= 7) return { level: "medium", message: "Event is within a week" }
    return { level: "low", message: "Event has sufficient lead time" }
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

  if (error || !event) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Error Loading Event</h3>
              <p className="text-gray-600 mb-4">{error || "Event not found"}</p>
              <Button onClick={() => router.back()}>Go Back</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const { date, time } = formatDateTime(event.date_time)
  const urgency = getUrgencyLevel()

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Review Event</h1>
          <p className="text-gray-600 mt-2">Evaluate and approve or reject this event submission</p>
        </div>

        {/* Urgency Alert */}
        {urgency && urgency.level !== "low" && (
          <Alert
            className={`mb-6 ${urgency.level === "high" ? "border-red-200 bg-red-50" : "border-orange-200 bg-orange-50"}`}
          >
            <AlertTriangle className={`h-4 w-4 ${urgency.level === "high" ? "text-red-600" : "text-orange-600"}`} />
            <AlertDescription className={urgency.level === "high" ? "text-red-800" : "text-orange-800"}>
              <strong>Urgent Review Required:</strong> {urgency.message}
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Event Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-2xl">{event.name}</CardTitle>
                    <CardDescription className="text-base mt-2">
                      {event.clubs?.name} • {event.clubs?.type} Club
                    </CardDescription>
                  </div>
                  <Badge variant="default">{event.status.replace("_", " ")}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <p className="font-medium">{date}</p>
                      <p className="text-sm text-gray-600">{time}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <MapPin className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <p className="font-medium">{event.venue}</p>
                      <p className="text-sm text-gray-600">Event Location</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Users className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <p className="font-medium">
                        {event.max_participants ? `Up to ${event.max_participants}` : "Unlimited"} participants
                      </p>
                      <p className="text-sm text-gray-600">Capacity Limit</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <User className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <p className="font-medium">{event.creator?.name}</p>
                      <p className="text-sm text-gray-600">{event.creator?.email}</p>
                    </div>
                  </div>
                </div>

                {event.registration_deadline && (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-1">Registration Deadline</h4>
                    <p className="text-blue-700">
                      {formatDateTime(event.registration_deadline).date} at{" "}
                      {formatDateTime(event.registration_deadline).time}
                    </p>
                  </div>
                )}

                {event.description && (
                  <>
                    <Separator />
                    <div>
                      <h4 className="font-medium mb-2">Event Description</h4>
                      <p className="text-gray-700 leading-relaxed">{event.description}</p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Equipment Requirements */}
            {event.equipments_json && Array.isArray(event.equipments_json) && event.equipments_json.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Package className="h-5 w-5 mr-2" />
                    Equipment Requirements
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {event.equipments_json.map((equipment: string, index: number) => (
                      <Badge key={index} variant="outline">
                        {equipment}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Review Decision */}
            <Card>
              <CardHeader>
                <CardTitle>Approval Decision</CardTitle>
                <CardDescription>Provide your decision and any feedback for the event organizer</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="notes">Review Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    placeholder="Add any comments, suggestions, or requirements for the event organizer..."
                    rows={4}
                    value={approvalNotes}
                    onChange={(e) => setApprovalNotes(e.target.value)}
                  />
                </div>

                {error && (
                  <Alert className="border-red-200 bg-red-50">
                    <XCircle className="h-4 w-4 text-red-600" />
                    <AlertDescription className="text-red-800">{error}</AlertDescription>
                  </Alert>
                )}

                <div className="flex flex-col sm:flex-row gap-4">
                  <Button
                    onClick={() => handleDecision("approve")}
                    disabled={isSubmitting}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    {isSubmitting && decision === "approve" ? "Approving..." : "Approve Event"}
                  </Button>
                  <Button
                    onClick={() => handleDecision("reject")}
                    disabled={isSubmitting}
                    variant="destructive"
                    className="flex-1"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    {isSubmitting && decision === "reject" ? "Rejecting..." : "Reject Event"}
                  </Button>
                </div>
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
                <Button variant="outline" className="w-full bg-transparent" onClick={() => router.back()}>
                  ← Back to Admin
                </Button>
                <Button variant="outline" className="w-full bg-transparent" asChild>
                  <a href={`/dashboard/events/${event.id}`} target="_blank" rel="noopener noreferrer">
                    View Full Details
                  </a>
                </Button>
              </CardContent>
            </Card>

            {/* Event Timeline */}
            <Card>
              <CardHeader>
                <CardTitle>Event Timeline</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Submitted</span>
                  <span>{new Date(event.created_at).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Event Date</span>
                  <span>{new Date(event.date_time).toLocaleDateString()}</span>
                </div>
                {event.registration_deadline && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Registration Deadline</span>
                    <span>{new Date(event.registration_deadline).toLocaleDateString()}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Review Checklist */}
            <Card>
              <CardHeader>
                <CardTitle>Review Checklist</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded" />
                  <span>Event details are complete and accurate</span>
                </div>
                <div className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded" />
                  <span>Venue is appropriate for the event</span>
                </div>
                <div className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded" />
                  <span>Date and time don't conflict with other events</span>
                </div>
                <div className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded" />
                  <span>Equipment requests are reasonable</span>
                </div>
                <div className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded" />
                  <span>Event aligns with club's mission</span>
                </div>
                <div className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded" />
                  <span>Safety and compliance requirements met</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
