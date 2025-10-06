# Schoology Bulk Upload Instructions

**Generated:** October 4, 2025  
**Source:** `seed-data-master.json` (103 assignments, 80 grades, 4 students, 2 parents, 28 teachers)  
**Status:** ✅ Ready for upload  
**Mode:** 📦 **INCREMENTAL UPDATE** - Adds to existing Schoology data

---

## 🎯 Important: This is an Incremental Upload

**Teacher UIDs have been aligned with your existing Schoology data:**
- All teachers use `_20250930` suffix to match existing users
- Admin user `ryan_hickman` is NOT included (keeping your admin separate)
- Will ADD 2 new parents: `ryan_mock`, `christina_mock`
- Will ADD 4 new students: `carter_mock`, `tazio_mock`, `livio_mock`, `lily_mock`
- Will ADD/UPDATE courses to use existing teachers
- Existing courses and teachers won't be affected

---

## 📊 What You're Uploading

### New Data Being Added
- **6 new users** (2 parents: Ryan Mock, Christina Mock | 4 students: Carter, Tazio, Livio, Lily)
- **27 courses** (will use existing teachers with `_20250930` UIDs)
- **30 enrollments** (new student-course associations)
- **4 parent associations** (Ryan Mock→Carter+Lily, Christina Mock→Tazio+Livio)
- **103 assignments** (realistic variety across all courses)
- **80 grades** (student scores on assignments)

### Existing Data (Won't Be Modified)
- **28 teachers** (all have matching `_20250930` UIDs)
- **1 admin** (ryan_hickman - your admin account, kept separate from test data)

### Test Personas

**Parent Account 1: Ryan Mock**
- Children: Carter (12th grade) + Lily (8th grade)
- Email: ryan.mock@example.com

**Parent Account 2: Christina Mock**
- Children: Tazio (11th grade) + Livio (8th grade)  
- Email: christina.mock@example.com

**Students:**
- **Carter** - Senior with AP courses, some missing assignments
- **Tazio** - Junior with AP CS + Auto Shop (diverse interests)
- **Livio** - 8th grader struggling in math (needs intervention testing)
- **Lily** - 8th grader, high achiever, all on track

---

## 📋 Upload Order (IMPORTANT!)

Upload files in this exact order to avoid dependency errors:

### 1. users.csv (34 rows)
**Contains:** 28 teachers (existing), 2 NEW parents (Ryan Mock, Christina Mock), 4 NEW students

**⚠️ Note:** Teachers already exist in Schoology - they'll be skipped/updated by UID match

**Schoology Upload:**
- Navigate to: School Settings → Import/Export
- Select: "Import Users"
- Upload: `users.csv`
- Map columns:
  - school_uid → School UID / User Unique ID
  - name_display → Display Name
  - name_first → First Name
  - name_last → Last Name
  - role → Role
  - additional_info → Additional Info

**Role Mapping:**
- Map CSV value "Teacher" → Schoology role "Teacher"
- Map CSV value "Parent" → Schoology role "Parent"
- Map CSV value "Student" → Schoology role "Student"

**Expected Results:**
- 28 teachers: Already exist (no changes)
- 2 parents: NEW (ryan_mock, christina_mock)
- 4 students: NEW (carter_mock, tazio_mock, livio_mock, lily_mock)

**✅ Your admin account (ryan_hickman) is NOT included in this file**

---

### 2. courses.csv (27 rows)
**Contains:** Course sections assigned to existing teachers (using `_20250930` UIDs)

**⚠️ Note:** Some courses may already exist - Schoology will update or skip based on section_school_code

**Schoology Upload:**
- Navigate to: School Settings → Import/Export
- Select: "Import Courses"
- Upload: `courses.csv`
- Map columns:
  - section_school_code → Section School Code
  - course_code → Course Code
  - course_title → Course Title
  - section_title → Section Title
  - teacher_school_uid → Teacher School UID
  - active → Active (1 = active)

