# User Journeys & Implemented Features

**Last Updated:** September 30, 2025  
**Status:** ✅ Hello World Milestone Complete

---

## Overview

This document catalogs **all currently implemented features** and user journeys in Modern Teaching. It serves as the single source of truth for what works today.

**For future features:** See `docs/product-requirements.md`  
**For architecture:** See `docs/ARCHITECTURE.md`

---

## Journey 1: Unauthenticated User

### Landing Page Experience

**Steps:**
1. User visits `https://modernteaching.ngrok.dev`
2. Sees application branding and login option
3. Clicks "Sign in with Schoology"
4. Redirects to OAuth flow

**UI Elements:**
- Login button
- Application name/branding

**Expected State:**
- No authentication cookies
- `/api/auth/status` returns 401 (normal behavior)
- Protected routes redirect to login

**Test Coverage:**
- ✅ E2E: `tests/e2e/oauth-flow.spec.ts` - login button visibility
- ✅ Backend: OAuth route tests

---

## Journey 2: OAuth Authentication Flow

### Complete Login Process

**Steps:**
1. User clicks "Sign in with Schoology"
2. → `GET /api/requestToken`
3. → Redirect to Schoology authorization page
4. User approves (may see hCaptcha)
5. Schoology redirects: `https://modernteaching.ngrok.dev/api/callback?oauth_token={token}&oauth_verifier={verifier}`
6. → `GET /api/callback` exchanges verifier for access token
7. → Fetches user profile from `/v1/users/me`
8. → Stores tokens and profile in Firestore `/users/{userId}`
9. → Sets session cookie `schoology_user_id={userId}`
10. → Redirects to `/dashboard`

**UI Elements:**
- Schoology OAuth approval page
- Loading/redirect states

**Expected State:**
- OAuth tokens stored in Firestore
- User profile stored in Firestore
- Session cookie set
- User redirected to dashboard

**Firestore Collections:**
```
/users/{userId}
  - accessToken: string
  - accessSecret: string
  - name: string
  - email: string
  - schoologyId: string
  - username: string
  - roleId: number
  - schoolId: string
  - lastLogin: timestamp
  - createdAt: timestamp
```

**Test Coverage:**
- ✅ Backend: `src/test/schoology-auth.integration.spec.ts`
- ✅ Backend: `src/test/oauth-simple.test.ts`
- ❌ E2E: No complete OAuth E2E test (requires real credentials or complex mocking)

**Known Issues:**
- OAuth callback URL must match Schoology Developer App **root domain**
- Rapid API calls can cause nonce collisions

---

## Journey 3: Parent User - View Children

### Parent Account with Multiple Children

**Steps:**
1. Parent logs in (e.g., Christina Mock)
2. Dashboard loads
3. Profile menu shows parent name and avatar
4. Profile dropdown lists all associated children:
   - Carter Mock
   - Tazio Mock
   - Livio Mock

**UI Elements:**
- Profile avatar in header (top-right)
- Profile dropdown menu
- Children list with avatars and names

**Expected State:**
- Parent profile loaded from `/api/schoology/me`
- Children list fetched from `/api/parent/children`
- Each child shows: name, avatar, grade level

**API Calls:**
```
GET /api/auth/status → 200 (authenticated)
GET /api/schoology/me → parent profile
GET /api/parent/children → array of child profiles
```

**Firestore Collections:**
```
/parents/{parentId}
  - activeChildId: string (null when viewing as parent)
```

**Test Coverage:**
- ✅ Backend: `/api/parent/children` route exists
- ❌ E2E: No test for children list display
- ❌ Unit: No test for profile menu component

---

## Journey 4: Parent - Select Child

### Switching to Child View

**Steps:**
1. Parent opens profile dropdown
2. Clicks on child name (e.g., "Carter Mock")
3. → `POST /api/parent/active` with `{ childId: "140788256" }`
4. → Updates Firestore `/parents/{parentId}` with `activeChildId`
5. Dashboard reloads
6. → `GET /api/schoology/courses` fetches child's courses
7. Profile menu updates to show child's name and avatar
8. "View as Parent" button appears

