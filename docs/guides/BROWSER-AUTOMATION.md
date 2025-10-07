# Browser Automation Testing Guide

**Status**: ✅ **PROVEN AND RECOMMENDED** - This is the primary testing approach.

---

## Quick Start

### One-Time Setup

**1. Ensure dev environment is running:**

```bash
npm run emu    # Terminal 1: Firebase emulators
npm run ngrok  # Terminal 2: Ngrok tunnel
npm run dev    # Terminal 3: Next.js server
```

**2. Launch persistent Chrome and authenticate:**

```bash
npm run chrome:test
```

Manually complete the OAuth login flow (one time only). Your session will be saved to `~/.chrome-profiles/schoology-testing`.

**3. Capture authentication state:**

```bash
node scripts/capture-auth-state.js
```

This extracts your authentication cookie to `.auth-state/session.json` (gitignored).

### Run Automated Tests

```bash
node scripts/inject-auth-state.js
```

This launches a fresh Chrome instance that's **automatically authenticated** without any manual login!

---

## Proven Capabilities

✅ **Full automation confirmed:**
- Open/close browser programmatically
- Authenticate without manual OAuth
- Navigate between pages
- Scroll up and down
- Click buttons and dropdowns
- Hover over elements
- Extract data from pages
- Take screenshots (disk + inline)
- No hCaptcha blocking

### Screenshot Strategies

**Two approaches, different use cases:**

| Use Case | Tool | Output | When to Use |
|----------|------|--------|-------------|
| **Automated Testing / CI** | Puppeteer scripts | Files to disk (`test-results/*.png`) | Headless tests, regression suites, logging for later analysis |
| **Interactive Development** | Cursor MCP Browser Tools | Inline in chat | Vibe coding sessions, debugging with AI, real-time feedback |

**Key Difference:**
- **Puppeteer**: Scripts we write, save to files, can't show inline in chat
- **Cursor MCP**: Built-in browser tools, show inline, but require manual browser control

**Recommendation for Testing Workflows:**
1. Use Puppeteer scripts for **automated E2E tests** (saves files, runs headless)
2. Use MCP Browser Tools for **interactive debugging** (shows inline, real-time feedback)
3. Both can authenticate using the same captured auth state!

---

## How It Works

### Architecture

```
1. Capture Phase (one time)
   ├─ Manual OAuth login → stores tokens in Firestore emulator
   └─ Extract cookie: schoology_user_id=140834634

2. Injection Phase (every test)
   ├─ Launch fresh Chrome with anti-automation flags
   ├─ Inject captured cookie
   ├─ Navigate to: https://modernteaching.ngrok.dev
   ├─ Ngrok tunnels → localhost:9000 (Next.js)
   ├─ Next.js queries → localhost:8080 (Firestore emulator)
   ├─ Tokens retrieved → user authenticated
   └─ Full access to authenticated app! 🎉
```

### Why This Works

The complete chain stays within your local dev environment:
- **Cookie injection** → Browser has user ID
- **Ngrok tunnel** → Connects to dev server
- **Dev server** → Accesses Firebase emulator
- **Emulator** → Contains OAuth tokens
- **Result** → Fully authenticated session

### Anti-Automation Flags

Chrome launches with:
```javascript
'--disable-blink-features=AutomationControlled'
'--disable-infobars'
```

These flags prevent Schoology's hCaptcha from triggering on automated runs.

---

## Available Scripts

| Script | Purpose | When to Use |
|--------|---------|-------------|
| `launch-persistent-chrome.js` | Launch Chrome with profile | Initial manual auth |
| `capture-auth-state.js` | Extract auth cookie | After manual login (one time) |
| `inject-auth-state.js` | Launch authenticated browser | Every automated test run |
| `validate-auth.js` | Check if auth is still valid | Before running test suites |
| `prove-automation.js` | Comprehensive capability demo | Validate everything works |
| `test-logout.js` | **⚠️ DESTRUCTIVE** - Test logout | Manual testing only |
| `quick-test-authenticated.js` | Quick CDP connection test | Test persistent Chrome |
| `background-test.js` | Non-intrusive testing | Run without stealing focus |

