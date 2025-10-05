# Grade Visibility Investigation - Oct 4, 2025

## Problem Discovered

**Grades exist in API but don't appear in Schoology UI**

- ✅ Assignments created successfully (103 total)
- ✅ Grades created successfully (80 total)
- ❌ Grades not visible on student/parent UI

## Root Cause

Schoology requires a **3-step workflow** for grades to appear in UI:

1. **Create Assignment** - Works ✅
2. **Create Submission** (per student) - **THIS WAS MISSING** ⚠️
3. **Create Grade** - Works ✅ (but invisible without step 2)

## Documentation Updated

### Primary Guides
- `docs/guides/API-USER-IMPERSONATION.md` - Added 3-step workflow, submission endpoint details
- `docs/guides/BULK-ASSIGNMENT-IMPORT.md` - Updated with full workflow, error handling, duplicate prevention

### Key Additions
1. **3-Step Workflow** clearly documented
2. **Submission endpoint** documented (needs verification - currently 404)
3. **Error handling** - Exponential backoff for rate limiting
4. **Idempotency** - How to prevent duplicates
5. **Partial failure handling** - Progress logging for safe resumption
6. **Update/Delete operations** - Full CRUD documentation

## Submission Endpoint Issue

**Status**: Needs verification

**Expected endpoint** (per Gemini research):
```
POST /v1/submissions/{assignment_id}/{user_id}/create
```

**Current result**: 404 Not Found

**Possible causes**:
1. Endpoint format incorrect
2. Feature not enabled for this Schoology instance
3. Different authentication required
4. API docs may be outdated

**Next steps to investigate**:
1. Try alternative endpoint: `POST /v1/sections/{section_id}/submissions`
2. Manually create submission via UI and inspect network traffic
3. Check Schoology admin settings for submission features
4. Contact Schoology support for clarification

## Files Updated

- ✅ `docs/guides/API-USER-IMPERSONATION.md`
- ✅ `docs/guides/BULK-ASSIGNMENT-IMPORT.md`
- ✅ `scripts/import-grades-only.js` (added submission logic)
- ✅ Deleted `temp-gemini-api-findings.md` (info integrated)

## Current Status

**Assignments**: ✅ Working perfectly
**Grades (API)**: ✅ Working perfectly  
**Grades (UI)**: ⚠️ Blocked on submission endpoint verification

## Verification Steps Completed

Confirmed via API that grades exist:
- Carter Mock: 22 grades in AP Biology
- Tazio Mock: 15 grades in US History
- Livio Mock: 14 grades in Science

All grades stored with correct values, just not visible in UI yet.
