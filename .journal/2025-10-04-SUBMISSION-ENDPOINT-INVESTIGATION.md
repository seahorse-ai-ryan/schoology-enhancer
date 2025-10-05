# Submission Endpoint Investigation - Oct 4, 2025

## Progress Update

### Endpoint Evolution
1. **First attempt (404):** `POST /v1/submissions/{assignment_id}/{user_id}/create`
2. **Second attempt (403):** `POST /v1/sections/{section_id}/submissions/{assignment_id}/users/{user_id}`

### Key Discovery

✅ **403 instead of 404 = Endpoint exists!**

The new endpoint format is correct, but we're hitting a permissions issue.

## Current Hypothesis

The submissions endpoint may **not support** the `X-Schoology-Run-As` impersonation header that works for assignments and grades.

### Evidence
- Assignments: ✅ Works with impersonation
- Grades: ✅ Works with impersonation  
- Submissions: ❌ Returns 403 with impersonation

## Possible Solutions

### Option 1: Student-Only Creation
Submissions might need to be created **by the student user**, not a teacher impersonating them.

**Implications:**
- Would need OAuth tokens for each student
- Not practical for bulk seeding
- Defeats the purpose of automated seeding

### Option 2: Different Permission Scope
Submissions might require a different admin permission level or API scope.

**Next steps:**
- Check Schoology admin settings for submission-related permissions
- Try the request without the `X-Schoology-Run-As` header
- Use raw admin credentials instead

### Option 3: Manual UI Workaround
If API doesn't support programmatic submission creation:

**Workaround:**
- Have teachers manually enter one grade per assignment via UI
- This creates the submission automatically
- Our API grades would then work

**Pros:** Simple, guaranteed to work  
**Cons:** Manual work for 103 assignments

## Next Actions

1. **Try without impersonation header** - Test if raw admin credentials work
2. **Check admin permissions** - Look for submission-specific settings
3. **Manual test** - Create one submission via UI, inspect network traffic
4. **Contact Schoology** - Ask support about submissions API restrictions

## Current Workaround

For now, grades ARE being created successfully and exist in the API. They just don't show in the UI until submissions exist.

**Temporary solution:** Teachers can manually enter one grade per assignment via UI to create submissions, then our bulk grades will become visible.

## Documentation Updates

Updated files to reflect 403 discovery:
- ✅ `docs/guides/SCHOOLOGY-API-SEEDING.md` - Updated submission status
- ✅ `scripts/import-grades-only.js` - Using new endpoint format
- ✅ Created `docs/guides/SEEDING-OVERVIEW.md` - Master seeding guide
- ✅ Renamed `BULK-ASSIGNMENT-IMPORT.md` → `SCHOOLOGY-API-SEEDING.md`

---

**Status:** Blocked on submission API permissions. Grades work but invisible until solved.
