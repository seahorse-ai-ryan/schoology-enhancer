# Schoology API Seeding (Assignments, Submissions, Grades)

## ⚠️ Status: ASSIGNMENTS WORKING, TESTING NEW SUBMISSION ENDPOINT

- ✅ Assignments create successfully
- 🔧 Testing new submission endpoint format
- ⚠️ Grades create but don't appear in UI until submissions work

## The 3-Step Workflow

For grades to appear in the Schoology UI, you must:

1. **Create Assignment** - Creates the assignment container (✅ Working)
2. **Create Submission** - Creates placeholder for each student (🔧 Endpoint verification needed)
3. **Create Grade** - Adds grade value to submission (✅ Working, but invisible without step 2)

## Quick Start

```bash
# Create assignments only (working)
node scripts/create-assignments-via-impersonation.js bulk

# Import grades (working, but needs submission step added)
node scripts/import-grades-only.js
```

## How It Works

1. **Authentication**: Uses permanent System Admin API keys (`SCHOOLOGY_ADMIN_KEY`, `SCHOOLOGY_ADMIN_SECRET`)
2. **Impersonation**: Adds `X-Schoology-Run-As: {teacher_user_id}` header to act as the teacher
3. **No Special Accounts Needed**: No need for "Super Teacher" or admin enrollment in courses
4. **ID Mapping**: Automatically maps `school_uid` → numeric Schoology IDs

## Key Technical Details

### OAuth Signature (Important!)

Schoology's OAuth implementation is **non-standard**:
- ✅ **Do**: Sign the URL and method only
- ❌ **Don't**: Include POST body data in OAuth signature

```javascript
// Correct approach
const request_data = { url, method: 'POST' }; // No body data!
const authHeader = oauth.toHeader(oauth.authorize(request_data));
```

### Content Type

- ✅ Use: `application/json`
- ❌ Don't use: `application/x-www-form-urlencoded`

### IDs Must Be Numeric

- ❌ `anthony_gamboa_20250930` (school_uid)
- ✅ `140836120` (Schoology user ID)

- ❌ `AP-BIO-3120-S1` (section code)
- ✅ `8067479367` (Schoology section ID)

### Assignment Fields

Use these essential fields:
```json
{
  "title": "Enzyme Lab Report",
  "description": "Optional description",
  "due": "2025-01-31",
  "max_points": 100,
  "allow_dropbox": 0
}
```

**Critical parameters:**

`allow_dropbox`:
- `0` = No submission required (paper-based, in-class work) → **grades visible immediately!**
- `1` = Requires online submission → grades only visible after students submit

`grading_category_id` (optional):
- If course has grading categories (Tests, Homework, etc.), specify which one
- If omitted, may default to "Ungraded" category
- Query `/sections/{id}/grading_categories` to get available categories
- Can be set up manually in Schoology course settings first

❌ Don't include: `grading_scale`, `grading_type` (causes 400 errors)

## Environment Variables Required

```bash
SCHOOLOGY_ADMIN_KEY=your_system_admin_key
SCHOOLOGY_ADMIN_SECRET=your_system_admin_secret
```

These are **permanent API keys** from your Schoology System Admin account, not OAuth tokens.

## Getting Numeric IDs

To map `school_uid` → Schoology ID:

```javascript
// Get user ID
const userUrl = 'https://api.schoology.com/v1/users?school_uids=anthony_gamboa_20250930';
// Returns: { user: [{ uid: "140836120", ... }] }

// Get section ID
const sectUrl = 'https://api.schoology.com/v1/users/{teacherId}/sections';
// Find section with matching section_school_code
```

## Grade Import (3-Step Process)

### Step 1: Create Submissions (Per Student)

⚠️ **UPDATE: Submissions Not Needed with `allow_dropbox: 0`**

If assignments are created with `allow_dropbox: 0`, **submissions are not required** and grades are visible immediately!

**Previous investigation:** Submissions API

**Tested all possible approaches:**

1. **Admin impersonating teacher:** 403 Forbidden
2. **Admin impersonating student:** 403 Forbidden (even with checkbox enabled)
3. **Student's own API keys:** 403 Forbidden ⚠️ **KEY FINDING**

