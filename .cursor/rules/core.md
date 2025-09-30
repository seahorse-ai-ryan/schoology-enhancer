# Modern Teaching - Core Context

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

**Starting a new chat?** Read this file + `docs/CURRENT-STATUS.md` to resume work.

**Key Docs:**
- `.cursor/rules/core.md` (this file) - Current status
- `.cursor/rules/workflow.md` - Dev environment
- `docs/ARCHITECTURE.md` - Technical details
- `docs/CURRENT-STATUS.md` - Active TODOs and context
- `docs/USER-JOURNEYS.md` - Implemented features
