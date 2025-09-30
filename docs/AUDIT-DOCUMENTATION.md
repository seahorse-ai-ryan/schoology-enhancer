# Documentation & Testing Audit

**Date:** September 30, 2025  
**Purpose:** Comprehensive review of documentation, testing coverage, and dev workflow  
**Status:** 🔄 In Progress

---

## Phase 1: Documentation Audit

### Current Documentation Files

| File                             | Status          | Purpose                                                     | Action Needed                                      |
| -------------------------------- | --------------- | ----------------------------------------------------------- | -------------------------------------------------- |
| **ARCHITECTURE.md**              | ✅ Current      | Complete architecture, data flow, caching, auth, milestones | Keep - Primary architecture doc                    |
| **architecture-plan.md**         | ⚠️ Legacy       | Old Firebase Studio "two servers" model                     | Archive - Outdated for current Cursor/ngrok setup  |
| **mock-sandbox-plan.md**         | ⚠️ Legacy       | Old seeding plan                                            | Archive - Replaced by SCHOOLOGY-SEED-DATA-GUIDE.md |
| **STARTUP.md**                   | ✅ Current      | Dev environment setup with ngrok/Firebase/Next.js           | Keep - Primary startup guide                       |
| **SCHOOLOGY-CSV-IMPORT.md**      | ✅ Current      | CSV bulk import procedures                                  | Keep - Active reference                            |
| **SCHOOLOGY-SEED-DATA-GUIDE.md** | ✅ Current      | Mock data best practices                                    | Keep - Active reference                            |
| **LOG.md**                       | ❌ Outdated     | Session logs from July 2025                                 | Delete - Not in current workflow                   |
| **mistakes-and-learnings.md**    | ❌ Outdated     | Vitest vs Jest, zombie processes                            | Delete - Lessons learned, no longer relevant       |
| **quick-reference.md**           | ⚠️ Outdated     | Has some good info but needs update                         | Update or merge into ARCHITECTURE.md               |
| **ai-best-practices.md**         | ⚠️ Generic      | "Vibe coding" methodology                                   | Update - Make project-specific for developers      |
| **product-requirements.md**      | ⚠️ Outdated     | Pre-Hello World PRD                                         | Update - Reflect current state and next phases     |
| **README.md**                    | ⚠️ Needs Update | Still references old tech/status                            | Update - Accurate, no-hype description             |

### AI Agent Configuration Files

| File                     | Status      | Purpose                               | Action Needed                                              |
| ------------------------ | ----------- | ------------------------------------- | ---------------------------------------------------------- |
| **.cursorrules**         | ✅ Current  | Primary AI agent rules for Cursor IDE | Split into multiple focused files                          |
| **.idx/airules.md**      | ❌ Outdated | Firebase Studio-specific rules        | Update for current Firebase Studio OR archive if not using |
| **ai-best-practices.md** | ⚠️ Generic  | Vibe coding methodology               | Refactor to `.cursor/ai-workflow.md` for developers        |

### Proposed New Documentation Structure

```
docs/
├── ARCHITECTURE.md          # ✅ Keep - Primary architecture
├── STARTUP.md               # ✅ Keep - Dev environment setup
├── TESTING.md               # 🆕 Create - Comprehensive testing guide
├── USER-JOURNEYS.md         # 🆕 Create - All user flows and UI affordances
├── API-REFERENCE.md         # 🆕 Create - Internal API endpoints
├── REFACTORING-PLAN.md      # 🆕 Create - Safe refactoring opportunities
├── SCHOOLOGY-CSV-IMPORT.md  # ✅ Keep - CSV import procedures
├── SCHOOLOGY-SEED-DATA-GUIDE.md # ✅ Keep - Mock data practices
└── archive/                 # 🗂️ Archive old files
    ├── architecture-plan.md
    ├── mock-sandbox-plan.md
    ├── LOG.md
    └── mistakes-and-learnings.md

.cursor/
├── rules/
│   ├── core.md              # 🆕 Core project context
│   ├── architecture.md      # 🆕 Architecture principles
│   ├── testing.md           # 🆕 Testing guidelines
│   └── workflow.md          # 🆕 Development workflow
└── ai-workflow.md           # 🆕 For human developers

.idx/
└── airules.md               # ✅ Update - Firebase Studio only (if still using)
```

