# Current Tasks - Modern Teaching

**Last Updated:** October 5, 2025  
**Purpose:** Atomic action items for current development session  
**Use:** Start every new AI chat by reading this file

---

## 🎯 IMMEDIATE ACTIONS (Today)

### 1. Implement Firestore Caching Layer 🟡
**Priority:** 🟡 HIGH - Performance & Cost Optimization

**Problem:** Courses and grades APIs hit Schoology on every page load
- No caching implemented
- Unnecessary API calls
- Slower page loads
- No offline support

**Solution:** Implement TTL-based caching as documented in ARCHITECTURE.md
- Cache courses and grades in Firestore
- 60-second TTL for development
- Cache-first, then check staleness, then API
- Update `/api/schoology/courses/route.ts` and `/api/schoology/grades/route.ts`

**Success Criteria:**
- Page loads use cached data when fresh
- Schoology API only called when cache is stale
- Offline access works with cached data

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

## 📅 THIS WEEK (Oct 5-10)

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

## 🔮 NEXT WEEK (Oct 10-17)

### 6. Dashboard Widgets (Per MVP-PLAN Week 3-4)
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

### HIGH Priority (Weeks 3-6)
- [ ] Assignments cross-course view with filters
- [ ] Grades overview page
- [ ] Grade normalization (points → percentages → letters)
- [ ] School year picker (schema support, UI post-MVP)

### MEDIUM Priority (Weeks 7-10)
- [ ] AI chat interface (text)
- [ ] AI chat (voice input)
- [ ] Settings page
- [ ] School information page

### LOW Priority (Weeks 11-12)
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


