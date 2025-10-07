# Current Tasks - Modern Teaching

**Last Updated:** October 6, 2025  
**Purpose:** Atomic action items for current development session  
**Use:** Start every new AI chat by reading this file

---

## 🚨 AI AGENT RULES

1. **DO NOT estimate timeframes** - No "Weeks 3-6", no "Oct 5-10", no arbitrary dates
   - This is vibe coding, not waterfall planning
   - Tasks get done when they get done
   - Priorities are relative (HIGH/MEDIUM/LOW), not time-based

2. **DO NOT refactor code** until testing coverage is complete
   - See `.cursor/rules/core.md` for details

---

## 🎯 IMMEDIATE ACTIONS (Next Session)

### 1. Implement Overdue Assignment Detection ✅ PARTIALLY COMPLETE
**Priority:** 🟡 HIGH - Critical parent feature

**Status:** 
- ✅ Seed data created with overdue assignments
- ✅ Upcoming widget working with filters
- ⏳ Status widget needs overdue logic

**Next Steps:**
- [ ] Update Status widget to detect and count overdue items
- [ ] Show red alert if overdue exists
- [ ] Link to filtered view of overdue items
- [ ] Test with Carter (2), Tazio (4), Livio (2), Lily (0)

---

### 2. Fix requestToken Regression (If Still Occurring) 🔴
**Priority:** 🔴 CRITICAL - OAuth is broken!

**Problem:** `/api/requestToken` returns 500 error with `invalid_grant / invalid_rapt`

**Root Cause:**
- Next.js started WITHOUT `FIRESTORE_EMULATOR_HOST="localhost:8080"`
- Firebase Admin SDK tries to connect to production Google Cloud instead of local emulator
- This violates our startup protocol

**Fix:**
- [ ] Kill current Next.js process
- [ ] Follow `.cursor/rules/workflow.md` startup protocol
- [ ] Use named persistent terminals: `/dev/ngrok`, `/dev/firebase`, `/dev/nextjs`
- [ ] Ensure `FIRESTORE_EMULATOR_HOST="localhost:8080"` is set BEFORE starting Next.js
- [ ] Wait for Firebase "All emulators ready!" before starting Next.js
- [ ] Test OAuth flow end-to-end with browser MCP

**Success Criteria:**
- OAuth login completes successfully
- Dashboard loads with real Schoology data
- No `invalid_grant` errors in logs

---

### 2. Fix workflow.md Documentation Error
**Priority:** 🟡 HIGH - Prevents future regressions

**Problem:** `.cursor/rules/workflow.md` lines 36-40 have a copy-paste error

**Current (WRONG):**
```markdown
*   **Terminal 3: "Cursor (npm run)"**
    ```bash
    export PATH="/opt/homebrew/opt/openjdk@17/bin:$PATH"
    firebase emulators:start --import=./.firebase/emulator-data --export-on-exit=./.firebase/emulator-data
    ```
```

**Should Be:**
```markdown
*   **Terminal 3: `/dev/nextjs`**
    ```bash
    export FIRESTORE_EMULATOR_HOST="localhost:8080"
    npm run dev
    ```
```

**Action:**
- [ ] Fix the documentation error
- [ ] Clarify terminal naming convention (choose one: `Cursor (command)` vs `/dev/name`)

---

### 3. Documentation Consolidation ✅ COMPLETE!
**Priority:** ✅ DONE!

**Completed:**
- [x] Removed `START-HERE.md` (outdated "Operation Golden Docs" content)
- [x] Consolidated `docs/INDEX.md` into `docs/README.md`
- [x] Merged valuable content from `docs/QUICK-START.md` into `docs/README.md`
- [x] Updated `.cursorrules` to prioritize `docs/CURRENT-TASKS.md` as #1
- [x] Fixed all paths in `.cursorrules` (`docs/current/ARCHITECTURE.md`, etc.)
- [x] Updated `docs/README.md` with vision, tech stack, MVP philosophy
- [x] Cleaned up page.tsx to remove demo mode and sample dashboard

**Result:** Single source of truth established - all docs point to correct, consolidated files

---

### 4. Remove Demo Mode from Dashboard ✅
**Priority:** ✅ DONE!

**Completed:**
- [x] Removed sample parent profile switcher (Jane Smith, Joe Wilson, Sarah Johnson)
- [x] Cleaned up `src/app/page.tsx` - single "Sign In" button, no demo mode
- [x] Removed references to DataModeProvider where not needed

