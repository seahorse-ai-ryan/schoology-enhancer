# GitHub Repository Cleanup Plan

**Created:** September 30, 2025  
**Purpose:** Prepare public repository for external developers

---

## 🎯 Issues Identified

Based on review of [github.com/seahorse-ai-ryan/schoology-enhancer](https://github.com/seahorse-ai-ryan/schoology-enhancer):

### 1. **Schoology Developer Prerequisites** ❌
- README doesn't mention need for approved Schoology Developer account
- No instructions for registering app in Schoology Developer Portal
- Missing link to https://developers.schoology.com

### 2. **Environment-Specific URLs** ❌
- `modernteaching.ngrok.dev` is hardcoded in docs (Ryan-specific)
- External developers would need their own ngrok account/domain
- No clear instructions for setting up alternative URLs

### 3. **Missing .env.local Template** ❌
- `.env.local` is gitignored (correct)
- No `.env.local.example` template provided
- External devs don't know what variables to configure

### 4. **Legacy Files (2+ months old)** ⚠️
- Many files show "2 months ago" timestamp on GitHub
- Suggests outdated docs/code not purged during Phase 1A cleanup
- Examples from GitHub file list:
  - `.devcontainer/` (should be deleted - we moved to native!)
  - `.dockerignore` (should be deleted)
  - Various docs/ files

### 5. **Personal Machine-Specific AI Rules** ⚠️
- `.cursor/rules/*.md` contains Ryan's machine paths
- Example: `/Users/ryanhickman/code/web-apps/schoology-enhancer`
- External devs would see these personal paths
- Could cause confusion or feel "locked in"

---

## 📋 Action Items

### High Priority (Before Next Push)

**1. Create .env.local.example**
```bash
# Create template with all required variables (no secrets)
# Include comments explaining each variable
# Reference Schoology Developer registration
```

**2. Update README.md**
- [ ] Add "Prerequisites" section with Schoology Developer registration
- [ ] Add link to https://developers.schoology.com
- [ ] Change `modernteaching.ngrok.dev` to `YOUR_DOMAIN.ngrok.dev` throughout
- [ ] Add note about ngrok static domain requirement (paid account)
- [ ] Add "Environment Setup" section referencing `.env.local.example`

**3. Remove Container Artifacts from GitHub**
- [ ] Verify `.devcontainer/` deleted locally ✅ (done)
- [ ] Verify `.dockerignore` deleted locally ✅ (done)  
- [ ] Ensure next git push reflects these deletions
- [ ] NOTE: Already deleted in commit c0d9f29, should be reflected on next push

**4. Sanitize .cursor/rules/ for Public**
- [ ] Replace `/Users/ryanhickman/code/web-apps/schoology-enhancer` with `${PROJECT_ROOT}` or similar
- [ ] Remove any personal identifiers (email, full name)
- [ ] Make rules generic for any developer

### Medium Priority (Before v0.2 Release)

**5. Audit & Update Legacy Docs**
- [ ] Review all files in `docs/` directory
- [ ] Delete obsolete files (check git history to confirm)
- [ ] Update remaining docs with current info
- [ ] Ensure all docs reference generic setup, not Ryan-specific

**6. Review Scripts for Personal Paths**
- [ ] Check `scripts/*.sh` for hardcoded paths
- [ ] Replace with environment variables or relative paths

**7. Add .gitignore Patterns**
```
# Personal AI configuration
.cursor/local-settings.json
.cursor/user-preferences.md

# User-specific environment
.env.local
.env.*.local

# Mac-specific
.DS_Store
```

### Low Priority (Nice to Have)

**8. Add CONTRIBUTING.md**
- External developer guide
- How to set up local environment
- How to register Schoology app
- Testing workflow

**9. Update LICENSE**
- Verify MIT license is appropriate
- Ensure copyright year is correct
- Add contributor guidelines

**10. Create .github/ Templates**
- Issue template
- PR template
- Security policy

---

## 🔍 Files to Audit

### Likely Legacy (Check for Deletion)

From GitHub file listing with "2 months ago":
- `action-plan.md` - Probably obsolete (replaced by CURRENT-STATUS.md)
- `AUDIT-DOCUMENTATION.md` - May be obsolete
- `product-requirements.md` - Check if current
- `REFACTOR-ACTION-PLAN.md` - Likely obsolete
- `REVISED-ACTION-PLAN.md` - Likely obsolete
- `session-context.md` - May be duplicate of CURRENT-STATUS.md
- `tmp-external-help.md` - Definitely temporary/legacy

### Keep & Update
- `ARCHITECTURE.md` ✅
- `STARTUP.md` ✅ (just updated)
- `CURRENT-STATUS.md` ✅ (just updated)
- `USER-JOURNEYS.md` ✅ (recently created)
- `TESTING.md` ✅ (just created)
- `CHROME-MCP-SETUP.md` ✅ (just updated)

---

## 🚀 Implementation Plan

### Phase 1: Critical Fixes (Today)
1. Create `.env.local.example`
2. Update README.md for external developers
3. Sanitize `.cursor/rules/` files
4. Git commit and push

### Phase 2: Legacy Cleanup (This Week)
1. Delete obsolete docs
2. Update remaining docs
3. Remove personal paths from scripts
4. Update .gitignore

### Phase 3: Polish (Before v0.2)
1. Add CONTRIBUTING.md
2. Create GitHub templates
3. Final audit of all public files

---

## 📝 Notes

**Why This Matters:**
- Repo is public on GitHub
- External developers may want to try the app
- Personal paths/info shouldn't be exposed
- Clear setup instructions prevent frustration

**What to Keep Private:**
- Actual Schoology API credentials (already in .env.local)
- ngrok auth token (already in .env.local)
- Personal machine paths (remove from docs/rules)
- User-specific preferences

**What to Make Generic:**
- All documentation
- AI rules for Cursor
- Example configurations
- Setup instructions

---

**Next Step:** Start with `.env.local.example` and README updates
