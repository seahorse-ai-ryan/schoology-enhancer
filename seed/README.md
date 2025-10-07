# Seed Data for Modern Teaching

**Last Updated:** October 5, 2025  
**Purpose:** Complete reference for test data used in development

---

## 📁 Data Files

### Source Data (`data/` directory)

**`data/master.json`** - Complete seed data for all mock users
**`data/assignments-additional.json`** - Additional assignments (overdue, upcoming tests)

**Contains:**
- 2 Parents (Ryan Mock, Christina Mock)
- 4 Students (Carter 12th, Tazio 11th, Livio 8th, Lily 8th)
- 28 Teachers (real names from anonymized Schoology data)
- 28 Courses (AP, core subjects, electives)
- 103 Assignments (realistic variety with due dates)
- 80 Grades (varied scores across all students)
- Grading categories with weights for each course

---

## 👨‍👩‍👧‍👦 Test Accounts

### Parent 1: Ryan Mock
**Email:** `ryan.mock@example.com`  
**School UID:** `ryan_mock`

**Children:**
- **Carter Mock** (12th grade, 2026 grad)
  - 10 courses (AP Biology, AP English Lit, AP Statistics, US Gov, PE, etc.)
  - 6 courses with grades (79%, 84%, 73%, 100%, 49%, 25%)
  - Profile: Senior with AP courses, athlete, some missing assignments
  
- **Lily Mock** (8th grade, 2030 grad) - ID: `140834639`
  - 6 courses (Drama, Health, Language Arts, Science, Social Studies, Algebra)
  - 3 courses with grades (96%, 92%, 88%)
  - Profile: High achiever, all A's, organized

---

### Parent 2: Christina Mock
**Email:** `christina.mock@example.com`  
**School UID:** `christina_mock`

**Children:**
- **Tazio Mock** (11th grade, 2027 grad)
  - 7 courses (US History, American Lit, Physics, Pre-Calc, AP CS, Auto, Planning)
  - All 7 courses have grades (75%, 73%, 67%, 60%, 59%, 56%, 0%)
  - Profile: Diverse interests (tech + automotive), B/C student
  
- **Livio Mock** (8th grade, 2030 grad) - ID: `140834638`
  - 7 courses (Science, Algebra, Choir, English, French, PE, Social Studies)
  - 4 courses with grades (89%, 82%, 75%, 64%)
  - Profile: Struggling in Algebra (low scores), okay in other subjects

---

## 🌱 Seeding Workflow

### Prerequisites

1. **CSV Data Imported** (one-time setup):
   - Users (teachers, parents, students)
   - Courses (sections)
   - Enrollments
   - Parent associations
   
   See: `sandbox/csv-exports/UPLOAD-INSTRUCTIONS.md`

2. **Environment Variables** in `.env.local`:
   ```bash
   SCHOOLOGY_ADMIN_KEY=your_system_admin_key
   SCHOOLOGY_ADMIN_SECRET=your_system_admin_secret
   ```

### Complete Seeding (One Command)

```bash
./scripts/seed-all.sh
```

This runs all 4 steps automatically:
1. Creates 103 assignments
2. Updates 55 grading category weights
3. Links 93 assignments to categories
4. Uploads 80 grades

**Time:** ~5-10 minutes

### Verification

```bash
# Show all student grades
node scripts/show-all-student-grades.js

# Check specific student
node scripts/check-assignments-grades.js 140834636  # Carter

# Test API accuracy
node scripts/test-grades-e2e.js
```

---

## 📊 Expected Results

After seeding, students should have these final course grades:

### Carter Mock (12th)
- 100% - Kinesiology Dual Enr 15 (green)
- 84% - AP English Literature (blue)
- 79% - AP Biology (yellow)
- 73% - AP Statistics (yellow)
- 49% - PE Weight Training (red)
- 25% - US Government (red)

### Tazio Mock (11th)
- 75% - Academic Planning
- 73% - US History
- 67% - Auto 3
- 60% - Physics
- 59% - AP Computer Science
- 56% - Pre Calculus
- 0% - American Literature 11

### Livio Mock (8th)
- 89% - Choir
- 82% - English 8
- 75% - French 1B
- 64% - PE 8

### Lily Mock (8th)
- 96% - Health and Fitness
- 92% - Drama
- 88% - Language Arts 8

---

## 🔧 How Schoology Grades Work

### The Calculation System

Schoology calculates final course grades using **weighted categories**:

