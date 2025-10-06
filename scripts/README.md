# Scripts Directory

**Purpose:** Automation scripts for seeding, verification, and development

**Organization:**
- **Seeding:** Setup Schoology data (run once or when reseeding)
- **Verification:** Check data state (run anytime)
- **Dev Utilities:** Development workflow tools
- **E2E Tests:** `/tests/e2e/` - Browser-based end-to-end tests
- **Archive:** `archive/` - Historical/debug scripts

---

## 🌱 Seeding Scripts (Essential)

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

---

## ✅ Verification Scripts (Run Anytime)

### Show All Student Grades
```bash
node scripts/show-all-student-grades.js
```

Displays final course grades for all 4 mock students in a clean format.

### Check Specific Student
```bash
# Use the numeric IDs from your .schoology-instance.json
node scripts/check-assignments-grades.js {student_id}
```

Shows detailed breakdown: assignments, individual grades, and final course grade.

### End-to-End API Test
```bash
node scripts/test-grades-e2e.js
```

Compares our API responses against Schoology's API directly to verify 100% accuracy.

---

---

## 🔧 Development Utilities

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

---

## 🧪 End-to-End Tests

**Location:** `/tests/e2e/`

```bash
cd tests/e2e
./test-all.sh          # Run all E2E tests
```

**Individual tests:**
- `e2e-auth-flow.js` - OAuth login flow
- `e2e-child-switching.js` - Parent child switching
- `test-2-default-dashboard.js` - Dashboard widgets
- `test-3-child-switching.js` - Child switch functionality
- `test-4-navigation.js` - Page navigation
- `test-5-assignments-grades.js` - Grades display
- `test-6-data-sources.js` - Data sources
- `test-7-complete-flow.js` - Complete user journey

---

## 📦 Archived Scripts

**Location:** `scripts/archive/`

Historical debug and one-off test scripts preserved for reference.

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

### Instance-Specific IDs

User IDs (school_uid → Schoology numeric ID) are specific to each Schoology instance.

After uploading CSVs, use this script to get your IDs:
```bash
node scripts/show-all-student-grades.js
```

Or query the API:
```bash
# Get user ID from school_uid
curl 'https://api.schoology.com/v1/users?school_uids=carter_mock'
```

**Note:** IDs are stored in `seed/.schoology-instance.json` (gitignored)

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
