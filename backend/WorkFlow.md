** Workflows **

-   Workflow: New Event

    -   Club user -> POST /events
    -   Event stored as pending
    -   Admin reviews -> POST /events/:id/approve or POST /events/:id/reject
        -   If approved -> visible to visitors
    -   Visitors can POST /events/:id/register with role

-   Workflow: New Club

    -   Club request -> POST /clubs
    -   Admin reviews -> POST /clubs/:id/approve or POST /clubs/:id/reject
        -   If approved -> assigned president/VP/faculty coordinator

-   Workflow: Register for Event

    -   Visitor clicks register -> API POST /events/:id/register
    -   Role assigned (participant, volunteer, manager, audience)
    -   Stored in EventRegistration table
    -   Event creator can view participants list

-   Workflow: Approval Tracking
    -   Every approval/rejection gets logged in AuditLog
    -   Includes who approved/rejected, timestamp, and reason

1.⁠ ⁠TopG will be made by us
2.⁠ ⁠⁠TopG will promote from visitor (who is a faculty) to club faculty coordinators
3.⁠ ⁠⁠Club faculty coordinators will promote visitors (who are club members) to club admins
4.⁠ ⁠⁠Club admins and faculty coordinator can promote users (who are students) to club members
5.⁠ ⁠⁠Everyone who creates a new account will be given access as visitor (faculty/student) only promoted by the respective authority
6.⁠ ⁠TopG will create club and assign faculty coordinator for the club
7.⁠ ⁠⁠2 types of users - faculty and student
