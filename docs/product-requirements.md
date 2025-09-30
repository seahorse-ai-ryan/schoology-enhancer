# Product Requirements - Modern Teaching

**Last Updated:** September 30, 2025  
**Current Version:** v0.1 (Hello World) ✅ Complete  
**Next Version:** v0.2 (Smart Caching & Core Features)

---

## Status Update

### ✅ v0.1 Complete (September 30, 2025)

**Achieved:**
- OAuth 1.0a authentication with Schoology
- Parent-child account associations and switching
- Real-time course data fetching from Schoology API
- Firestore caching for offline support
- Mock student data pipeline (CSV bulk import)
- Static development domain (modernteaching.ngrok.dev)

**Demo:** Parent logs in → selects child → dashboard shows child's real Schoology courses

---

## Problem Statement

The official Schoology application makes it difficult for students, parents, and teachers to get a clear, consolidated view of upcoming work. Key issues:

- Excessive navigation required to build mental map of workload
- Difficulty tracking overdue assignments, retakes, and current work simultaneously
- Absence of tools for planning or breaking down large assignments
- No offline access to course data
- Mobile experience suboptimal

**Modern Teaching solves this** with a clean, fast, offline-capable dashboard that prioritizes actionable information.

---

## Product Roadmap

### v0.2: Smart Caching & Core Features (Next - 2-3 weeks)

**Objective:** Reduce API load, improve performance, display assignments and announcements

**Features:**

1. **TTL-Based Cache Staleness**
   - Check cache age before hitting Schoology API
   - Configurable TTL: 1min (dev), 10min (test), 1hr (prod)
   - Display staleness indicator ("Cached - 2 hours ago")

2. **Assignments Display**
   - Create `/api/schoology/assignments` endpoint
   - Fetch assignments for user's enrolled sections
   - Display on dashboard with due dates
   - Sort by urgency (overdue, due soon, future)
   - Cache with same TTL strategy

3. **Announcements Display**
   - Create `/api/schoology/announcements` endpoint
   - Fetch recent announcements from courses
   - Display on dashboard
   - Mark as read functionality

4. **Manual Refresh**
   - "Refresh" button on dashboard
   - Force-fetch fresh data from API
   - Update cache
   - Loading indicator

**Success Metrics:**
- API calls reduced by 80%+ (due to caching)
- Dashboard loads in <500ms from cache
- Fresh data fetched within TTL window
- Assignments visible with clear due dates

---

### v0.3: Week Ahead View (4-6 weeks)

**Objective:** Unified view of all upcoming work across courses

**Features:**

1. **Week Ahead Dashboard**
   - Aggregate all assignments, tests, events from all courses
   - Single timeline view (7 days forward)
   - Color-coded by course
   - Filter by type (assignment, test, event)

2. **Overdue & Missing Tracking**
   - Visual flags for overdue items
   - "Missing" assignment detection
   - Priority indicators

3. **Calendar Integration**
   - Month/week view toggle
   - Click to see details
   - Export to iCal (future)

**Success Metrics:**
- Users can plan their week in <90 seconds
- Reduced missing assignments for active users

---

### v0.4: Grades & Performance (6-8 weeks)

**Objective:** Track academic performance across courses

**Features:**

1. **Grades Display**
   - Current grade per course
   - Grade breakdown by category (tests, homework, projects)
   - Grade trend over time

2. **Performance Analytics**
   - Course difficulty indicators
   - Time spent per course (estimated from assignments)
   - Comparative performance (if data available)

3. **Progress Tracking**
   - Completion percentage per course
   - Upcoming vs. completed assignments
   - Streak tracking for motivation

---

### v1.0: Production Ready & Proactive Planner (3-4 months)

**Objective:** Launch to real users with planning features

**Features:**

1. **Custom Task Breakdown**
   - Create sub-tasks for large assignments
   - Set personal deadlines
   - Track progress on complex projects

2. **Smart Notifications**
   - Deadline reminders
   - New announcement alerts
   - Grade posted notifications
   - Custom reminder timing

3. **Production Deployment**
   - Deploy to modernteaching.com
   - SSL certificate
   - Production Firebase project
   - Error monitoring (Sentry or Firebase Crashlytics)
   - Performance monitoring

4. **Real User Accounts**
   - Move beyond mock data
   - Support real schools and districts
   - User onboarding flow

5. **Mobile Optimization**
   - Progressive Web App (PWA)
   - Offline-first architecture
   - Touch-friendly UI
   - Push notifications

**Success Metrics:**
- App loads in <2 seconds
- 99.9% uptime
- <100ms API response time (cached)
- Positive user feedback

---

### v2.0: AI-Powered Insights (6-12 months)

**Objective:** Leverage LLM capabilities for intelligent recommendations

**Features:**

1. **LLM Embeddings**
   - Generate embeddings for all course content
   - Semantic search across assignments
   - Related content discovery

2. **AI Recommendations**
   - Study time suggestions based on assignment complexity
   - Resource recommendations
   - Personalized deadline planning

3. **RAG-Powered Q&A**
   - Ask questions about course content
   - Get answers from cached materials
   - Citation of source materials

4. **Predictive Analytics**
   - Grade predictions based on trends
   - Risk indicators for struggling courses
   - Success pattern recognition

**Technical Foundation:**
- Data models already LLM-ready (embedding fields, semantic keywords)
- RAG-optimized relationships in place
- Protocol buffer compatible interfaces

---

## Technical Architecture

**See `docs/ARCHITECTURE.md` for complete details.**

**Current Tech Stack:**
- Frontend: Next.js 14, React, TypeScript, Tailwind CSS
- Backend: Firebase Functions, Next.js API Routes
- Database: Firestore (caching & user data)
- Auth: Schoology OAuth 1.0a
- Testing: Chrome DevTools MCP, Jest, Playwright
- Deploy: Firebase Hosting + Functions

**Development:**
- Primary: Cursor on Mac (local development)
- Secondary: Firebase Studio (cloud deployment)
- Static Domain: modernteaching.ngrok.dev

---

## Security & Privacy

**Current:**
- OAuth tokens securely stored in Firestore
- Session cookies HttpOnly
- Admin credentials in environment variables (not in code)
- No user data in Git

**Future:**
- Google Secret Manager for production credentials
- Rate limiting on API endpoints
- CSRF protection
- Content Security Policy (CSP)

---

## Success Metrics (Overall)

**v0.1 (Complete):**
- ✅ E2E flow working
- ✅ Real Schoology data displayed

**v0.2 (Next):**
- 80%+ API call reduction via caching
- <500ms dashboard load from cache
- Assignments visible and sortable

**v1.0 (Future):**
- 99.9% uptime
- <2 second app load time
- Positive user feedback
- Real user adoption

---

## Out of Scope (For Now)

- Multi-school support (future v1.0+)
- Teacher-specific features (focus on students/parents)
- Direct Schoology data modification (read-only for now)
- Mobile native apps (PWA sufficient)
- Integrations with other LMS platforms

---

**For current implementation status, see `docs/USER-JOURNEYS.md`  
For active development work, see `docs/CURRENT-STATUS.md`**