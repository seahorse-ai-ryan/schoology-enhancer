# Testing Guide - Modern Teaching

**Last Updated:** September 30, 2025  
**Environment:** Native macOS with Cursor Browser Automation

---

## 🧪 Testing Philosophy

**Browser-First Approach:** Visual, AI-driven E2E testing takes priority over headless unit tests.

**Why?**
- Faster iteration with vibe coding
- AI can see what's actually happening
- Catches UI/UX issues that unit tests miss
- Real user flows validated end-to-end

---

## 🎯 Testing Pyramid (Inverted for Solo Development)

```
        🌐 E2E Browser Tests (Primary)
              ↑
        🔌 API Integration Tests
              ↑
        ⚙️ Unit Tests (Minimal)
```

**Traditional pyramid inverted:** For a solo developer with AI pair programming, the speed and confidence from E2E tests outweighs the maintenance cost.

---

## 🛠️ Testing Tools

### 1. Cursor MCP Browser Automation (Primary) ⭐

**What:** Playwright-based browser automation via Cursor's built-in MCP  
**Status:** ✅ Enabled (native Mac support)  
**Best For:**
- AI-driven E2E testing
- Visual verification
- Interactive debugging
- Real user flows
- Exploratory testing

**How to Use:**
Just ask the AI to test something! Examples:
- "Navigate to the dashboard and check if courses are displayed"
- "Test the OAuth flow - I'll sign in when the browser opens"
- "Verify parent-child switching works correctly"

The AI will:
1. Open a visible browser window
2. Navigate to your app
3. Pause for manual auth if needed
4. Continue automation
5. Report findings with screenshots

**No configuration files needed!** No `playwright.config.ts`, no `.spec.ts` files.

### 2. Jest (Backend/Unit Tests)

**What:** JavaScript testing framework for Node.js  
**Status:** ✅ Configured (`npm run test:emu`)  
**Best For:**
- Data transformations
- API route logic
- Firebase integration
- Utility functions

**When to Use:** Only when browser testing isn't needed (e.g., testing date formatting)

---

## 📁 Test Structure

```
src/test/                          # Backend/unit tests
├── admin-page.spec.tsx
├── authorize-url.spec.ts
├── hello-world.spec.ts
├── oauth-flow.node.spec.ts
└── ... (11 files total)

# E2E browser tests: Run via AI in Cursor using MCP tools
# No separate test files needed - just ask the AI!
```

---

## 🔐 Authenticated Testing Pattern

### The Challenge

Our app requires **real Schoology OAuth** credentials. You can't automate login without exposing secrets.

### The Solution: Hybrid Manual/Automated Flow

**Pattern:** AI launches browser → You sign in manually → AI continues automation

**How it works:**

### How It Works

```typescript
test.beforeAll(async ({ browser }) => {
  const page = await browser.newPage();
  await page.goto('http://localhost:9000');
  
  // Check if already authenticated
  const authResponse = await page.request.get('/api/auth/status');
  
  if (authResponse.status() === 401) {
    // Pause and prompt user
    console.log('🔐 Please sign in with Schoology OAuth...');
    console.log('⏸️  Test will resume automatically after redirect');
    
    // Wait for OAuth redirect (up to 3 minutes)
    await page.waitForURL('http://localhost:9000/**', { timeout: 180000 });
    
    // Verify auth worked
    const statusCheck = await page.request.get('/api/auth/status');
    expect(statusCheck.status()).toBe(200);
  }
  
  // Now all tests run with authenticated session!
});
```

### Running Authenticated Tests

**Step 1:** Ensure dev servers running:
```bash
# Terminal 1
ngrok http --url=modernteaching.ngrok.dev 9000 --log stdout

# Terminal 2
firebase emulators:start

# Terminal 3
npm run dev
```

**Step 2:** Ask AI to test something that requires auth:

Examples:
- "Test the full OAuth flow - open the browser and I'll sign in"
- "Navigate to dashboard, I'll authenticate, then verify courses load"
- "Test parent-child switching after I log in"

**Step 3:** AI opens browser to your app

**Step 4:** You manually sign in with Schoology OAuth

**Step 5:** AI detects auth completion and continues testing automatically

**Step 6:** AI reports findings with screenshots and observations

**No test files to maintain!** Just conversational testing with AI.

---

## 🚀 Quick Start: Automated Testing

**Run automated tests with persistent auth:**

```bash
# First time: Sign in when browser opens
node scripts/test-authenticated.js

# All future runs: Fully automated!
node scripts/test-authenticated.js
```

Session persists in `.auth/chrome-profile/` - no more manual login!

**See:** `docs/TESTING-QUICK-START.md` for details.

---

## 🧪 Test Scenarios to Cover

### Authentication Flow
- ✅ Display login button when not authenticated
- ✅ OAuth redirect to Schoology
- ✅ Successful redirect back after auth
- ✅ Display authenticated user in header

### Parent-Child Features
- ✅ Show parent profile menu with children
- ✅ Switch to child view and display courses
- ✅ Display real course data (not mock)
- ✅ Switch between multiple children

### Data & Caching
- ✅ Network request to `/api/schoology/courses` works
- ✅ Cache course data in Firestore
- ✅ Show data source indicators (Live/Cached/Mock)
- ✅ Handle cache expiration