**Expected Results:** New courses created with assignments, or existing courses updated if section codes match

---

### 3. enrollments.csv (30 rows)
**Contains:** Student-course associations

**Schoology Upload:**
- Navigate to: School Settings → Import/Export
- Select: "Import Enrollments"
- Upload: `enrollments.csv`
- Map columns:
  - section_school_code → Section School Code
  - student_school_uid → Student School UID
  - enrollment_type → Enrollment Type (2 = student)

**Verify:** All 4 students enrolled in correct courses

---

### 4. parent_associations.csv (4 rows)
**Contains:** Parent-child links

**⚠️ Important Location:** This import is NOT in the main Import/Export section!

**Schoology Upload:**
1. Navigate to: **Tools → User Management → Manage Users**
2. Click the **"Parents/Advisors"** tab
3. Click **"Options"** dropdown (top left)
4. Under **"ASSOCIATIONS"** section, click **"Import"**
5. Upload: `parent_associations.csv`
6. Map columns:
   - **Child Unique User ID*** → `student_school_uid`
   - **Parent Unique User ID*** → `parent_school_uid`
7. Preview and Confirm

**Expected Associations:**
- Ryan Mock → Carter (12th), Lily (8th)
- Christina Mock → Tazio (11th), Livio (8th)

**Verify:**
- Both parents should show 2 children each
- Students should appear under correct parent

---

### 5. assignments.csv (103 rows) ⚠️ API ONLY
**Contains:** All assignments across all courses

**❌ CANNOT be imported via CSV!**

