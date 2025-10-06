# Scripts Directory Cleanup Plan

## Current State
**50 JavaScript files, 6 shell scripts**

## Categorization

### ✅ KEEP - Core Seeding (Essential)
```
create-assignments-via-impersonation.js
update-category-weights.js
assign-categories-to-assignments.js
import-grades-only.js
seed-additional-assignments.js
seed-events-announcements.js
seed-all.sh
generate-seed-csvs.js
start-emulators.js
```

### ✅ KEEP - Verification & Testing (Useful)
```
show-all-student-grades.js
check-assignments-grades.js
check-grading-categories.js
test-grades-e2e.js
test-ui-data-flow.sh
check-user-courses.js
find-overdue-ungraded.js
check-assignment-types.js
```

### 🗂️ MOVE TO scripts/archive/ - One-off Debug
```
debug-*.js (5 files)
test-carter-grades.js
test-section-grades.js
test-create-category.js
test-update-*.js (2 files)
test-single-assignment.js
verify-*.js (if not actively used)
fix-*.js (if completed)
```

### 🗂️ MOVE TO scripts/e2e/ - Browser E2E Tests
```
e2e-*.js (3 files)
test-2-default-dashboard.js
test-3-child-switching.js
test-4-navigation.js
test-5-assignments-grades.js
test-6-data-sources.js  
test-7-complete-flow.js
test-authenticated.js
test-all.sh
```

### ❓ EVALUATE - May be obsolete
```
auth-browser-session.js
launch-browser.js
simple-screenshot.js
browser-screenshot-test.js (if exists)
```

### ✅ KEEP - Utility
```
start-*.sh (3 files)
align-seed-with-schoology.js
enroll-super-teacher-via-api.js
get-teacher-sections.js
```

## Proposed Structure

```
scripts/
├── README.md (updated index)
├── seeding/ (or keep at root?)
│   ├── seed-all.sh
│   ├── create-assignments-via-impersonation.js
│   ├── update-category-weights.js
│   ├── assign-categories-to-assignments.js
│   ├── import-grades-only.js
│   └── seed-events-announcements.js
├── verification/
│   ├── show-all-student-grades.js
│   ├── check-assignments-grades.js
│   ├── test-grades-e2e.js
│   └── check-*.js
├── e2e/
│   ├── test-all.sh
│   └── test-*.js
└── archive/
    ├── debug-*.js
    └── (one-off scripts)
```

**OR simpler: Keep scripts/ flat, move only archive/**

## Recommendation

**Simple approach:**
1. Create `scripts/archive/` for debug/one-off scripts
2. Keep everything else flat in `scripts/`
3. Update README.md to group by purpose
4. Document which scripts are essential vs optional

**Benefit:** Minimal disruption, clear organization, easy to find scripts
