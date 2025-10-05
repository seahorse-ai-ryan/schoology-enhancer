# BREAKTHROUGH: allow_dropbox Parameter
## Oct 4, 2025

### The Problem

Grades were uploaded successfully via API but not visible in UI, even after students submitted assignments.

### Root Cause Discovered

When creating assignments, we were missing a critical parameter: **`allow_dropbox`**

### How Schoology Assignments Work

```javascript
allow_dropbox: 0  // No online submission required → grades visible immediately!
allow_dropbox: 1  // Requires online submission → needs submission before grades show
```

**Our mistake:** We didn't set `allow_dropbox`, so Schoology defaulted to requiring submissions.

### The Fix

Add `allow_dropbox: 0` when creating assignments:

```javascript
const assignmentData = {
  title: assignment.title,
  description: assignment.description,
  due: assignment.due,
  max_points: assignment.points,
  allow_dropbox: 0  // ← THE MISSING PIECE!
};
```

### Why This Makes Sense

Many assignments don't require online submissions:
- Paper assignments
- In-class work
- Oral presentations
- Physical projects
- Tests/quizzes administered in person

For these, teachers just enter grades directly - no submission needed!

### Impact

**Before fix:**
- ❌ Assignments require submissions
- ❌ Students must submit (even blank) to see grades
- ❌ Not realistic for paper-based assignments

**After fix:**
- ✅ Assignments don't require submissions
- ✅ Grades visible immediately when entered
- ✅ Matches real-world teaching workflow

### Next Steps

1. ✅ Update `create-assignments-via-impersonation.js` with `allow_dropbox: 0`
2. Delete all existing assignments in Schoology
3. Re-run assignment creation script with new parameter
4. Verify grades are now visible without submissions!

---

**Lesson learned:** Always check ALL API parameters, not just required ones!
