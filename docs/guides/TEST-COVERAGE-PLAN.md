# Comprehensive Test Coverage Plan

**Last Updated:** September 30, 2025  
**Status:** Ready to implement  
**Goal:** 100% coverage of all user journeys before refactoring

---

## 🎯 Testing Strategy

**Three-Layer Approach:**
1. **E2E Tests** (Playwright + Persistent Auth) - User journeys
2. **Integration Tests** (Jest) - API routes, Firebase interaction
3. **Unit Tests** (Jest) - Data transformations, utilities

**Priority:** E2E tests first (validate all user journeys), then fill gaps with integration/unit tests.

---

## 📚 Test Coverage Matrix

Based on `docs/USER-JOURNEYS.md` - 11 user journeys to cover:

### 1. ✅ Parent Authentication (DONE)
**Status:** ✅ Automated with `scripts/test-authenticated.js`

**Covered:**
- OAuth redirect to Schoology
- hCaptcha completion (manual once)
- Redirect back to app
- Session persistence across runs

**Script:** `scripts/test-authenticated.js`

---

### 2. ⏳ View Default Child's Dashboard
**Status:** TODO

**E2E Test Scenarios:**
- [ ] Load dashboard as authenticated parent
- [ ] Verify default child displayed (e.g., "Tazio Mock")
- [ ] Verify courses section shows courses
- [ ] Check data source indicator ("Live Verified")
- [ ] Verify course count matches expected

**Test File:** Create `scripts/test-default-dashboard.js`

**Assertions:**
```javascript
// Check default child is selected
const activeChild = await page.textContent('[data-testid="active-child-name"]');
expect(activeChild).toBe('Tazio Mock');

// Verify courses loaded
const courses = await page.locator('[data-testid="course-item"]').count();
expect(courses).toBeGreaterThan(0);

// Check data source
const dataSource = await page.textContent('[data-testid="data-source-badge"]');
expect(dataSource).toContain('Live');
```

---

### 3. ⏳ Switch Between Children
**Status:** TODO

**E2E Test Scenarios:**
- [ ] Click child selector dropdown
- [ ] Verify all children listed
- [ ] Select different child
- [ ] Verify UI updates with new child's data
- [ ] Verify courses change
- [ ] Check URL/state persists on refresh

**Test File:** `scripts/test-child-switching.js`

**Critical Assertions:**
```javascript
// Open child selector
await page.click('[data-testid="child-selector"]');

// Verify all children present
const children = await page.locator('[data-testid="child-option"]').allTextContents();
expect(children).toContain('Tazio Mock');
expect(children).toContain('Carter Mock');

// Switch to Carter
await page.click('text=Carter Mock');
await page.waitForTimeout(1000);

// Verify active child changed
const activeChild = await page.textContent('[data-testid="active-child-name"]');
expect(activeChild).toBe('Carter Mock');

// Verify courses updated
const newCourses = await page.locator('[data-testid="course-item"]').allTextContents();
expect(newCourses.length).toBeGreaterThan(0);
```

---

### 4. ⏳ View Course Details
**Status:** TODO

**E2E Test Scenarios:**
- [ ] Click on a course card
- [ ] Navigate to course detail page
- [ ] Verify course title, teacher, section
- [ ] Verify assignments listed
- [ ] Check upcoming/overdue counts
- [ ] Verify grading period info

**Test File:** `scripts/test-course-details.js`

---

### 5. ⏳ View Assignments List
**Status:** TODO

**E2E Test Scenarios:**
- [ ] Navigate to assignments view
- [ ] Verify assignments grouped by status (upcoming/overdue/completed)
- [ ] Check assignment titles, due dates, point values
- [ ] Verify filtering works (by course, by date)
- [ ] Test sorting (by due date, by points)

**Test File:** `scripts/test-assignments.js`

---

### 6. ⏳ View Assignment Details
**Status:** TODO

**E2E Test Scenarios:**
- [ ] Click on specific assignment
- [ ] Verify description displayed
- [ ] Check attachments/materials listed
- [ ] Verify submission status
- [ ] Check grade if graded
- [ ] Verify teacher feedback displayed

**Test File:** `scripts/test-assignment-details.js`

---

### 7. ⏳ Check Grades & Progress
**Status:** TODO

**E2E Test Scenarios:**
- [ ] Navigate to grades view
- [ ] Verify grade breakdown per course
- [ ] Check grading period selector
- [ ] Verify grade calculations accurate
- [ ] Check progress indicators (percent complete)
- [ ] Test filtering by grading period

**Test File:** `scripts/test-grades.js`

---

### 8. ⏳ View Announcements
**Status:** TODO

**E2E Test Scenarios:**
- [ ] Navigate to announcements view
- [ ] Verify recent announcements displayed
- [ ] Check announcement titles, dates, authors
- [ ] Verify read/unread indicators
- [ ] Click announcement to view full content
- [ ] Check filtering (by course, by date)

**Test File:** `scripts/test-announcements.js`

---

### 9. ⏳ Manage Incentives
**Status:** TODO

**E2E Test Scenarios:**
- [ ] Navigate to incentives view
- [ ] Verify incentive types listed
- [ ] Check point values/thresholds
- [ ] Verify student progress toward goals
- [ ] Test adding new incentive
- [ ] Test editing existing incentive
- [ ] Verify parent controls work

