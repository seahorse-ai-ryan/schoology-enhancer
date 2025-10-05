# Schoology Seed Data Generation Guide

**Last Updated:** September 30, 2025  
**Purpose:** Document best practices and learnings for creating mock student/teacher/course data for Schoology developer sandbox testing.

---

## Table of Contents

1. [Data Source Philosophy](#data-source-philosophy)
2. [Required Fields & Constraints](#required-fields--constraints)
3. [Common Pitfalls & Fixes](#common-pitfalls--fixes)
4. [Seed JSON Structure](#seed-json-structure)
5. [CSV Generation Rules](#csv-generation-rules)
6. [Import Sequence](#import-sequence)

---

## Data Source Philosophy

### Golden Rule: No Dynamic Generation

**❌ BAD:** Generating `school_uid` values dynamically based on today's date  
**✅ GOOD:** Storing explicit `school_uid` values in seed JSON files

**Why:** Users in Schoology are created at specific points in time. Their UIDs must match **exactly** between:

- The initial creation (via API or CSV)
- The CSV exports for enrollments, associations, etc.
- The app's data fetching logic

**Solution:** All `school_uid` values are **explicitly defined** in `seed/sandbox/*.json` files and **never** dynamically generated.

---

## Required Fields & Constraints

### User Fields

#### Students

```json
{
  "name": "Carter Mock",
  "role": "student",
  "grad_year": 2026,
  "school_uid": "carter_mock_20250929" // REQUIRED - must match Schoology
}
```

- `school_uid`: **REQUIRED** - Format: `firstname_lastname_YYYYMMDD`
  - Only letters, numbers, periods, dashes, underscores allowed
  - Must be globally unique within the school
  - Date should match when user was actually created in Schoology
- `primary_email`: **OPTIONAL** for students (omit to avoid conflicts)
- `name`: Full name (first + last)
- `grad_year`: Graduation year (for students)

#### Teachers

```json
{
  "name": "Summers E",
  "role": "teacher",
  "school_uid": "summers_e_20250930", // REQUIRED
  "email": "summers.e@modernteaching.example" // OPTIONAL
}
```

- `school_uid`: **REQUIRED** - Same rules as students
- `primary_email`: **OPTIONAL** - Use unique email or auto-generate
- **Name Constraints:**
  - No special characters that can't be sanitized (e.g., `/`, `,`, `—`)
  - Single-word names get `_user` appended
  - **Examples of FIXED names:**
    - ❌ `"Snell/Harris"` → ✅ `"Snell Harris"` → UID: `snell_harris_20250930`
    - ❌ `"Cronin,Tari"` → ✅ `"Cronin Tari"` → UID: `cronin_tari_20250930`
    - ❌ `"—"` (em-dash) → ✅ Remove entirely (invalid teacher)

#### Parents

```json
{
  "name": "Ryan Hickman",
  "email": "ryan@seahorsetwin.com",
  "role": "parent",
  "school_uid": "ryan_hickman_20250929" // REQUIRED
}
```

- `school_uid`: **REQUIRED**
- `primary_email`: **REQUIRED** for parents (used for login)

---

### Course Fields

```json
{
  "title": "US Government",
  "course_code": "US-GOVERNMENT", // REQUIRED - max ~20 chars
  "teacher": "Summers E", // Must match a teacher's name exactly
  "section": "p1 T1", // REQUIRED - displays as "Section Name" in Schoology UI
  "section_school_code": "US-GOVERNMENT-S1", // REQUIRED - Schoology auto-generates as {COURSE_CODE}-S1
  "description": "", // Optional
  "department": "", // Optional
  "credits": "1" // Optional
}
```

**Critical Fields:**

- `course_code`: **REQUIRED** - Used by Schoology to match courses
  - Max length ~20 characters (e.g., `KINESIOLOGY-DUAL-ENR-15` → `KINESIOLOGY-DUAL-ENR`)
  - Use uppercase, hyphens for spaces
- `section`: **REQUIRED** - Displays as "Section Name" in Schoology UI
  - Can be descriptive (e.g., `"p1 T1"`, `"07 (8308 4 Acad Planning)"`)
  - This is what teachers/students see in the UI
- `section_school_code`: **REQUIRED** - Unique identifier for the section
  - **Schoology auto-generates this as `{COURSE_CODE}-S1`**
  - Must be unique across all courses and grading periods
  - Used for enrollment matching

**Examples from real data:**

- Course: "US Government", Code: `US-GOVERNMENT`, Section: `"p1 T1"`, School Code: `US-GOVERNMENT-S1`
- Course: "Auto 3", Code: `AUTO-3`, Section: `"02 (5053 1 Auto 3)"`, School Code: `AUTO-3-S1`

---

### Enrollment Fields

```json
{
  "course": "US Government", // Must match course title exactly
  "user": "Carter Mock", // Must match student name
  "role": "student"
}
```

**Note:** Enrollments are auto-generated from course-teacher relationships and enrollment records in the CSV export.

---

## Common Pitfalls & Fixes

### 1. Invalid Teacher Names

❌ **Problem:** Teachers with special characters or non-alphanumeric names

```json
{ "name": "Snell/Harris" }  // Forward slash is invalid
{ "name": "Cronin,Tari" }  // Comma is invalid
{ "name": "—" }  // Em-dash is invalid
```

✅ **Fix:** Sanitize names in the seed JSON

```json
{ "name": "Snell Harris", "school_uid": "snell_harris_20250930" }
{ "name": "Cronin Tari", "school_uid": "cronin_tari_20250930" }
// Remove the em-dash entry entirely
```

---

### 2. Email Conflicts

❌ **Problem:** Using the same email for multiple users

```json
{ "name": "Parent 1", "email": "ryan@seahorsetwin.com" }
{ "name": "Parent 2", "email": "ryan@seahorsetwin.com" }  // CONFLICT
```

✅ **Fix:** Omit email for students, use unique emails for parents/teachers

```json
// Students: no email
{ "name": "Carter Mock", "role": "student" }

// Parents/Teachers: unique emails
{ "name": "Ryan Hickman", "email": "ryan@seahorsetwin.com" }
{ "name": "Christina Mock", "email": "christina@example.com" }
```

---

### 3. Section Code Mismatch

❌ **Problem:** Section codes in CSV don't match what Schoology auto-generates

**Root Cause:**

- The `section` field (e.g., `"p1 T1"`) is for display only (appears as "Section Name" in UI)
- Schoology **auto-generates** `section_school_code` as `{COURSE_CODE}-S1`
- This is independent of the section name

✅ **Fix:** Always use `{COURSE_CODE}-S1` for `section_school_code`

```json
{
  "course_code": "AUTO-3",
  "section": "02 (5053 1 Auto 3)", // Display name
  "section_school_code": "AUTO-3-S1" // Auto-generated by Schoology
}
```

**See also:**

- [Schoology Enrollment API](https://developers.schoology.com/api-documentation/rest-api-v1/enrollment/)
- [Section Code vs Section School Code](https://uc.powerschool-docs.com/en/schoology/latest/section-code-and-section-school-code)

---

### 4. Date Mismatches

❌ **Problem:** Students created on Sept 29, but CSV uses Sept 30

```javascript
const today = new Date(); // DON'T DO THIS
const studentUid = `carter_mock_${today.getFullYear()}${month}${day}`;
```

✅ **Fix:** Use explicit `school_uid` from JSON

```typescript
const studentUid = seed.data.users.student.school_uid; // Read from JSON
```

---

## Seed JSON Structure

### File Location

`/seed/sandbox/{name}-mock.json`

### Full Example: `carter-mock.json`

```json
{
  "users": {
    "parent": {
      "name": "Ryan Hickman",
      "email": "ryan@seahorsetwin.com",
      "role": "parent",
      "school_uid": "ryan_hickman_20250929"
    },
    "student": {
      "name": "Carter Mock",
      "role": "student",
      "grad_year": 2026,
      "school_uid": "carter_mock_20250929"
    },
    "teachers": [
      {
        "name": "Summers E",
        "role": "teacher",
        "school_uid": "summers_e_20250930"
      },
      {
        "name": "Gamboa A",
        "role": "teacher",
        "school_uid": "gamboa_a_20250930"
      }
    ]
  },
  "courses": [
    {
      "title": "US Government",
      "course_code": "US-GOVERNMENT",
      "teacher": "Summers E",
      "section": "p1 T1",
      "section_school_code": "US-GOVERNMENT-S1"
    },
    {
      "title": "AP Biology",
      "course_code": "AP-BIOLOGY",
      "teacher": "Gamboa A",
      "section": "p2 T1",
      "section_school_code": "AP-BIOLOGY-S1"
    }
  ],
  "enrollments": [
    { "course": "US Government", "user": "Carter Mock", "role": "student" },
    { "course": "AP Biology", "user": "Carter Mock", "role": "student" }
  ]
}
```

---

## CSV Generation Rules

### Teachers CSV

- **Filename:** `all-teachers.csv`
- **Headers:** `school_uid,name_title,name_first,name_last,primary_email,role_name`
- **school_uid Source:** Read from `teacher.school_uid` in JSON
- **Deduplication:** Teachers appearing in multiple seed files are only listed once

### Courses CSV

- **Filename:** `all-courses.csv`
- **Headers:** `course_code,course_title,section_title,section_school_code,description,department,credits`
- **course_code:** Read from `course.course_code` (max ~20 chars)
- **section_title:** Read from `course.section` (displays in UI as "Section Name")
- **section_school_code:** Read from `course.section_school_code` (always `{COURSE_CODE}-S1`)
- **Includes Sections:** Schoology imports courses and sections together in one CSV
- **Note:** Schoology auto-generates `section_school_code` as `{COURSE_CODE}-S1` regardless of section name

### Enrollments CSV

- **Filename:** `all-enrollments.csv`
- **Headers:** `course_code,section_school_code,unique_user_id,enrollment_type`
- **enrollment_type:**
  - `1` = Admin (Teachers)
  - `2` = Member (Students)
- **Teacher UIDs:** Looked up from `teachers` array by matching `course.teacher` to `teacher.name`
- **Student UIDs:** Read from `student.school_uid`
- **Order:** Teachers listed FIRST, then students

---

## Import Sequence

### Step 1: Import Teachers

1. Download **Teachers CSV**
2. Upload to Schoology → Tools → User Management → Manage Users → Import
3. **Settings:**
   - Match by: `School Unique ID`
   - Role: `Teacher`
   - Update existing: Yes

### Step 2: Import Courses (includes Sections)

1. Download **Courses CSV**
2. Upload to Schoology → Tools → Courses → Import
3. **Settings:**
   - Select **School**
   - Select **Grading Periods** (create one first if needed)
   - Match by: `Course Code`

### Step 3: Import Enrollments

1. Download **Enrollments CSV**
2. Upload to Schoology → Tools → Courses → Course Enrollments → Import
3. **Critical Settings:**
   - **Enroll based on:** ⚠️ `Section School Code` (NOT "Section Code")
   - **Enrollment Type:** "Use Import File"
     - Admin CSV Value: `1`
     - Member CSV Value: `2`

---

## Future Mock Data Guidelines

When creating new mock students/teachers:

1. **Always** specify explicit `school_uid` values
2. **Never** use dynamic date generation
3. **Sanitize** teacher names (no `/`, `,`, or special chars)
4. **Match** teacher names exactly between courses and teachers array
5. **Use** descriptive section names that match real Schoology data
6. **Test** CSV generation before uploading to Schoology

---

## Example: Adding a New Student

```json
// In seed/sandbox/new-student-mock.json
{
  "users": {
    "student": {
      "name": "Alex Johnson",
      "role": "student",
      "grad_year": 2027,
      "school_uid": "alex_johnson_20251001" // Use actual creation date
    },
    "teachers": [
      {
        "name": "Smith J",
        "role": "teacher",
        "school_uid": "smith_j_20251001" // Use actual creation date
      }
    ]
  },
  "courses": [
    {
      "title": "Algebra II",
      "course_code": "ALGEBRA-II",
      "teacher": "Smith J",
      "section": "p3 T1",
      "section_school_code": "ALGEBRA-II-S1"
    }
  ],
  "enrollments": [
    { "course": "Algebra II", "user": "Alex Johnson", "role": "student" }
  ]
}
```

**Key Points:**

1. `school_uid` must match when users are actually created in Schoology
2. `course_code` max ~20 characters
3. `section` can be descriptive (what users see)
4. `section_school_code` follows pattern `{COURSE_CODE}-S1`

Then regenerate CSVs and import in sequence: Teachers → Courses → Enrollments.

---

## API & Documentation References

**Schoology Developer Docs:**

- [Enrollment API](https://developers.schoology.com/api-documentation/rest-api-v1/enrollment/)
- [Course Section API](https://developers.schoology.com/api-documentation/rest-api-v1/course-section/)

**PowerSchool Help Center:**

- [Section Code and Section School Code](https://uc.powerschool-docs.com/en/schoology/latest/section-code-and-section-school-code)
- [Import Courses with CSV](https://uc.powerschool-docs.com/en/schoology/latest/import-courses-with-a-csv-xls-file)
- [Import Course Enrollments with CSV](https://uc.powerschool-docs.com/en/schoology/latest/import-course-enrollments-with-a-csv-xls-file)

**Project Documentation:**

- `docs/SCHOOLOGY-CSV-IMPORT.md` - Detailed CSV import instructions