---

## 🎬 Visual Testing with Cursor

### Using Cursor's Test Explorer

**Features:**
- Click-to-run individual tests
- Real-time browser visualization
- Auto-refresh on file changes
- Screenshots on failure
- Console output integrated

**Best Practice:**
1. Write test in `tests/e2e/*.spec.ts`
2. Save file (Test Explorer auto-updates)
3. Click ▶️ Run button
4. Watch browser execute
5. Check console for logs/errors
6. Fix issues and re-run

### Debug Mode

**How to Debug:**
1. Add `await page.pause()` in test
2. Run test
3. Browser stops at breakpoint
4. Inspect DOM, console, network
5. Click "Resume" when ready

**Example:**
```typescript
test('debug user menu', async ({ page }) => {
  await page.goto('/dashboard');
  
  await page.pause(); // 👈 Breakpoint here
  
  await page.getByRole('button', { name: /profile/i }).click();
  // ... rest of test
});
```

---

## 🔄 Testing Workflow

### During Development

**1. Make code changes** (e.g., update user menu)

**2. Run relevant E2E test** via Test Explorer

**3. Watch browser** execute test in real-time

**4. Check console** for logs/errors

**5. If test fails:**
- Screenshot saved automatically
- Error context shown in Test Explorer
- Fix code and re-run

**6. If test passes:**
- Commit changes with confidence
- Move to next feature

### Before Committing

**Run full E2E suite:**
```bash
npx playwright test tests/e2e/
```

**Run backend tests:**
```bash
npm run test:emu
```

**Check for regressions:**
- All tests should pass
- No new console errors
- Screenshots match expected UI

---

## 📊 Test Coverage Goals

### Phase 2: Fill Testing Gaps (Current Priority)

**Missing Tests:**
- [x] Parent-child switching E2E ✅ (authenticated-flow.spec.ts)
- [x] Live API course fetching ✅ (authenticated-flow.spec.ts)
- [x] Cache fallback behavior ✅ (authenticated-flow.spec.ts)
- [ ] Announcements fetching
- [ ] Deadlines fetching
- [ ] Multi-child household flow
- [ ] Cache expiration (TTL)
- [ ] Offline behavior

### Phase 3: Advanced Scenarios

**Future Tests:**
- [ ] Network failure recovery
- [ ] Concurrent parent sessions
- [ ] Real-time updates
- [ ] Performance (LCP, FID, CLS)
- [ ] Accessibility (ARIA, keyboard nav)

---

## 🚀 CI/CD Testing (Future)

### Headless Mode

For automated pipelines without manual auth:

**Option 1: Cookie Injection**
```typescript
// Save auth state once manually
await context.storageState({ path: 'auth-state.json' });

// In CI: Load saved state
const context = await browser.newContext({
  storageState: 'auth-state.json'
});
```

**Option 2: API Token**
```typescript
// Extract token from OAuth callback
// Store in GitHub Secrets
// Inject in CI environment
process.env.SCHOOLOGY_TEST_TOKEN = 'xxx';
```

**Option 3: Mock Mode**
```typescript
// Run E2E tests against mock Schoology API
// Separate test suite from real API tests
```

---

## 🐛 Troubleshooting

### Test Explorer Not Showing Tests

**Solutions:**
1. Ensure `playwright.config.ts` points to `testDir: './tests/e2e'`
2. File names must end in `.spec.ts` or `.test.ts`
3. Restart Cursor if still not visible

### Browser Doesn't Open

**Solutions:**
1. Check Cursor Settings → Tools & MCP → Browser Automation (should show "Ready")
2. Verify Chrome installed: `/Applications/Google Chrome.app/Contents/MacOS/Google Chrome`
3. Try running manually: `npx playwright test --headed`

### Authentication Timeout

**Causes:**
- Took longer than 3 minutes to sign in
- Network issues during OAuth
- Schoology server slow

**Solutions:**
- Increase timeout in test: `{ timeout: 300000 }` (5 min)
- Ensure stable internet connection
- Check ngrok tunnel is active

### Tests Pass Locally, Fail in Test Explorer

**Causes:**
- Different base URL
- Environment variables not loaded
- Port conflicts

**Solutions:**
1. Check `.env.local` is loaded
2. Verify dev servers running on correct ports
3. Check `playwright.config.ts` base URL

---

## 📚 Additional Resources

**Playwright Docs:**
- https://playwright.dev/docs/intro
- https://playwright.dev/docs/test-assertions

**Cursor Browser Automation:**
- Settings → Tools & MCP → Browser Automation
- Built on Playwright
- Native to Cursor IDE

**Testing Best Practices:**
- Write tests from user perspective
- Test behavior, not implementation
- One assertion per test (when possible)
- Use data-testid for critical elements

---

## 🎯 Next Steps

**Phase 2 Completion Checklist:**
- [x] Create authenticated test suite ✅
- [x] Document hybrid manual/automated pattern ✅
- [ ] Run full authenticated flow with real OAuth
- [ ] Add tests for announcements endpoint
- [ ] Add tests for deadlines endpoint
- [ ] Document test results in CURRENT-STATUS.md

**After testing complete:** Code refactoring can begin (with confidence!)

---

**Questions?** Check `docs/CURRENT-STATUS.md` for active TODOs and context.