**Test File:** `scripts/test-incentives.js`

---

### 10. ⏳ Data Source Indicators
**Status:** TODO

**E2E Test Scenarios:**
- [ ] Verify "Live Verified" badge when using real API
- [ ] Force cache mode - verify "Cached" badge appears
- [ ] Force mock mode - verify "Mock Data" badge
- [ ] Check timestamp on cached data
- [ ] Verify cache expiration logic
- [ ] Test refresh button functionality

**Test File:** `scripts/test-data-sources.js`

---

### 11. ⏳ Multi-Child Planning View
**Status:** TODO

**E2E Test Scenarios:**
- [ ] Navigate to planning view
- [ ] Verify calendar shows all children's events
- [ ] Check color coding by child
- [ ] Verify filtering (show/hide specific children)
- [ ] Test week/month view switching
- [ ] Verify conflicting events highlighted

**Test File:** `scripts/test-planning.js`

---

## 🧪 Integration Test Coverage

**API Routes:**
- [ ] `/api/auth/status` - Auth check
- [ ] `/api/auth/login` - OAuth initiation
- [ ] `/api/callback` - OAuth callback handling
- [ ] `/api/schoology/users/me` - Current user profile
- [ ] `/api/schoology/users/{id}/children` - Get children
- [ ] `/api/schoology/courses` - Get courses for user
- [ ] `/api/schoology/sections/{id}/assignments` - Get assignments
- [ ] `/api/schoology/sections/{id}/grades` - Get grades

**Test File:** Create `src/test/integration/api-routes.spec.ts`

---

## 🔬 Unit Test Coverage

**Data Transformations:**
- [ ] `src/lib/schoology/transform.ts` - API response transformations
- [ ] `src/lib/cache/helpers.ts` - Cache key generation, expiration
- [ ] `src/lib/data/courses.ts` - Course data processing
- [ ] `src/lib/data/assignments.ts` - Assignment data processing
- [ ] `src/lib/data/grades.ts` - Grade calculations

**Utilities:**
- [ ] Date formatting
- [ ] Grade calculations
- [ ] Assignment status logic
- [ ] Data source determination

**Test Directory:** `src/test/unit/`

---

## 📊 Coverage Goals

**By Phase:**

### Phase 3A (Current): E2E Coverage
**Goal:** All 11 user journeys have automated E2E tests

**Estimate:** 2-3 days
- [ ] Journeys 2-11 (10 remaining)
- ~1-2 hours per journey
- Use persistent auth (no manual login!)

### Phase 3B: Integration Tests
**Goal:** All API routes tested

**Estimate:** 1 day
- [ ] 8 API routes
- Test with emulated Firebase
- Mock Schoology API responses

### Phase 3C: Unit Tests
**Goal:** 80%+ unit test coverage

**Estimate:** 1 day
- [ ] Data transformations
- [ ] Utilities
- [ ] Edge cases

---

## 🚀 Implementation Plan

### Week 1: E2E Tests (Journeys 2-11)

**Day 1-2:** Core user flows
- View default dashboard
- Switch between children
- View course details
- View assignments list

**Day 3:** Assignment & Grade flows
- Assignment details
- Grades & progress

**Day 4:** Secondary features
- Announcements
- Incentives
- Data source indicators

**Day 5:** Advanced features
- Multi-child planning view
- Edge cases & error handling

### Week 2: Integration & Unit Tests

**Day 1-2:** API Integration Tests
- All API routes
- Error handling
- Cache behavior

**Day 3-4:** Unit Tests
- Data transformations
- Utilities
- Edge cases

**Day 5:** Coverage analysis & gap filling

---

## 🎯 Success Criteria

**Before Refactoring:**
- ✅ All 11 user journeys have automated E2E tests
- ✅ All API routes have integration tests
- ✅ 80%+ unit test coverage
- ✅ All tests passing in CI
- ✅ Test execution < 5 minutes total

**After Achieving Coverage:**
- Safe to refactor with confidence
- Automated regression detection
- CI/CD pipeline ready
- Documentation complete

---

## 📝 Test Template

**For each new E2E test:**

```javascript
#!/usr/bin/env node
const { chromium } = require('playwright');
const path = require('path');

const PROFILE_DIR = path.join(__dirname, '..', '.auth', 'chrome-profile');
const APP_URL = 'https://modernteaching.ngrok.dev';

async function testFeatureName() {
  console.log('\n🧪 Testing: [Feature Name]\n');

  const context = await chromium.launchPersistentContext(PROFILE_DIR, {
    channel: 'chrome',
    headless: false,
  });

  const page = context.pages()[0] || await context.newPage();
  
  await page.goto(`${APP_URL}/dashboard`);
  await page.waitForTimeout(2000);

  // Test assertions here
  console.log('✅ Test 1: [Description]');
  // ... assertions

  await page.screenshot({ path: `test-results/feature-name.png` });
  
  await context.close();
  console.log('\n✅ All tests passed!\n');
}

testFeatureName().catch(console.error);
```

---

## 🔗 References

- **User Journeys:** `docs/USER-JOURNEYS.md`
- **Auth Setup:** `docs/TESTING-QUICK-START.md`
- **Working Example:** `scripts/test-authenticated.js`
- **Current Status:** `docs/CURRENT-STATUS.md`

---

**Ready to achieve 100% test coverage! 🎉**
