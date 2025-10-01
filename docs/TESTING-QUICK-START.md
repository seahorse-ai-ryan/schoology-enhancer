# Automated Testing - Quick Start

**Last Updated:** September 30, 2025

---

## 🚀 TL;DR

```bash
# Run all E2E tests
bash scripts/test-all.sh

# Or run individual tests
node scripts/test-authenticated.js
node scripts/test-2-default-dashboard.js
node scripts/test-3-child-switching.js
# ... etc
```

**First run only:** Sign in when browser opens, then all future runs are fully automated!

---

## 🧪 Available Tests

**All tests use persistent authentication - sign in once, automated forever!**

| Test | Script | What It Tests |
|------|--------|---------------|
| 1 | `test-authenticated.js` | OAuth authentication & session persistence |
| 2 | `test-2-default-dashboard.js` | Dashboard loads with default child |
| 3 | `test-3-child-switching.js` | Switch between children |
| 4 | `test-4-navigation.js` | Navigation & course details |
| 5 | `test-5-assignments-grades.js` | Assignments & grades display |
| 6 | `test-6-data-sources.js` | Data source indicators (Live/Cached/Mock) |
| 7 | `test-7-complete-flow.js` | Complete user journey E2E |

---

## 🔑 The Breakthrough

**Problem:** Schoology OAuth requires hCaptcha, which blocks automated browsers.

**Solution:** `chromium.launchPersistentContext()` maintains a real Chrome profile.

**Result:**
1. Sign in once manually (pass hCaptcha)
2. Session saved to `.auth/chrome-profile/`
3. All future tests: **already authenticated!**

---

## 📊 What Gets Tested

**Core User Journeys:**
- ✅ Authentication & session persistence
- ✅ Dashboard with real/cached/mock data
- ✅ Child switching (multiple students)
- ✅ Navigation between sections
- ✅ Assignments & grades display
- ✅ Data source indicators
- ✅ Complete user flow E2E

**All tests:**
- Use persistent auth (no manual login after first run)
- Take screenshots in `test-results/`
- Report detailed results
- Run independently

---

## 🔄 When to Re-authenticate

**Rarely needed!** Only when:
- Schoology session expires (24-48 hours)
- You change Schoology password
- Browser profile gets corrupted

**To refresh:**
```bash
rm -rf .auth/chrome-profile
node scripts/test-authenticated.js
# Sign in again when browser opens
```

---

## 📁 Test Results

All screenshots saved to `test-results/`:
- `test-1-authenticated.png`
- `test-2-default-dashboard.png`
- `test-3-child-switching.png`
- etc.

**Git ignores this directory** - screenshots are local only.

---

## 🎯 Running Tests

**Run all tests in sequence:**
```bash
bash scripts/test-all.sh
```

**Run individual test:**
```bash
node scripts/test-authenticated.js
node scripts/test-2-default-dashboard.js
# etc.
```

**First time:**
- Browser opens
- Sign in with Schoology
- Complete OAuth
- Test continues automatically

**Every time after:**
- Fully automated!
- No manual interaction
- Session reused

---

## 📝 Adding New Tests

Copy the template from any existing test:

```javascript
const { chromium } = require('playwright');
const path = require('path');

const PROFILE_DIR = path.join(__dirname, '..', '.auth', 'chrome-profile');
const APP_URL = 'https://modernteaching.ngrok.dev';

async function testNewFeature() {
  const context = await chromium.launchPersistentContext(PROFILE_DIR, {
    channel: 'chrome',
    headless: false,
  });

  const page = context.pages()[0] || await context.newPage();
  await page.goto(`${APP_URL}/dashboard`);
  
  // Your tests here
  
  await page.screenshot({ path: 'test-results/test-new.png' });
  await context.close();
}

testNewFeature().catch(console.error);
```

---

## 🏆 Success!

**You now have:**
- ✅ 7 automated E2E tests
- ✅ Persistent auth (no repeated login)
- ✅ Visual verification (screenshots)
- ✅ Complete user journey coverage

**Next:** Add integration & unit tests for 100% coverage!

---

**For detailed docs:** See `docs/TESTING-SUCCESS.md`