---

## Phase 2: Testing Audit

### Current Testing Infrastructure

**Backend Tests (Jest):**

- Location: `src/test/`
- Command: `npm run test:emu`
- Status: ✅ Working

**E2E Tests (Playwright):**

- Location: `tests/e2e/`
- Command: `npm run test:simple`
- Status: ⚠️ Blocked by MSW issues (per old docs)

**Current Test Files:**

```
src/test/
├── demo-session.spec.ts     # Demo mode cookie/redirect
└── setup.ts                 # Test configuration

tests/e2e/
├── (Need to audit actual files)
```

### User Journeys to Map & Test

#### 1. **Unauthenticated User Journey**

- [ ] Visit landing page
- [ ] See "Sign in with Schoology" button
- [ ] See demo mode option (if exists)
- [ ] Attempt to access protected routes → redirect to login

#### 2. **OAuth Authentication Journey**

- [ ] Click "Sign in with Schoology"
- [ ] Redirect to Schoology OAuth page
- [ ] Approve authorization
- [ ] Redirect back to app with tokens
- [ ] Store tokens in Firestore
- [ ] Redirect to dashboard

#### 3. **Parent User Journey**

- [ ] Login as parent (Christina Mock)
- [ ] See profile menu with children list
- [ ] Click on child (Carter/Tazio/Livio Mock)
- [ ] Dashboard shows child's courses
- [ ] Switch between children
- [ ] Click "View as Parent" to return
- [ ] Logout

#### 4. **Student User Journey (Direct Login)**

- [ ] Login as student
- [ ] See own dashboard with courses
- [ ] No child-switching UI
- [ ] Logout

#### 5. **Dashboard Data Display Journey**

- [ ] Course cards show: title, code, teacher, section
- [ ] Data source badges (Live/Cached)
- [ ] Assignments section (future)
- [ ] Announcements section (future)
- [ ] Deadlines section (future)

#### 6. **Admin Journey**

- [ ] Access `/admin` page (requires admin role)
- [ ] See registered users list
- [ ] Download CSVs (Teachers, Courses, Enrollments)
- [ ] Manage grading periods
- [ ] Seed mock data (if needed)

#### 7. **Error & Edge Cases**

- [ ] User without email shows "No email on file"
- [ ] User without courses shows empty state
- [ ] API failure → fallback to cache
- [ ] Cache empty → show appropriate message
- [ ] Session expiry → redirect to login
- [ ] Invalid OAuth callback → error message

### Testing Coverage Gaps

**Identified Gaps:**

1. No tests for parent-child switching
2. No tests for course data fetching/caching
3. No tests for admin functionality
4. No tests for error states
5. No E2E tests for complete OAuth flow (MSW issue?)

**Testing Tools Status:**

- ✅ Jest: Working for backend integration
- ⚠️ Playwright: Script exists but MSW blocking?
- 🆕 Chrome DevTools MCP: Newly available in Cursor
- ⚠️ Cursor Browser: Not working in container

---

## Phase 3: Browser Setup for Cursor

### Issue

Cursor browser not working in container environment:

> "Chrome isn't installed"

### Investigation Needed

1. Is Cursor running in a Docker/container on Mac?
2. Can we install Chrome in the container?
3. Alternative: Use host Chrome with remote debugging?
4. What's the container config? (`.devcontainer` file?)

### Proposed Solutions

- **Option A:** Install Chrome in container (if writable)
- **Option B:** Configure Cursor to use host Chrome via remote debugging
- **Option C:** Use Chrome DevTools MCP without Cursor Browser
- **Option D:** Continue with existing Playwright setup (headless)

---

## Phase 4: AI Rules Consolidation

### Current Issues

1. **Overloaded `.cursorrules`** - Single 250+ line file with everything
2. **Duplicate content** - Same info in multiple places
3. **Outdated airules.md** - References old Firebase Studio workflow
4. **Generic ai-best-practices.md** - Not project-specific enough

### Proposed Structure

