# Modern Teaching - Core AI Rules

**⭐⭐ START HERE: Read `.cursor/rules/task-kickoff.md` before starting any new task! ⭐⭐**

## 🎯 Primary Goal

**Project Name:** Modern Teaching (formerly Schoology Enhancer)  
**Repository:** https://github.com/seahorse-ai-ryan/schoology-enhancer  
**Deployment:** Firebase Hosting (modernteaching.com - planned)

---

## Current Status (September 30, 2025)

### ✅ Hello World Milestone Achieved

**Complete E2E Flow:**
1. Parent logs in with real Schoology OAuth credentials
2. Selects child (Carter, Tazio, or Livio Mock) from profile menu
3. Dashboard fetches and displays child's courses from Schoology API
4. Data cached to Firestore for offline access

**What Works:**
- OAuth 1.0a authentication flow
- Parent-child account associations
- Real-time course data fetching (`/api/schoology/courses`)
- Firestore caching with offline support
- Dashboard displaying live student courses with teacher names
- Mock data CSV bulk import to Schoology sandbox
- Static ngrok domain for stable development

---

## Next Priority (v0.2 - Smart Caching)

⏳ **DO NOT REFACTOR CODE** until testing coverage is complete.

⏳ **DO NOT ESTIMATE TIMEFRAMES** - This is vibe coding, not waterfall planning. No "Weeks 3-6" or arbitrary dates.

**Current Focus:**
1. ✅ Switched to native Mac for full browser automation support
2. Configure Chrome DevTools MCP in Cursor (user action)
3. Implement browser-first testing strategy
4. Fill testing gaps for Hello World features (parent-child switching, live API, cache fallback)
5. **ONLY THEN** consider code refactoring

**Upcoming Features:**
- TTL-based staleness checks (1min dev, 10min test, 1hr prod)
- `/api/schoology/assignments` endpoint
- `/api/schoology/announcements` endpoint
- Manual refresh button on dashboard

---

## Development Environment

### Native macOS Development
- All development happens natively on Mac (no containers)
- Local development with ngrok for Schoology OAuth callbacks
- Chrome/Chromium for browser automation and AI-driven testing
- Firebase Emulators for backend services
- Full GUI support enables Cursor Browser + Chrome DevTools MCP

---

## Key Achievements

1. **Real E2E Flow:** Parent → Select Child → View Courses
2. **Modern Data Architecture:** LLM-ready models with semantic fields, RAG optimization
3. **Offline Support:** Smart caching with Firestore fallbacks
4. **Mock Data Pipeline:** CSV bulk import to Schoology sandbox
5. **Static Dev Domain:** modernteaching.ngrok.dev (no manual URL updates)

---

## Critical Rules for AI Agents

### 🚫 DO NOT Touch Code Yet

**No code refactoring without explicit approval.**

Testing coverage must be complete first to prevent regressions.

### ✅ Current Work Focus

**Allowed:**
- Documentation updates
- Test creation
- Chrome installation
- Testing infrastructure

**Not Allowed:**
- Code refactoring
- Architectural changes
- Feature additions (unless explicitly requested)

---

## Tech Stack

- **Frontend:** Next.js 14, React, TypeScript, Tailwind CSS
- **Backend:** Firebase Functions, Next.js API Routes
- **Database:** Firestore
- **Auth:** Schoology OAuth 1.0a
- **Testing:** Chrome DevTools MCP, Jest, Playwright
- **Deploy:** Firebase Hosting + Functions

---

## Session Continuity

**Starting a new chat?** Read these docs first:

**CRITICAL (Read Every Session):**
1. `.cursor/rules/core.md` (this file) - Current status & rules
2. `.cursor/rules/workflow.md` - Dev environment & testing
3. `../docs/CURRENT-TASKS.md` ⭐⭐ - **WHAT TO DO NOW** (atomic action items)
4. `../docs/roadmaps/MVP-PLAN.md` ⭐ - What we're building (12-week plan)
5. `../docs/roadmaps/PRODUCT-DECISIONS.md` ⭐ - Why we chose this approach
6. `../docs/QUICK-START.md` ⭐ - One-page dev reference

**Current State (What's Built):**
- `../docs/current/ARCHITECTURE.md` - System design, data flow
- `../docs/current/USER-JOURNEYS.md` - Implemented features

**Developer Guides (How-To):**
- `../docs/guides/STARTUP.md` - Starting services
- `../docs/guides/TESTING-QUICK-START.md` - Running tests
- `../docs/guides/STATE-MANAGEMENT.md` ⭐ - Zustand + SWR
- `../docs/guides/I18N-STRATEGY.md` ⭐ - next-intl for UI
- `../docs/guides/THIRD-PARTY-INTEGRATIONS.md` ⭐ - ClassLink, Infinite Campus
- `../docs/guides/SEED-DATA-REFERENCE.md` ⭐ - Test personas

**Design & UI:**
- `../docs/design/FIGMA-PROMPTS.md` ⭐ - AI mockup prompts
- `../docs/design/SCREEN-SPECS.md` ⭐ - All screen requirements

⭐ = Updated Oct 2025 - Essential reading  
⭐⭐ = **START HERE** - Immediate action items

## 🎯 Current Priority

**Check:** `docs/CURRENT-TASKS.md` for today's priorities

**Testing-First Development:**
1. Fix any regressions (test first!)
2. Add test coverage for existing features
3. ONLY THEN consider new features or refactoring

**DO NOT proceed to code refactoring without explicit approval.**

---

## 🔗 External Documentation & APIs

**Critical:** Before implementing features or troubleshooting issues related to Schoology, YOU MUST consult these resources first. Do not rely solely on the existing codebase, as it may be incomplete.

1.  **Developer API Documentation (Source of Truth for Data)**
    -   **URL:** `https://developers.schoology.com/api-documentation/rest-api-v1/`
    -   **Use For:** Understanding API endpoints, data structures, authentication, and available parameters. This is the primary reference for any backend or data-fetching task.

2.  **User-Facing Help Center (Source of Truth for Features)**
    -   **URL:** `https://uc.powerschool-docs.com/en/schoology/latest/`
    -   **Use For:** Understanding how features *should* work from a user's perspective. This provides essential context for UI/UX design and feature implementation.

---

## 📂 Quick Navigation

- **TODOs:** `docs/CURRENT-TASKS.md` ⭐⭐ **START HERE**
