Workflows
Workflow: New Event

Club user -> POST /events

Event stored as pending

Admin reviews -> POST /events/:id/approve or POST /events/:id/reject

If approved -> visible to visitors

Visitors can POST /events/:id/register with role

Workflow: New Club

Club request -> POST /clubs

Admin reviews -> POST /clubs/:id/approve or POST /clubs/:id/reject

If approved -> assigned president/VP/faculty coordinator

Workflow: Register for Event

Visitor clicks register -> API POST /events/:id/register

Role assigned (participant, volunteer, manager, audience)

Stored in EventRegistration table

Event creator can view participants list

Workflow: Approval Tracking

Every approval/rejection gets logged in AuditLog

Includes who approved/rejected, timestamp, and reason