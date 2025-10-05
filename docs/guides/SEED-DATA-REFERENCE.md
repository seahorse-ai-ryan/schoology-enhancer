# Seed Data Normalization - Summary

**Date:** October 3, 2025  
**Status:** ✅ Complete

---

## ✅ What Was Accomplished

Took the comprehensive Gemini-generated seed data and normalized it to be the single source of truth for development.

---

## 📦 The Master File

**`/seed/sandbox/seed-data-master.json`** (49 KB)

### Contains:
- **2 Parents:** Ryan Hickman, Christina Mock
- **4 Students:** Carter (12th), Tazio (11th), Livio (8th), Lily (8th)
- **28 Teachers:** Real names from anonymized data
- **28 Courses:** Full range (AP, core, electives)
- **150+ Assignments:** Realistic grades, statuses, due dates
- **Attendance:** Per-course records
- **Events & Announcements:** School-wide data

---

## 🔄 Key Changes Made

### 1. **UID Normalization**
**Before:** `ryan_hickman_20251001`, `carter_mock_20250929`  
**After:** `ryan_hickman`, `carter_mock`

- Removed all date suffixes
- Simple, predictable format
- Applied to ALL users and references (350+ updates)

### 2. **Parent-Child Redistribution**
**Before:**
- Ryan → 1 child (Carter only)
- Christina → 3 children (Tazio, Livio, Lily)

**After:**
- Ryan → 2 children (Carter 12th + Lily 8th)
- Christina → 2 children (Tazio 11th + Livio 8th)

**Why:** Better testing with balanced accounts, different grade level combinations

### 3. **Added Grade Levels**
Added explicit `grade_level` field:
- Carter: 12 (senior)
- Tazio: 11 (junior)
- Livio: 8 (middle school)
- Lily: 8 (middle school)

---

## 👨‍👩‍👧‍👦 Testing Accounts

### Account 1: Ryan Hickman
**Email:** ryan.hickman@example.com  
**Children:**
- **Carter (12th grade, 2026 grad):** AP courses, sports, some missing assignments
- **Lily (8th grade, 2030 grad):** High achiever, all A's, on track

**Test:** High school senior vs middle schooler, college prep vs foundational

---

### Account 2: Christina Mock
**Email:** christina.mock@example.com  
**Children:**
- **Tazio (11th grade, 2027 grad):** Diverse courses (AP CS + Auto Shop), mixed grades
- **Livio (8th grade, 2030 grad):** Struggling in math, needs intervention

**Test:** Vocational + academic mix, student needing help

---

## 📊 Student Profiles

### Carter Mock (12th Grade) - 10 Courses
- AP Biology, AP English Lit, AP Statistics
- US Government, PE, Kinesiology Dual Enrollment
- Team Football, Tutorials

**Profile:** Senior with AP courses, athlete, some missing PE/Gov assignments

---

### Tazio Mock (11th Grade) - 7 Courses
- US History, American Lit, Physics, Pre-Calc
- AP Computer Science, Auto 3, Academic Planning

**Profile:** Junior with varied interests (tech + automotive), B/C student

---

### Livio Mock (8th Grade) - 7 Courses
- Science 8, Algebra 1, Choir, English 8
- French 1B, PE 8, Social Studies 8

**Profile:** Struggling in Algebra (very low scores), okay in other subjects

---

### Lily Mock (8th Grade) - 6 Courses
- Drama, Health, Language Arts, Science
- Social Studies, Algebra 1

**Profile:** Strong student, all A's, organized, on track

---

## 📁 File Status

### ✅ Active Files
- **`seed-data-master.json`** ← **USE THIS**
- `README.md` - Complete documentation
- `DEPRECATED-README.txt` - Deprecation notice

### ❌ Deprecated (Can Remove After Testing)
- `carter-mock.json`
- `tazio-mock.json`
- `livio-mock.json`
- `parent_associations.csv`

---

## 🚀 Next Steps

### 1. Update Seed Scripts
```typescript
// OLD
import carterData from './carter-mock.json';
import tazioData from './tazio-mock.json';

// NEW
import seedData from './seed-data-master.json';

// Access: seedData.users.parents, .students, .teachers
// Access: seedData.courses, seedData.assignments, etc.
```

### 2. Verify Parent-Child Associations
Test that:
- Ryan can see Carter & Lily
- Christina can see Tazio & Livio
- Child switching works (2-click)

### 3. Test All 4 Student Profiles
Each should load with correct:
- Courses (6-10 courses each)
- Assignments (150+ total)
- Grades and statuses
- Attendance records

### 4. Remove Old Files
After verification works:
```bash
cd seed/sandbox
rm carter-mock.json tazio-mock.json livio-mock.json parent_associations.csv
```

---

## 💡 Key Benefits

**Before:** Multiple files, inconsistent UIDs, unbalanced testing scenarios  
**After:** Single source of truth, clean UIDs, balanced parent accounts

**Testing Improvements:**
- 2 parent accounts (instead of 1)
- Balanced student distribution (2 each instead of 1 & 3)
- 4 distinct student personas with realistic, varied data
- 150+ realistic assignments vs. handful in old files
- Complete course enrollment data
- Attendance records included

---

## 📚 Documentation

**Read:** `/seed/sandbox/README.md` for comprehensive details on:
- Complete data inventory
- Student personas and use cases
- Testing scenarios
- UID conventions
- Usage examples

---

**Seed data is now production-ready for development! 🎉**

All UIDs are normalized, parent-child associations are balanced, and you have comprehensive realistic data from Gemini based on actual Schoology screenshots.


