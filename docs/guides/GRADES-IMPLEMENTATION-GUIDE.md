# Grades Implementation Guide

**Last Updated:** October 5, 2025  
**Status:** ✅ Fully Working End-to-End

---

## Overview

This guide documents how grades work in our application, from Schoology's API through to the UI display.

---

## How Schoology Grades Work

### The Grade Calculation System

Schoology calculates final course grades using a **weighted category system**:

1. **Grading Categories** - Each course has categories (e.g., "Tests", "Homework", "Labs")
2. **Category Weights** - Each category has a weight percentage (e.g., Tests = 40%)
3. **Assignment Categorization** - Each assignment belongs to a category
4. **Automatic Calculation** - Schoology calculates the final grade based on:
   - Average score within each category
   - Weighted average across all categories

**Example:**
```
AP Biology:
├── Tests (40%)
│   ├── Unit 1 Exam: 85/100
│   └── Unit 2 Exam: 90/100
│   → Category Average: 87.5%
│
├── Homework (30%)
│   ├── Assignment 1: 100/100
│   └── Assignment 2: 80/100
│   → Category Average: 90%
│
└── Labs (30%)
    └── Lab Report: 95/100
    → Category Average: 95%

Final Course Grade: (87.5 × 0.40) + (90 × 0.30) + (95 × 0.30) = 90%
```

---

## API Data Flow

### 1. Fetch Sections
```
GET /v1/users/{userId}/sections
```
Returns list of courses student is enrolled in.

### 2. Fetch Grades for Each Section
```
GET /v1/sections/{sectionId}/grades
```

**Response Structure:**
```json
{
  "grades": {
    "grade": [
      {
        "assignment_id": "123",
        "grade": 85,
        "max_points": 100
      }
    ]
  },
  "final_grade": [
    {
      "enrollment_id": "456",
      "period": [
        {
          "period_id": "p1141932",
          "grade": 90,  // ← THE FINAL COURSE GRADE
          "comment": ""
        }
      ]
    }
  ]
}
```

**Key Fields:**
- `grades.grade[]` - Individual assignment grades
- `final_grade[0].period[0].grade` - **The calculated final course grade**

---

## Our Implementation

### Backend API Route

**File:** `src/app/api/schoology/grades/route.ts`

**What it does:**
1. Determines target user (parent's active child or logged-in user)
2. Fetches all sections for that user
3. For each section, calls `/sections/{id}/grades`
4. Extracts the `final_grade.period[0].grade` value
5. Returns a map of `sectionId → { grade, period_id }`

**Example Response:**
```json
{
  "grades": {
    "8067479367": {
      "grade": 79,
      "period_id": "p1141932"
    },
    "8067479369": {
      "grade": 84,
      "period_id": "p1141932"
    }
  },
  "targetUserId": "140834636"
}
```

---

### Frontend Display

**File:** `src/components/dashboard/UserDashboard.tsx`

**What it does:**
1. Fetches courses from `/api/schoology/courses`
2. Fetches grades from `/api/schoology/grades`
3. Matches grades to courses by section ID
4. Displays grade badge next to each course

**UI Display:**
```tsx
{courseGrade && courseGrade.grade !== null ? (
  <div className={`px-3 py-1 rounded-md ${getGradeBgColor(courseGrade.grade)}`}>
    <span className="text-lg font-semibold">
      {courseGrade.grade}%
    </span>
  </div>
) : (
  <span className="text-sm text-gray-400">No grade</span>
)}
```

---

## Seeding Requirements

For grades to appear correctly, the following must be in place:

### 1. Grading Categories Must Exist

**Cannot be created via API** - Must be set up in Schoology UI first.

**How to set up:**
1. Log into Schoology as teacher
2. Go to Course → Settings → Grading Categories
3. Create categories with names matching seed data
4. Save (weights can be 0 initially)

**Then update weights via API:**
```bash
node scripts/update-category-weights.js
```

### 2. Assignments Must Be Categorized

**Critical:** Each assignment must have `grading_category_id` set.

```bash
node scripts/assign-categories-to-assignments.js
```

### 3. Assignments Must Have Correct Settings

**Critical parameter:**
```javascript
{
  "allow_dropbox": 0  // Makes grades visible immediately
}
```

Without this, grades won't appear until students submit work (which can't be done via API).

### 4. Grades Must Be Uploaded

```bash
node scripts/import-grades-only.js
```

Uses `PUT /sections/{id}/grades` with batch format.

---

## Complete Seeding Workflow

