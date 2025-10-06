# Expected Grades Reference

**Last Updated:** October 5, 2025  
**Purpose:** Reference for verifying that grades are displaying correctly

---

## Carter Mock (12th Grade)
**User ID:** `140834636`  
**School UID:** `carter_mock`

| Course | Final Grade | Status |
|--------|-------------|--------|
| Kinesiology Dual Enr 15 | 100% | ✅ |
| AP English Literature | 84% | ✅ |
| AP Biology | 79% | ✅ |
| AP Statistics | 73% | ✅ |
| PE Weight Training | 49% | ✅ |
| US Government | 25% | ✅ |
| Kinesiology Dual Enr 16A | No Grade | Partial data |
| Closed Tutorial | No Grade | No assignments |
| FHS Tutorial | No Grade | No assignments |
| Team Football | No Grade | No assignments |

**Total Courses with Grades:** 6 out of 10

---

## Tazio Mock (11th Grade)
**User ID:** `140834637`  
**School UID:** `tazio_mock`

| Course | Final Grade | Status |
|--------|-------------|--------|
| Academic Planning | 75% | ✅ |
| US History | 73% | ✅ |
| Auto 3 | 67% | ✅ |
| Physics | 60% | ✅ |
| AP Computer Science Principles | 59% | ✅ |
| Pre Calculus | 56% | ✅ |
| American Literature 11 | 0% | ✅ (low grade) |

**Total Courses with Grades:** 7 out of 7

---

## Livio Mock (8th Grade)
**User ID:** `140834638`  
**School UID:** `livio_mock`

| Course | Final Grade | Status |
|--------|-------------|--------|
| Choir | 89% | ✅ |
| English 8 | 82% | ✅ |
| French 1B | 75% | ✅ |
| PE 8 | 64% | ✅ |
| Algebra 1 | No Grade | Categories need setup |
| Science 8 | No Grade | Categories need setup |
| Social Studies 8 | No Grade | Categories need setup |

**Total Courses with Grades:** 4 out of 7

---

## Lily Mock (8th Grade)
**User ID:** `140834639`  
**School UID:** `lily_mock`

| Course | Final Grade | Status |
|--------|-------------|--------|
| Health and Fitness | 96% | ✅ |
| Drama | 92% | ✅ |
| Language Arts 8 | 88% | ✅ |
| Algebra 1 | No Grade | Categories need setup |
| Science 8 | No Grade | Categories need setup |
| Social Studies 8 | No Grade | Categories need setup |

**Total Courses with Grades:** 3 out of 6

---

## Notes

### Courses Without Final Grades

Some courses show "No Grade" for the following reasons:

1. **No grading categories configured** - Categories must be created in Schoology UI
2. **Category weights sum to 0%** - Need to run `update-category-weights.js`
3. **No assignments** - Tutorial courses intentionally have no graded work
4. **Assignments not categorized** - Need to run `assign-categories-to-assignments.js`

### Expected UI Display

When viewing the dashboard as a parent:

1. Select child from dropdown (e.g., "Carter Mock")
2. Dashboard should show list of courses
3. Each course should display:
   - Course name
   - Course code
   - Teacher name
   - **Grade badge** (if grade exists)
   - "No grade" label (if no final grade)

### API Response Format

```json
{
  "grades": {
    "8067479367": {
      "grade": 79,
      "period_id": "p1141932"
    }
  },
  "targetUserId": "140834636"
}
```

Key is the section ID (matches course ID in UI).

---

## Verification Commands

### Show all student grades:
```bash
node scripts/show-all-student-grades.js
```

### Check specific student:
```bash
node scripts/check-assignments-grades.js 140834636  # Carter
node scripts/check-assignments-grades.js 140834637  # Tazio
node scripts/check-assignments-grades.js 140834638  # Livio
node scripts/check-assignments-grades.js 140834639  # Lily
```

### Test API endpoint:
```bash
# Carter's grades
curl http://localhost:9000/api/schoology/grades \
  -H "Cookie: schoology_user_id=140834636" | python3 -m json.tool

# Tazio's grades
curl http://localhost:9000/api/schoology/grades \
  -H "Cookie: schoology_user_id=140834637" | python3 -m json.tool
```

---

## Data Sources

- **Seed Data:** `seed/sandbox/seed-data-master.json`
- **CSV Exports:** `seed/sandbox/csv-exports/*.csv`

## Related Documentation

- `seed/README.md` - Complete seed data reference
- `docs/guides/SCHOOLOGY-DATA-SEEDING.md` - How to seed this data
- `docs/guides/GRADES-TROUBLESHOOTING.md` - Fix issues
- `scripts/README.md` - Verification scripts

---

**This reference should match exactly what appears in the UI after proper seeding.**