According to [PowerSchool's Import Comprehensive Guide](https://uc.powerschool-docs.com/en/schoology/latest/import-comprehensive-guide), Schoology does NOT support bulk CSV import for assignments or grades.

**✅ Must use REST API instead:**

```bash
POST /v1/sections/{section_id}/assignments
{
  "title": "Assignment Title",
  "due": "2025-10-15T23:59:00Z",
  "max_points": 100,
  "description": "Assignment description",
  "type": "assignment"
}
```

**API Documentation:**
- [Schoology Assignment API](https://developers.schoology.com/api-documentation/rest-api-v1/assignment/)
- Requires OAuth authentication
- Must be done per-section

**Alternative:** Create assignments manually in Schoology UI or develop a script using the API

---

### 6. grades.csv (80 rows) ⚠️ API ONLY
**Contains:** Student grades on assignments

**❌ CANNOT be imported via CSV!**

Schoology does NOT support bulk CSV import for grades. They must be submitted via the REST API.

**✅ Must use REST API instead:**

```bash
POST /v1/sections/{section_id}/grades
{
  "enrollment_id": 12345,
  "assignment_id": 67890,
  "grade": 85,
  "comment": "Good work!"
}
```

**API Documentation:**
- [Schoology REST API](https://developers.schoology.com/api-documentation/rest-api-v1/)
- Requires OAuth authentication
- Must associate grades with specific enrollments and assignments

**Alternative:** Enter grades manually in Schoology gradebook or develop a script using the API

---

## ✅ Post-Upload Verification

### Test with Parent Accounts

**1. Login as Ryan Mock**
- Email: ryan.mock@example.com
- Should see 2 children: Carter, Lily
- Switch to Carter → See 10 courses with assignments/grades
- Switch to Lily → See 6 courses with assignments/grades

**2. Login as Christina Mock**
- Email: christina.mock@example.com
- Should see 2 children: Tazio, Livio
- Switch to Tazio → See 7 courses with assignments/grades
- Switch to Livio → See 7 courses with assignments/grades (low math scores)

**Note:** Your admin account (ryan_hickman) remains separate and untouched

### Verify Data Richness

**Check Carter's Data (Senior):**
- ✅ AP Biology: 5 assignments (1 missing, varied grades)
- ✅ AP English Lit: 5 assignments (essays, seminars)
- ✅ AP Statistics: 5 assignments (tests, video notes)
- ✅ US Government: 6 assignments (several missing)
- ✅ PE Weight Training: 6 assignments (participation tracking)
- ✅ Tutorial courses enrolled
- ✅ Kinesiology (dual enrollment)
- ✅ Team Football

**Check Tazio's Data (Junior):**
- ✅ US History: 5 assignments
- ✅ American Lit: 5 assignments (1 missing)
- ✅ Physics: 5 assignments (1 missing lab)
- ✅ Pre-Calculus: 5 assignments (2 missing DMs)
- ✅ AP Computer Science: 5 assignments
- ✅ Auto Shop: 5 assignments (vocational)
- ✅ Academic Planning: 3 assignments

**Check Livio's Data (8th Grade - Struggling Math):**
- ✅ Science: 6 assignments (variety)
- ✅ Algebra 1: 5 assignments (**LOW SCORES** - 8, 1, 0 out of 21, 12, 16)
- ✅ Choir: 4 assignments
- ✅ English 8: 4 assignments
- ✅ French 1B: 5 assignments
- ✅ PE 8: 5 assignments (low participation)
- ✅ Social Studies: 5 assignments

**Check Lily's Data (8th Grade - High Achiever):**
- ✅ Drama: 1 assignment (92/100)
- ✅ Health: 1 assignment (48/50)
- ✅ Language Arts: 1 assignment (88/100)
- ✅ Science 8: Shared with Livio
- ✅ Social Studies 8: Shared with Livio
- ✅ Algebra 1: Shared with Livio

---

## 🎯 Testing Scenarios Enabled

### Scenario 1: Parent Switches Between Children
- Ryan Mock switches from Carter (10 courses) to Lily (6 courses)
- Completely different course loads
- High school vs middle school UI differences

### Scenario 2: Missing Assignments Alert
- Carter has multiple missing assignments across courses
- Tazio has missing assignments in multiple subjects
- Livio has missing math homeworks

### Scenario 3: Struggling Student (Intervention Needed)
- Livio's Algebra scores: 8/21, 1/12, 0/16 (failing)
- Parent should see alerts/concerns
- Test "student needs help" UI flows

### Scenario 4: High Achiever
- Lily's all on track (no missing, good grades)
- Test "everything is fine" UI state

### Scenario 5: Varied Grading
- Different point values (10, 20, 50, 100, 150)
- Different categories with weights
- Late submissions, missing assignments, upcoming work

---

## 🚨 Common Upload Issues

### Issue 1: Date Format
**Problem:** Schoology expects specific date format  
**Fix:** May need to convert ISO timestamps to MM/DD/YYYY or YYYY-MM-DD

### Issue 2: Duplicate UIDs
**Problem:** School UID conflicts with existing data  
**Fix:** Use unique prefixes (e.g., `mock_carter` instead of `carter_mock`)

### Issue 3: Missing Teachers
**Problem:** Course import fails if teacher doesn't exist  
**Fix:** Upload users.csv FIRST, then courses.csv

### Issue 4: Grading Periods
**Problem:** Courses need grading period associations  
**Fix:** Create grading periods first or leave blank

---

## 📝 Notes

**What's Included:**
- ✅ Realistic assignment titles from actual Schoology data
- ✅ Varied due dates (past, present, future)
- ✅ Multiple grading categories per course
- ✅ Missing assignments flagged
- ✅ Late submissions marked
- ✅ Course materials/folders (in JSON, not CSV)
- ✅ School announcements and events
- ✅ Attendance records per course

**What's NOT Included (Manual Setup):**
- Grading periods/terms (create manually in Schoology)
- School calendar/holidays
- Actual file attachments for assignments
- Course descriptions

---

## ✅ Ready to Upload!

All CSV files are properly formatted and ready for Schoology bulk import.

**Estimated Time:** 15-20 minutes to upload all files  
**Result:** Fully populated Schoology sandbox with rich, realistic test data

**👉 Start with `users.csv` and work through the numbered list above!**

