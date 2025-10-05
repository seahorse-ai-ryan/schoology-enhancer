# Submission Endpoint Investigation - Final Update
## Oct 4, 2025

### Endpoint Discovery Journey

1. **First attempt:** `POST /v1/submissions/{assignment_id}/{user_id}/create`
   - Result: 404 Not Found
   
2. **Second attempt:** `POST /v1/sections/{section_id}/submissions/{assignment_id}/users/{user_id}`
   - With teacher impersonation: 403 Forbidden
   - **Progress:** Endpoint exists! (404 → 403)
   
3. **Third attempt:** Same endpoint, student impersonation
   - With student impersonation (`X-Schoology-Run-As: {student_id}`): 403 Forbidden
   - Empty error body suggests permission restriction

### Key Finding: Student Impersonation Not Supported

**Evidence:**
- Teacher impersonation works for: assignments ✅, grades ✅
- Student impersonation blocked for: submissions ❌
- 403 error with empty response body (no specific error message)

**Likely cause:** Schoology's API impersonation feature may only support teacher impersonation, not student impersonation.

**Checked settings:**
- User Management → Permissions → Impersonation → **Teacher checkbox** ✅ enabled
- No "Student" checkbox appears to exist in admin settings

### Current State

**What Works:**
- ✅ 103 assignments created successfully
- ✅ 80 grades created successfully (exist in API)

**What Doesn't Work:**
- ❌ Submissions cannot be created programmatically
- ❌ Grades invisible in UI (require submissions to display)

### Workarounds

#### Option 1: Manual Grade Entry (Recommended for Now)
Teachers can enter **one grade per assignment** via Schoology UI:
1. Opens assignment
2. Enters grade for any student
3. This automatically creates submission for that student
4. Our bulk grades then become visible

**Effort:** ~5-10 minutes for 103 assignments

#### Option 2: Authenticate as Students
Use 3-legged OAuth to get actual student tokens:
1. Each student logs in via OAuth flow
2. Store their tokens in Firestore
3. Use student's own tokens (not impersonation) to create submissions

**Pros:** Programmatic solution  
**Cons:** Requires student credentials, complex OAuth flow for 4 students

#### Option 3: Contact Schoology Support
Ask if:
- Student impersonation is supported in API
- There's a different way to create submissions programmatically
- There's a permission we're missing

### Recommendation

**For MVP development:**
1. Accept that bulk seeding requires one manual step (entering first grade per assignment)
2. Document this clearly in seeding guides
3. Contact Schoology support for long-term solution

**For production:**
- Students create submissions naturally by submitting work
- Teachers enter grades, which become visible immediately
- No programmatic submission creation needed

### Documentation Status

All docs updated to reflect submission endpoint findings:
- ✅ `docs/guides/SCHOOLOGY-API-SEEDING.md` - Marked as blocked with 403
- ✅ `docs/guides/API-USER-IMPERSONATION.md` - Documented impersonation limitations
- ✅ `docs/guides/SEEDING-OVERVIEW.md` - Explained 2-phase workflow

---

**Conclusion:** Schoology API likely does not support programmatic submission creation via impersonation. Manual workaround or Schoology support inquiry needed.
