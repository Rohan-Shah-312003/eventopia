User {
  id: string (UUID)
  name: string
  reg_no: string
  role: enum("visitor", "admin", "taskforce", "faculty")
  position: enum("student", "faculty")
  createdAt: Date
  updatedAt: Date
}

Club {
  id: string (UUID)
  name: string
  type: enum("technical", "non-technical", "cultural", "sports")
  faculty_coordinator: User (FK)
  president: User (FK)
  vice_president: User (FK)
  budget: number
  logo: string (URL)
  no_of_members: number (optional)
  createdAt: Date
  updatedAt: Date
  status: enum("pending", "approved", "rejected")  // for new club approval
}


Event {
  id: string (UUID)
  name: string
  type: enum("hackathon", "seminar", "club_event", "hostel_event")
  owner_club: Club (FK)
  venue: string
  date: Date
  time: string
  requirements: JSON
  budget: number
  revenue_generated: number
  createdAt: Date
  updatedAt: Date
  status: enum("pending", "approved", "rejected")
  rejection_reason: string (nullable)
}

EventRegistration {
  id: string (UUID)
  user: User (FK)
  event: Event (FK)
  role: enum("manager", "volunteer", "participant", "audience")
  createdAt: Date
}

AuditLog {
  id: string (UUID)
  action: string
  performed_by: User (FK)
  entity_type: enum("event", "club", "user")
  entity_id: string
  old_data: JSON
  new_data: JSON
  createdAt: Date
}
