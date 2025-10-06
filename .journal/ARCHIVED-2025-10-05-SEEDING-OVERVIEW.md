# Schoology Seeding Overview

## Purpose

This guide explains the complete process for seeding a Schoology developer sandbox with realistic test data for Modern Teaching development.

## The 2-Phase Seeding Process

Schoology requires a **two-phase approach** because different data types support different import methods:

### Phase 1: CSV Bulk Uploads
**What:** Users, Courses, Enrollments, Parent Associations  
**How:** Schoology's web-based CSV import tools  
**Why:** These entities are foundational and Schoology provides native CSV importers

### Phase 2: API Batch Operations
**What:** Assignments, Submissions, Grades  
**How:** Schoology REST API with impersonation  
**Why:** CSV import not available - must use API programmatically

---

## Phase 1: CSV Bulk Uploads

### What Gets Uploaded
1. **Users** - Parents, students, teachers (2 parents, 4 students, 28 teachers)
2. **Courses** - 28 courses across grade levels and subjects
3. **Enrollments** - Students and teachers enrolled in sections
4. **Parent Associations** - Link parents to their children

### Process
```bash
# Generate CSVs from seed data
node scripts/generate-seed-csvs.js

# Upload via Schoology UI (in order)
# 1. users.csv → Tools → User Management → Import
# 2. courses.csv → Tools → Course Management → Import  
# 3. enrollments.csv → Tools → Enrollment Management → Import
# 4. parent_associations.csv → Tools → User Management → Manage Users → Parents tab → Import
```

### Source Data
- **Master file:** `seed/sandbox/seed-data-master.json`
- **Generated CSVs:** `seed/sandbox/csv-exports/*.csv`

### Detailed Guide
See: `docs/guides/SCHOOLOGY-CSV-IMPORT.md`

---

## Phase 2: API Batch Operations

### What Gets Created
1. **Assignments** - 103 assignments across all courses
2. **Submissions** - Placeholder submissions for each student (required for grades to show in UI!)
3. **Grades** - 80+ grades with various scores and comments

### Why Use the API?
Schoology does **not support CSV import** for assignments and grades. They must be created via REST API.

### The 3-Step Workflow
For grades to appear in the Schoology UI, you must create them in this exact order:

1. **Create Assignment** → Creates the assignment container
2. **Create Submission** → Creates placeholder for each student (**critical for UI visibility**)
3. **Create Grade** → Adds grade value to submission

### Process
```bash
# Set environment variables
export SCHOOLOGY_ADMIN_KEY=your_system_admin_key
export SCHOOLOGY_ADMIN_SECRET=your_system_admin_secret

# Create assignments (Step 1)
node scripts/create-assignments-via-impersonation.js bulk

# Create submissions + grades (Steps 2 & 3)
node scripts/import-grades-only.js
```

### Technical Requirement: API Impersonation
API operations require the **`X-Schoology-Run-As`** header to act as teachers:
- Uses System Admin API keys (permanent, no expiration)
- Impersonates teachers to create their course content
- No need to enroll admin in courses

### Detailed Guides
- **API Operations:** `docs/guides/SCHOOLOGY-API-SEEDING.md`
- **Impersonation:** `docs/guides/API-USER-IMPERSONATION.md`

---

## Complete Seeding Workflow

### Prerequisites
1. Schoology developer sandbox account with System Admin role
2. System Admin API keys (from Schoology admin settings)
3. Impersonation enabled (User Management → Permissions → Impersonation → Teacher)

### Step-by-Step
```bash
# 1. Generate CSVs
node scripts/generate-seed-csvs.js

# 2. Upload CSVs via Schoology UI (in order)
#    - users.csv
#    - courses.csv  
#    - enrollments.csv
#    - parent_associations.csv

# 3. Set API credentials
export SCHOOLOGY_ADMIN_KEY=your_key
export SCHOOLOGY_ADMIN_SECRET=your_secret

# 4. Create assignments via API
node scripts/create-assignments-via-impersonation.js bulk

# 5. Create submissions & grades via API
node scripts/import-grades-only.js

# 6. Verify in Schoology UI
# - Log in as parent (ryan_mock@example.com or christina_mock@example.com)
# - Check child accounts have courses, assignments, and grades
```

---

## Seed Data Contents

### Test Accounts
**Parent 1: Ryan Mock**
- Email: `ryan_mock@example.com`
- Children: Carter (12th), Lily (8th)

**Parent 2: Christina Mock**
- Email: `christina_mock@example.com`
- Children: Tazio (11th), Livio (8th)

### Data Inventory
- 2 Parents
- 4 Students (balanced: 2 per parent)
- 28 Teachers
- 28 Courses (AP, core, electives)
- 103 Assignments (various types, due dates)
- 80+ Grades (realistic score distribution)

### Seed Data Guides
- **Reference:** `docs/guides/SEED-DATA-REFERENCE.md` - What data exists
- **Structure:** `docs/guides/SCHOOLOGY-SEED-DATA-GUIDE.md` - How to create seed data
- **Expansion:** `docs/guides/SEED-DATA-EXPANSION-PLAN.md` - Future plans

---

## Troubleshooting

### CSV Upload Issues
- **Role not mapping:** Ensure CSV has capitalized values ("Teacher", "Parent", "Student")
- **Missing course code:** enrollments.csv must have both `course_code` and `section_school_code`
- **Parent associations not found:** Use separate UI location (Parents/Advisors tab)

### API Issues
- **401 Unauthorized:** OAuth signature issue - don't include body data in signature
- **403 Forbidden:** Impersonation not enabled in Schoology settings
- **404 Not Found:** Using `school_uid` instead of numeric Schoology IDs
- **Grades not showing in UI:** Missing submission step (Step 2 in 3-step workflow)

---

## Quick Reference

| Task | Method | Guide |
|------|--------|-------|
| Users, Courses, Enrollments | CSV Upload | `SCHOOLOGY-CSV-IMPORT.md` |
| Assignments, Submissions, Grades | API Batch | `SCHOOLOGY-API-SEEDING.md` |
| API Impersonation Setup | System Admin Keys | `API-USER-IMPERSONATION.md` |
| Seed Data Overview | JSON Reference | `SEED-DATA-REFERENCE.md` |

---

## Success Criteria

✅ All CSVs uploaded without errors  
✅ Assignments visible in teacher view  
✅ Assignments visible in student "To Do"  
✅ **Grades visible on parent/student grades page** (confirms submission step worked)  
✅ Parent can switch between children  
✅ Each student has 6-10 courses with assignments and grades  

---

**Ready to seed?** Start with Phase 1 CSVs, then move to Phase 2 API operations.

