# Modern Teaching - Architecture Overview

**Last Updated:** September 30, 2025  
**Status:** ✅ "Hello World" Milestone Achieved

---

## Table of Contents

1. [Overview](#overview)
2. [Data Flow Architecture](#data-flow-architecture)
3. [Caching Strategy](#caching-strategy)
4. [Authentication Flow](#authentication-flow)
5. [API Endpoints](#api-endpoints)
6. [Data Models](#data-models)

---

## Overview

Modern Teaching is a Next.js application that enhances the Schoology learning management system with modern UI/UX, offline capabilities, and AI-ready data architecture.

**Tech Stack:**

- **Frontend:** Next.js 14 (App Router), React, TypeScript, Tailwind CSS
- **Backend:** Next.js API Routes (Node.js)
- **Database:** Firestore (caching & offline support)
- **Authentication:** OAuth 1.0a (Schoology)
- **External API:** Schoology REST API v1
- **Deployment:** Firebase Hosting
- **Development:** ngrok static domain (`modernteaching.ngrok.dev`)

---

## Data Flow Architecture

### Current Implementation (v1 - "Hello World")

```
┌─────────────────┐
│   React UI      │
│  (Dashboard)    │
└────────┬────────┘
         │ 1. getCourses()
         ▼
┌─────────────────────────┐
│ SchoologyDataService    │
│ (Client-side Service)   │
└────────┬────────────────┘
         │ 2. fetch('/api/schoology/courses')
         ▼
┌─────────────────────────────────┐
│ Next.js API Route               │
│ /api/schoology/courses          │
│ - Checks active child           │
│ - Uses OAuth or admin creds     │
│ - Fetches from Schoology API    │
└────────┬────────────────────────┘
         │ 3. GET /v1/users/{id}/sections
         ▼
┌─────────────────────────┐
│   Schoology REST API    │
│   (Live Data Source)    │
└────────┬────────────────┘
         │ 4. Returns sections array
         ▼
┌─────────────────────────────────┐
│ SchoologyDataService            │
│ - Transforms API response       │
│ - Caches to Firestore           │
│ - Returns to UI                 │
└────────┬────────────────────────┘
         │ 5. cacheCourses()
         ▼
┌─────────────────────────┐
│      Firestore          │
│ /users/{id}/courses     │
│ (Offline Cache)         │
└─────────────────────────┘
```

### Grades Data Flow (Added Oct 2025)

```
┌─────────────────┐
│   Dashboard UI  │
│  (UserDashboard)│
└────────┬────────┘
         │ fetch('/api/schoology/grades')
         ▼
┌─────────────────────────────────┐
│ Next.js API Route               │
│ /api/schoology/grades           │
│ - Checks active child           │
│ - Uses admin credentials        │
│ - Impersonates target user      │
└────────┬────────────────────────┘
         │ For each section:
         │ GET /v1/sections/{id}/grades
         │ X-Schoology-Run-As: {userId}
         ▼
┌─────────────────────────┐
│   Schoology REST API    │
│ - Returns grade data    │
│ - Includes final_grade  │
└────────┬────────────────┘
         │ Extract: final_grade[0].period[0].grade
         ▼
┌─────────────────────────────────┐
│ API Response                    │
│ {                               │
│   grades: {                     │
│     "8067479367": {             │
│       grade: 79,                │
│       period_id: "p1141932"     │
│     }                           │
│   }                             │
│ }                               │
└────────┬────────────────────────┘
         │ Display in UI
         ▼
┌─────────────────────────┐
│   Grade Badge           │
│   [79%] (color-coded)   │
└─────────────────────────┘
```

**Key Points:**

- ✅ **API-First:** Always tries to fetch fresh data from Schoology
- ✅ **Cache-Second:** Falls back to Firestore if API fails
- ✅ **Offline Support:** Cached data available when offline
- ⏳ **No Staleness Check (Yet):** Currently fetches on every page load
- ✅ **Grades:** Fetched separately and matched to courses by section ID

---

## Caching Strategy

### Current Implementation (v1.1 - Oct 2025)

**TTL-Based Caching (60 seconds):**

**On Dashboard Load:**

1. Call `fetch('/api/schoology/courses')`
2. API route checks Firestore cache
3. If cache exists and fresh (< 60s old):
   - Return cached data immediately
   - No Schoology API call
4. If cache stale or missing:
   - Fetch from Schoology API
   - Update Firestore cache with timestamp
   - Return fresh data

**Cache Collections:**
- `cache_courses/{userId}` - User's enrolled courses
- `cache_grades/{userId}` - User's final course grades
- `cache_assignments/{userId}_{sectionId}` - Assignments per section

**Cache Document Structure:**
```javascript
{
  courses: [...],          // or grades: {...}, or assignments: [...]
  cachedAt: 1696512000000, // Unix timestamp
  targetUserId: "140834636"
}
```

**Performance Benefits:**
- First load: ~800ms (Schoology API call)
- Cached loads: ~50ms (Firestore read)
- 16x faster for cached data
- Reduces Schoology API usage by ~90%

**Cache Structure:**

```
/users/{userId}/courses/{courseId}
  - id: string
  - name: string
  - code: string
  - teacher: object
  - isActive: boolean
  - lastUpdated: timestamp
  - sourceTimestamp: timestamp
  - dataSource: 'live' | 'cached' | 'mock'
```

### Planned Improvements (v2)

**Time-Based Staleness:**

```typescript
// Check cache age before hitting API
const cacheAge = Date.now() - lastUpdated.getTime();
const TTL = 60 * 1000; // 1 minute for dev, 10 minutes for prod

if (cacheAge < TTL) {
  // Return cached data
  return cachedCourses;
} else {
  // Fetch fresh data from API
  return await fetchFreshCourses();
}
```

**Configuration:**

- **Development:** 1 minute TTL (fast iteration)
- **Mock School:** 10 minutes TTL (reasonable for testing)
- **Production:** 1 hour TTL (balance freshness vs. API load)

**Background Refresh:**

- Popular courses refreshed automatically
- User-triggered refresh available
- WebSocket updates for real-time changes (future)

---

## Authentication Flow

### OAuth 1.0a (3-Legged)

**User Login Flow:**

```
1. User clicks "Sign in with Schoology"
   → GET /api/requestToken

2. Redirect to Schoology authorization page
   → https://app.schoology.com/oauth/authorize?oauth_token={token}

3. User approves, Schoology redirects back
   → https://modernteaching.ngrok.dev/api/callback?oauth_token={token}&oauth_verifier={verifier}

4. Exchange verifier for access token
   → POST /oauth/access_token

5. Store tokens in Firestore
   → /users/{userId} { accessToken, accessSecret }

6. Fetch user profile
   → GET /v1/users/me

7. Store profile in Firestore
   → /users/{userId} { name, email, schoologyId, ... }

8. Set session cookie
   → schoology_user_id={userId}

9. Redirect to dashboard
   → /dashboard
```

### Admin Credentials (2-Legged)

**For Mock Users (No OAuth Tokens):**

```
1. Check if user has accessToken in Firestore
   → If missing, use admin credentials

2. Fetch data using admin API keys
   → GET /v1/users/{userId}/sections
   → Signed with SCHOOLOGY_ADMIN_KEY/SECRET

3. Return data to user
   → Same format as OAuth response
```

**Use Cases:**

- Mock students created via bulk import
- Parent viewing child's data
- Admin tools and debugging

---

## API Endpoints

### Authentication

| Endpoint            | Method | Purpose                     |
| ------------------- | ------ | --------------------------- |
| `/api/requestToken` | GET    | Initiate OAuth flow         |
| `/api/callback`     | GET    | Handle OAuth callback       |
| `/api/auth/status`  | GET    | Check authentication status |

### User Data

| Endpoint                 | Method   | Purpose                            |
| ------------------------ | -------- | ---------------------------------- |
| `/api/schoology/me`          | GET      | Get current user profile           |
| `/api/schoology/child`       | GET      | Get active child profile (parents) |
| `/api/schoology/courses`     | GET      | Get user's enrolled courses (cached, 60s TTL) |
| `/api/schoology/grades`      | GET      | Get final course grades (cached, 60s TTL) |
| `/api/schoology/assignments` | GET      | Get assignments for section (cached, 60s TTL) |
| `/api/parent/children`       | GET      | Get parent's children list         |
| `/api/parent/active`         | GET/POST | Get/set active child               |

### Admin

| Endpoint                     | Method   | Purpose                      |
| ---------------------------- | -------- | ---------------------------- |
| `/api/admin/users`           | GET      | List all registered users    |
| `/api/admin/seed`            | POST     | Seed mock data               |
| `/api/admin/seed/csv`        | GET      | Generate CSV for bulk import |
| `/api/admin/grading-periods` | GET/POST | Manage grading periods       |

---

## Data Models

### SchoologyCourse

**Our Enhanced Model:**

```typescript
interface SchoologyCourse {
  // Core identifiers
  id: string;
  externalId?: string; // Schoology's ID
  code: string;
  name: string;

  // Academic metadata
  subject: string;
  gradeLevel: string;
  credits: number;
  academicYear: string;
  semester: string;

  // Staff information
  teacher: {
    id: string;
    name: string;
    email: string;
    department: string;
  };

  // Description
  description?: string;

  // Status
  isActive: boolean;

  // Cache metadata
  lastUpdated: Date;
  sourceTimestamp: Date;
  dataSource: "live" | "cached" | "mock";

  // LLM/RAG fields (future)
  embedding?: number[];
  semanticKeywords?: string[];
  aiGeneratedSummary?: string;
}
```

**Schoology API Response:**

```json
{
  "section": [
    {
      "id": "123456",
      "course_title": "US Government",
      "course_code": "US-GOVERNMENT",
      "section_title": "p1 T1",
      "section_code": "US-GOVERNMENT-S1",
      "active": "1",
      "description": "...",
      "grading_periods": [...],
      "admin": [...],
      "instructors": {...}
    }
  ]
}
```

---

## Milestones

### ✅ v0.1 - "Hello World" (Sept 30, 2025)

**Achieved:**

- ✅ OAuth 1.0a authentication with Schoology
- ✅ Parent-child account associations
- ✅ Real-time course data fetching from Schoology API
- ✅ Firestore caching for offline support
- ✅ Dashboard displaying live student courses
- ✅ Mock data seeding via CSV bulk import
- ✅ Static ngrok domain for development

**Demo:**

- Parent logs in with real Schoology credentials
- Selects child (Carter Mock) from profile menu
- Dashboard shows child's 4 real courses from Schoology
- Data cached to Firestore for offline access

### ⏳ v0.2 - "Smart Caching" (Next)

**Planned:**

- ⏳ Staleness checks with configurable TTL
- ⏳ Background refresh jobs
- ⏳ User-triggered manual refresh
- ⏳ Loading indicators for fresh vs. cached data
- ⏳ Assignments and grades data fetching
- ⏳ Announcements and deadlines

### 🔮 v1.0 - "Production Ready"

**Future:**

- 🔮 Production deployment to Firebase
- 🔮 Real user accounts (non-mock)
- 🔮 Performance optimizations
- 🔮 Error boundary improvements
- 🔮 Comprehensive testing suite
- 🔮 LLM embeddings for semantic search
- 🔮 AI-powered insights and recommendations

---

### Firestore "View" Documents (Denormalization Strategy)

**Concept:**
To optimize for performance and cost, the architecture uses a denormalization strategy by creating pre-aggregated "view" documents in Firestore. Instead of the client application performing complex joins and reading from multiple collections to build a page, a single, purpose-built document is read.

**Value Proposition:**
1.  **Performance:** Loading a complex view like the main dashboard might require fetching data from `courses`, `assignments`, and `grades` collections. A view document combines this into a single document, reducing a 20-read operation into a **single read**, resulting in dramatically faster page loads.
2.  **Cost Reduction:** Since Firestore bills per document read, this strategy significantly lowers operational costs, especially for frequently accessed, data-rich pages.
3.  **Enables Proactive Features:** This is the key architectural pattern that will enable future features like background data syncing and proactive notifications. A cloud function can run on a schedule, update the view document with fresh data from Schoology, and then trigger a notification based on the aggregated result, all without the user needing to be active in the app.

**Architecture:**
- **Trigger:** A Cloud Function is triggered whenever underlying source data (e.g., a grade in the `grades` collection) is updated.
- **Process:** The function reads the necessary related data, aggregates it, and writes it to a specific view document (e.g., `/user_dashboards/{userId}`).
- **Client Action:** The client application simply subscribes to this single document for real-time updates.

**Trade-offs:**
- **Increased Storage:** This approach uses more storage due to data duplication. This is a deliberate trade-off, as storage costs are significantly lower than read operation costs in Firestore.
- **Development Overhead:** It requires creating and maintaining the Cloud Functions that build and update the view documents. This initial complexity is accepted for the significant long-term gains in performance and cost.
- **UI Flexibility:** While it's true that UI changes might require updates to the view document structure, this is a manageable part of the development process. For highly personalized layouts (a post-MVP feature), client-side AI models like Gemini Nano could potentially re-format the data from the view document to meet user wishes without needing new database reads.

---

## Data Backup and Restoration

### Production Environment (Cloud Firestore)

**Strategy:** Automated Backups + Point-in-Time Recovery (PITR)

1.  **Automated Daily Backups:** Cloud Firestore is configured to automatically create a full backup of the production database every 24 hours. These backups are retained for 30 days.
2.  **Point-in-Time Recovery (PITR):** PITR is enabled for the production database. This allows for recovery to any specific microsecond within the last 7 days, providing granular protection against accidental data deletion or corruption.

**Restoration Procedure:**
- In case of catastrophic data loss, a full restore will be initiated from the latest daily backup.
- For targeted data corruption incidents (e.g., a bad script affecting a specific collection), PITR will be used to restore the affected documents to a state just before the incident occurred.

### Development & Staging Environments

**Strategy:** Persistent Local Data + Manual Seeding

1.  **Local Emulator Persistence:** The Firebase Local Emulator Suite is configured to persist data between sessions. This is achieved by using the `--import` and `--export-on-exit` flags, which save the state of the emulators to a local directory (`.firebase/emulator-data`). This directory is included in `.gitignore`.
2.  **Environment Separation:** The project uses separate Firebase projects for different environments, managed via the `.firebaserc` file:
    *   **`demo-project` (DEV):** The local emulator environment with persistent data.
    *   **`modernteaching-beta` (BETA):** A dedicated cloud project for staging and beta testing.
    *   **`modernteaching` (PROD):** The live production project.
3.  **Seeding:** The BETA environment is periodically seeded from a sanitized snapshot of the production data or from the master seed file (`seed/sandbox/seed-data-master.json`) to provide a realistic testing environment.

---

## Development Workflow

### Local Environment

**Prerequisites:**

- Node.js 20+
- Firebase CLI
- Ngrok (with paid account for static domain)
- Schoology Developer Account

**Setup:**

1. Clone repo
2. Copy `.env.local.example` to `.env.local`
3. Set environment variables (OAuth keys, Firebase config)
4. Install dependencies: `npm install`
5. Build Firebase functions: `npm run build`

**Start Services (in order):**

```bash
# Terminal 1: ngrok (named "Cursor (ngrok http)")
ngrok http --url=modernteaching.ngrok.dev 9000 --log stdout

# Terminal 2: Firebase Emulators (named "Cursor (firebase emulators:start)")
firebase emulators:start

# Terminal 3: Next.js Dev Server (named "Cursor (npm run)")
npm run dev
```

**Access:**

- App: `https://modernteaching.ngrok.dev`
- Firestore UI: `http://localhost:4000`
- Ngrok Dashboard: `http://localhost:4040`

### Testing

**Backend Tests:**

```bash
npm run test:emu  # Jest + Firebase Emulators
```

**E2E Tests:**

```bash
npm run test:simple  # Playwright (only when MCP unavailable)
```

**Preferred:** Use Chrome DevTools MCP for interactive testing

---

## Key Learnings

### OAuth 1.0a Gotchas

1. **Callback URL:** Must match exactly in Schoology app settings (root domain, not full callback path)
2. **Nonce Collisions:** Rapid API calls can cause signature verification failures
3. **Admin vs. User Context:** 2-legged vs. 3-legged OAuth for different use cases

### Schoology API Quirks

1. **Section School Codes:** Auto-generated as `{COURSE_CODE}-S1`, independent of section name
2. **Email Conflicts:** Students should not have `primary_email` to avoid conflicts
3. **Grading Periods:** Required for course imports, must be created first
4. **Enrollment Types:** Numeric values (1=Admin/Teacher, 2=Member/Student)
5. **Assignment Category Fields:** Inconsistent naming
   - GET returns: `grading_category` (STRING)
   - POST/PUT expects: `grading_category_id` (NUMBER/STRING)
   - Always check both: `assignment.grading_category || assignment.grading_category_id`

### Data Architecture

1. **LLM-Ready:** All models include fields for embeddings and semantic search
2. **RAG-Optimized:** Structured relationships for retrieval-augmented generation
3. **Offline-First:** Cache everything, sync when online
4. **Type-Safe:** Full TypeScript coverage for data models

---

## References

**Project Docs:**

- `README.md` - Setup and quick start
- `.cursor/rules/workflow.md` - Dev environment and startup
- `docs/guides/SCHOOLOGY-DATA-SEEDING.md` - Seeding workflow
- `seed/README.md` - Seed data reference and test accounts

**External Docs:**

- [Schoology Developer Portal](https://developers.schoology.com/)
- [Schoology REST API](https://developers.schoology.com/api-documentation/rest-api-v1/)
- [PowerSchool Help Center](https://uc.powerschool-docs.com/en/schoology/latest/)

