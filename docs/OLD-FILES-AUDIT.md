# Old Files Audit - September 30, 2025

**Found:** 75 files older than 2 days (out of 183 total tracked files)

---

## 📊 Summary Statistics

- **Total tracked files:** 183
- **Changed in last 2 days:** 108
- **Older than 2 days:** 75 (41% of repo!)
- **Oldest files:** From July 18, 2025 (2+ months old)

---

## 🗑️ Files to DELETE (Not Needed)

### 1. AI/Genkit Related (July 18-21)
**Status:** ❌ DELETE - Not using Genkit anymore

- `src/ai/genkit.ts` (July 18)
- `src/ai/dev.ts` (July 21)
- `src/ai/flows/summarize-announcement.ts` (July 21)
- `src/components/announcement-summarizer.tsx` (July 21)
- `apphosting.yaml` (July 18) - Genkit deployment config

**Reason:** We don't use Genkit AI flows. Using standard Next.js + Firebase.

### 2. Old/Unused Components & Pages

- `.modified` (July 21) - Empty file, no purpose
- `src/app/(authenticated)/announcements/page.tsx` (July 21) - Not implemented yet
- `src/app/(authenticated)/courses/[id]/page.tsx` (Sep 26) - Not implemented yet
- `src/app/(authenticated)/incentives/page.tsx` (Sep 26) - Not implemented yet
- `src/app/(authenticated)/planning/page.tsx` (Sep 26) - Placeholder only

**Reason:** These are empty placeholders or unfinished features.

### 3. Firebase Functions (July 23)
**Status:** ⚠️ REVIEW - May be superseded

- `src/functions/hello-world.ts`
- `src/functions/simple-test.ts`
- `src/functions/lib/*.js` (compiled JS files)
- `src/functions/lib/*.js.map` (source maps)

**Reason:** Functions folder exists but we're using Next.js API routes instead.

### 4. Old Test Files (July 23 - Aug 13)

- `src/test/oauth-simple.test.ts` (Aug 13)
- `src/test/oauth.test.ts` (Aug 13)
- `src/test/example.spec.ts` (July 23)

**Reason:** Superseded by new E2E tests with persistent auth.

### 5. Temporary/Helper Files

- `tmp-external-help.md` (July 23)
- `functions` symlink (Aug 13)

---

## 📝 Files to UPDATE (Needed but Outdated)

### 1. Config Files (July 18-24)
**Status:** ⚠️ UPDATE

#### tsconfig.json (July 18)
- ✅ Mostly fine
- ❓ Review `target: ES2017` - could be newer
- ❓ Check if paths are all correct

#### next.config.ts (July 21)
- ⚠️ Has `ignoreBuildErrors: true` - should fix and remove
- ⚠️ Has `ignoreDuringBuilds: true` - should fix and remove
- ✅ Image patterns OK

#### postcss.config.mjs (July 18)
- ✅ Minimal and correct
- No changes needed

#### tailwind.config.ts (July 21)
- ❓ Review - may need updates for new components
- Check if all paths included

### 2. Firebase Studio Config
**Status:** ⚠️ UPDATE for native Mac

#### .idx/dev.nix (July 24)
- ⚠️ This is for Firebase Studio (cloud IDE)
- May need updates for future Studio sessions
- Currently using native Mac - this file unused

#### .idx/icon.png (July 21)
- ❓ Project icon - probably fine
- Could update to match branding

#### .idx/integrations.json (July 22)
- ❓ Firebase Studio integrations
- May need review for future Studio use

### 3. Build/Deploy Config

#### firebase.json (Aug 13)
- ⚠️ Review emulator settings
- Check hosting config
- Verify functions config

### 4. Package Files

#### package.json (Sep 29)
- ✅ Recent (1 day old)
- ❓ Review dependencies for unused packages

---

## ✅ Files to KEEP (Core Infrastructure)

### 1. shadcn/ui Components (July 18)
**Status:** ✅ KEEP - These are stable

All from July 18, but these are standard UI components:
- `src/components/ui/*.tsx` (35+ components)
- `components.json`
- `src/lib/utils.ts`
- `src/hooks/use-toast.ts`

**Reason:** These don't change often. Part of shadcn/ui framework.

### 2. Core Lib Files

- `src/lib/firebase.ts` (Aug 13)
- `src/lib/schoology.ts` (July 22)
- ✅ Core infrastructure, stable

### 3. Firebase Config

- `firebase.json` (Aug 13)
- ✅ Core config, rarely changes

---

## 🎯 Recommended Actions

### Immediate (Today)

1. **Delete AI/Genkit files:**
```bash
git rm -r src/ai/
git rm apphosting.yaml
git rm src/components/announcement-summarizer.tsx
```

2. **Delete empty/unused files:**
```bash
git rm .modified
git rm tmp-external-help.md
git rm functions  # if it's a symlink
```

3. **Delete old test files:**
```bash
git rm src/test/oauth-simple.test.ts
git rm src/test/oauth.test.ts  
git rm src/test/example.spec.ts
```

4. **Delete placeholder pages:**
```bash
git rm src/app/(authenticated)/announcements/page.tsx
git rm src/app/(authenticated)/courses/[id]/page.tsx
git rm src/app/(authenticated)/incentives/page.tsx
git rm src/app/(authenticated)/planning/page.tsx
```

### Short Term (This Week)

5. **Review Firebase functions:**
   - Decide: Keep or move to API routes?
   - If keeping, update and document
   - If not, delete src/functions/

6. **Update config files:**
   - Fix TypeScript/ESLint errors
   - Remove `ignoreBuildErrors` from next.config.ts
   - Update tsconfig if needed

7. **Review .idx/ files:**
   - Update for native Mac dev
   - Ensure Firebase Studio compatibility
   - Document any changes needed

---

## 📊 Impact Assessment

**If we delete recommended files:**

- **Remove:** ~30 files
- **Update:** ~5 config files
- **Keep:** ~35 UI components + core infrastructure

**Result:**
- Cleaner repository (16% smaller)
- No unused AI frameworks
- No placeholder/empty pages
- Only working, tested code remains

---

## 🚨 Files Needing Attention

### Critical Review Needed:

1. **src/functions/** - Entire directory (17 files)
   - Are these used? 
   - Or using API routes instead?
   - Decision needed ASAP

2. **next.config.ts** - Has error ignoring
   - Should fix errors, not ignore them
   - Technical debt

3. **.idx/** files - Firebase Studio config
   - Need updates for native Mac setup
   - May be outdated

4. **Placeholder pages** - 4 authenticated routes
   - Delete or implement?
   - Cluttering route structure

---

## ✅ Next Steps

1. Run deletion commands above
2. Test that app still works
3. Update config files
4. Review functions directory
5. Commit: "chore: Remove 30+ unused/old files"

**Goal:** Clean, lean codebase with only necessary files!
