# Technical Architecture Decisions (TAD)

**Last Updated:** September 30, 2025  
**Purpose:** Document key architectural decisions and trade-offs

---

## 🎯 Decision Log Format

Each decision includes:
- **Context:** Why this decision was needed
- **Options:** Alternatives considered
- **Decision:** What we chose
- **Rationale:** Why we chose it
- **Consequences:** Trade-offs and implications
- **Status:** Proposed, Accepted, Superseded

---

## TAD-001: Next.js vs Firebase Functions

**Date:** September 30, 2025  
**Status:** ✅ ACCEPTED

**Context:**  
Need backend logic for OAuth, API proxying, and data transformations. Firebase Functions vs Next.js API routes.

**Options:**
1. Firebase Functions - Serverless functions, integrated with Firebase
2. Next.js API routes - Integrated with Next.js frontend
3. Hybrid - Functions for heavy tasks, API routes for simple ones

**Decision:** Next.js API routes only (no Firebase Functions)

**Rationale:**
- ✅ Simpler architecture - one codebase
- ✅ Faster development - no separate deployment
- ✅ Better local development - `npm run dev` runs everything
- ✅ Easier debugging - same language/tools
- ✅ Lower complexity - no function versioning
- ❌ Trade-off: Tied to Next.js hosting (but that's fine)

**Consequences:**
- All backend logic in `src/app/api/`
- Deploy via Firebase Hosting with Next.js
- Can't use Firebase-specific Function features (PubSub, etc.)
- Simpler mental model for solo developer

**Evidence:** Deleted entire `src/functions/` directory (36 files) with no issues

---

## TAD-002: Persistent Browser Context for E2E Testing

**Date:** September 30, 2025  
**Status:** ✅ ACCEPTED - BREAKTHROUGH!

**Context:**  
Schoology OAuth requires hCaptcha, which blocks automated browsers (Playwright/Chromium).

**Options:**
1. Use headless Chromium - ❌ Blocked by hCaptcha
2. Manual login every test run - ❌ Not automated
3. CAPTCHA solving service (2Captcha) - ❌ Costs money, unreliable
4. Mock OAuth in tests - ❌ Doesn't test real integration
5. **Persistent browser context** - ✅ WINNER!

**Decision:** `chromium.launchPersistentContext()` with system Chrome

**Rationale:**
- ✅ Sign in once manually (pass hCaptcha)
- ✅ Session persists in `.auth/chrome-profile/`
- ✅ All future tests fully automated
- ✅ Tests real OAuth integration
- ✅ No third-party services needed
- ✅ Free, reliable, fast

**Consequences:**
- Positive: Full E2E automation possible
- Positive: Real API testing with real auth
- Negative: Need to refresh auth every ~24-48 hours
- Negative: Can't run tests in pure headless CI (need headed Chrome)

**Code:**
```javascript
const context = await chromium.launchPersistentContext('.auth/chrome-profile', {
  channel: 'chrome',
  headless: false,
});
```

**Evidence:** 7 E2E tests working with zero manual intervention after first login

---

### Implementation Nuances & Collaboration

**1. Defeating Bot Detection:**

Schoology's login employs bot detection that is triggered by standard Playwright/Chromium automation flags. To bypass this, we must launch Chromium with specific arguments that make it appear like a regular, user-driven browser. The key arguments are:
- `--disable-blink-features=AutomationControlled`: This removes the `navigator.webdriver` flag that test automation software uses.
- `--disable-infobars`: This hides the "Chrome is being controlled by automated test software" banner.
- **A Standard User Agent:** We set a common user agent string to avoid standing out.

Without these flags, hCaptcha will block the login attempt, and the authentication will fail.

**2. Security & `.gitignore`:**

The persistent context is saved to the `.auth/chrome-profile/` directory. This directory contains sensitive session cookies and tokens. **It is critical that this directory is never committed to source control.** The project's `.gitignore` file is already configured to exclude the entire `.auth/` directory, ensuring this data remains local.

**3. Local and Machine-Specific Profiles:**

The `.auth/chrome-profile/` is entirely local to your machine. It is not shared and will not exist when a new developer clones the repository.

-   **For New Developers:** Upon running a verification script for the first time, Playwright will create a new, empty profile directory. The developer (or an agent on their behalf) will need to perform a one-time manual login to Schoology to populate this directory with valid authentication tokens.
-   **Isolation:** This profile is completely separate from any personal Google Chrome profiles you may have on your machine. It does not share history, bookmarks, or cookies, ensuring that our testing environment is isolated and does not interfere with your personal browsing.

---

## TAD-003: User vs Account Data Separation

**Date:** September 30, 2025  
**Status:** 🟡 PROPOSED

**Context:**  
Need to handle data that's shared (grades, assignments) vs personal (hidden items, preferences).

**Options:**
1. Everything shared - ❌ No personalization
2. Everything personal - ❌ Duplicated data, inconsistency
3. **Firestore collections by scope** - ✅ Clean separation

**Decision:** Two-tier Firestore structure

**Firestore Schema:**
```javascript
// ACCOUNT-LEVEL (Shared by student + all parents)
/accounts/{accountId}/
  courses/        // From Schoology API
  assignments/    // From Schoology API  
  grades/         // From Schoology API
  unofficial_grades/  // Added by users, but shared
  sync_metadata/  // Last sync time, cache status

// USER-LEVEL (Personal to each user)
/users/{userId}/
  preferences/    // Dark mode, default view, etc.
  hidden_items/   // Dismissed assignments
  flagged_items/  // Assignments needing help
  scenarios/      // "What If" saved scenarios
  time_overrides/ // Personal time estimates
  notifications/  // User-specific notification prefs
```

**Rationale:**
- ✅ Clear ownership - no ambiguity
- ✅ Efficient queries - don't fetch what you don't need
- ✅ Privacy-friendly - users control their preferences
- ✅ Scalable - user data doesn't bloat account data

**Consequences:**
- Positive: Clean data model
- Positive: Easy to explain to users
- Negative: Two queries for some views (account + user data)
- Negative: Need merge logic in UI

**Open Questions:**
- Q: What if parent wants to see child's hidden items?
- Q: Should sub-task completion be user-level or account-level?
- Q: How to handle conflicts (parent and student both edit)?

---

## TAD-004: Caching Strategy

**Date:** September 30, 2025  
**Status:** ✅ ACCEPTED (Current Implementation)

**Context:**  
Schoology API has rate limits. Need caching to prevent hitting limits and improve performance.

**Options:**
1. No caching - ❌ Slow, rate limit issues
2. Client-side only (localStorage) - ❌ Not shared across devices
3. **Firestore cache with TTL** - ✅ CURRENT
4. Redis/Memcached - ❌ Additional infrastructure

**Decision:** Firestore as cache with timestamp-based TTL

**Current Implementation:**
```javascript
// Check cache first
const cached = await getDoc(doc(db, `accounts/${accountId}/courses/cache`));
if (cached.exists() && !isExpired(cached.data().timestamp)) {
  return cached.data().courses;
}

// Cache miss - fetch from API
const fresh = await fetchFromSchoologyAPI();
await setDoc(doc(db, `accounts/${accountId}/courses/cache`), {
  courses: fresh,
  timestamp: Date.now(),
  source: 'api'
});
return fresh;
```

**TTL Values:**
- Courses: 1 hour (rarely change mid-semester)
- Assignments: 15 minutes (updated frequently)
- Grades: 15 minutes (parents check often)
- User profile: 24 hours (static)

**Consequences:**
- Positive: Fast load times
- Positive: Respects API limits
- Positive: Works offline (stale data better than nothing)
- Negative: Users might see slightly outdated data
- Negative: Firestore read costs

**Evidence:** "Live Verified" badge system shows cache status to users

---

## TAD-005: Mobile Navigation Pattern

**Date:** September 30, 2025  
**Status:** 🟡 PROPOSED

**Context:**  
Mobile-first design requires intuitive navigation. Need to choose pattern.

**Options:**
1. Hamburger menu - ❌ Requires tap to open, bad UX on mobile
2. **Bottom tab bar** - ✅ Best for mobile
3. Top tabs - ❌ Hard to reach on large phones
4. Drawer navigation - ❌ Hidden navigation anti-pattern

**Decision:** Bottom tab bar with 5 primary tabs

**Proposed Tabs:**
1. 🏠 Dashboard - Overview and widgets
2. ✓ Planner - Task list and sub-tasks
3. 📅 Calendar - Integrated schedule
4. 📊 Grades - Gradebook and "What If"
5. ⚙️ Settings - Profile, preferences, goals

**Rationale:**
- ✅ Thumb-friendly on all phone sizes
- ✅ Always visible - no hidden navigation
- ✅ Industry standard (iOS/Android apps)
- ✅ Quick context switching
- ❌ Limited to 5 main sections (but that's good - forces focus)

**Consequences:**
- Positive: Intuitive, mobile-optimized
- Positive: Fast navigation (one tap)
- Negative: 5-tab limit (forces prioritization)
- Negative: Desktop layout needs different treatment

**Implementation:**
- Use shadcn/ui Tabs component
- Position: `fixed bottom-0` on mobile
- Desktop: Side navigation or top tabs

---

## TAD-006: State Management Strategy

**Date:** September 30, 2025  
**Status:** 🟡 PROPOSED

**Context:**  
Need to manage complex state (user data, preferences, cache status) across components.

**Options:**
1. React Context only - Simple but can cause re-renders
2. Redux - Powerful but heavy, lots of boilerplate
3. Zustand - Lightweight, modern
4. **React Context + SWR** - Use existing tools
5. TanStack Query - Similar to SWR, more features

**Decision:** TBD - Leaning toward React Context + SWR

**Rationale (if we choose Context + SWR):**
- ✅ SWR already handles data fetching/caching
- ✅ React Context for global state (user, preferences)
- ✅ Minimal new dependencies
- ✅ Well-documented, widely used
- ❌ May need optimization for large datasets

**Open Questions:**
- Q: How much client-side state do we really need?
- Q: Is current solution (props drilling) actually a problem yet?
- Q: Wait until we have performance issues before adding complexity?

**Recommendation:** Start simple (Context), refactor if needed.

---

## TAD-007: AI Integration Architecture

**Date:** September 30, 2025  
**Status:** 🟡 PROPOSED (Phase 6)

**Context:**  
Plan for conversational AI, time estimates, sub-task suggestions, etc.

**Options:**
1. **Firebase Genkit** - Google's AI orchestration framework
2. Direct Gemini API calls - Simpler but less features
3. LangChain - Feature-rich but complex
4. OpenAI GPT - Proven but expensive
5. Anthropic Claude - High quality, different pricing

**Decision:** Firebase Genkit + Gemini (for Phase 6)

**Rationale:**
- ✅ Integrated with Firebase ecosystem
- ✅ Deployment story simple
- ✅ Vertex AI integration (cost optimization)
- ✅ Built-in prompt management
- ✅ Observability and tracing
- ❌ Google-locked (but acceptable for this project)

**Architecture:**
```
User Query
    ↓
Next.js API Route (/api/ai/query)
    ↓
Firebase Genkit Flow
    ↓
├─→ Fetch Firestore context
├─→ Build prompt with user data
├─→ Call Gemini API
└─→ Return structured response
    ↓
UI renders response
```

**Consequences:**
- Positive: Powerful AI capabilities
- Positive: Well-supported by Google
- Negative: Vendor lock-in to Google
- Negative: Costs scale with usage

**Cost Estimates:**
- Gemini 2.0 Flash: ~$0.0001 per query
- 1000 daily active users × 5 queries/day = $0.50/day = $182.50/month
- Acceptable for initial launch

---

## TAD-008: Teacher LTI Integration Approach

**Date:** September 30, 2025  
**Status:** 🟡 PROPOSED (Phase 7)

**Context:**  
Teachers need to provide time estimates and sub-task templates without leaving Schoology.

**Options:**
1. **LTI (Learning Tools Interoperability)** - Industry standard
2. Chrome extension - ❌ Teachers must install
3. Separate teacher app - ❌ Workflow disruption
4. Email/form submission - ❌ Not integrated

**Decision:** LTI 1.3 (latest standard)

**How LTI Works:**
1. Register our app with Schoology as "Resource App"
2. District admin installs for teachers
3. Teacher sees our app link in Schoology UI
4. Click opens our iframe with secure context
5. We receive teacher_id, course_id, assignment_id
6. Show focused UI for adding time estimates
7. Save to Firestore (account-level)
8. Close iframe, return to Schoology

**Technical Implementation:**
- Create `/api/lti/launch` endpoint
- Validate LTI 1.3 JWT signature
- Render teacher-specific UI in iframe
- Store data in `/accounts/{accountId}/teacher_data/`

**Consequences:**
- Positive: Minimal teacher friction
- Positive: Secure, standard protocol
- Positive: District can control access
- Negative: Requires district admin approval
- Negative: Testing requires Schoology sandbox

**Open Questions:**
- Q: How many districts will approve LTI apps?
- Q: Can we launch without LTI (Phase 1-6 work fine)?
- Q: Alternative for districts that don't allow LTI?

---

## TAD-009: Third-Party Calendar Integration

**Date:** September 30, 2025  
**Status:** 🟡 PROPOSED (Phase 4)

**Context:**  
Need to show academic + personal events in unified calendar view.

**Options:**
1. Google Calendar API only - ❌ Excludes iOS users
2. **Google + Apple iCal** - ✅ Covers 95%+ of users
3. Microsoft Outlook too - Maybe later
4. CalDAV (universal) - ❌ Complex, hard to auth

**Decision:** Google Calendar + Apple iCal for Phase 4

**Technical Approach:**

**Google Calendar:**
- OAuth 2.0 authentication
- Calendar API v3
- Read-only access
- Fetch events for date range
- Cache in Firestore

**Apple iCal (.ics subscription):**
- User provides calendar subscribe URL
- We parse .ics format
- Refresh every 15 minutes
- Store events in Firestore

**Unified Data Model:**
```typescript
interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  source: 'schoology' | 'google' | 'ical';
  type: 'assignment' | 'test' | 'personal' | 'sports' | 'family';
  color: string;
}
```

**Consequences:**
- Positive: Covers most users
- Positive: Standard OAuth flows
- Negative: Two separate integrations
- Negative: iCal less reliable (no push updates)

---

## TAD-010: Data Sync Strategy

**Date:** September 30, 2025  
**Status:** 🟡 PROPOSED

**Context:**  
How often to sync data from Schoology? Real-time vs polling vs on-demand?

**Options:**
1. Real-time webhooks - ❌ Schoology doesn't support
2. **Polling with smart TTL** - ✅ Current approach
3. On-demand only (user pull-to-refresh) - ❌ Users forget
4. Background sync (service worker) - Future enhancement

**Decision:** Intelligent polling with user-triggered refresh

**Implementation:**
```javascript
// TTL-based caching (current)
if (cacheAge < TTL) {
  return cached;
}

// User pull-to-refresh forces fresh
if (userTriggered) {
  const fresh = await fetchFromAPI();
  updateCache(fresh);
  return fresh;
}

// Automatic background refresh (future)
if (pageVisible && cacheAge > TTL/2) {
  refreshInBackground(); // Don't block UI
}
```

**TTL Values by Data Type:**
```
User Profile: 24 hours (rarely changes)
Courses: 1 hour (stable during semester)
Assignments: 15 minutes (teachers add frequently)
Grades: 15 minutes (parents check often)
Announcements: 10 minutes (timely information)
```

**Consequences:**
- Positive: Good balance of freshness and performance
- Positive: Respect API rate limits
- Positive: Works offline with stale data
- Negative: Users might see outdated data briefly
- Negative: Need clear "last updated" timestamps

**Future Enhancement:**
- Service worker for background sync
- WebSocket connection to our server
- Server polls Schoology, pushes to clients

---

## TAD-011: State Management for User/Account Data

**Date:** September 30, 2025  
**Status:** 🔴 NEEDS DECISION

**Context:**  
Complex state requirements emerging: user preferences, hidden items, scenarios, account data merging.

**Options:**
1. **React Context + SWR/TanStack Query**
   - Pros: Minimal deps, well-supported
   - Cons: Manual optimization needed
   
2. **Zustand**
   - Pros: Lightweight (2kb), simple API, great DevTools
   - Cons: Another library to learn

3. **Redux Toolkit**
   - Pros: Powerful, great DevTools, lots of features
   - Cons: Heavy, boilerplate, overkill for now

4. **Jotai/Recoil**
   - Pros: Atomic state, fine-grained updates
   - Cons: Less common, smaller ecosystem

**Recommendation:** Start with React Context + SWR, refactor to Zustand if performance suffers

**Rationale:**
- Start simple (YAGNI principle)
- SWR already handles data fetching beautifully
- Context fine for global state (current user, theme)
- Zustand easy to add later (minimal migration)

**When to Refactor:**
- If Context causes excessive re-renders
- If state logic becomes complex
- If DevTools debugging becomes difficult
- If team feedback suggests pain points

**Code Example (Current):**
```typescript
// Context for global state
const UserContext = React.createContext();

// SWR for data fetching
const { data, error } = useSWR('/api/schoology/courses', fetcher);
```

**Code Example (Future Zustand):**
```typescript
// If we need Zustand later
const useStore = create((set) => ({
  user: null,
  preferences: {},
  setUser: (user) => set({ user }),
  updatePreference: (key, value) => set((state) => ({
    preferences: { ...state.preferences, [key]: value }
  })),
}));
```

---

## TAD-012: Mobile-First CSS Strategy

**Date:** September 30, 2025  
**Status:** ✅ ACCEPTED

**Context:**  
Need responsive design approach. Mobile-first vs desktop-first?

**Decision:** Mobile-first with Tailwind CSS

**Approach:**
```css
/* Mobile default (no prefix) */
.button { padding: 0.5rem; }

/* Tablet and up */
.button { @apply md:padding-1rem; }

/* Desktop */
.button { @apply lg:padding-2rem; }
```

**Breakpoints:**
- sm: 640px (large phones)
- md: 768px (tablets)
- lg: 1024px (laptops)
- xl: 1280px (desktops)

**Rationale:**
- ✅ Majority of usage expected on mobile
- ✅ Forces focus on essentials
- ✅ Progressive enhancement
- ✅ Better performance (smaller mobile bundles)

**Consequences:**
- Positive: Mobile UX will be excellent
- Positive: Less code (start minimal)
- Negative: Desktop might feel sparse initially

---

## TAD-013: Error Handling & Observability

**Date:** September 30, 2025  
**Status:** 🟡 PROPOSED

**Context:**  
Need to track errors, performance, and user behavior for debugging and optimization.

**Options:**
1. Console.log only - ❌ Not production-ready
2. **Firebase Crashlytics** - ✅ Integrated
3. Sentry - Excellent but costs money
4. Custom logging - Time-consuming

**Decision:** Firebase Crashlytics + Custom error boundaries

**Implementation:**
```typescript
// Error boundary for each major component
<ErrorBoundary fallback={<ErrorUI />}>
  <Dashboard />
</ErrorBoundary>

// Log to Crashlytics
logError({
  error: e,
  context: 'DashboardWidget',
  userId: currentUser.id,
  metadata: { widget: 'assignments' }
});
```

**What to Track:**
- All API errors
- Component crashes
- Failed authentication attempts
- Cache misses
- Slow queries (>2s)

**Privacy:**
- No PII in logs
- User IDs only (not names/emails)
- Aggregate metrics only

---

## TAD-014: Deployment & Hosting Strategy

**Date:** September 30, 2025  
**Status:** 🟡 PROPOSED

**Context:**  
Need to deploy Next.js app with Firebase backend. Multiple options available.

**Options:**
1. **Vercel** - Next.js creators, optimized
2. **Firebase Hosting** - Integrated ecosystem
3. Cloud Run - More control, more config
4. Netlify - Good but not Next.js-optimized

**Decision:** TBD - Leaning toward Firebase Hosting

**Firebase Hosting Approach:**
```json
// firebase.json
{
  "hosting": {
    "public": ".next",
    "rewrites": [{ "source": "**", "destination": "/index.html" }]
  }
}
```

**Deployment Flow:**
```bash
npm run build
firebase deploy --only hosting
```

**Rationale for Firebase:**
- ✅ Integrated with Firestore
- ✅ Same console for everything
- ✅ Good performance (global CDN)
- ✅ Reasonable pricing
- ❌ Not as Next.js-optimized as Vercel
- ❌ Manual build step

**Rationale for Vercel:**
- ✅ Optimal Next.js performance (ISR, Edge)
- ✅ Zero-config deployment
- ✅ Preview deployments
- ❌ Separate from Firebase
- ❌ Additional vendor

**Recommendation:** Start with Firebase (ecosystem integration), migrate to Vercel if performance demands

---

## TAD-015: Testing Strategy Architecture

**Date:** September 30, 2025  
**Status:** ✅ ACCEPTED

**Decision:** Three-tier testing pyramid

**Tier 1: E2E Tests (Playwright + Persistent Auth)**
- Purpose: Validate user journeys
- Frequency: Every deployment
- Coverage: 7 tests currently, targeting 11+
- Run: `bash scripts/test-all.sh`

**Tier 2: Integration Tests (Jest + Firebase Emulators)**
- Purpose: Test API routes and Firebase interaction
- Frequency: Every commit
- Coverage: All API routes
- Run: `npm run test:emu`

**Tier 3: Unit Tests (Jest)**
- Purpose: Test utilities, transformations, calculations
- Frequency: Every commit
- Coverage: 80%+ target
- Run: `npm run test`

**Rationale:**
- ✅ E2E catches regression in user flows
- ✅ Integration tests catch API issues
- ✅ Unit tests catch logic bugs
- ✅ Fast feedback loop (unit → integration → E2E)

**Evidence:** Successfully implemented E2E tier with persistent auth

---

## 📝 Decisions Needed (For Product Owner Review)

### Decision DN-001: Grading Scale Complexity

**Question:** How to handle complex grading scenarios?

**Scenarios:**
1. Weighted categories (Tests 40%, Homework 30%, Participation 30%)
2. Extra credit assignments (can exceed 100%)
3. Dropped assignments (lowest quiz dropped)
4. Partial credit and rubrics

**Options:**
- Start simple: Only total points, no weighting
- Support weighted categories
- Full Schoology parity (all edge cases)

**Recommendation:** Start simple (total points only), add weighted categories in Phase 2

**Your Input Needed:**
- How common are weighted categories in your target schools?
- Can we launch without this?
- Is this a deal-breaker for users?

---

### Decision DN-002: Offline Mode Priority

**Question:** When to implement offline support?

**Options:**
- Phase 1: Service worker, cache-first strategy
- Phase 3-4: After core features solid
- Phase 7+: Nice-to-have only

**Trade-offs:**
- Early: Users can use on bad connections, but adds complexity
- Late: Simpler development, risk of users frustrated by connectivity

**Recommendation:** Phase 3-4 (middle ground)

**Your Input Needed:**
- Is offline mode critical for your target users?
- Rural areas with poor connectivity?
- Or mostly urban/suburban with good WiFi?

---

### Decision DN-003: Real-Time Updates

**Question:** Should data update in real-time when changes happen in Schoology?

**Options:**
1. Polling only (current) - Simple, works
2. WebSocket connection - Real-time, complex
3. Server-Sent Events - One-way push, simpler
4. Firebase Realtime Database - Managed, easy

**Use Case:**
- Teacher posts grade → Student sees immediately (no refresh)
- New assignment added → Appears in dashboard live

**Trade-offs:**
- Real-time: Better UX, higher infrastructure costs
- Polling: Simpler, slightly stale data (15min max)

**Recommendation:** Polling for Phase 1-2, consider real-time in Phase 5-6

**Your Input Needed:**
- How important is instant grade notification?
- Can users tolerate 15-minute delay?
- Does real-time justify complexity?

---

## 🔧 Refactoring Priorities (Phase 4)

**Before adding major features, we should refactor:**

### Refactor R-001: Remove Error Ignoring

**File:** `next.config.ts`
```typescript
// CURRENT (BAD):
typescript: { ignoreBuildErrors: true },
eslint: { ignoreDuringBuilds: true },

// TARGET (GOOD):
// Remove these lines, fix all errors
```

**Why:** Technical debt, may hide real issues

**Effort:** 2-4 hours
**Priority:** HIGH

---

### Refactor R-002: Data Transformation Layer

**Current:** Ad-hoc transformations in components and API routes

**Target:** Centralized transformation layer
```typescript
// src/lib/transforms/
- schoology-to-app.ts     // API → App data model
- grade-normalizer.ts     // Grade calculations
- assignment-enricher.ts  // Add metadata
```

**Why:** 
- Consistency across codebase
- Easier testing
- Single source of truth for data shapes

**Effort:** 4-6 hours
**Priority:** MEDIUM

---

### Refactor R-003: Component Organization

**Current:** Some components in `/components`, some in `/app`

**Target:** Clear component library
```
src/components/
  dashboard/        // Dashboard widgets
  grades/           // Grade-related components
  assignments/      // Assignment components
  layout/           // Nav, header, footer
  ui/               // shadcn components
  shared/           // Reusable utilities
```

**Why:**
- Easier to find components
- Clear ownership
- Better for testing

**Effort:** 2-3 hours
**Priority:** LOW (works fine as-is)

---

### Refactor R-004: API Route Patterns

**Current:** Some validation, some not. Inconsistent error handling.

**Target:** Standardized API route pattern
```typescript
// Pattern for all routes
export async function GET(request: Request) {
  try {
    // 1. Validate auth
    const user = await validateAuth(request);
    if (!user) return unauthorized();
    
    // 2. Parse and validate input
    const params = validateParams(request);
    
    // 3. Fetch data (with caching)
    const data = await fetchWithCache(params);
    
    // 4. Transform for client
    const transformed = transformData(data);
    
    // 5. Return success
    return json(transformed);
    
  } catch (error) {
    // 6. Log and return error
    logError(error);
    return jsonError(error);
  }
}
```

**Why:**
- Consistent behavior
- Easier debugging
- Better error messages
- Centralized logging

**Effort:** 6-8 hours
**Priority:** MEDIUM

---

## 🎯 Immediate Next Steps (This Week)

**Priority 1: Seed Data Expansion**
- Add 20+ assignments to Tazio Mock
- Add Carter Mock with different profile
- Include all assignment types
- Add realistic due dates
- Add grading scales

**Priority 2: Dashboard Widget Implementation**
- Upcoming Assignments widget
- Grades At-a-Glance widget
- Basic layout with real data

**Priority 3: Grade Normalization**
- Fetch grading scales
- Calculate letter grades
- Display all three formats

**Priority 4: Run Full E2E Test Suite**
- Verify all 7 tests pass
- Fix any issues found
- Add screenshots to documentation

---

## 📚 Related Documents

- **Strategic Roadmap:** 18-24 month vision
- **Product Requirements:** Detailed feature specs
- **Current Status:** Weekly progress
- **Architecture:** System design overview

---

**All decisions marked 🟡 PROPOSED require product owner input before proceeding!**

---

## TAD-016: Offline Strategy

**Date:** October 4, 2025
**Status:** ✅ ACCEPTED

**Context:**
A strategic decision was needed on whether to build a full "offline-first" application or focus on performance caching, as proposed by different AI advisors.

**Options:**
1.  **Full Offline-First (Gemini's Proposal):** Implement a service worker and local-first architecture (e.g., using IndexedDB) from Phase 1. This would allow users to view all cached data and edit/create data offline, which would sync upon reconnection.
2.  **Performance Caching Only (Ryan's Decision):** Do not support full offline capabilities. Instead, use caching (both client-side with SWR and server-side with Firestore) to enhance performance, reduce API calls, and provide a read-only view of stale data if the user is momentarily disconnected.
   
**Decision:** Option 2: Performance Caching Only. Full offline support is not an MVP requirement.
   
**Rationale:**
- ✅ **User Context:** The primary users (students and parents) are not expected to be in extended offline environments where they would need to input or modify data.
- ✅ **Complexity vs. Value:** The engineering complexity of building a full offline-syncing model is very high and is not justified by the user need for the MVP.
- ✅ **Performance is the Real Goal:** The core goals of reducing cloud costs and ensuring a fast UI can be achieved through a multi-layered caching strategy without the overhead of offline-first architecture.
- ✅ **Read-Only View:** The app can still render cached data if a user opens it without a connection, providing a graceful degradation of service without the complexity of managing offline mutations.
   
**Consequences:**
- Positive: Greatly simplifies the initial architecture and reduces development time.
- Positive: Avoids a complex class of bugs related to data synchronization and conflict resolution.
- Negative: The app will not be fully functional without an internet connection, which was noted as a potential key differentiator. This is an accepted trade-off.
- Neutral: The architecture does not preclude adding more advanced offline capabilities post-MVP if user feedback demonstrates a strong need.
   
---

## Development Workflow

### Local Environment

```

```
