# Schoology Sandbox Seeding Plan (Hello World)

Goal: create a small but realistic dataset in the developer school so our app can demonstrate live fetch + cached rendering without depending on a real district.

Seed set:

- 1 parent, 1 student, 2 teachers
- 4 courses (English, Biology, US Government, Statistics) each with a section
- 8 assignments per course (mixture of submitted/missing/graded)
- 4 announcements across courses

Implementation outline:

1. Admin OAuth credentials (from dev school) are used server-side. Developer App keys are used for end-user login only.
2. Endpoints to call (Schoology API):
   - POST /users (bulk JSON recommended) (create teacher/student/parent)
   - POST /courses; POST /sections
   - POST /sections/{section_id}/enrollments
   - POST /sections/{section_id}/assignments
   - POST /sections/{section_id}/updates (announcements)
3. Idempotency: store mapping in Firestore (sandboxSeed/index) to avoid duplicates.
4. Safety: disabled in production. Requires ADMIN_SEED_KEY environment variable.

Data source:

- We maintain seed JSON under `seed/sandbox/*.json`. These files mirror the structure expected by the API calls and can be edited by hand.

Next steps:

- Use `/api/admin/seed` (POST) guarded by key header `x-seed-key` or app admin role.
- Bulk create users with JSON to leverage conflict handling and capture `Location`/`id`:
  ```json
  { "users": { "user": [ { "school_uid": "carter_mock_20250929", "username": "carter_mock_20250929", "name_first": "Carter", "name_last": "Mock", "role_id": 3, "school_id": 123456 } ] } }
  ```
- Conflict resolution options (documented by Schoology):
  - `?email_conflict_resolution=1` to create username-only if email exists.
  - `?ignore_email_conflicts=1` for cross-school conflicts (not used by default here).
- Prefer omitting `primary_email` in seeds to avoid conflicts.
