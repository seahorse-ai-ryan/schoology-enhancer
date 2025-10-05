# Grading Categories - Manual Setup Required
## Oct 4, 2025

### Discovery

The Schoology API **does not support creating grading categories**. They must be set up manually via the Schoology UI.

### API Limitation

Attempts to `POST /sections/{id}/grading_categories` result in 400 errors.

**What the API DOES support:**
- ✅ GET - Read existing categories
- ✅ Assign `grading_category` when creating assignments
- ❌ POST - Create new categories (UI only)

### Manual Setup Required

For each course, go to Course Settings → Grading Categories and create:

**AP Biology (Section: 8067479367)**
1. Full AP Labs (26.65%)
2. Homework Assignments (10.13%)
3. My AP College Board Grade (21.11%)
4. Short Lab Activities (10.13%)
5. Unit Exam + AP Like Final exam (15.99%)
6. Final Semester We Service Project (15.99%)

**AP English Lit (Section: 8067479369)**
1. All Essays/Presentations (40%)
2. Socratic Seminars (40%)
3. Reading Logs (10%)
4. Classwork/Informal Discussions (10%)

**AP Statistics (Section: 8067479371)**
1. Tests (85%)
2. Vocabulary Tests (10%)
3. Video Notes (5%)

### Alternative Approach

**Option 1: Use default "Ungraded"**
- Skip category setup
- All assignments show as "Ungraded"
- Grades still work, just not weighted

**Option 2: Manual UI setup (Recommended)**
1. Set up categories in Schoology UI once
2. Query API to get category IDs
3. Update assignment creation to use IDs

**Option 3: Simple default categories**
- Create just 3-4 generic categories in UI:
  - Tests (40%)
  - Homework (30%)
  - Labs/Projects (20%)
  - Participation (10%)
- Map all assignments to these simpler categories

### Impact

⚠️ **Not a blocker** but important for realistic data:
- Without categories: Assignments show "Ungraded", may not count toward course grade
- With categories: Proper weighted gradebook, realistic parent/student experience

### Recommendation

**For current seeding:** 
- Proceed with allow_dropbox: 0 fix (the critical breakthrough)
- Accept "Ungraded" category for now
- Document that categories need manual setup

**For production testing:**
- Set up categories in UI once
- Save category IDs to configuration
- Update seed data to include category assignments

---

**Bottom line:** Categories are a nice-to-have for realistic data, but allow_dropbox: 0 is the essential fix. We can add categories later.