**UI Elements:**
- Child name in profile menu
- Child avatar
- "View as Parent" button
- Course cards showing child's classes

**Expected State:**
- `activeChildId` set in Firestore
- Dashboard shows child's courses
- Profile displays child info
- Can switch back to parent view

**API Calls:**
```
POST /api/parent/active → { childId: "140788256" }
GET /api/schoology/child → child profile
GET /api/schoology/courses → child's enrolled sections
```

**Test Coverage:**
- ✅ Backend: `/api/parent/active` POST exists
- ❌ E2E: No test for child selection flow
- ❌ Integration: No test for dashboard update on child switch

---

## Journey 5: Dashboard - Live Course Data

### Fetching Real Schoology Data

**Steps:**
1. User on dashboard (parent viewing child or student viewing own)
2. → `SchoologyDataService.getCourses()` called
3. → `fetch('/api/schoology/courses')`
4. API route determines:
   - If parent with activeChildId: fetch child's sections
   - If user without OAuth tokens: use admin credentials
   - If user with OAuth tokens: fetch own sections
5. → `GET /v1/users/{userId}/sections` (Schoology API)
6. Transform response to `SchoologyCourse[]`
7. Cache to Firestore `/users/{userId}/courses/{courseId}`
8. Return to UI
9. Dashboard renders course cards with:
   - Course title
   - Section name
   - Teacher name
   - Course code
   - "Live" badge (blue)
   - "Active" badge

**UI Elements:**
- Course cards in "Your Courses" section
- Teacher names
- Section information
- Data source badges

**Expected State:**
- Fresh data from Schoology API
- Cached to Firestore for offline access
- "Live" badge indicates fresh data
- Courses display correctly

**Data Flow:**
```
UI (Dashboard)
  ↓ getCourses()
SchoologyDataService
  ↓ fetch('/api/schoology/courses')
Next.js API Route
  ↓ OAuth signed request
Schoology API (/v1/users/{id}/sections)
  ↓ Returns sections array
Transform & Cache
  ↓ Save to Firestore
Return to UI
```

**Test Coverage:**
- ✅ Backend: `/api/schoology/courses` route exists
- ❌ E2E: No test for live data fetch
- ❌ Integration: No test for caching logic
- ❌ Unit: No test for data transformation

**Current Example (Carter Mock):**
- US Government (Summers E) - p1 T1
- AP Biology (Gamboa A) - p2 T1
- AP English Lit (Javier R) - p4 T1
- AP Statistics (Scholten B) - p3 T1

---

## Journey 6: Dashboard - Cached Data Fallback

### Offline Support & API Failures

**Steps:**
1. User on dashboard
2. API call to `/api/schoology/courses` fails (network error, API down, etc.)
3. `SchoologyDataService.getCourses()` catches error
4. Falls back to Firestore cache
5. Reads from `/users/{userId}/courses/` collection
6. Returns cached courses
7. Dashboard renders with "Cached" badge (gray)

**UI Elements:**
- Same course cards as live data
- "Cached" badge instead of "Live"
- No error message (graceful fallback)

**Expected State:**
- Stale but valid data displayed
- User can still use app offline
- No disruption to UX

**Test Coverage:**
- ❌ Backend: No test for cache fallback logic
- ❌ E2E: No test for offline behavior
- ❌ Integration: No test for API failure → cache flow

**Planned Enhancement (v0.2):**
- Staleness indicator (e.g., "Cached - 2 hours ago")
- Manual refresh button
- Background cache updates

---

## Journey 7: Parent - Return to Parent View

### Switch Back from Child

**Steps:**
1. Parent is viewing child's dashboard
2. Opens profile dropdown
3. Clicks "View as Parent" button
4. → `POST /api/parent/active` with `{ childId: "" }`
5. → Clears `activeChildId` in Firestore
6. Dashboard reloads
7. Shows parent's profile (no courses for parents)
8. Profile menu shows parent name/avatar
9. "View as Parent" button disappears
10. Children list visible again