**NPM Scripts:**
- `npm run chrome:test` - Launch persistent Chrome

---

## Example: Writing a Test

```javascript
const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

async function runTest() {
  // Load auth state
  const authState = JSON.parse(
    fs.readFileSync('.auth-state/session.json', 'utf8')
  );
  
  // Launch browser with anti-automation flags
  const browser = await puppeteer.launch({
    headless: false,
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    args: [
      '--disable-blink-features=AutomationControlled',
      '--disable-infobars',
    ]
  });
  
  const page = await browser.newPage();
  
  // Inject authentication
  await page.setCookie(...authState.cookies);
  await page.goto('https://modernteaching.ngrok.dev', { 
    waitUntil: 'domcontentloaded' 
  });
  await page.reload({ waitUntil: 'networkidle2' });
  await sleep(3000); // Wait for auth redirect
  
  // Now you're authenticated! Run your tests...
  
  // Navigate
  await page.goto('https://modernteaching.ngrok.dev/courses');
  
  // Click elements
  await page.click('button#some-button');
  
  // Extract data
  const data = await page.evaluate(() => {
    return {
      title: document.title,
      gpa: document.querySelector('[class*="gpa"]')?.textContent
    };
  });
  
  // Screenshot
  await page.screenshot({ path: 'test-results/my-test.png' });
  
  // Clean up
  await browser.close();
}
```

---

## Alternative Methods (For Reference)

### Method 1: Persistent Chrome + Puppeteer CDP

**Use when:** You want to manually control auth or watch tests run

```bash
# Terminal 1: Launch persistent Chrome
npm run chrome:test
# (Manually log in)

# Terminal 2: Connect and automate
node scripts/quick-test-authenticated.js
```

**Pros:**
- Visual feedback
- Manual auth control
- Can run in background
- Profile persists

**Cons:**
- Manual Chrome management
- Port 9222 conflicts possible
- Requires Chrome to stay open

### Method 2: Cursor Native Playwright MCP

**Use when:** Testing public/unauthenticated pages

```
# In Cursor AI chat
Navigate to https://modernteaching.ngrok.dev and take a screenshot
```

**Pros:**
- Zero setup
- AI-native
- Quick exploration

