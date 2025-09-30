# Automated Testing with Persistent Auth

**Last Updated:** September 30, 2025

---

## 🎯 The Solution: One-Time Auth, Infinite Tests

**Problem:** hCaptcha blocks Playwright's Chromium  
**Solution:** Authenticate once manually, save session, reuse forever

---

## 🚀 Quick Start

### Step 1: Save Your Auth State (One Time)

```bash
node scripts/save-auth-state.js
```

**What happens:**
1. ✅ Browser opens to your app
2. ✅ You click "Sign In with Schoology"
3. ✅ You complete OAuth (pass hCaptcha **once**)
4. ✅ Script saves your session to `.auth/state.json`
5. ✅ Browser closes

**You only do this ONCE** (or when session expires).

### Step 2: Run Automated Tests

Now all your tests can use the saved auth state:

```javascript
// In your test or when using Cursor MCP
const context = await browser.newContext({
  storageState: '.auth/state.json' // Load saved session
});

// Now you're authenticated! No hCaptcha, no manual login
const page = await context.newPage();
await page.goto('https://modernteaching.ngrok.dev/dashboard');
// You're logged in automatically!
```

---

## 📁 File Structure

```
.auth/
└── state.json          # Saved browser session (gitignored)

scripts/
└── save-auth-state.js  # Script to capture auth

.gitignore              # Includes .auth/state.json
```

**Important:** `.auth/state.json` is gitignored (contains your session cookies)

---

## 🔄 When to Refresh Auth

**Your saved auth expires when:**
- Schoology session expires (usually 24-48 hours)
- You clear cookies in your regular browser
- You change Schoology password

**To refresh:**
```bash
node scripts/save-auth-state.js
```

Just re-run and sign in again. Takes 30 seconds.

---

## 🧪 Using Saved Auth with Cursor MCP

**Example: Test authenticated dashboard**

Ask AI:
> "Load the saved auth state from .auth/state.json and test the dashboard - verify courses load for each child"

The AI will:
1. Create browser context with saved auth
2. Navigate to dashboard (already logged in!)
3. Test parent-child switching
4. Verify courses load
5. Report findings

**No hCaptcha! No manual login! Fully automated!**

---

## 📝 Example Test Pattern

```javascript
/**
 * Automated test using saved auth state
 */
async function testAuthenticatedFlow() {
  const fs = require('fs');
  const path = require('path');
  
  // Check if auth state exists
  const authPath = path.join(__dirname, '..', '.auth', 'state.json');
  if (!fs.existsSync(authPath)) {
    console.log('❌ No saved auth state found');
    console.log('👉 Run: node scripts/save-auth-state.js');
    return;
  }
  
  // Launch browser with saved auth
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    storageState: authPath // Load saved session
  });
  
  const page = await context.newPage();
  
  // Navigate - you're already authenticated!
  await page.goto('https://modernteaching.ngrok.dev/dashboard');
  
  // Verify auth worked
  const authStatus = await page.request.get('/api/auth/status');
  console.log('Auth status:', authStatus.status()); // Should be 200
  
  // Now test authenticated features
  await page.click('[data-testid="user-menu"]');
  await page.click('text=Carter Mock');
  // ... continue testing
  
  await browser.close();
}
```

---

## 🎬 Workflow Comparison

### Before (Manual Every Time)
```
Test 1: Manual login → Pass hCaptcha → Test
Test 2: Manual login → Pass hCaptcha → Test
Test 3: Manual login → Pass hCaptcha → Test
❌ Slow, repetitive, not automated
```

### After (One-Time Auth)
```
Setup: node scripts/save-auth-state.js (once)
Test 1: Load state → Test (automated)
Test 2: Load state → Test (automated)  
Test 3: Load state → Test (automated)
✅ Fast, automated, no hCaptcha!
```

---

## 🔒 Security Notes

**What's in `.auth/state.json`:**
- Browser cookies (including auth tokens)
- localStorage data
- Session storage
- IndexedDB data

**Security:**
- ✅ Gitignored (not committed to repo)
- ✅ Local to your machine only
- ✅ Same security as being logged in normally
- ⚠️ Don't share this file (it's your session)
- ⚠️ Refresh if compromised

**Best practices:**
- Keep file local
- Refresh periodically
- Don't commit to Git
- Don't share in screenshots/logs

---

## 🐛 Troubleshooting

### "Auth state not found"
```bash
# Run the setup script
node scripts/save-auth-state.js
```

### "Auth expired" / Tests show login page
```bash
# Session expired - refresh auth
node scripts/save-auth-state.js
```

### "hCaptcha still appearing"
- Make sure you completed OAuth fully in the setup script
- Check that `.auth/state.json` exists and isn't empty
- Try refreshing auth state

### "Tests fail with 401 errors"
- Auth state expired
- Re-run `node scripts/save-auth-state.js`

---

## 🎯 Next Steps

1. **Run setup now:**
   ```bash
   node scripts/save-auth-state.js
   ```

2. **Test it works:**
   Ask AI to load `.auth/state.json` and navigate to dashboard

3. **Build your test suite:**
   All tests can now run fully automated!

4. **Refresh when needed:**
   Re-run setup script when session expires (every few days)

---

## 📚 References

- [Playwright Authentication Docs](https://playwright.dev/docs/auth)
- Saved in: `.auth/state.json`
- Script: `scripts/save-auth-state.js`

**The key insight:** You authenticate once manually (pass hCaptcha), save the session, then all future tests are fully automated!
