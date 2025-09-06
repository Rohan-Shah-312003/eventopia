import { Suspense } from "react"
import { createServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, Calendar, MapPin, Users } from "lucide-react"
import Link from "next/link"

async function RegistrationSuccessContent({ eventId }: { eventId: string }) {
  const supabase = createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const { data: event } = await supabase
    .from("events")
    .select(`
      *,
      clubs (
        name
      )
    `)
    .eq("id", eventId)
    .single()

  if (!event) redirect("/dashboard/events")

  const { data: registration } = await supabase
    .from("event_registrations")
    .select("*")
    .eq("event_id", eventId)
    .eq("user_id", user.id)
    .single()

  if (!registration) redirect(`/dashboard/events/${eventId}`)

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Card>
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl text-green-600">Registration Successful!</CardTitle>
          <p className="text-muted-foreground">You have successfully registered for this event</p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-muted/50 p-4 rounded-lg">
            <h3 className="font-semibold text-lg mb-2">{event.name}</h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>
                  {new Date(event.date).toLocaleDateString()} at {event.time}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span>{event.venue}</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span>Organized by {event.clubs?.name}</span>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h4 className="font-medium text-blue-900 mb-2">What's Next?</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Check your email for confirmation details</li>
              <li>• Mark your calendar for {new Date(event.date).toLocaleDateString()}</li>
              <li>
                • Arrive at {event.venue} by {event.time}
              </li>
              {event.requirements && <li>• Remember: {event.requirements}</li>}
            </ul>
          </div>

          <div className="flex gap-3">
            <Button asChild className="flex-1">
              <Link href={`/dashboard/events/${eventId}`}>View Event Details</Link>
            </Button>
            <Button variant="outline" asChild className="flex-1 bg-transparent">
              <Link href="/dashboard/events">Browse More Events</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function RegistrationSuccessPage({ params }: { params: { id: string } }) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <RegistrationSuccessContent eventId={params.id} />
    </Suspense>
  )
}
