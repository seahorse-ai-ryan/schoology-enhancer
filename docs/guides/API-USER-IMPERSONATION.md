# Schoology API User Impersonation

## ✅ STATUS: TESTED AND WORKING

The `X-Schoology-Run-As` header allows System Admins to perform API actions on behalf of other users (e.g., teachers) without enrolling in courses or managing separate service accounts.

## What is API Impersonation?

Using permanent System Admin API credentials, you can execute API calls with the permissions of another user by adding a single header:

```
X-Schoology-Run-As: {user_id}
```

Where `{user_id}` is the numeric Schoology ID of the user you want to impersonate (typically a teacher).

## Why Use Impersonation?

**Best for:** Bulk operations (assignments, grades, course management) performed programmatically

**Alternatives considered:**
- ❌ **Dual-enroll admin** - Not scalable, clutters admin account
- ❌ **Service account** - Complex to set up, requires separate credentials
- ❌ **OAuth tokens** - Expire frequently, unsuitable for automation

**Benefits:**
- ✅ No course enrollment needed
- ✅ Permanent API keys (no expiration)
- ✅ Actions logged under correct teacher scope
- ✅ Clean separation between admin and course operations

## How to Use Impersonation

### Basic Request Structure

```javascript
const OAuth = require('oauth-1.0a');
const crypto = require('crypto');

const oauth = new OAuth({
  consumer: { 
    key: process.env.SCHOOLOGY_ADMIN_KEY, 
    secret: process.env.SCHOOLOGY_ADMIN_SECRET 
  },
  signature_method: 'HMAC-SHA1',
  hash_function(base_string, key) {
    return crypto.createHmac('sha1', key).update(base_string).digest('base64');
  }
});

// Make request
const url = 'https://api.schoology.com/v1/sections/8067479367/assignments';
const request_data = { url, method: 'POST' };
const authHeader = oauth.toHeader(oauth.authorize(request_data));

const response = await fetch(url, {
  method: 'POST',
  headers: {
    ...authHeader,
    'X-Schoology-Run-As': '140836120',  // Teacher's numeric ID
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ title: 'Test Assignment', max_points: 100 })
});
```

### Critical Technical Details

#### 1. OAuth Signature (Non-Standard!)

⚠️ **Schoology's OAuth is non-standard for POST requests**

✅ **Correct:** Sign URL and method only
```javascript
const request_data = { url, method: 'POST' }; // No body data!
```

❌ **Wrong:** Including body causes 401 errors
```javascript
const request_data = { url, method: 'POST', data: bodyData }; // ❌ Fails
```

#### 2. Use Numeric IDs, Not school_uid

|| Type | ❌ Wrong | ✅ Correct |
||------|----------|-----------|
|| User | `anthony_gamboa_20250930` | `140836120` |
|| Section | `AP-BIO-3120-S1` | `8067479367` |

**Get numeric IDs:**
```javascript
// User ID from school_uid
GET /v1/users?school_uids=anthony_gamboa_20250930

// Section ID from teacher
GET /v1/users/{teacherId}/sections
```

#### 3. Always Use application/json

- ✅ `Content-Type: application/json`
- ❌ `application/x-www-form-urlencoded` (causes 415 errors)

---

## Enabling Impersonation

You must enable this feature in Schoology admin settings:

1. Go to **User Management → Permissions**
2. Find **Impersonation** settings
3. Check the **Teacher** checkbox
4. Save changes

Without this, API requests will return `403 Forbidden`.

## Documentation Status

⚠️ **The official User Provisioning API documentation is restricted** and not publicly accessible. However, the `X-Schoology-Run-As` header functionality is confirmed through:
- Public developer forums
- Community discussions
- Our own successful testing

**Don't confuse with UI impersonation:** The manual UI impersonation feature (1-hour sessions in web browser) is different from API impersonation (stateless, no time limit).

## Common Use Cases

Impersonation is ideal for programmatic operations. **The key is to impersonate the user type who naturally performs the action:**

### Impersonate Teachers For:
- **Bulk assignment creation** - Create assignments across multiple courses
- **Grade import** - Import grades for existing assignments
- **Course content management** - Update assignments, materials, discussions
- **Analytics** - Pull grade data from teacher perspective

### Impersonate Students For:
- **Submission creation** - Create placeholder submissions for assignments
- **Student-specific actions** - Any action that represents a student's work

For detailed workflows on assignments/grades, see: `docs/guides/SCHOOLOGY-API-SEEDING.md`

## Troubleshooting Impersonation

| Error | Cause | Solution |
|-------|-------|----------|
| **401 Unauthorized** | OAuth signature includes body data | Remove `data` from `oauth.authorize()` call |
| **403 Forbidden** | Impersonation not enabled | Enable in Schoology admin: User Management → Permissions → Impersonation |
| **403 Forbidden** | Invalid user ID in header | Verify user ID is numeric and exists |
| **404 Not Found** | Using `school_uid` instead of numeric ID | Query `/v1/users?school_uids=...` to get numeric ID |
| **415 Unsupported Media Type** | Wrong Content-Type header | Use `application/json` |

## Environment Variables

```bash
# Required for impersonation
SCHOOLOGY_ADMIN_KEY=your_system_admin_api_key
SCHOOLOGY_ADMIN_SECRET=your_system_admin_api_secret

# These are PERMANENT API keys from System Admin account
# NOT OAuth tokens (which expire)
```

## Example Scripts

Working implementations with impersonation:
- `scripts/create-assignments-via-impersonation.js` - Bulk assignment creation
- `scripts/import-grades-only.js` - Grade import with impersonation

Both scripts include:
- Automatic `school_uid` → numeric ID mapping
- Proper OAuth signature handling
- Error handling and rate limiting

## See Also

- `docs/guides/SEEDING-OVERVIEW.md` - Complete 2-phase seeding workflow
- `docs/guides/SCHOOLOGY-API-SEEDING.md` - Full assignment/submission/grade workflow details
- `docs/guides/SCHOOLOGY-CSV-IMPORT.md` - For users, courses, enrollments via CSV