# Browser Testing with Cursor MCP

**Last Updated:** September 30, 2025

---

## 🎯 The Issue: hCaptcha Blocking Automation

**Problem:** hCaptcha detects Playwright's Chromium as automated and blocks it.

**Root Cause:** 
- Playwright's bundled Chromium has `navigator.webdriver = true`
- hCaptcha and other anti-bot systems detect this
- Standard Playwright browser fails hCaptcha challenges

---

## ✅ Solution: Use System Chrome with User Data

**Instead of Playwright's Chromium, use your actual Google Chrome:**

### Option 1: Manual Testing (Current Approach)

For now, when you need to test with OAuth:

1. **Use your regular Chrome browser** (not automated)
2. Navigate to https://modernteaching.ngrok.dev manually
3. Sign in with Schoology OAuth
4. Test features manually or with AI assistance via console

**Pros:**
- No hCaptcha issues
- Your existing session/cookies work
- Full browser functionality

**Cons:**
- Manual interaction required
- Can't fully automate OAuth

### Option 2: Chrome CDP (Chrome DevTools Protocol) - Future

For automated testing with your real Chrome:

```javascript
// Launch with Chrome CDP
const browser = await chromium.connectOverCDP('http://localhost:9222');
```

**Requires:**
1. Start Chrome with remote debugging:
```bash
/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome \
  --remote-debugging-port=9222 \
  --user-data-dir="/tmp/chrome-testing-profile"
```

2. Cursor MCP connects to this Chrome instance
3. No webdriver flags, passes hCaptcha
4. Maintains your session

### Option 3: Browser Context with Persistent State

Save authenticated state for reuse:

```javascript
// After manual login once, save state
await context.storageState({ path: 'auth-state.json' });

// Reuse in future tests
const context = await browser.newContext({
  storageState: 'auth-state.json'
});
```

---

## 🚀 Recommended Testing Workflow

**For development (current):**

1. **Manual Auth Once:**
   - Open Chrome manually
   - Sign in to https://modernteaching.ngrok.dev
   - Complete OAuth flow

2. **AI-Assisted Testing:**
   - Ask AI to observe via console logs
   - AI reads network tab, console, DOM
   - AI reports findings

3. **Automated Testing (without auth):**
   - Use Cursor MCP for unauthenticated flows
   - Test landing page, UI components, etc.

**For CI/CD (future):**
- Use API token approach (bypass OAuth UI)
- Or use 2Captcha service for automation
- Or mock OAuth in test environment

---

## 🔧 Chrome CDP Setup (When Needed)

To enable Chrome DevTools Protocol for Cursor MCP:

```bash
# 1. Start Chrome with remote debugging
/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome \
  --remote-debugging-port=9222 \
  --user-data-dir="/tmp/chrome-test" \
  &

# 2. Cursor MCP can now connect to this Chrome
# No hCaptcha blocking, full functionality
```

---

## 📝 Current Limitation

**hCaptcha + Playwright = ❌ Blocked**

**Workarounds:**
- ✅ Use system Chrome manually for OAuth
- ✅ Save auth state after first login
- ✅ Test non-auth flows with Cursor MCP
- ✅ Use Chrome CDP for full automation (requires setup)

---

## 🎯 Next Steps

1. **For now:** Manual Chrome for OAuth testing
2. **Document:** Save auth state after successful login
3. **Future:** Set up Chrome CDP if frequent OAuth testing needed
4. **Alternative:** Mock OAuth in test environment

---

**The key insight:** Playwright's Chromium is detected by anti-bot systems. Use your real Chrome for testing that requires passing hCaptcha.
