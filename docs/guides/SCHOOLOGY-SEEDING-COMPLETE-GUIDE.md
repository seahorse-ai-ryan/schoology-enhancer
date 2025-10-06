# Complete Schoology Seeding Guide

**Last Updated:** October 5, 2025  
**Status:** ✅ Fully Working

---

## Overview

This guide documents the complete, tested workflow for seeding assignments and grades into Schoology via the REST API.

## Prerequisites

1. **CSV Data Already Imported:**
   - Users (teachers, parents, students)
   - Courses (sections)
   - Enrollments
   - Parent associations

2. **Environment Variables:**
   ```bash
   SCHOOLOGY_ADMIN_KEY=your_system_admin_key
   SCHOOLOGY_ADMIN_SECRET=your_system_admin_secret
   ```

3. **Super Teacher Account:**
   - User: `super_teacher_20250930`
   - Schoology ID: `140836120`
   - Must be enrolled in all sections via CSV with `override_role: 1`

---

## The Complete Seeding Workflow

### Step 1: Create Assignments

```bash
node scripts/create-assignments-via-impersonation.js bulk
```

**What it does:**
- Creates all assignments from `seed-data-master.json`
- Uses `allow_dropbox: 0` (critical - makes grades visible immediately)
- Impersonates Super Teacher using `X-Schoology-Run-As` header
- Rate limited to 10 requests/second

**Result:** ✅ 103 assignments created

---

### Step 2: Update Grading Category Weights

```bash
node scripts/update-category-weights.js
```

**What it does:**
- Reads grading categories from `seed-data-master.json`
- Fetches existing categories from Schoology (created via UI or previous runs)
- Updates the `weight` field for each category

**Critical Finding:** Grading categories CANNOT be created via API - they must exist in Schoology first (created via UI). However, their weights CAN be updated via API.

**Result:** ✅ 55 categories updated with correct weights

---

### Step 3: Assign Categories to Assignments

```bash
node scripts/assign-categories-to-assignments.js
```

**What it does:**
- Reads assignment → category mappings from `assignments.csv`
- Updates each assignment's `grading_category_id` field
- Links assignments to their weighted categories

**Result:** ✅ 93 assignments properly categorized

---

### Step 4: Upload Grades

```bash
node scripts/import-grades-only.js
```

**What it does:**
- Reads grades from `seed-data-master.json`
- Uploads grades in bulk using `PUT /sections/{id}/grades`
- Uses batch format for efficiency

**Result:** ✅ 80 grades uploaded

---

### Step 5: Verify Final Grades

```bash
node scripts/show-all-student-grades.js
```

**What it displays:**
- Final calculated course grades for all students
- Sorted by grade (highest first)

**Example Output:**
```
📊 Carter Mock (12th)
  100%  Kinesiology Dual Enr 15
   84%  AP English Literature
   79%  AP Biology
   73%  AP Statistics
   49%  PE Weight Training
   25%  US Government
```

---

## Key Technical Details

### Grading Categories

**Cannot be created via API** - Must be set up manually in Schoology UI first.

**Can be updated via API:**
```javascript
PUT /v1/sections/{section_id}/grading_categories/{category_id}
{
  "title": "Tests",
  "weight": 85,
  "calculation_type": 2
}
```

**How Schoology calculates final grades:**
1. Groups assignments by category
2. Calculates average for each category
3. Applies category weights
4. Produces final course grade

**Without proper weights:** Categories default to 0%, final grade won't calculate.

---

### Assignment Creation

**Critical parameter:**
```javascript
{
  "title": "Test Assignment",
  "max_points": 100,
  "allow_dropbox": 0,  // ← CRITICAL: Makes grades visible immediately
  "grading_category_id": 12345  // ← Links to category
}
```

**`allow_dropbox` values:**
- `0` = No submission required → Grades visible immediately (use this for seeding)
- `1` = Requires submission → Grades hidden until student submits

---

### Grade Upload

**Endpoint:** `PUT /v1/sections/{section_id}/grades`

**Format (batch):**
```javascript
{
  "grades": {
    "grade": [
      {
        "assignment_id": "123",
        "enrollment_id": "456",
        "grade": "95",
        "comment": "Great work!"
      },
      // ... more grades
    ]
  }
}
```