**Cons:**
- ❌ Triggers hCaptcha (can't authenticate)
- No persistent sessions
- Limited configuration

**Not suitable for authenticated flows.**

---

## Testing Workflows

### For E2E User Journeys (Recommended)

```bash
# Setup (one time)
npm run chrome:test  # Auth manually
node scripts/capture-auth-state.js

# Every test run
node scripts/inject-auth-state.js
# → Fully automated, authenticated testing!
```

### For Visual Regression

```bash
# Same as E2E, but focus on screenshots
node scripts/inject-auth-state.js
# Script takes screenshots at key points
# Compare with baseline images
```

### For CI/CD (Future)

```bash
# 1. Export emulator data with test users
firebase emulators:export ./test-data

# 2. In CI pipeline:
firebase emulators:start --import=./test-data &
npm run ngrok &
npm run dev &
sleep 10

# 3. Run tests with pre-captured auth
node scripts/inject-auth-state.js
node tests/e2e/my-test.js
```

---

## Troubleshooting

### Authentication Expired (NORMAL - NOT A BUG!)

**Symptoms:**
- `inject-auth-state.js` lands on landing page instead of dashboard
- Browser shows "Sign In with Schoology" button
- Test says "AUTHENTICATION EXPIRED"

**Cause:** OAuth sessions expire periodically for security

**⚠️ IMPORTANT FOR AI AGENTS:**
**This is NOT a bug in the code or tests!** Do not attempt to "fix" this by modifying code. This is expected behavior.

**Fix:** Re-authenticate following the clear instructions in the script output:
```bash
# 1. Launch persistent Chrome
npm run chrome:test

# 2. Log in manually (one time)
# 3. Capture new auth state
node scripts/capture-auth-state.js

# 4. Resume testing
node scripts/inject-auth-state.js
```

**Prevention:** Run `node scripts/validate-auth.js` before test suites to check auth status proactively.

### "User not found" after injection

**Cause:** Emulator restarted and lost user data

**Fix:** Re-authenticate (same steps as auth expiration above) or import emulator data:
```bash
firebase emulators:start --import=./.firebase/emulator-data
```

### hCaptcha appears

**Cause:** Anti-automation flags not set

**Fix:** Ensure you're using `inject-auth-state.js` which sets flags, not direct Playwright/Cursor MCP

### Browser immediately closes

**Cause:** Script error or test completed

**Fix:** Add `await sleep(30000)` before `browser.close()` to inspect, or set `headless: false` to watch

### Port 9222 already in use

**Cause:** Another Chrome debug instance running

**Fix:**
```bash
pkill -f "remote-debugging-port=9222"
npm run chrome:test
```

---

## Auth Expiration & Logout Testing

### Expected Auth Expiration

**Authentication will expire periodically.** This is normal OAuth behavior, not a bug.

**When it happens:**
- Captured auth cookie becomes invalid
- `inject-auth-state.js` will detect and show clear re-auth instructions
- You simply need to re-authenticate (takes ~30 seconds)

**AI Agent Protocol:**
When you see "AUTHENTICATION EXPIRED", do NOT:
- ❌ Modify test code
- ❌ Debug application code
- ❌ Change authentication logic
- ❌ Think something is broken

Instead, DO:
- ✅ Recognize this as expected behavior
- ✅ Instruct user to re-authenticate
- ✅ Point to the clear steps shown in the script output

### Testing Logout (Destructive Test)

**Script:** `scripts/test-logout.js`

**⚠️ WARNING:** This test invalidates all captured authentication. It will:
1. Log out the current user
2. Verify logout works correctly
3. Delete the auth state file
4. Require manual re-authentication before further testing

**When to run:**
- Only when specifically testing logout functionality
- Never as part of automated test suites
- Only on manual demand

**Usage:**
```bash
node scripts/test-logout.js
# Waits 5 seconds, then proceeds with logout
# After completion, you MUST re-authenticate:
#   1. npm run chrome:test
#   2. Log in manually
#   3. node scripts/capture-auth-state.js
```

**DO NOT** include this in regular test runs or it will break all subsequent tests.

---

## Important Notes

### Local Development Only

- All data is in **Firebase emulators** (localhost:8080)
- No production Firebase or Schoology data
- OAuth tokens from Schoology's development instance
- Safe to experiment without risk

### Emulator Data Persistence

Emulator data persists in `.firebase/emulator-data` and is automatically imported on `npm run emu`.

To manually export:
```bash
firebase emulators:export ./my-backup
```

To import:
```bash
firebase emulators:start --import=./my-backup
```

### Profile Location

Persistent Chrome profile: `~/.chrome-profiles/schoology-testing` (gitignored)

Auth state: `.auth-state/session.json` (gitignored)

---

## Success Criteria

✅ **Proven in comprehensive test:**
- Browser opens/closes automatically
- Authentication without manual login
- Navigation works (Dashboard → Courses → back)
- Scrolling works (up/down 500px)
- Interactions work (dropdown click, hover)
- Data extraction works (title, GPA, user)
- Screenshots work (5 saved to disk, displayed inline)

**Result:** 🎉 **THIS IS THE WAY!**

---

## Quick Reference

```bash
# First time setup
npm run chrome:test                    # Auth manually (one time)
node scripts/capture-auth-state.js     # Capture cookie

# Every test
node scripts/inject-auth-state.js      # Automated testing!

# Validate auth before test suites
node scripts/validate-auth.js          # Check if re-auth needed

# Prove capabilities
node scripts/prove-automation.js       # Comprehensive demo

# Logout testing (DESTRUCTIVE - use sparingly!)
node scripts/test-logout.js            # Test logout, invalidates auth

# Persistent Chrome + CDP (alternative)
npm run chrome:test                    # Terminal 1
node scripts/quick-test-authenticated.js  # Terminal 2
```

---

## Files

- **Scripts:** `scripts/capture-auth-state.js`, `scripts/inject-auth-state.js`, `scripts/prove-automation.js`
- **Auth State:** `.auth-state/session.json` (gitignored)
- **Chrome Profile:** `~/.chrome-profiles/schoology-testing` (gitignored)
- **Screenshots:** `test-results/*.png`