```bash
# Step 1: Create assignments
node scripts/create-assignments-via-impersonation.js bulk

# Step 2: Set up grading category weights
node scripts/update-category-weights.js

# Step 3: Link assignments to categories
node scripts/assign-categories-to-assignments.js

# Step 4: Upload grades
node scripts/import-grades-only.js

# Step 5: Verify
node scripts/show-all-student-grades.js
```

**Total time:** ~5-10 minutes

---

## Verification

### Check Schoology Data Directly

```bash
# Check assignments and grades for a student
node scripts/check-assignments-grades.js 140834636  # Carter

# Show all student grades
node scripts/show-all-student-grades.js
```

### Test API Endpoint

```bash
# Test grades API for Carter
curl http://localhost:9000/api/schoology/grades \
  -H "Cookie: schoology_user_id=140834636" \
  | python3 -m json.tool
```

**Expected Response:**
```json
{
  "grades": {
    "8067479367": { "grade": 79, "period_id": "p1141932" },
    "8067479369": { "grade": 84, "period_id": "p1141932" }
  },
  "targetUserId": "140834636"
}
```

### Test in Browser

1. Log in as parent (Christina Mock or Ryan Mock)
2. Navigate to dashboard
3. Click on a child's profile in the dropdown
4. Verify grades appear next to each course

---

## Troubleshooting

### "No Grade" showing for all courses

**Possible causes:**

1. **Category weights are 0%**
   - Fix: `node scripts/update-category-weights.js`
   - Verify: Check Schoology UI → Course Settings → Grading Categories

2. **Assignments not linked to categories**
   - Fix: `node scripts/assign-categories-to-assignments.js`
   - Verify: Check assignment details in Schoology UI

3. **No grades uploaded**
   - Fix: `node scripts/import-grades-only.js`
   - Verify: `node scripts/check-assignments-grades.js {userId}`

4. **Grading categories don't exist**
   - Fix: Manually create in Schoology UI (one-time setup)
   - Then run: `node scripts/update-category-weights.js`

### Grades exist in API but not in UI

**Cause:** Assignments created with `allow_dropbox: 1` (requires submissions)

**Fix:** Recreate assignments with `allow_dropbox: 0`

### API returns empty grades object

**Possible causes:**

1. **Wrong user ID** - Verify you're using student ID, not parent ID
2. **No active child set** - Parent must have activeChildId set in Firestore
3. **Student has no grades** - Verify grades exist in Schoology

---

## Data Structure Reference

### Seed Data Master

**File:** `seed/sandbox/seed-data-master.json`

**Structure:**
```json
{
  "courses": [
    {
      "section_school_code": "AP-BIO-3120-S1",
      "grading_categories": {
        "Tests": 40,
        "Homework": 30,
        "Labs": 30
      }
    }
  ],
  "assignments": [
    {
      "course_school_code": "AP-BIO-3120-S1",
      "title": "Unit 1 Exam",
      "category": "Tests",  // Maps to grading category
      "points": 100
    }
  ],
  "grades": [
    {
      "section_school_code": "AP-BIO-3120-S1",
      "student_school_uid": "carter_mock",
      "assignment_title": "Unit 1 Exam",
      "grade": 85
    }
  ]
}
```

---

## Key Learnings

### What Works via API

✅ Creating assignments  
✅ Updating assignment categories  
✅ Updating category weights  
✅ Uploading grades (bulk)  
✅ Fetching final course grades  

### What Doesn't Work via API

❌ Creating grading categories (UI only)  
❌ Creating submissions (403 Forbidden)  

### Critical Parameters

- `allow_dropbox: 0` - Makes grades visible without submissions
- `grading_category_id` - Links assignment to weighted category
- `X-Schoology-Run-As` - Enables admin impersonation
- OAuth signature must NOT include POST body (Schoology quirk)

---

## Related Documentation

- `docs/guides/SCHOOLOGY-DATA-SEEDING.md` - Complete seeding workflow
- `docs/guides/GRADES-TROUBLESHOOTING.md` - Fix common issues
- `docs/guides/EXPECTED-GRADES-REFERENCE.md` - Expected values for verification
- `docs/guides/API-USER-IMPERSONATION.md` - Technical details on impersonation
- `seed/README.md` - Seed data and test accounts
- `.journal/2025-10-04-BREAKTHROUGH-ALLOW-DROPBOX.md` - Discovery of critical parameter
- `.journal/2025-10-04-SUBMISSION-API-CONCLUSION.md` - Why submissions don't work