**Important:**
- Must use `PUT`, not `POST`
- Requires `enrollment_id` (not just user_id)
- Grades are strings, not numbers
- Use `X-Schoology-Run-As` header to impersonate teacher

---

### Submissions (Not Required)

**Finding:** Schoology API does NOT support programmatic submission creation.

**Tested approaches (all failed with 403):**
1. Admin impersonating teacher
2. Admin impersonating student  
3. Student's own API keys

**Why:** Submissions represent actual student work. Schoology requires they be created through:
- Student UI (uploading work)
- Teacher UI (when entering first grade)
- Actual submission process

**Impact:** With `allow_dropbox: 0`, submissions are NOT needed. Grades are visible immediately.

---

## Data Files

### Primary Source
**`seed/sandbox/seed-data-master.json`**
- Complete course definitions with grading categories and weights
- 103 assignments with category assignments
- 80 grades for students

### CSV Files (for reference)
**`seed/sandbox/csv-exports/`**
- `assignments.csv` - Assignment → category mapping (description column)
- `grades.csv` - Individual assignment grades
- `courses.csv` - Course definitions
- `enrollments.csv` - Student enrollments

---

## Verification Commands

### Check assignments and grades for a student:
```bash
node scripts/check-assignments-grades.js 140834636  # Carter
node scripts/check-assignments-grades.js 140834637  # Tazio
node scripts/check-assignments-grades.js 140834638  # Livio
node scripts/check-assignments-grades.js 140834639  # Lily
```

### Show all student grades:
```bash
node scripts/show-all-student-grades.js
```

### Test API endpoint:
```bash
curl http://localhost:9000/api/schoology/grades \
  -H "Cookie: schoology_user_id=140834636" | python3 -m json.tool
```

---

## Troubleshooting

### No final course grade showing

**Cause:** Grading categories have 0% weight

**Fix:**
```bash
node scripts/update-category-weights.js
```

### Assignments not linked to categories

**Cause:** `grading_category_id` not set on assignments

**Fix:**
```bash
node scripts/assign-categories-to-assignments.js
```

### Grades not visible in UI

**Cause:** Assignments created with `allow_dropbox: 1` (requires submissions)

**Fix:** Recreate assignments with `allow_dropbox: 0`

---

## Complete Reseed Process

If you need to completely reseed from scratch:

```bash
# 1. Delete all assignments in Schoology (via UI or API)
# 2. Run complete seeding workflow:

node scripts/create-assignments-via-impersonation.js bulk
node scripts/update-category-weights.js
node scripts/assign-categories-to-assignments.js
node scripts/import-grades-only.js

# 3. Verify
node scripts/show-all-student-grades.js
```

**Time required:** ~5-10 minutes total

---

## API Endpoints Reference

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/users/{id}/sections` | GET | Get student's enrolled sections |
| `/sections/{id}/assignments` | GET/POST | List/create assignments |
| `/sections/{id}/assignments/{id}` | PUT | Update assignment |
| `/sections/{id}/grading_categories` | GET | List categories |
| `/sections/{id}/grading_categories/{id}` | PUT | Update category weight |
| `/sections/{id}/grades` | GET/PUT | Get/upload grades |
| `/sections/{id}/enrollments` | GET | Get enrollment IDs |

---

## Known Limitations

1. **Grading categories cannot be created via API** - Must use Schoology UI
2. **Submissions cannot be created via API** - Returns 403 for all approaches
3. **Rate limiting:** 50 requests per 5 seconds - use 100ms delays
4. **OAuth quirk:** Don't include POST body in OAuth signature

---

## Success Criteria

After completing the seeding workflow, you should see:

✅ All assignments visible in Schoology UI  
✅ All assignments properly categorized  
✅ All categories have correct weights  
✅ All grades visible (no submissions required)  
✅ Final course grades calculated and displayed  
✅ Grades fetchable via our API endpoint  

---

## Related Documentation

- `docs/guides/API-USER-IMPERSONATION.md` - Technical details on X-Schoology-Run-As
- `docs/guides/BULK-ASSIGNMENT-IMPORT.md` - Original assignment import guide
- `.journal/2025-10-04-BREAKTHROUGH-ALLOW-DROPBOX.md` - Discovery of allow_dropbox parameter
- `.journal/2025-10-04-SUBMISSION-API-CONCLUSION.md` - Why submissions don't work via API
