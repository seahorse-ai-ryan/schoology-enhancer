# Documentation & Testing Refactor - Action Plan

**Created:** September 30, 2025  
**Status:** 📋 Ready to Execute  
**Goal:** Clean up documentation, ensure test coverage, prepare for safe refactoring

---

## Executive Summary

**Key Findings:**

- ✅ We're running in a Linux container (hostname: b84215616828)
- ✅ Have solid backend tests (Jest - 13 test files)
- ✅ Have E2E tests (Playwright - 1 file with comprehensive mock data tests)
- ⚠️ Documentation spread across 12+ files with duplication/outdated info
- ⚠️ Missing tests for Hello World milestone features (parent-child switching, live API)
- ⚠️ No systematic user journey documentation
- 🆕 Cursor now supports .cursor/rules/ multi-file structure
- 🆕 Chrome in container for Cursor Browser feature

**Impact:**

- Can't safely refactor without risking regressions in untested areas
- New developers (AI or human) get conflicting info from docs
- Container environment limits browser-based testing options

---

## Phased Execution Plan

### Phase 1: Documentation Consolidation (Day 1)

**Objective:** Single source of truth for all project information

#### 1.1 Create Archive

```bash
mkdir -p docs/archive
mv docs/LOG.md docs/archive/
mv docs/mistakes-and-learnings.md docs/archive/
mv docs/architecture-plan.md docs/archive/
mv docs/mock-sandbox-plan.md docs/archive/
```

#### 1.2 Create Modular AI Rules

Create `.cursor/rules/` structure:

**`.cursor/rules/core.md`** - Project identity

- Project name: Modern Teaching
- Current status: Hello World milestone achieved
- Key achievements
- Next priority: Smart caching + assignments/announcements

**`.cursor/rules/architecture.md`** - Technical architecture

- Data flow: UI → API → Schoology → Firestore cache
- Data models (SchoologyCourse, etc.)
- API endpoints table
- Caching strategy

**`.cursor/rules/testing.md`** - Testing guidelines

- Backend: Jest (`npm run test:emu`)
- E2E: Playwright (`npm run test:simple`) - note MSW issue if still relevant
- Test data strategy
- Coverage requirements

**`.cursor/rules/workflow.md`** - Development workflow

- Startup sequence (ngrok, firebase, npm)
- Terminal naming conventions
- Common issues and fixes
- Debugging approaches

**`.cursorrules`** - Minimal delegator

```markdown
# Cursor AI Rules for Modern Teaching

Read all files in `.cursor/rules/` for complete context:

- core.md - Project status and priorities
- architecture.md - Technical design
- testing.md - Testing strategy
- workflow.md - Development workflow

This modular structure keeps rules focused and maintainable.
```

#### 1.3 Update README.md

**New structure:**

```markdown
# Modern Teaching

Schoology enhancement with modern UI, offline support, and AI-ready data.

## Current Status

✅ Hello World milestone - OAuth, parent-child switching, live course data

## Features

[Current actual features only]

## Quick Start

[Accurate setup for local dev]

## Tech Stack

[Current stack]

## Documentation

- docs/ARCHITECTURE.md - Complete architecture
- docs/STARTUP.md - Development setup
- docs/TESTING.md - Testing guide
- docs/USER-JOURNEYS.md - All user flows
```

#### 1.4 Update/Create Key Docs

**docs/USER-JOURNEYS.md** - NEW

- Map every user flow with screenshots
- UI affordances documentation
- Error states and edge cases

**docs/TESTING.md** - NEW

- Current test infrastructure
- How to run tests
- How to add new tests
- Coverage requirements
- Browser testing options (container limitations)

**docs/API-REFERENCE.md** - NEW

- All internal API endpoints
- Request/response formats
- Authentication requirements
- Error codes

**docs/product-requirements.md** - UPDATE

- Remove completed Hello World goals
- Update with post-milestone roadmap
- v0.2: Smart Caching
- v0.3: Assignments & Announcements
- v1.0: Production ready

**ai-best-practices.md → .cursor/ai-workflow.md** - MOVE & UPDATE

- For human developers joining the project
- How to work with AI effectively on this codebase
- Project-specific vibe coding tips

**. idx/airules.md** - UPDATE or ARCHIVE

- If still using Firebase Studio: minimal file linking to .cursor/rules/
- If not: move to archive

**quick-reference.md** - DELETE or MERGE

- Audit useful content
- Merge into ARCHITECTURE.md
- Delete redundant parts

---

### Phase 2: Testing Coverage Audit (Day 2)

**Objective:** Map all user journeys and identify test gaps

#### 2.1 Document All User Journeys

