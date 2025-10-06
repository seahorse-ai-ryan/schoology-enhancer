# Manual Testing Checklist - Grades Feature

**Purpose:** Verify grades feature works correctly in the browser

---

## Prerequisites

✅ Development services running (`/start` command)  
✅ Logged in to the application  
✅ Schoology data seeded (`./scripts/seed-all.sh`)

---

## Test Scenario 1: Parent Viewing Child Grades

### Setup
- User: Christina Mock or Ryan Mock (parent accounts)
- Test with: Carter Mock (has 6 courses with grades)

### Steps

1. **Load Dashboard**
   - [ ] Navigate to `https://modernteaching.ngrok.dev/dashboard`
   - [ ] Verify dashboard loads successfully
   - [ ] Check browser console for errors (should be none)

2. **Check Initial View**
   - [ ] Should show parent's own courses (if parent is also a teacher)
   - [ ] Or show message about selecting a child

3. **Select Child**
   - [ ] Click on profile dropdown (top right)
   - [ ] Should see list of children (Carter, Lily for Ryan; Tazio, Livio for Christina)
   - [ ] Click on first child (Carter for Ryan, Tazio for Christina)

4. **Verify Courses Load**
   - [ ] Dashboard should refresh
   - [ ] Should show child's courses
   - [ ] Course count should match expected (10 for Carter, 7 for Tazio)

5. **Verify Grades Display**
   - [ ] Each course should show either a grade badge or "No grade"
   - [ ] For Carter, should see:
     - AP Biology: **79%** (yellow badge)
     - AP English Lit: **84%** (blue badge)
     - AP Statistics: **73%** (yellow badge)
     - Kinesiology 15: **100%** (green badge)
     - PE Weight Training: **49%** (red/orange badge)
     - US Government: **25%** (red badge)
   - [ ] Courses without grades should show "No grade" in gray

6. **Verify Color Coding**
   - [ ] Green badges (90-100%): Kinesiology 15
   - [ ] Blue badges (80-89%): AP English Lit
   - [ ] Yellow badges (70-79%): AP Biology, AP Statistics
   - [ ] Red/Orange badges (<70%): PE Weight Training, US Government

7. **Test Child Switching**
   - [ ] Switch to second child
   - [ ] Dashboard should refresh
   - [ ] Courses should update
   - [ ] Grades should update to second child's grades

---

## Test Scenario 2: Student Viewing Own Grades

### Setup
- User: Carter Mock (student account)
- Login directly as student (if student login enabled)

### Steps

1. **Load Dashboard**
   - [ ] Navigate to dashboard
   - [ ] Should show student's own courses

2. **Verify Grades**
   - [ ] Same 6 courses with grades as when viewed by parent
   - [ ] Same grade values
   - [ ] Same color coding

---

## Test Scenario 3: Edge Cases

### No Grades
- User: Switch to Lily Mock
- Expected: Some courses show "No grade"
- [ ] Verify "No grade" displays correctly in gray
- [ ] Verify layout doesn't break

### All Grades
- User: Switch to Tazio Mock  
- Expected: All 7 courses have grades
- [ ] Verify all grades display
- [ ] Verify proper color distribution

### Low Grades
- User: Tazio's American Literature (0%)
- [ ] Verify red badge for failing grade
- [ ] Verify doesn't show negative value

---

## Console Checks

Open browser DevTools → Console

### Should See (Good)
- `[Dashboard] Fetching grades from /api/schoology/grades`
- `[Dashboard] Grades response status: 200`
- `[Dashboard] Grades data received: ...`

### Should NOT See (Bad)
- Any 403, 404, or 500 errors
- "Failed to fetch grades" errors
- "No grade found for course..." warnings (unless expected)

---

## Network Checks

Open browser DevTools → Network tab

### Expected Requests

**On Dashboard Load:**
1. `GET /api/auth/status` → 200
2. `GET /api/parent/children` → 200
3. `GET /api/schoology/courses` → 200
4. `GET /api/schoology/grades` → 200

**On Child Switch:**
1. `POST /api/parent/active` → 200
2. `GET /api/schoology/courses` → 200 (refreshes)
3. `GET /api/schoology/grades` → 200 (refreshes)

### Check Response Bodies

**`/api/schoology/grades` should return:**
```json
{
  "grades": {
    "8067479367": { "grade": 79, "period_id": "p1141932" },
    ...
  },
  "targetUserId": "140834636"
}
```

---

## Visual Checks

### Layout
- [ ] Grades don't overflow or break layout
- [ ] Color badges are readable
- [ ] "No grade" text is subtle but visible
- [ ] Mobile responsive (if testing on mobile)

### Color Accuracy
- [ ] Green badges are clearly green
- [ ] Red badges are clearly red (not orange)
- [ ] Colors provide instant visual feedback

### Accessibility
- [ ] Grade text is legible
- [ ] Sufficient contrast ratio
- [ ] No reliance on color alone (percentages visible)

---

## 🐛 If Something's Wrong

### Grades not showing at all

**Check:**
```bash
# Is data in Schoology?
node scripts/check-assignments-grades.js 140834636

# Is API working?
node scripts/test-grades-e2e.js
```

**Fix:** See `docs/guides/GRADES-TROUBLESHOOTING.md`

### Wrong grade values

**Check:**
- Compare browser display with script output
- Check Schoology UI directly

**Fix:**
- Verify category weights are correct
- Re-run seeding if needed

### Child switching doesn't update grades

**Check:**
- Browser console for errors
- Network tab for API calls

**Fix:**
- Verify `/api/parent/active` is working
- Check that dashboard refetches data after child change

---

## ✅ Success Criteria

All checkboxes above should be checked ✅

**If any fail, see:**
- `docs/guides/GRADES-TROUBLESHOOTING.md`
- `docs/guides/GRADES-IMPLEMENTATION-GUIDE.md`
- `GRADES-COMPLETION-REPORT.md`
