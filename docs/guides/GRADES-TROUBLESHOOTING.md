# Grades Troubleshooting Guide

**Purpose:** Quick reference for diagnosing and fixing grade display issues

---

## 🔍 Diagnostic Commands

### Check What's in Schoology
```bash
# See all data for a student
node scripts/check-assignments-grades.js 140834636

# Show final grades for all students
node scripts/show-all-student-grades.js

# Check category setup
node scripts/check-grading-categories.js 140834636
```

### Test API Endpoints
```bash
# Test our grades API
curl http://localhost:9000/api/schoology/grades \
  -H "Cookie: schoology_user_id=140834636" | python3 -m json.tool

# Test E2E accuracy
node scripts/test-grades-e2e.js
```

---

## ❌ Problem: "No Grade" showing for all courses

### Possible Cause 1: Category weights are 0%

**Symptoms:**
- Assignments exist
- Individual assignment grades exist
- Final course grade = `null`

**Diagnosis:**
```bash
node scripts/check-grading-categories.js 140834636
```

Look for categories with `weight: 0%`.

**Fix:**
```bash
node scripts/update-category-weights.js
```

**Verify:**
```bash
node scripts/show-all-student-grades.js
```

---

### Possible Cause 2: Assignments not linked to categories

**Symptoms:**
- Categories have correct weights
- Assignments show as "Ungraded" in Schoology
- Final grade = `null`

**Diagnosis:**
Check assignment details in Schoology UI - look for "Grading Category: Ungraded"

**Fix:**
```bash
node scripts/assign-categories-to-assignments.js
```

**Verify:**
Refresh Schoology UI and check assignment details.

---

### Possible Cause 3: No grades uploaded

**Symptoms:**
- Assignments exist
- No individual assignment grades in Schoology

**Diagnosis:**
```bash
node scripts/check-assignments-grades.js 140834636
```

Look for `Individual Assignment Grades: 0`.

**Fix:**
```bash
node scripts/import-grades-only.js
```

**Verify:**
Check Schoology UI → Gradebook

---

### Possible Cause 4: Grading categories don't exist

**Symptoms:**
- Fresh Schoology instance
- No categories visible in UI

**Fix:**
Categories must be created manually in Schoology UI:

1. Log in as teacher (use Super Teacher: `super_teacher_20250930`)
2. Go to Course → Settings → Grading Categories
3. Create categories matching seed data names
4. Save (weights can be 0, will be updated by script)
5. Run: `node scripts/update-category-weights.js`

---

## ❌ Problem: Grades in API but not in UI

### Cause: Frontend not fetching grades

**Diagnosis:**
Check browser console for errors when loading dashboard.

**Fix:**
Verify `UserDashboard.tsx` has grades fetching logic:

```typescript
// Should have this in loadUserData():
const gradesRes = await fetch('/api/schoology/grades');
if (gradesRes.ok) {
  const gradesData = await gradesRes.json();
  setGrades(gradesData.grades || {});
}
```

---

### Cause: Section ID mismatch

**Symptoms:**
- API returns grades with correct section IDs
- UI shows courses but no grades
- Console shows "No grade found for course..."

**Diagnosis:**
Check if course IDs match grade keys:
```javascript
console.log('Course ID:', course.id);
console.log('Grade keys:', Object.keys(grades));
```

**Fix:**
Both courses and grades APIs must use `String(section.id)` consistently.

---

## ❌ Problem: Some students have grades, others don't

### Cause: Incomplete seeding

**Fix:**
Re-run complete seeding workflow:
```bash
./scripts/seed-all.sh
```

---

### Cause: Missing student enrollments

**Diagnosis:**
```bash
# Check if student is enrolled in courses
node scripts/check-assignments-grades.js {studentId}
```

If "Found 0 enrolled sections", the student isn't enrolled.

**Fix:**
Re-upload enrollments.csv via Schoology UI.

---

## ❌ Problem: Grades showing wrong values

### Cause: Stale data from previous seeding

**Fix:**
1. Delete all assignments in Schoology (via UI or API)
2. Re-run seeding:
   ```bash
   ./scripts/seed-all.sh
   ```

---

### Cause: Incorrect weight calculations

**Diagnosis:**
Compare Schoology UI grade with our API:

1. Check grade in Schoology → Gradebook
2. Check grade from API: `node scripts/show-all-student-grades.js`
3. If different, category weights may be wrong

**Fix:**
```bash
node scripts/update-category-weights.js
```

---

## ❌ Problem: API returns 403 Forbidden

### Cause: Missing admin credentials

**Fix:**
Ensure `.env.local` has:
```bash
SCHOOLOGY_ADMIN_KEY=your_key
SCHOOLOGY_ADMIN_SECRET=your_secret
```

---

### Cause: User ID doesn't exist

**Diagnosis:**
```bash
# Try to fetch user info
curl http://localhost:9000/api/schoology/me \
  -H "Cookie: schoology_user_id={userId}"
```

If 404, user doesn't exist in Schoology.

**Fix:**
Re-upload users.csv via Schoology UI.

---

## ❌ Problem: API returns empty grades object

### Cause: Parent with no active child

**Symptoms:**
```json
{
  "grades": {},
  "targetUserId": "140834634"  // ← Parent ID
}
```

**Fix:**
Set active child first:
```bash
curl -X POST http://localhost:9000/api/parent/active \
  -H "Cookie: schoology_user_id=140834634" \
  -H "Content-Type: application/json" \
  -d '{"childId":"140834636"}'
```

Or use the child's ID directly:
```bash
curl http://localhost:9000/api/schoology/grades \
  -H "Cookie: schoology_user_id=140834636"  # ← Child ID
```

---

## ✅ Verification Checklist

After fixing an issue, verify with these steps:

1. **Schoology Data:**
   ```bash
   node scripts/check-assignments-grades.js {userId}
   ```
   Should show: assignments, individual grades, final course grade

2. **Our API:**
   ```bash
   node scripts/test-grades-e2e.js
   ```
   Should show: 100% match between Schoology and our API

3. **UI Display:**
   - Open browser
   - Log in as parent
   - Select child
   - Verify grades appear with color coding

---

## 🆘 Nuclear Option: Complete Reseed

If nothing else works:

```bash
# 1. Clean Schoology (CAREFUL - deletes all assignments)
# Do this manually via Schoology UI or use API to delete

# 2. Reseed everything
./scripts/seed-all.sh

# 3. Verify
node scripts/show-all-student-grades.js
node scripts/test-grades-e2e.js

# 4. Test in browser
```

---

## 📞 Getting Help

If you're still stuck after trying these steps:

1. Check `docs/guides/GRADES-IMPLEMENTATION-GUIDE.md` for technical details
2. Check `docs/guides/SCHOOLOGY-DATA-SEEDING.md` for seeding workflow
3. Check `seed/README.md` for expected test data
4. Review `.journal/` files for historical context
5. Check terminal logs for Next.js errors

---

**Most grade issues are caused by:**
1. Missing or incorrect category weights (70% of cases)
2. Assignments not linked to categories (20% of cases)
3. Missing grades in Schoology (10% of cases)