Create comprehensive USER-JOURNEYS.md with:

**Journey 1: Unauthenticated Landing**

- Steps: Visit site → See login button → Click → Redirect to Schoology
- UI Elements: Login button, app name, hero section
- Expected State: No dashboard access
- Current Tests: ✅ Playwright oauth-flow.spec.ts

**Journey 2: OAuth Flow**

- Steps: Schoology auth → Approve → Callback → Store tokens → Redirect to dashboard
- UI Elements: OAuth screens, loading states
- Expected State: Tokens in Firestore, session cookie set
- Current Tests: ⚠️ Partial (no full E2E with real OAuth)

**Journey 3: Parent - View Own Profile**

- Steps: Login as parent → See own profile → No courses
- UI Elements: Profile card, "No courses" message
- Expected State: Profile data from Firestore, child_uids visible
- Current Tests: ❌ Missing

**Journey 4: Parent - Select Child**

- Steps: Parent login → Profile menu → See children → Click child → Dashboard updates
- UI Elements: Profile dropdown, child list, active child indicator
- Expected State: activeChildId set, child's courses displayed
- Current Tests: ❌ Missing

**Journey 5: Parent - Switch Between Children**

- Steps: Select Child A → View courses → Select Child B → View different courses
- UI Elements: Profile menu, child switcher
- Expected State: Correct data for each child
- Current Tests: ❌ Missing

**Journey 6: Parent - Return to Parent View**

- Steps: Child selected → Click "View as Parent" → See parent profile
- UI Elements: "View as Parent" button, profile menu
- Expected State: activeChildId cleared
- Current Tests: ❌ Missing

**Journey 7: Student - Direct Login**

- Steps: Student login → See own dashboard → Own courses
- UI Elements: Dashboard, course cards, no child switcher
- Expected State: Own courses, no parent features
- Current Tests: ❌ Missing

**Journey 8: Dashboard - Live Data Display**

- Steps: Login → Dashboard fetches from API → Shows courses with "Live" badge
- UI Elements: Course cards, teacher names, badges
- Expected State: Real data from Schoology API, cached to Firestore
- Current Tests: ❌ Missing

**Journey 9: Dashboard - Cached Data Fallback**

- Steps: API fails → Dashboard reads from cache → Shows courses with "Cached" badge
- UI Elements: Course cards, "Cached" badge
- Expected State: Stale but valid data from Firestore
- Current Tests: ❌ Missing

**Journey 10: Admin - User Management**

- Steps: Admin login → /admin → See user list → Download CSVs
- UI Elements: Admin page, user table, CSV buttons
- Expected State: Admin role required, full access
- Current Tests: ⚠️ Partial (admin-page.spec.tsx exists)

**Journey 11: Logout Flow**

- Steps: Click logout → Clear cookies → Redirect to landing
- UI Elements: Logout button
- Expected State: Session cleared, no access to dashboard
- Current Tests: ✅ logout-flow.spec.tsx exists

#### 2.2 Create Test Coverage Matrix

| Journey          | Backend Tests                         | E2E Tests             | Manual Tests | Status    |
| ---------------- | ------------------------------------- | --------------------- | ------------ | --------- |
| Landing Page     | N/A                                   | ✅ oauth-flow.spec.ts | ✅           | Complete  |
| OAuth Flow       | ✅ schoology-auth.integration.spec.ts | ⚠️ Partial            | ✅           | Needs E2E |
| Parent Profile   | ❌                                    | ❌                    | ✅           | Missing   |
| Select Child     | ❌                                    | ❌                    | ✅           | Missing   |
| Switch Children  | ❌                                    | ❌                    | ✅           | Missing   |
| Return to Parent | ❌                                    | ❌                    | ✅           | Missing   |
| Student Login    | ❌                                    | ❌                    | ⚠️           | Missing   |
| Live Data Fetch  | ❌                                    | ❌                    | ✅           | Missing   |
| Cached Fallback  | ❌                                    | ❌                    | ❌           | Missing   |
| Admin Features   | ✅ admin-page.spec.tsx                | ❌                    | ✅           | Needs E2E |
| Logout           | ✅ logout-flow.spec.tsx               | ❌                    | ✅           | Needs E2E |

**Critical Gaps:**

1. No tests for parent-child switching (core feature!)
2. No tests for live API fetching
3. No tests for cache fallback
4. No E2E tests for admin features

#### 2.3 Assess Testing Infrastructure

**Current Tools:**

- ✅ Jest: Working, 13 test files
- ✅ Playwright: Working, 1 E2E file with mock data tests
- 🆕 Chrome DevTools MCP: Available in Cursor
- ❌ Cursor Browser: Not available in Linux container

