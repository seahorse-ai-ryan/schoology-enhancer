# Schoology Sandbox Seeding Plan (Hello World)

Goal: create a small but realistic dataset in the developer school so our app can demonstrate live fetch + cached rendering without depending on a real district.

Seed set:

- 1 parent, 1 student, 2 teachers
- 4 courses (English, Biology, US Government, Statistics) each with a section
- 8 assignments per course (mixture of submitted/missing/graded)
- 4 announcements across courses

Implementation outline:

1. Admin OAuth credentials (from dev school) are used server-side.
2. Endpoints to call (Schoology API):
   - POST /users (create teacher/student/parent)
   - POST /courses; POST /sections
   - POST /sections/{section_id}/enrollments
   - POST /sections/{section_id}/assignments
   - POST /sections/{section_id}/updates (announcements)
3. Idempotency: store mapping in Firestore (sandboxSeed/index) to avoid duplicates.
4. Safety: disabled in production. Requires ADMIN_SEED_KEY environment variable.

Data source:

- We maintain seed JSON under `seed/sandbox/*.json`. These files mirror the structure expected by the API calls and can be edited by hand.

Next steps:

- Create `/api/admin/seed/sandbox` (POST) guarded by key header `x-seed-key`.
- Implement minimal create-if-missing logic and write created IDs back to Firestore.
