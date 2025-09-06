import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { Calendar, Building2, CheckCircle } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-svh bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Calendar className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold text-primary">Event Manager</h1>
          </div>
          <div className="space-x-2">
            <Button variant="ghost" asChild>
              <Link href="/auth/login">Sign In</Link>
            </Button>
            <Button asChild>
              <Link href="/auth/register">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-3xl mx-auto space-y-6">
          <h2 className="text-4xl md:text-6xl font-bold text-gray-900">Streamline Your Campus Events</h2>
          <p className="text-xl text-gray-600 leading-relaxed">
            The complete platform for student organizations to create, manage, and track events. From registration to
            approval workflows, we&apos;ve got you covered.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link href="/auth/register">Start Managing Events</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/events">Browse Events</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h3 className="text-3xl font-bold text-gray-900 mb-4">Everything You Need to Manage Events</h3>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Built specifically for student organizations and campus administrators
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <Card>
            <CardHeader>
              <Building2 className="h-12 w-12 text-primary mb-4" />
              <CardTitle>Club Management</CardTitle>
              <CardDescription>
                Organize your student clubs with role-based access for presidents, VPs, and faculty coordinators
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Calendar className="h-12 w-12 text-primary mb-4" />
              <CardTitle>Event Planning</CardTitle>
              <CardDescription>
                Create detailed events with venue booking, equipment requests, and participant management
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <CheckCircle className="h-12 w-12 text-primary mb-4" />
              <CardTitle>Approval Workflow</CardTitle>
              <CardDescription>
                Streamlined approval process for administrators with detailed event review and feedback
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary text-primary-foreground py-16">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-3xl font-bold mb-4">Ready to Get Started?</h3>
          <p className="text-xl mb-8 opacity-90">Join hundreds of student organizations already using Event Manager</p>
          <Button size="lg" variant="secondary" asChild>
            <Link href="/auth/register">Create Your Account</Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Calendar className="h-6 w-6" />
            <span className="text-lg font-semibold">Event Manager</span>
          </div>
          <p className="text-gray-400">Empowering student organizations to create amazing events</p>
        </div>
      </footer>
    </div>
  )
}