**Container Limitations:**

```
Running in: Linux container (hostname: b84215616828)
Docker: Not accessible from within container
Chrome: Not installed in container
```

**Testing Strategy Options:**

**Option A: Playwright Headless (Current)**

- ✅ Already working
- ✅ No browser required
- ❌ Can't debug visually
- ❌ MSW issues (per old docs)

**Option B: Chrome DevTools MCP**

- ✅ Can inspect running app
- ✅ Network/console/DOM access
- ❌ No automated test execution
- ✅ Good for manual verification

**Option C: Install Chrome in Container**

- ⚠️ Requires container rebuild
- ⚠️ Increases container size
- ✅ Enables Cursor Browser
- ✅ Full debugging capabilities

**Option D: Remote Chrome Debugging**

- ⚠️ Complex setup
- ✅ Use host browser
- ❌ May have networking issues

**Recommendation:** Start with Option A (Playwright) + Option B (MCP for manual checks), evaluate Option C if needed.

---

### Phase 3: Browser Setup Investigation (Day 2-3)

**Objective:** Enable browser-based testing in container

#### 3.1 Investigate Cursor's Container Setup

```bash
# Check if we can install Chrome
which apt-get || which yum || which apk

# Check available disk space
df -h

# Check if we're in a read-only container
touch /tmp/test-write && rm /tmp/test-write && echo "Writable" || echo "Read-only"
```

#### 3.2 Attempt Chrome Installation (if possible)

```bash
# Debian/Ubuntu based
curl -fsSL https://dl.google.com/linux/linux_signing_key.pub | sudo apt-key add -
echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" | sudo tee /etc/apt/sources.list.d/google-chrome.list
sudo apt-get update
sudo apt-get install -y google-chrome-stable

# Alpine based (if applicable)
apk add chromium
```

#### 3.3 Configure Cursor Browser

If Chrome installs successfully:

1. Restart Cursor
2. Test Cursor Browser feature
3. Document setup for future developers

If Chrome can't be installed:

1. Document container limitations
2. Update testing docs to reflect Playwright + MCP approach
3. Consider requesting writable container from Cursor team

---

### Phase 4: Fill Testing Gaps (Day 3-5)

**Objective:** Achieve 80%+ coverage of critical user journeys

#### 4.1 Backend Tests (Jest)

**Priority 1: Parent-Child Switching**

```typescript
// src/test/parent-child-switching.spec.ts
describe("Parent-Child Account Switching", () => {
  test("should fetch children for parent user");
  test("should set active child");
  test("should clear active child (return to parent)");
  test("should fetch child profile data");
  test("should fetch child courses");
});
```

**Priority 2: Course Data Fetching**

```typescript
// src/test/course-data-fetching.spec.ts
describe("Course Data Fetching", () => {
  test("should fetch courses from Schoology API");
  test("should transform API response to SchoologyCourse");
  test("should cache courses to Firestore");
  test("should fall back to cache on API failure");
  test("should handle empty course list");
});
```

**Priority 3: Admin Features**

```typescript
// Extend src/test/admin-page.spec.tsx
describe("Admin Features", () => {
  test("should require admin role");
  test("should list all users");
  test("should generate CSV files");
  test("should manage grading periods");
});
```

#### 4.2 E2E Tests (Playwright)

**Priority 1: OAuth Flow**

```typescript
// tests/e2e/oauth-complete.spec.ts
// NOTE: May need to mock OAuth or use test credentials
test("complete OAuth flow with real callback");
test("store tokens in Firestore");
test("redirect to dashboard after auth");
```

**Priority 2: Parent User Journey**

```typescript
// tests/e2e/parent-journey.spec.ts
test("parent sees children in profile menu");
test("parent can select a child");
test("dashboard shows child courses");
test("parent can switch between children");
test("parent can return to own view");
```

**Priority 3: Data Display**

```typescript
// tests/e2e/dashboard-data.spec.ts
test("dashboard shows live courses with badge");
test("course cards show correct info");
test("fallback to cached data works");
test("empty state displays correctly");
```

#### 4.3 Manual Testing Checklist

Create `docs/MANUAL-TEST-CHECKLIST.md`:

- [ ] OAuth flow with real Schoology account
- [ ] Parent login → select each child → verify courses
- [ ] Student login → verify own courses
- [ ] API failure → verify cache fallback
- [ ] Admin page → verify all features
- [ ] Logout → verify session cleared
- [ ] Mobile responsive design
- [ ] Error states (no email, no courses, etc.)

---

### Phase 5: Documentation Updates (Day 5-6)

**Objective:** Finalize all documentation with accurate info