**Conclusion:** Schoology API does not support programmatic submission creation. Even a student using their own API credentials cannot create an empty submission placeholder.

**Why:** Submissions represent actual student work (files, text, links). Schoology's API is designed to prevent creating empty submissions - they must be created through:
- Student UI (uploading actual work)
- Teacher UI (when entering first grade)
- Dropbox/Materials system

**Required Workaround for Seeding:**

Teachers must enter **one grade per assignment** via Schoology UI:

1. Navigate to assignment
2. Click "Grade Submissions"
3. Enter any grade for any student
4. This auto-creates submission
5. All bulk API grades become visible

**Time required:** ~5-10 minutes for 103 assignments

**Production Impact:** None - students naturally create submissions by submitting work

**Why this matters:** Without submissions, grades won't appear in the student/parent UI (they exist in API but are invisible)

### Step 2: Create Grades (Bulk)

✅ **Status: Working**

```javascript
PUT /v1/sections/{section_id}/grades
X-Schoology-Run-As: {teacherId}

Body:
{
  "grades": {
    "grade": [
      {
        "assignment_id": "123",
        "enrollment_id": "456",
        "grade": "95",
        "comment": "Great work!"
      }
    ]
  }
}
```

## Preventing Duplicates

Before creating content, check if it already exists:

```javascript
// Check for existing assignment by title
GET /v1/sections/{section_id}/assignments

// Check for existing submission
GET /v1/sections/{section_id}/submissions?assignment_id={id}&user_id={uid}
```

## Handling Failures

### Rate Limiting (429 Errors)
Implement exponential backoff:
```javascript
async function retryWithBackoff(fn, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (error.status === 429 && i < maxRetries - 1) {
        const delay = Math.pow(2, i) * 1000; // 1s, 2s, 4s
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        throw error;
      }
    }
  }
}
```

### Partial Failures
Log progress to resume safely:
```javascript
// Log each successful operation
fs.appendFileSync('import-log.csv', `${assignmentId},${status}\n`);

// Skip already-completed items on retry
const completed = new Set(readCompletedIds('import-log.csv'));
if (completed.has(assignmentId)) continue;
```

## Troubleshooting

| Error | Cause | Fix |
|-------|-------|-----|
| 401 Verification failed | OAuth signature includes body | Remove body data from signature |
| 403 Forbidden | Impersonation not enabled | Enable in Schoology: User Management → Permissions → Impersonation |
| 415 Unsupported Media Type | Wrong Content-Type | Use `application/json` |
| 400 Invalid grading scale | Extra fields | Use only essential fields |
| 404 Not Found | Using school_uid instead of Schoology ID | Get numeric IDs via API |

## Updating & Deleting

### Update Assignment
```javascript
PUT /v1/sections/{section_id}/assignments/{assignment_id}
X-Schoology-Run-As: {teacherId}

{
  "max_points": 120,  // Only include fields to change
  "due": "2025-02-15"
}
```

### Delete Assignment
```javascript
DELETE /v1/sections/{section_id}/assignments/{assignment_id}
X-Schoology-Run-As: {teacherId}
```

### "Delete" Grade (via Exception)
```javascript
PUT /v1/sections/{section_id}/grades
X-Schoology-Run-As: {teacherId}

{
  "grades": {
    "grade": [
      {
        "assignment_id": "123",
        "enrollment_id": "456",
        "exception": 1  // 1=Excused, 2=Incomplete
      }
    ]
  }
}
```

## Success Criteria

✅ Assignment created with status 201  
✅ Assignment appears in teacher's section  
✅ Students can see assignment in "To Do"  
⚠️ Grades show in API but not UI (submission step needed)  
🎯 **Goal**: Grades visible on student/parent grades page  

## See Also

- `docs/guides/SEEDING-OVERVIEW.md` - Complete 2-phase seeding workflow
- `docs/guides/API-USER-IMPERSONATION.md` - Technical details on impersonation
- `docs/guides/SCHOOLOGY-CSV-IMPORT.md` - Phase 1: CSV uploads (users, courses, enrollments)
