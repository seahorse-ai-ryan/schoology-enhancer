# Schoology Data Seeding - Complete Guide

**Last Updated:** October 5, 2025  
**Status:** ✅ Fully Working

---

## Quick Start

```bash
# One command to seed everything
./scripts/seed-all.sh
```

**Time:** ~5-10 minutes  
**Result:** All 4 students have courses, assignments, and grades

---

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Phase 1: CSV Uploads (One-Time Setup)](#phase-1-csv-uploads)
4. [Phase 2: API Seeding (Repeatable)](#phase-2-api-seeding)
5. [Verification](#verification)
6. [Troubleshooting](#troubleshooting)
7. [Technical Details](#technical-details)

---

## Overview

Schoology seeding is a **two-phase process**:

**Phase 1: CSV Uploads** (One-time setup)
- Users, Courses, Enrollments, Parent Associations
- Done via Schoology's web UI
- Only needs to be done once per Schoology instance

**Phase 2: API Seeding** (Repeatable)
- Assignments, Grading Categories, Grades
- Done via REST API with scripts
- Can be re-run as needed

---

## Prerequisites

### 1. Environment Variables

In `.env.local`:
```bash
SCHOOLOGY_ADMIN_KEY=your_system_admin_key
SCHOOLOGY_ADMIN_SECRET=your_system_admin_secret
```

These are **permanent API keys** from Schoology System Admin account.

### 2. Seed Data File

**`seed/sandbox/seed-data-master.json`** - Contains all test data
- 2 Parents, 4 Students, 28 Teachers
- 28 Courses with grading categories
- 103 Assignments
- 80 Grades

---

## Phase 1: CSV Uploads

**When:** First time setting up Schoology instance  
**Frequency:** Once per Schoology instance

### Step 1: Generate CSVs

```bash
node scripts/generate-seed-csvs.js
```

**Output:** `seed/sandbox/csv-exports/*.csv`

### Step 2: Upload to Schoology

**Upload Order (Important!):**

1. **users.csv**
   - Location: Tools → User Management → Import Users
   - Creates: 2 parents, 4 students, 28 teachers
   
2. **courses.csv**
   - Location: Tools → Courses → Import
   - Creates: 28 course sections
   - Note: Must select school and grading period during import
   
3. **enrollments.csv**
   - Location: Tools → Courses → Enrollments → Import
   - Enrolls: Students in courses, teachers in courses
   
4. **parent_associations.csv**
   - Location: Tools → User Management → Manage Users → Parents Tab → Options → Import
   - Links: Parents to their children

**Detailed instructions:** `seed/sandbox/csv-exports/UPLOAD-INSTRUCTIONS.md`

---

## Phase 2: API Seeding

**When:** Initial setup and whenever you want fresh data  
**Frequency:** Can be re-run anytime

### Complete Workflow (Automated)

```bash
./scripts/seed-all.sh
```

This runs all 4 steps automatically.

### Manual Steps (If Needed)

```bash
# Step 1: Create assignments (103 total)
node scripts/create-assignments-via-impersonation.js bulk

# Step 2: Update grading category weights (55 categories)
node scripts/update-category-weights.js

# Step 3: Link assignments to categories (93 assignments)
node scripts/assign-categories-to-assignments.js

# Step 4: Upload grades (80 grades)
node scripts/import-grades-only.js
```

### What Each Step Does

**Step 1: Create Assignments**
- Reads assignments from `seed-data-master.json`
- Creates via `POST /sections/{id}/assignments`
- Uses `allow_dropbox: 0` (critical - makes grades visible immediately)
- Impersonates Super Teacher using `X-Schoology-Run-As` header

**Step 2: Update Category Weights**
- Grading categories must exist in Schoology (created via UI)
- Updates their weights via `PUT /sections/{id}/grading_categories/{id}`
- Without correct weights, final grades won't calculate

**Step 3: Assign Categories**
- Links each assignment to its category via `PUT /sections/{id}/assignments/{id}`
- Uses category names from `assignments.csv` description column
- Unlinked assignments show as "Ungraded" and may not count

**Step 4: Upload Grades**
- Uploads grades in bulk via `PUT /sections/{id}/grades`
- Uses batch format for efficiency
- Schoology automatically calculates final course grade

---

## Verification

### Check Schoology Data

```bash
# Show all student final grades
node scripts/show-all-student-grades.js

# Detailed check for specific student
node scripts/check-assignments-grades.js 140834636  # Carter
node scripts/check-assignments-grades.js 140834637  # Tazio
```

### Test API Endpoint

```bash
# Test our API matches Schoology exactly
node scripts/test-grades-e2e.js

# Expected: 100% match for all students
```

### Test UI Data Flow

```bash
# Simulate what frontend does
./scripts/test-ui-data-flow.sh

# Should show grades in Step 4
```

### Expected Results

**Carter Mock should have:**
- 100% - Kinesiology Dual Enr 15
- 84% - AP English Literature
- 79% - AP Biology
- 73% - AP Statistics
- 49% - PE Weight Training
- 25% - US Government

*See `seed/README.md` for all students' expected grades*

---

## Troubleshooting

### "No Grade" showing for all courses

**Diagnosis:**
```bash
node scripts/check-grading-categories.js 140834636
```

Look for categories with `weight: 0%`.

**Fix:**
```bash
node scripts/update-category-weights.js
```

### Assignments showing as "Ungraded"

**Fix:**
```bash
node scripts/assign-categories-to-assignments.js
```

### Missing assignments/grades

**Fix:**
```bash
# Reseed everything
./scripts/seed-all.sh
```

**Complete troubleshooting guide:** `docs/guides/GRADES-TROUBLESHOOTING.md`

---

## Technical Details

### API Endpoints Used

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/users/{id}/sections` | GET | Get enrolled sections |
| `/sections/{id}/assignments` | GET/POST/PUT | Manage assignments |
| `/sections/{id}/grading_categories` | GET/PUT | Manage categories |
| `/sections/{id}/grades` | GET/PUT | Manage grades |
| `/sections/{id}/enrollments` | GET | Get enrollment IDs |

### Critical API Field Names

⚠️ **Assignment Category Field Naming**

Schoology's API uses **inconsistent field names** for grading categories:

**When READING assignments (GET):**
- Field name: `grading_category` (NOT `grading_category_id`)
- Type: STRING (e.g., `"90423914"`)
- Example: `assignment.grading_category = "90423914"`

**When WRITING assignments (POST/PUT):**
- Field name: `grading_category_id`
- Type: NUMBER or STRING
- Example: `{ grading_category_id: 90423914 }`

**In your code:**
```javascript
// Reading
const categoryId = assignment.grading_category || assignment.grading_category_id;

// Writing
const updateData = {
  grading_category_id: 90423914
};
```

This inconsistency is a Schoology API quirk that must be handled correctly.

### Critical Parameters

**Assignment Creation:**
```javascript
{
  "title": "Test Assignment",
  "max_points": 100,
  "allow_dropbox": 0,  // ← CRITICAL: Grades visible immediately
  "grading_category_id": 12345  // Links to category
}
```

**Grade Upload (Batch):**
```javascript
{
  "grades": {
    "grade": [
      {
        "assignment_id": "123",
        "enrollment_id": "456",
        "grade": "95",
        "comment": "Great work!"
      }
    ]
  }
}
```

### Authentication

**Uses Admin Impersonation:**
- Admin API keys (permanent, no expiration)
- `X-Schoology-Run-As: {userId}` header
- Can impersonate any teacher to create content

**OAuth Quirk:**
- Don't include POST body in OAuth signature
- Only sign URL and method

### API Limitations

**What works:**
✅ Creating assignments  
✅ Updating category weights  
✅ Uploading grades  

**What doesn't work:**
❌ Creating grading categories (UI only)  
❌ Creating submissions (returns 403)  

**Workaround:** Use `allow_dropbox: 0` to make grades visible without submissions

---

## How Grades Calculate

### Weighted Category System

1. Each course has categories (Tests, Homework, Labs)
2. Each category has a weight percentage
3. Each assignment belongs to a category
4. Schoology calculates weighted average automatically

**Example:**
```
AP Biology (Final Grade: 82%):
├── Tests (40%) → 75% avg → 30 points
├── Homework (30%) → 90% avg → 27 points
└── Labs (30%) → 85% avg → 25.5 points
Total: 82.5% → Displayed as 82%
```

### Requirements for Calculation

- Categories must have non-zero weights
- Assignments must be linked to categories
- At least one graded assignment in a category

---

## Data Files Reference

### Primary Source
**`seed/sandbox/seed-data-master.json`**
- Complete data for all users, courses, assignments, grades
- Single source of truth

### Generated Files
**`seed/sandbox/csv-exports/*.csv`**
- Generated from master JSON
- Used for Phase 1 uploads

**`seed/sandbox/category-mappings.json`**
- Generated during seeding
- Maps category names to Schoology IDs

---

## Related Documentation

**For Users:**
- `seed/README.md` - Complete seed data reference
- `docs/guides/SEEDING-QUICK-START.md` - Quick reference card
- `scripts/README.md` - All seeding scripts explained

**For Developers:**
- `docs/guides/GRADES-IMPLEMENTATION-GUIDE.md` - How grades work in our app
- `docs/guides/GRADES-TROUBLESHOOTING.md` - Fix common issues
- `docs/guides/API-USER-IMPERSONATION.md` - Technical impersonation details

**Historical:**
- `.journal/2025-10-04-BREAKTHROUGH-ALLOW-DROPBOX.md` - Critical discovery
- `.journal/2025-10-04-SUBMISSION-API-CONCLUSION.md` - API limitations

---

## Success Criteria

After seeding, you should have:

✅ All assignments visible in Schoology  
✅ All assignments properly categorized  
✅ All categories have correct weights  
✅ All grades uploaded and visible  
✅ Final course grades calculated  
✅ Grades fetchable via our API  
✅ Grades displaying in our UI with color coding  

**Test:** Log in as parent, select child, see color-coded grades next to each course.