#### 5.1 Update Core Docs

- [ ] README.md - Accurate, no-hype description
- [ ] ARCHITECTURE.md - Add staleness check section, update milestones
- [ ] STARTUP.md - Verify all steps are current
- [ ] USER-JOURNEYS.md - Complete with screenshots
- [ ] TESTING.md - Full testing guide
- [ ] API-REFERENCE.md - All endpoints documented

#### 5.2 Update AI Configuration

- [ ] Split .cursorrules into .cursor/rules/ modules
- [ ] Update .idx/airules.md (if still using Firebase Studio)
- [ ] Create .cursor/ai-workflow.md for developers
- [ ] Delete or archive outdated AI docs

#### 5.3 Update Product Roadmap

- [ ] product-requirements.md - Post-Hello World goals
- [ ] Add v0.2 (Smart Caching) details
- [ ] Add v0.3 (Assignments & Announcements) details
- [ ] Add v1.0 (Production Ready) details

---

### Phase 6: Safe Refactoring (Day 7+)

**Objective:** Improve code quality without breaking functionality

#### 6.1 Identify Refactoring Opportunities

**Areas to Review:**

1. **Duplicate OAuth logic** - Consolidate client creation
2. **API route patterns** - Standardize error handling
3. **Data transformations** - Shared utilities
4. **Type definitions** - Ensure consistency
5. **Component structure** - Extract reusable parts

#### 6.2 Refactoring Process

For each refactor:

1. ✅ Ensure tests are green
2. 🔄 Make ONE refactor (no functionality changes)
3. ✅ Run tests, verify still green
4. 💾 Commit with clear message
5. 🔁 Repeat

#### 6.3 Document Refactoring Decisions

Create `docs/REFACTORING-LOG.md`:

- What was refactored
- Why it was refactored
- What risks were mitigated
- What tests verified it

---

## Success Criteria

**Phase 1-2 Complete When:**

- ✅ All legacy docs archived
- ✅ New modular AI rules in place
- ✅ README.md accurate and current
- ✅ All user journeys documented
- ✅ Test coverage gaps identified

**Phase 3 Complete When:**

- ✅ Browser setup investigated
- ✅ Testing strategy finalized
- ✅ Documentation updated with limitations/solutions

**Phase 4 Complete When:**

- ✅ 80%+ test coverage of critical journeys
- ✅ All Hello World features have tests
- ✅ Manual test checklist complete

**Phase 5 Complete When:**

- ✅ All docs accurate and up-to-date
- ✅ No conflicting information
- ✅ AI rules modular and maintainable

**Phase 6 Complete When:**

- ✅ Code refactored with no regressions
- ✅ All tests still passing
- ✅ Refactoring decisions documented

---

## Timeline Estimate

| Phase                          | Effort          | Duration      |
| ------------------------------ | --------------- | ------------- |
| 1. Documentation Consolidation | 4-6 hours       | Day 1         |
| 2. Testing Coverage Audit      | 3-4 hours       | Day 2         |
| 3. Browser Setup Investigation | 2-3 hours       | Day 2-3       |
| 4. Fill Testing Gaps           | 8-12 hours      | Day 3-5       |
| 5. Documentation Updates       | 4-6 hours       | Day 5-6       |
| 6. Safe Refactoring            | 8-16 hours      | Day 7+        |
| **Total**                      | **29-47 hours** | **7-10 days** |

---

## Questions Requiring User Input

1. **Firebase Studio Usage:**

   - [ ] Are you still using Firebase Studio for development?
   - [ ] If yes, keep .idx/airules.md updated
   - [ ] If no, archive it

2. **Testing Priorities:**

   - [ ] Should we fix Playwright + MSW issue (per old docs)?
   - [ ] Or focus on Playwright headless + Chrome DevTools MCP?
   - [ ] Is installing Chrome in container worth the effort?

3. **Demo Mode:**

   - [ ] Is demo mode still a desired feature?
   - [ ] Keep demo-session.spec.ts?
   - [ ] Or archive it with old docs?

4. **Refactoring Scope:**
   - [ ] Are there specific areas of code causing pain?
   - [ ] Any known technical debt to prioritize?
   - [ ] Performance concerns to address?

---

## Next Immediate Actions

**Ready to execute now:**

1. Create `.cursor/rules/` directory structure
2. Move legacy docs to `docs/archive/`
3. Create USER-JOURNEYS.md skeleton
4. Create TESTING.md skeleton
5. Update README.md

**Awaiting your approval:**

- Which phases to prioritize?
- Answer the 4 questions above
- Any specific concerns or preferences?

---

**Status:** 📋 Plan complete, ready for execution with your approval
