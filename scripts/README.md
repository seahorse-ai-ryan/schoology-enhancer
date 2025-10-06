# Scripts Directory

**Purpose:** Automation scripts for seeding, testing, and managing Schoology data

---

## 🌱 Seeding Scripts

### Complete Seeding Workflow

```bash
# Run all seeding steps in order (recommended)
./scripts/seed-all.sh
```

**Or run individual steps:**

```bash
# Step 1: Create assignments
node scripts/create-assignments-via-impersonation.js bulk

# Step 2: Update category weights  
node scripts/update-category-weights.js

# Step 3: Assign categories to assignments
node scripts/assign-categories-to-assignments.js

# Step 4: Upload grades
node scripts/import-grades-only.js
```

**Time:** ~5-10 minutes total

---

## 🧪 Testing & Verification Scripts

### Show All Student Grades
```bash
node scripts/show-all-student-grades.js
```

Displays final course grades for all 4 mock students in a clean format.

### Check Specific Student
```bash
node scripts/check-assignments-grades.js 140834636  # Carter
node scripts/check-assignments-grades.js 140834637  # Tazio
node scripts/check-assignments-grades.js 140834638  # Livio
node scripts/check-assignments-grades.js 140834639  # Lily
```

Shows detailed breakdown: assignments, individual grades, and final course grade.

### End-to-End API Test
```bash
node scripts/test-grades-e2e.js
```

Compares our API responses against Schoology's API directly to verify 100% accuracy.

---

## 🔧 Utility Scripts

### Check Grading Categories
```bash
node scripts/check-grading-categories.js {userId}
```

Lists all grading categories and their weights for each course.

### Start Development Services
```bash
./scripts/start-all.sh          # Start all services
./scripts/start-dev.sh          # Alternative startup
./scripts/start-dev-static.sh   # Static startup
```

### Firebase Emulators
```bash
node scripts/start-emulators.js
```

Starts Firebase emulators with correct Java PATH.

---

## 📊 Test Scripts (E2E Browser Tests)

### Authentication Flow
```bash
node scripts/e2e-auth-flow.js           # Full OAuth flow
node scripts/e2e-child-switching.js     # Parent switching between children
```

### Dashboard Tests
```bash
node scripts/test-2-default-dashboard.js   # Default dashboard load
node scripts/test-3-child-switching.js     # Child switching
node scripts/test-4-navigation.js          # Navigation flow
node scripts/test-5-assignments-grades.js  # Assignments and grades display
node scripts/test-6-data-sources.js        # Data source indicators
node scripts/test-7-complete-flow.js       # Complete user journey
```

### Run All Tests
```bash
./scripts/test-all.sh
```

---

## 🔨 Development Helper Scripts

### Generate CSV Files from Seed Data
```bash
node scripts/generate-seed-csvs.js
```

Generates all CSV files for Schoology bulk import.

### Enroll Super Teacher
```bash
node scripts/enroll-super-teacher-via-api.js
```

Ensures Super Teacher has access to all sections.

### Get Teacher Sections
```bash
node scripts/get-teacher-sections.js
```

Lists all sections for a specific teacher.

---

## 📝 Important Notes

### Super Teacher Account

**ID:** `140836120`  
**school_uid:** `super_teacher_20250930`

This account is enrolled in all courses and is used for API impersonation when creating/updating content.

### Student IDs

- Carter Mock: `140834636`
- Tazio Mock: `140834637`
- Livio Mock: `140834638`
- Lily Mock: `140834639`

### Parent IDs

- Christina Mock: `140834634`
- Ryan Mock: `140834635`

---

## ⚠️ Common Issues

### "Admin credentials not configured"

**Fix:** Ensure `.env.local` has:
```bash
SCHOOLOGY_ADMIN_KEY=your_key
SCHOOLOGY_ADMIN_SECRET=your_secret
```

### "Section not found"

**Fix:** Verify sections were created via CSV upload first.

### "Category not found"

**Fix:** Categories must be created in Schoology UI. Cannot be created via API.

### Rate limiting (429 errors)

**Fix:** Scripts include 100ms delays. If you still hit limits, increase the delay.

---

## 📚 Related Documentation

- `seed/README.md` - Seed data reference and expected grades
- `docs/guides/SCHOOLOGY-DATA-SEEDING.md` - Complete seeding workflow
- `docs/guides/GRADES-IMPLEMENTATION-GUIDE.md` - How grades work
- `docs/guides/GRADES-TROUBLESHOOTING.md` - Fix common issues
- `docs/guides/API-USER-IMPERSONATION.md` - Technical impersonation details

---

## 🧹 Cleanup Scripts

**Note:** Most temporary test scripts have been cleaned up. If you see scripts not documented here, they may be obsolete and can be removed.

**Keep these:**
- All seeding scripts (create-assignments, update-category-weights, etc.)
- All verification scripts (show-all-student-grades, check-assignments-grades, etc.)
- All E2E test scripts (test-*.js)
- Utility scripts (start-emulators.js, generate-seed-csvs.js, etc.)

**Can be removed:**
- Any scripts with "temp", "debug", or "test" in the name that aren't documented above
- Scripts that duplicate functionality of working scripts