**UI Elements:**
- "View as Parent" button (when child active)
- Profile menu with parent info
- Children list

**Expected State:**
- `activeChildId` = null in Firestore
- Parent profile displayed
- No child-specific data shown

**Test Coverage:**
- ✅ Backend: `/api/parent/active` POST with empty childId works
- ❌ E2E: No test for return to parent flow

---

## Journey 8: Student - Direct Login

### Student Account (No Parent Features)

**Steps:**
1. Student logs in with own Schoology credentials
2. OAuth flow completes
3. Dashboard loads
4. Shows student's own courses
5. No child-switching UI (parent features hidden)

**UI Elements:**
- Student profile in header
- Own courses displayed
- No "children" dropdown

**Expected State:**
- Student role detected
- No parent features visible
- Own courses fetched from API

**Test Coverage:**
- ❌ Backend: No test for student role detection
- ❌ E2E: No test for student login flow

**Note:** Currently untested with real student login (mock students don't have OAuth tokens).

---

## Journey 9: Admin - User Management & Seeding

### Admin Dashboard & Tools

**Steps:**
1. User with admin role accesses `/admin`
2. Sees registered users list
3. Can download CSVs for bulk import:
   - Teachers CSV
   - Courses CSV
   - Enrollments CSV
4. Can manage grading periods
5. Can grant admin role to self (bootstrap)

**UI Elements:**
- Admin page (`/admin`)
- Registered users table
- CSV download buttons
- Grading period controls

**Expected State:**
- User must have `admin` role in Firestore `/app_roles/{userId}`
- Returns 403 if not admin

**Firestore Collections:**
```
/app_roles/{userId}
  - roles: ['admin']
```

**API Endpoints:**
```
GET /api/admin/users - List all users
GET /api/admin/seed/csv?type=users - Generate teachers CSV
GET /api/admin/seed/csv?type=courses - Generate courses CSV
GET /api/admin/seed/csv?type=enrollments - Generate enrollments CSV
GET /api/admin/grading-periods - List grading periods
POST /api/admin/grading-periods - Create grading period
```

**Test Coverage:**
- ✅ Backend: `src/test/admin-page.spec.tsx`
- ❌ E2E: No admin flow tests

---

## Journey 10: Logout

### User Signs Out

**Steps:**
1. User clicks logout button
2. Clears session cookies
3. Redirects to landing page
4. User cannot access dashboard

**UI Elements:**
- Logout button in profile menu

**Expected State:**
- Cookies cleared
- Redirect to `/`
- Protected routes inaccessible

**Test Coverage:**
- ✅ Backend: `src/test/logout-flow.spec.tsx`
- ❌ E2E: No complete logout E2E test

---

## Backend Processes

### Automatic Processes

**OAuth Callback Handler:**
- Stores user profile in Firestore on first login
- Updates `lastLogin` timestamp
- Handles token refresh (if implemented)

**Data Caching:**
- Courses cached on fetch
- TTL-based refresh (planned v0.2)

**Parent-Child Association:**
- Fetched from Schoology API
- Can be seeded via CSV bulk import

---

## Admin & Backend Tasks

### CSV Generation & Bulk Import

**Workflow:**
1. Admin generates CSV from `/admin` page
2. Downloads: Teachers, Courses, Enrollments
3. Uploads to Schoology via web UI
4. Selects school and grading period
5. Data appears in Schoology sandbox
6. App fetches via API

**See:** `docs/SCHOOLOGY-CSV-IMPORT.md` for detailed procedures

### Mock Data Management

**Seed Files:** `/seed/sandbox/*.json`
- `carter-mock.json` - Carter Mock's data
- `tazio-mock.json` - Tazio Mock's data
- `livio-mock.json` - Livio Mock's data

**See:** `docs/SCHOOLOGY-SEED-DATA-GUIDE.md` for guidelines

---

## Data Source Indicators

### Badge System

**Live (Blue):**
- Fresh data from Schoology API
- Just fetched in this session

**Cached (Gray):**
- Stale data from Firestore
- API failed, using offline cache

**Mock (Hidden):**
- Demo/test data
- NOT shown in production (removed from UI)

---

## Error States & Edge Cases

### Implemented Error Handling

**User Without Email:**
- Displays "No email on file" instead of empty field
- Common for student accounts

**User Without Courses:**
- Shows empty state message
- No error thrown

**API Failure:**
- Graceful fallback to cache
- No visible error to user (unless cache also empty)

**Session Expiry:**
- Redirect to login
- User can re-authenticate

**Missing Admin Role:**
- `/admin` returns 403 Forbidden
- Clear error message

---

## Not Yet Implemented

### Planned for v0.2

- ❌ Assignments display
- ❌ Grades display
- ❌ Announcements display
- ❌ Deadlines/calendar view
- ❌ Manual refresh button
- ❌ Staleness indicators

### Planned for v1.0

- ❌ Student direct login (works but untested)
- ❌ Real parent accounts (non-mock)
- ❌ Production deployment
- ❌ Performance optimization
- ❌ Error boundaries
- ❌ LLM embeddings
- ❌ AI-powered insights

---

## Testing Coverage Status

| Journey | Implemented | Backend Test | E2E Test | Status |
|---------|-------------|--------------|----------|--------|
| Landing Page | ✅ | N/A | ✅ | Complete |
| OAuth Flow | ✅ | ✅ | ⚠️ Partial | Manual only |
| Parent Profile | ✅ | ✅ | ❌ | No E2E test |
| Select Child | ✅ | ✅ | ❌ | No E2E test |
| Switch Children | ✅ | ❌ | ❌ | No tests |
| Return to Parent | ✅ | ❌ | ❌ | No tests |
| Student Login | ✅ | ❌ | ❌ | No tests |
| Live Course Fetch | ✅ | ✅ | ❌ | No E2E test |
| Cached Fallback | ✅ | ❌ | ❌ | No tests |
| Admin Tools | ✅ | ✅ | ❌ | No E2E test |
| Logout | ✅ | ✅ | ❌ | No E2E test |

**Critical Gap:** Core Hello World features lack E2E test coverage.

---

## API Endpoints Reference

**See `docs/ARCHITECTURE.md` for complete API reference.**

**Quick Reference:**

### Authentication
- `GET /api/requestToken` - Initiate OAuth
- `GET /api/callback` - OAuth callback handler
- `GET /api/auth/status` - Check auth status

### User Data
- `GET /api/schoology/me` - Current user profile
- `GET /api/schoology/child` - Active child profile
- `GET /api/schoology/courses` - User's courses
- `GET /api/parent/children` - Parent's children list
- `GET /POST /api/parent/active` - Get/set active child

### Admin
- `GET /api/admin/users` - List all users
- `GET /api/admin/seed/csv` - Generate CSVs
- `GET /POST /api/admin/grading-periods` - Manage grading periods

---

## UI Components

### Layout Components

**Header:**
- App branding
- Profile menu (user-nav.tsx)
- Logout button

**Profile Menu (user-nav.tsx):**
- User avatar and name
- Email (or "No email on file")
- Children list (for parents)
- "View as Parent" button (when child active)
- Logout button

### Dashboard Components

**UserDashboard.tsx:**
- Profile cards (live profile data)
- Course cards (live/cached data)
- Data source badges
- Quick stats (course count, etc.)

**Course Card:**
- Course title
- Section name
- Teacher name
- Course code
- "Live" or "Cached" badge
- "Active" badge

---

## Session Continuity

**Cookies:**
- `schoology_user_id` - Session identifier (maps to Firestore `/users/{id}`)

**Firestore State:**
- User profile in `/users/{userId}`
- Active child in `/parents/{userId}`
- Cached courses in `/users/{userId}/courses/`
- Admin roles in `/app_roles/{userId}`

**On Page Reload:**
- Check `schoology_user_id` cookie
- Fetch profile from Firestore
- Fetch active child if parent
- Load cached courses
- Attempt fresh API fetch

---

**For implementation details, see `docs/ARCHITECTURE.md`  
For testing strategy, see `.cursor/rules/workflow.md`**
