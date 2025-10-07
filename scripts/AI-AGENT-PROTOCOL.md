# AI Agent Protocol for Browser Automation

## ⚠️ CRITICAL: Authentication Expiration is NORMAL

### What You'll See

When running `inject-auth-state.js` or automated tests, you may see:

```
⚠️  Authentication failed - landed on: https://modernteaching.ngrok.dev/
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔐 AUTHENTICATION EXPIRED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### **THIS IS NOT A BUG!**

Do NOT:
- ❌ Modify test code
- ❌ Debug application code
- ❌ Change authentication logic
- ❌ Investigate "why it broke"
- ❌ Search for issues in the codebase
- ❌ Try to "fix" anything

### What This Means

OAuth sessions expire periodically for security. This is **expected and normal behavior**. It happens to everyone, in every environment.

### What You Should Do

Simply tell the user:

> "Your authentication session has expired. This is normal OAuth behavior. Please re-authenticate by running:
> 1. `npm run chrome:test`
> 2. Log in manually when the browser opens
> 3. `node scripts/capture-auth-state.js`
> 4. Then run your tests again"

That's it. No debugging needed.

---

## Validation Before Testing

### Check Auth Status First

Before running test suites, run:

```bash
node scripts/validate-auth.js
```

This will:
- ✅ Check if auth is still valid
- ✅ Provide clear re-auth instructions if expired
- ✅ Exit with status 0 if valid, 1 if expired

**Use this in test scripts:**

```bash
# Validate auth first
node scripts/validate-auth.js || {
  echo "Please re-authenticate before running tests"
  exit 1
}

# Run tests
node scripts/inject-auth-state.js
node my-test.js
```

---

## Destructive Test: Logout

### Script: `test-logout.js`

**⚠️ WARNING:** This test:
- Logs out the current user
- Deletes the auth state file
- Invalidates ALL captured authentication
- Requires manual re-authentication afterward

### When to Run

- **ONLY** when specifically testing logout functionality
- **NEVER** in automated test suites
- **NEVER** as part of CI/CD
- **ONLY** on explicit user request

### DO NOT

- ❌ Include in regular test runs
- ❌ Run as part of E2E test suites
- ❌ Run automatically
- ❌ Run unless user specifically requests logout testing

### Correct Usage

```bash
# User explicitly asks to test logout
node scripts/test-logout.js

# Script waits 5 seconds (time to cancel)
# Then logs out and deletes auth state
# After this, you MUST tell user to re-authenticate
```

---

## Error Message Interpretation

### "No auth state found"

**Meaning:** User hasn't authenticated yet, or logout test was run

**Action:** Tell user to run initial setup:
```bash
npm run chrome:test  # Auth manually
node scripts/capture-auth-state.js
```

### "Authentication expired"

**Meaning:** OAuth session expired (normal!)

**Action:** Tell user to re-authenticate (same steps as above)

### "User not found"

**Meaning:** Emulator restarted and lost data, or user switched emulator sessions

**Action:** Tell user to re-authenticate or import emulator data

### "hCaptcha appears"

**Meaning:** Anti-automation flags not set (should not happen with our scripts)

**Action:** Verify user is running `inject-auth-state.js`, not direct Playwright/Cursor MCP

---

## Testing Workflow for AI Agents

### Before Any Test Run

```bash
# 1. Check if auth is valid
node scripts/validate-auth.js

# If it exits with error, stop and instruct user to re-auth
# If it succeeds, proceed
```

### Running Tests

```bash
# 2. Run your test with auth injection
node scripts/inject-auth-state.js

# Or your custom test that uses auth injection
```

### After Failed Auth

```
User, your authentication expired. Please run:
1. npm run chrome:test
2. Log in manually
3. node scripts/capture-auth-state.js

This is normal and takes about 30 seconds.
```

### Testing Logout

```
Only if user EXPLICITLY asks to test logout:

"This will invalidate your authentication. You'll need to
log in again afterward. Run: node scripts/test-logout.js"
```

---

## Never Do This

### ❌ Don't Debug Auth Expiration

```
WRONG:
"It looks like there's an authentication bug. Let me check the
callback logic... maybe the tokens aren't being stored correctly..."

RIGHT:
"Your authentication expired. This is normal. Please re-authenticate:
npm run chrome:test, then log in manually, then capture-auth-state.js"
```

### ❌ Don't Try to "Fix" Expired Auth

```
WRONG:
"Let me modify the auth logic to handle expiration better..."

RIGHT:
"This is expected behavior. No code changes needed."
```

### ❌ Don't Run Logout Test Automatically

```
WRONG:
"Let me run all the tests including logout..."

RIGHT:
"Logout test is destructive. Run it manually only when specifically
testing logout functionality."
```

---

## Key Takeaways

1. **Auth expiration is NORMAL** - not a bug
2. **Re-authentication takes 30 seconds** - simple fix
3. **validate-auth.js checks status** - use before test suites
4. **test-logout.js is DESTRUCTIVE** - use sparingly on demand
5. **Clear error messages guide user** - just point to them

When in doubt, check the error message from the script itself. It provides clear, correct instructions.
