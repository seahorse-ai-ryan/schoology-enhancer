# Automated Testing - Quick Start

**Last Updated:** September 30, 2025

---

## 🚀 TL;DR

```bash
# First run: Sign in manually when browser opens
node scripts/test-authenticated.js

# All future runs: Fully automated!
node scripts/test-authenticated.js
```

**Done!** Your session persists forever. No more manual login.

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

Current automated tests verify:
- ✅ Authentication persistence works
- ✅ Dashboard loads with real data
- ✅ Parent profile displayed correctly
- ✅ Active student information shown
- ✅ Courses section present

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

## 📁 What Gets Saved

`.auth/chrome-profile/` contains:
- Cookies (including Schoology session)
- localStorage
- IndexedDB
- Session storage

**This directory is gitignored** (never committed).

---

## 🧪 Adding More Tests

Edit `scripts/test-authenticated.js`:

```javascript
// Add new test after authentication check
console.log('Test 3: Clicking child selector...');
await page.click('[data-testid="child-selector"]');
await page.waitForTimeout(1000);

const childName = await page.textContent('.active-child-name');
console.log(`   ✅ Active child: ${childName}\n`);
```

---

## 🎯 Next: Comprehensive Coverage

See `docs/CURRENT-STATUS.md` Phase 3 for the full test plan covering all 11 user journeys.

---

**For detailed documentation:** See `docs/TESTING-SUCCESS.md`