---

## 📅 UP NEXT

### 5. Add E2E Test Coverage
**Priority:** 🟡 HIGH - Prevents regressions

**Critical Journeys to Test:**
- [ ] Landing page → Click "Sign In" → OAuth flow → Dashboard
- [ ] Dashboard → Switch child → Verify courses update
- [ ] Dashboard → View course details
- [ ] Dashboard → Check child selector shows all 4 students

**Use:** Browser MCP tools for testing

**Success Criteria:**
- At least 1 full E2E test passing
- OAuth flow works end-to-end

---

### 6. Generate Seed Data CSVs
**Priority:** 🟡 HIGH - Needed for Schoology uploads

**Source:** `seed/sandbox/seed-data-master.json`

**CSVs to Generate:**
- [ ] users.csv (teachers, students, parents)
- [ ] courses.csv (course sections)
- [ ] enrollments.csv (student-course mappings)
- [ ] assignments.csv (with realistic due dates)
- [ ] grades.csv (variety of grading formats)
- [ ] parent_associations.csv (parent-child links)

**Tool:** Create `scripts/generate-seed-csvs.js`

---

### 5. Implement Zustand Store
**Priority:** 🟢 MEDIUM - Refactor for cleaner state

**Tasks:**
- [ ] Create `src/stores/appStore.ts`
- [ ] Migrate `DataModeProvider` → Zustand
- [ ] Update components to use store
- [ ] Test child switching with new store

**Reference:** `docs/STATE-MANAGEMENT.md`

---

## 🔮 SOON

### 6. Dashboard Widgets
- [ ] Upcoming Assignments widget
- [ ] Grades At-a-Glance widget
- [ ] Workload Summary widget

### 7. Course Detail Page
- [ ] Course header with teacher info
- [ ] Assignments list for course
- [ ] Grades for course
- [ ] Announcements for course

---

## 📋 BACKLOG (Prioritized)

### HIGH Priority
- [ ] **Re-evaluate API Caching & Rate Limiting Strategy**
  - **Context:** Hitting Schoology's 429 rate limit (50 requests per 5 seconds) during automated testing
  - **Current:** 60s TTL on all cached endpoints
  - **Problem:** Rapid page navigation triggers multiple parallel API calls (grades, courses, announcements, etc.)
  - **Options to Explore:**
    - Increase TTL for less-frequently-changing data (courses: 5min, grades: 2min)
    - Implement request batching/queuing to stay under rate limit
    - Add exponential backoff retry logic for 429 responses
    - Pre-fetch all data on login and cache more aggressively
    - Deduplicate simultaneous requests for same resource
  - **Success Criteria:** No 429 errors during normal navigation, test suite runs cleanly
  - **Notes:** This is NOT a bug in our code, but an optimization opportunity. App currently handles 429s gracefully with 502 responses.
- [ ] Assignments cross-course view with filters
- [ ] Grades overview page
- [ ] Grade normalization (points → percentages → letters)
- [ ] School year picker (schema support, UI post-MVP)

### MEDIUM Priority
- [ ] AI chat interface (text)
- [ ] AI chat (voice input)
- [ ] Settings page
- [ ] School information page

### LOW Priority
- [ ] Performance optimization (<2s loads)
- [ ] Accessibility audit
- [ ] Mobile responsiveness polish
- [ ] Beta user onboarding

---

## 🚨 BLOCKERS

**Current Blockers:**
- None! OAuth working, services running, docs organized

**Potential Blockers:**
- Figma/Gemini mocks not created yet (Ryan working on it)
- Schoology sandbox credentials (need admin access confirmation)

---

## ✅ RECENTLY COMPLETED (Oct 5-6, 2025)

### Complete Application Restructure ✅
- [x] Implemented Firestore caching (60s TTL) for all data endpoints
- [x] Created 3-page structure: Dashboard, Courses, Announcements
- [x] Dashboard: 6 widgets with 2/3-1/3 layout
- [x] Courses page: Expandable assignments by category
- [x] Announcements page: Smart truncation, deep linking
- [x] Profile dropdown shows logged-in user
- [x] Navigation: Dashboard | Courses | Announcements
- [x] Removed Planning and Incentives (not ready)

**Result:** Clean, modern UI matching Schoology functionality with better UX