**.cursor/rules/** (New Cursor multi-file support)

```markdown
core.md # Project name, status, key achievements, next priority
architecture.md # Data models, caching, API endpoints
testing.md # Testing strategy, commands, MCP usage
workflow.md # Dev environment, startup sequence, common issues
```

**.cursor/ai-workflow.md** (For human developers)

```markdown
# How to Work with AI on This Project

- Vibe coding principles
- Which files to read first
- How to provide context
- Testing expectations
```

**.idx/airules.md** (Firebase Studio only)

```markdown
# Firebase Studio Specific Rules

- Two servers model (if still relevant)
- Hard restart command
- Links to .cursor/rules/ for details
```

**.cursorrules** (Minimal, delegates to .cursor/rules/)

```markdown
# Cursor Rules

This project uses modular rules in `.cursor/rules/`.
Read all files in that directory for complete context.

Quick Reference:

- Core: .cursor/rules/core.md
- Architecture: .cursor/rules/architecture.md
- Testing: .cursor/rules/testing.md
- Workflow: .cursor/rules/workflow.md
```

---

## Phase 5: README Update

### Current Issues

- References old tech (MSW issues, Playwright blocking)
- Mentions contributions (single dev project)
- Status section outdated

### Proposed Content

```markdown
# Modern Teaching (Schoology Enhancer)

A Next.js application that enhances Schoology with modern UI, offline support, and AI-ready data.

## Status

✅ "Hello World" milestone achieved - OAuth login, parent-child switching, live course data

## Features

- Schoology OAuth 1.0a authentication
- Parent account → child selection
- Real-time course data from Schoology API
- Firestore caching for offline access
- Mock data seeding for development

## Tech Stack

- Next.js 14, TypeScript, Tailwind CSS
- Firebase (Firestore, Functions, Hosting)
- Schoology REST API v1
- ngrok for local development

## Quick Start

[Accurate setup instructions]

## Development

[Clear workflow]

## Testing

[Current testing approach]

## Documentation

- docs/ARCHITECTURE.md - Complete architecture
- docs/STARTUP.md - Dev environment setup
- docs/TESTING.md - Testing guide
```

---

## Phase 6: Cleanup Plan

### Files to Archive (move to docs/archive/)

- ❌ docs/LOG.md - July session logs, not current
- ❌ docs/mistakes-and-learnings.md - Vitest/Jest lessons, resolved
- ❌ docs/architecture-plan.md - Old Firebase Studio model
- ❌ docs/mock-sandbox-plan.md - Replaced by SCHOOLOGY-SEED-DATA-GUIDE.md
- ⚠️ docs/demo-session.spec.ts - Wrong location (should be in tests/)

### Files to Delete

- None immediately - archive first, delete after refactor complete

### Files to Update

- ✅ README.md - Accurate description
- ✅ product-requirements.md - Post-Hello World roadmap
- ✅ ai-best-practices.md → .cursor/ai-workflow.md
- ✅ quick-reference.md - Merge useful bits into ARCHITECTURE.md or delete

---

## Phase 7: Refactoring Plan (Future)

**After testing coverage is complete:**

1. **Identify refactoring opportunities**

   - Duplicate code
   - Inconsistent patterns
   - Technical debt

2. **Prioritize by risk**

   - Low risk: Well-tested areas
   - High risk: Critical paths

3. **Refactor with tests**

   - Green → Refactor → Green
   - No functionality changes
   - Verify with test suite

4. **Document decisions**
   - Why we refactored
   - What changed
   - What stayed the same

---

## Next Steps

1. ✅ Create this audit document
2. ⏳ Review actual test files to map coverage
3. ⏳ Investigate Cursor browser/container issue
4. ⏳ Create .cursor/rules/ structure
5. ⏳ Update README.md
6. ⏳ Archive legacy docs
7. ⏳ Create USER-JOURNEYS.md
8. ⏳ Create TESTING.md
9. ⏳ Begin refactoring with full test coverage

---

## Questions for Developer

1. **Are you still using Firebase Studio?** If not, we can archive .idx/airules.md
2. **Container setup:** What's running Cursor in a container? (.devcontainer config?)
3. **Testing priority:** Should we fix Playwright E2E or focus on Chrome DevTools MCP?
4. **Browser preference:** Chrome DevTools MCP vs Cursor Browser vs Playwright?
5. **Demo mode:** Is this feature still active/needed? (Found demo-session.spec.ts)
