# Grading Categories Discovery
## Oct 4, 2025

### Issue Found

Assignments created via API show grade values (e.g., 45/50) but display as "Ungraded" category and may not appear on main Grades page.

### Root Cause

Missing `grading_category_id` parameter when creating assignments.

### How Schoology Grading Categories Work

Courses can have grading categories with weights:
- Tests: 40%
- Homework: 30%
- Labs: 20%
- Participation: 10%

Without specifying a category, assignments default to "Ungraded" which may not count toward final grades.

### How to Fix

**Option 1: Set up categories in Schoology first**
1. Teacher goes to Course Settings → Grading Categories
2. Creates categories with weights
3. API can then assign to specific categories

**Option 2: Use default/no category**
- Don't set `grading_category_id`
- Assignments appear as "Ungraded"
- Still visible, just not categorized

### API Usage

```javascript
// Get available categories
GET /sections/{section_id}/grading_categories

// Create assignment with category
const assignmentData = {
  title: "Test Assignment",
  max_points: 100,
  allow_dropbox: 0,
  grading_category_id: 12345  // ← Specify category
};
```

### Current State

Our test sections don't have grading categories configured, so all assignments default to "Ungraded".

### Recommendation for Seeding

**For MVP/testing:**
- Leave `grading_category_id` unset
- Assignments work fine, just show as "Ungraded"
- Grades still visible and calculated

**For production/realistic data:**
- Set up 3-4 grading categories in Schoology UI first
- Update seed data to include category assignments
- Use API to assign each assignment to appropriate category

### Impact

✅ **Does NOT block seeding** - grades still work
⚠️ **Cosmetic issue** - shows "Ungraded" instead of "Tests", "Homework", etc.
📋 **Future enhancement** - can be added later for more realistic testing

---

**Bottom line:** This is a nice-to-have, not a blocker. The allow_dropbox: 0 fix is the critical breakthrough.
