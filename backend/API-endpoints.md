Auth
POST   /auth/register        -> Register user
POST   /auth/login           -> Login & JWT issue
GET    /auth/profile         -> Get logged-in user

Users
GET    /users                -> List all users (admin only)
GET    /users/:id            -> Get single user
PATCH  /users/:id            -> Update user (admin/self)
DELETE /users/:id            -> Delete user (admin)

Clubs
POST   /clubs                -> Register new club (pending approval)
GET    /clubs                -> List all clubs (filter: approved/pending)
GET    /clubs/:id            -> Get club details
PATCH  /clubs/:id            -> Update club info (goes to admin for approval)
DELETE /clubs/:id            -> Delete club (admin only)

POST   /clubs/:id/approve    -> Approve club (admin only)
POST   /clubs/:id/reject     -> Reject club (admin only, with reason)

Events
POST   /events               -> Create new event (club user, goes pending)
GET    /events               -> List events (filter by type/status/date)
GET    /events/:id           -> Get event details
PATCH  /events/:id           -> Update event details (club user, pending approval again if major change)
DELETE /events/:id           -> Delete event (club user/admin)

POST   /events/:id/approve   -> Approve event (admin only)
POST   /events/:id/reject    -> Reject event (admin only, with reason)

Event Registration
POST   /events/:id/register  -> Register user for event with role
GET    /events/:id/registrations -> Get list of participants (club/admin only)


Dashboard APIs
    - Visitor Dashboard
    GET /dashboard/visitor/events   -> Get ongoing events

    - Club Dashboard
    GET /dashboard/club/my-events    -> Get events created by logged-in club
    GET /dashboard/club/statistics   -> Event stats (participants, volunteers, revenue)

    - Admin Dashboard
    GET /dashboard/admin/pending-events -> Get all events awaiting approval
    GET /dashboard/admin/pending-clubs  -> Get all clubs awaiting approval
    GET /dashboard/admin/audit-logs     -> Get history of actions