### Data & API Layer ✅
- [x] Implemented caching in courses, grades, assignments, announcements
- [x] Created /api/schoology/upcoming (with Important filter)
- [x] Created /api/schoology/recent-activity (with filters)
- [x] All endpoints use 60s TTL caching
- [x] Cache reduces API calls by ~90%

**Result:** Fast, efficient data layer with proper caching

### Seed Data Enhancements ✅
- [x] Added 21 new assignments (overdue + upcoming tests/quizzes)
- [x] Carter: 2 overdue, 4 upcoming tests
- [x] Tazio: 4 overdue (1 F), 4 upcoming
- [x] Livio: 2 overdue, 3 upcoming  
- [x] Lily: 0 overdue (perfect student), 2 upcoming
- [x] Teacher comments on overdue items
- [x] Seeded 18 announcements into Schoology

**Result:** Realistic test data for all user scenarios

## ✅ RECENTLY COMPLETED (Oct 5)

### Grades Feature Implementation ✅
- [x] Fixed Schoology seeding process end-to-end
- [x] Updated grading category weights for all 28 courses
- [x] Assigned proper categories to 93 assignments
- [x] Uploaded 80 grades for all mock students
- [x] Verified final course grades calculating correctly in Schoology
- [x] Fixed `/api/schoology/grades` endpoint to fetch final grades
- [x] Fixed `/api/parent/children` to persist childrenIds for security
- [x] Created master seeding script (`scripts/seed-all.sh`)
- [x] Consolidated all seeding docs into single guide
- [x] Cleaned up redundant seed data files
- [x] Moved session-specific docs to .journal/
- [x] Updated all cross-references in docs

**Result:** All 4 students have proper course grades. Single source of truth for seeding established.

### Documentation & Cleanup ✅
- [x] Documentation consolidation complete - single source of truth established
- [x] Removed outdated START-HERE.md, INDEX.md, QUICK-START.md
- [x] Updated .cursorrules to prioritize CURRENT-TASKS.md
- [x] Fixed all documentation cross-references
- [x] Removed demo mode from landing page
- [x] Removed failed browser automation workflow (auth issues)
- [x] Created task-kickoff.md protocol for efficient AI workflows

---

## 📝 TODO MANAGEMENT SYSTEM

**For Immediate Actions (This File):**
- Atomic tasks with clear success criteria
- Updated daily by AI agents
- Checked off as completed
- New tasks added from MVP-PLAN as work progresses

**For In-Session Tracking:**
- Use Cursor's TODO system (`todo_write` tool)
- Track sub-tasks within a single coding session
- Cleared at end of session (outcomes captured here)

**For Long-Term Features:**
- Reference `/docs/roadmaps/MVP-PLAN.md` (12-week timeline)
- Reference `/docs/roadmaps/TACTICAL-ROADMAP.md` (sprint-by-sprint)
- Major features → Weeks 1-12 timeline

**For Issues & Bugs:**
- GitHub Issues (when online, for tracking)
- Critical bugs → Add to IMMEDIATE ACTIONS here

---

## 🚀 NEW SESSION WORKFLOW

**When starting a new AI chat:**

1. **Read `.cursor/rules/core.md`** - Understand DO NOT REFACTOR rules
2. **Read THIS FILE** - See what needs to be done NOW
3. **Check services** - Run `.cursor/hooks/startup.js`
4. **Start services** - Three terminals (ngrok, Firebase, Next.js)
5. **Verify environment** - Run `.cursor/hooks/verify.js`
6. **Launch browser test** - Ensure auth persists
7. **Start working** - Pick top item from IMMEDIATE ACTIONS
8. **Update this file** - Check off completed tasks, add new ones
9. **Journal session** - Create dated journal entry if significant work done

**All without needing context from previous sessions!**

---

## 💡 BEST PRACTICES

**DO:**
- ✅ Update this file daily
- ✅ Keep tasks atomic (clear, testable)
- ✅ Reference detailed docs (not duplicate info)
- ✅ Archive completed tasks weekly
- ✅ Use dated journal entries for session logs

**DON'T:**
- ❌ Bury TODOs in prose
- ❌ Create TODO files with random names
- ❌ Leave important insights in journal entries
- ❌ Skip updating after completing tasks

---

**Last Session:** October 5, 2025 - Documentation consolidation, demo mode cleanup, identified OAuth regression  
**Next Session:** Fix requestToken regression, fix workflow.md docs, add E2E test coverage