1. **Grading Categories** - Each course has categories (Tests, Homework, Labs)
2. **Category Weights** - Each category has a percentage (e.g., Tests = 40%)
3. **Assignment Categorization** - Each assignment belongs to a category
4. **Automatic Calculation** - Schoology calculates based on weighted averages

**Example:**
```
AP Biology:
├── Tests (40%) → Average: 75% → Weighted: 30 points
├── Homework (30%) → Average: 90% → Weighted: 27 points
└── Labs (30%) → Average: 85% → Weighted: 25.5 points
Final Grade: 82.5%
```

### Critical Requirements

For final grades to calculate:
- ✅ Grading categories must exist (created in Schoology UI)
- ✅ Categories must have non-zero weights
- ✅ Assignments must be linked to categories
- ✅ Assignments must have `allow_dropbox: 0` (grades visible immediately)

---

## 🗂️ File Structure

```
seed/
├── README.md (this file)
├── .schoology-instance.json (gitignored - your instance-specific IDs)
├── data/                              # Source JSON data
│   ├── master.json                    # Primary seed data
│   └── assignments-additional.json    # Additional assignments
└── csv-exports/                       # Generated CSVs for bulk upload
    ├── users.csv
    ├── courses.csv
    ├── enrollments.csv
    ├── parent_associations.csv
    ├── assignments.csv (reference - use API)
    ├── grades.csv (reference - use API)
    └── UPLOAD-INSTRUCTIONS.md
```

**Note:** After uploading CSVs, create `.schoology-instance.json` with your instance's numeric IDs:
```json
{
  "school_group_id": "YOUR_GROUP_ID",
  "super_teacher_id": "YOUR_TEACHER_ID",
  "student_ids": {
    "carter_mock": "YOUR_ID",
    ...
  }
}
```

⚠️ **This file is gitignored** - You must create it locally after seeding.

---

## 🚀 Quick Start

### First Time Setup

1. **Upload CSVs to Schoology** (one-time):
   ```bash
   # Follow instructions in:
   cd seed/csv-exports
   cat UPLOAD-INSTRUCTIONS.md
   ```

2. **Run API seeding**:
   ```bash
   ./scripts/seed-all.sh
   ```

3. **Verify**:
   ```bash
   node scripts/show-all-student-grades.js
   ```

### Reseeding (After Changes)

If you modify `seed-data-master.json`:

```bash
# Regenerate CSVs (if user/course data changed)
node scripts/generate-seed-csvs.js

# Re-upload CSVs to Schoology (if needed)

# Reseed assignments and grades
./scripts/seed-all.sh
```

---

## 🔍 Troubleshooting

### No grades showing

```bash
# Check what's in Schoology
node scripts/check-assignments-grades.js 140834636

# Reseed everything
./scripts/seed-all.sh
```

### Category weights are 0%

```bash
node scripts/update-category-weights.js
```

### Assignments not categorized

```bash
node scripts/assign-categories-to-assignments.js
```

**For complete troubleshooting:** See `docs/guides/GRADES-TROUBLESHOOTING.md`

---

## 📖 Related Documentation

**Essential Guides:**
- `docs/guides/SEEDING-QUICK-START.md` - Quick reference card
- `docs/guides/GRADES-IMPLEMENTATION-GUIDE.md` - How grades work in our app
- `docs/guides/GRADES-TROUBLESHOOTING.md` - Fix common issues

**Technical Details:**
- `docs/guides/API-USER-IMPERSONATION.md` - How X-Schoology-Run-As works
- `scripts/README.md` - All seeding and testing scripts

**Historical Context:**
- `.journal/2025-10-04-BREAKTHROUGH-ALLOW-DROPBOX.md` - Discovery of critical parameter
- `.journal/2025-10-04-SUBMISSION-API-CONCLUSION.md` - Why submissions don't work via API

---

## 🎓 Key Learnings

### What Works via API
✅ Creating assignments (`POST /sections/{id}/assignments`)  
✅ Updating category weights (`PUT /sections/{id}/grading_categories/{id}`)  
✅ Linking assignments to categories (`PUT /sections/{id}/assignments/{id}`)  
✅ Uploading grades in bulk (`PUT /sections/{id}/grades`)  

### What Doesn't Work via API
❌ Creating grading categories (must use Schoology UI)  
❌ Creating submissions (returns 403 Forbidden)  

### Critical Parameters
- `allow_dropbox: 0` - Makes grades visible without submissions
- `grading_category_id` - Links assignment to weighted category
- `X-Schoology-Run-As` - Enables admin impersonation

---

**Ready to seed? Run `./scripts/seed-all.sh` and you'll have complete test data in ~5 minutes!**
