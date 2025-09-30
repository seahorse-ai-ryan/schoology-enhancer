# Revised Documentation & Testing Action Plan

**Updated:** September 30, 2025  
**Status:** 🚀 Ready to Execute  
**Approved by:** Ryan (User)

---

## Key Decisions from User Feedback

### 1. ✅ Chrome in Container - **HIGH PRIORITY**

- **Decision:** Install Chrome in container for Cursor Browser + Chrome DevTools MCP
- **Why:** Critical for AI agent-driven development speed and E2E capabilities
- **MCP Context:** [Chrome DevTools MCP](https://github.com/ChromeDevTools/chrome-devtools-mcp/?tab=readme-ov-file#chrome-devtools-mcp) enables AI agents to control browser
- **Impact:** Game-changer for automated testing and development workflow
- **Priority:** Phase 1B (right after doc cleanup)

### 2. ✅ Firebase Studio Support - **KEEP**

- **Decision:** Retain Firebase Studio capability
- **Why:** Future deployment to Firebase Hosting for modernteaching.com
- **Action:** Keep `.idx/airules.md` updated, link to `.cursor/rules/`
- **Note:** Primary dev in Cursor/Mac, Firebase Studio for cloud deployment work

### 3. ❌ Demo Mode - **DEPRECATED**

- **Decision:** Remove demo mode
- **Why:** Mock data now in real Schoology backend for testing
- **Action:** Archive `demo-session.spec.ts` and related code
- **Future:** Landing page with promotional content (text, images, videos)

### 4. 🔄 Testing Strategy - **Browser-First**

- **Decision:** Prioritize Chrome DevTools MCP > Playwright > Jest
- **Jest:** Unit tests, backend API, server logic only
- **Playwright:** Reduce to cases where browser automation isn't suitable
- **Chrome MCP:** Primary E2E testing method (AI agent-driven)
- **Rationale:** Vibe coding requires interactive browser testing

### 5. 📋 Sequencing - **Revised**

```
Phase 1A: Doc Cleanup (Low-hanging fruit) ← START HERE
    ↓
Phase 1B: Install Chrome in Container
    ↓
Phase 2: Testing Infrastructure (Chrome MCP + targeted Jest/Playwright)
    ↓
Phase 3: Fill Testing Gaps (Browser-first approach)
    ↓
[PAUSE - NO CODE REFACTOR UNTIL APPROVED]
    ↓
Phase 4: Final Doc Updates (based on testing learnings)
    ↓
[ONLY AFTER APPROVAL]
Phase 5: Safe Code Refactoring
```

---

## Revised Execution Plan

### Phase 1A: Immediate Documentation Cleanup (TODAY - 2 hours)

**Objective:** Remove confusion, legacy content, and redundancy

#### Step 1: Archive Legacy Files (15 min)

```bash
mkdir -p docs/archive
git mv docs/LOG.md docs/archive/
git mv docs/mistakes-and-learnings.md docs/archive/
git mv docs/architecture-plan.md docs/archive/
git mv docs/mock-sandbox-plan.md docs/archive/
git commit -m "docs: archive legacy documentation files"
```

#### Step 2: Delete/Deprecate Demo Mode References (15 min)

```bash
# Move demo test to archive
git mv src/test/demo-session.spec.ts docs/archive/
git mv src/test/demo-flow.spec.tsx docs/archive/

# Create deprecation note
cat > docs/archive/DEMO-MODE-DEPRECATED.md << 'EOF'
# Demo Mode - DEPRECATED

**Date Deprecated:** September 30, 2025
**Reason:** Mock data now seeded directly into Schoology developer sandbox

## What Was Demo Mode?
Previously allowed users to explore app without Schoology credentials.

## Why Deprecated?
- We now have mock users (Carter, Tazio, Livio Mock) in Schoology
- Real authentication flow works with test data
- Reduces code complexity
- More realistic testing

## Future Alternative
Landing page will have promotional content (screenshots, videos, feature descriptions)
for users without Schoology accounts.
EOF

git add docs/archive/DEMO-MODE-DEPRECATED.md
git commit -m "docs: deprecate demo mode, use Schoology mock data instead"
```

#### Step 3: Update README.md (30 min)

**New accurate README:**

````markdown
# Modern Teaching

Next.js application enhancing Schoology with modern UI, offline support, and AI-ready data architecture.

## Status

✅ **Hello World Milestone Achieved** (Sept 30, 2025)

- OAuth 1.0a authentication with Schoology
- Parent-child account switching
- Live course data from Schoology API
- Firestore caching for offline access

## Features

### Current (v0.1)

- **Authentication:** Schoology OAuth 1.0a
- **Parent Accounts:** Select and switch between children
- **Course Display:** Real-time data from Schoology API
- **Offline Support:** Firestore caching with fallback
- **Mock Data:** Seeded test accounts for development

### Next (v0.2 - Planned)

- TTL-based cache staleness checks
- Assignments and grades display
- Announcements and deadlines
- Manual data refresh

## Tech Stack

- **Frontend:** Next.js 14 (App Router), React, TypeScript, Tailwind CSS
- **Backend:** Firebase Functions (Node.js)
- **Database:** Firestore
- **Authentication:** Schoology OAuth 1.0a
- **Development:** ngrok static domain, Firebase Emulators
- **Testing:** Chrome DevTools MCP, Jest, Playwright

## Quick Start

### Prerequisites

- Node.js 20+
- Firebase CLI
- ngrok (paid account for static domain)
- Schoology Developer Account

### Setup

1. **Clone and install:**

```bash
git clone https://github.com/seahorse-ai-ryan/schoology-enhancer.git
cd schoology-enhancer
npm install
```
````

2. **Configure environment:**

```bash
cp .env.local.example .env.local
# Edit .env.local with your credentials:
# - SCHOOLOGY_CONSUMER_KEY/SECRET (OAuth)
# - SCHOOLOGY_ADMIN_KEY/SECRET (Admin API)
# - SCHOOLOGY_CALLBACK_URL (ngrok domain)
```

3. **Start development services:**

```bash
# Terminal 1: ngrok
ngrok http --url=modernteaching.ngrok.dev 9000 --log stdout

# Terminal 2: Firebase Emulators
firebase emulators:start

# Terminal 3: Next.js Dev Server
npm run dev
```

4. **Access:**

- App: https://modernteaching.ngrok.dev
- Firestore UI: http://localhost:4000
- Ngrok Dashboard: http://localhost:4040

## Development Workflow

See detailed guides:

- **[ARCHITECTURE.md](docs/ARCHITECTURE.md)** - Complete system architecture
- **[STARTUP.md](docs/STARTUP.md)** - Development environment setup
- **[TESTING.md](docs/TESTING.md)** - Testing strategy (coming soon)

## Testing

### Backend Tests (Jest)

```bash
npm run test:emu
```

### Browser-Based Testing (Chrome DevTools MCP)

Primary testing method using AI-driven browser automation.
See [TESTING.md](docs/TESTING.md) for details.

### E2E Tests (Playwright)

```bash
npm run test:simple
```

## Deployment

**Target:** Firebase Hosting + Functions  
**Domain:** modernteaching.com (planned)  
**Current:** Development only (ngrok)

## Documentation

- [ARCHITECTURE.md](docs/ARCHITECTURE.md) - Data flow, caching, auth
- [STARTUP.md](docs/STARTUP.md) - Dev environment
- [SCHOOLOGY-CSV-IMPORT.md](docs/SCHOOLOGY-CSV-IMPORT.md) - Bulk import
- [SCHOOLOGY-SEED-DATA-GUIDE.md](docs/SCHOOLOGY-SEED-DATA-GUIDE.md) - Mock data

## Project Structure

```
src/
├── app/              # Next.js app router
│   ├── api/          # API routes
│   ├── (authenticated)/ # Protected pages
│   └── layout.tsx    # Root layout
├── components/       # React components
├── lib/              # Shared utilities
├── functions/        # Firebase Functions
└── test/             # Jest tests

tests/
└── e2e/              # Playwright E2E tests

seed/
└── sandbox/          # Mock student data (JSON)
```

## License

MIT

---

**Built for modern educational technology**

````

#### Step 4: Create Minimal .cursor/rules/ Structure (30 min)

**Create directory:**
```bash
mkdir -p .cursor/rules
````

**`.cursor/rules/core.md`:**

```markdown
# Modern Teaching - Core Context

**Project Name:** Modern Teaching (formerly Schoology Enhancer)
**Repository:** https://github.com/seahorse-ai-ryan/schoology-enhancer
**Deployment:** Firebase Hosting (modernteaching.com - planned)

## Current Status (Sept 30, 2025)

✅ **Hello World Milestone Achieved**

**What Works:**

- OAuth 1.0a authentication with Schoology
- Parent can select child from profile menu
- Dashboard displays live courses from Schoology API
- Data cached to Firestore for offline access
- Mock student accounts (Carter, Tazio, Livio Mock) for testing

**What's Next (v0.2):**

- TTL-based staleness checks (1min dev, 10min test, 1hr prod)
- Assignments and announcements endpoints
- Manual data refresh button

## Key Achievements

1. **Real E2E Flow:** Parent logs in → selects child → sees real Schoology courses
2. **Modern Data Architecture:** LLM-ready models with semantic fields
3. **Offline Support:** Firestore caching with smart fallbacks
4. **Mock Data Pipeline:** CSV bulk import to Schoology sandbox
5. **Static Dev Domain:** modernteaching.ngrok.dev (no manual updates)

## Development Environments

### Primary: Cursor on Mac (Local Development)

- Use for day-to-day coding
- Chrome DevTools MCP for browser testing
- ngrok + Firebase Emulators + Next.js

### Secondary: Firebase Studio (Cloud Deployment)

- Use for Firebase-specific work
- Deploy to production
- Manage cloud resources

## Next Priority

**DO NOT REFACTOR CODE** until testing coverage is complete.

**Current Focus:**

1. Install Chrome in container for Cursor Browser
2. Implement browser-first testing with Chrome DevTools MCP
3. Fill testing gaps for Hello World features
4. Then (and only then) consider code refactoring
```

**`.cursor/rules/workflow.md`:**

````markdown
# Development Workflow

## Startup Sequence

### Persistent Named Terminals

Start services in this order without `cd` prefixes:

```bash
# Terminal 1: "Cursor (ngrok http)"
ngrok http --url=modernteaching.ngrok.dev 9000 --log stdout

# Terminal 2: "Cursor (firebase emulators:start)"
firebase emulators:start

# Terminal 3: "Cursor (npm run)"
npm run dev
```
````

**Critical:** Don't use `cd /workspaces/...` prefix - it ruins terminal names!

## Testing Strategy

### Browser-First Approach

**1. Chrome DevTools MCP (Primary)**

- AI agent controls browser directly
- Best for E2E user journeys
- Interactive debugging
- See: https://github.com/ChromeDevTools/chrome-devtools-mcp/

**2. Jest (Backend Only)**

- Unit tests for data transformations
- API route logic
- Firebase integration
- Command: `npm run test:emu`

**3. Playwright (Minimal Use)**

- Only when browser automation isn't suitable
- Command: `npm run test:simple`

## Common Commands

```bash
# Development
npm run dev          # Next.js dev server (port 9000)
npm run build        # Build Firebase Functions
npm run typecheck    # TypeScript checking
npm run lint         # ESLint

# Testing
npm run test:emu     # Jest backend tests
npm run test:simple  # Playwright (use sparingly)

# Deployment
firebase deploy      # Deploy to production
```

## Common Issues

### Services Won't Start

- Check for zombie processes
- Delete terminals and restart fresh
- Ensure ports are free (9000, 5001, 8080, 4000)

### OAuth Callback Fails

- Verify ngrok URL in `.env.local` matches `SCHOOLOGY_CALLBACK_URL`
- Check Schoology Developer App domain matches ngrok root

### Tests Failing

- Ensure Firebase Emulators are running
- Check Firestore has mock data seeded
- Verify admin role granted to test user

## Links

- Dev App: https://modernteaching.ngrok.dev
- Firestore UI: http://localhost:4000
- Ngrok Dashboard: http://localhost:4040

````

**`.cursorrules` (Minimal Delegator):**
```markdown
# Cursor AI Rules for Modern Teaching

This project uses modular rules for better organization.

## Read All Rule Files

1. `.cursor/rules/core.md` - Project status, milestones, priorities
2. `.cursor/rules/workflow.md` - Dev environment, testing, commands
3. `docs/ARCHITECTURE.md` - Technical architecture (data flow, caching, API)
4. `docs/STARTUP.md` - Detailed environment setup

## Critical Rules

**DO NOT refactor code without explicit approval.**
Testing coverage must be complete first.

**Testing Strategy:**
- Primary: Chrome DevTools MCP (browser-first)
- Secondary: Jest (backend/unit tests only)
- Minimal: Playwright (when browser automation isn't suitable)

**Development:**
- Primary environment: Cursor on Mac
- Secondary: Firebase Studio (cloud deployment only)
- Keep both .idx/airules.md and .cursor/rules/ updated

## Context Priority

When in doubt, prioritize:
1. `.cursor/rules/core.md` for current status
2. `docs/ARCHITECTURE.md` for technical details
3. User's explicit instructions
````

**Update .idx/airules.md:**

````markdown
# Firebase Studio Rules (Cloud Deployment Only)

**Note:** Primary development happens in Cursor on Mac. Use Firebase Studio for cloud-specific work.

## Context

Modern Teaching is a Next.js app deployed to Firebase Hosting.

- **Primary Dev:** Cursor on Mac with ngrok + local emulators
- **Firebase Studio:** Cloud deployment, Firebase console work, production debugging
- **Domain:** modernteaching.com (planned)

## Firebase Studio Specifics

### Two Servers Model

1. **Firebase Emulators:** Auto-start in background
2. **Next.js Dev Server:** Manual start via "Preview" button

### Commands

- **Hard Restart:** Command Palette → "Firebase Studio: Hard Restart"
- **Testing:** Use Cursor's Chrome DevTools MCP when possible

## Shared Rules

See `.cursor/rules/` for complete project context:

- `core.md` - Project status and priorities
- `workflow.md` - Development workflow
- `docs/ARCHITECTURE.md` - Technical architecture

## Deployment

```bash
firebase deploy              # Deploy all
firebase deploy --only hosting
firebase deploy --only functions
```
````

**Target Project:** modernteaching (production)
**Current Project:** demo-project (local emulators)

````

#### Step 5: Update product-requirements.md (15 min)

**Quick update to reflect post-Hello World state:**

Add at the top:
```markdown
# Product Requirements (POST-Hello World)

**Last Updated:** September 30, 2025
**Current Status:** ✅ Hello World milestone complete

## Completed (v0.1)

✅ **Phase 0: Hello World**
- Schoology OAuth 1.0a authentication
- Parent-child account associations
- Live course data fetching
- Firestore caching
- Mock data seeding

## Current Phase (v0.2): Smart Caching & Core Features

[Rest of existing content...]
````

#### Step 6: Quick Reference Audit (15 min)

**Decision: Merge useful parts into ARCHITECTURE.md, delete quick-reference.md**

Extract any unique content from quick-reference.md that isn't in ARCHITECTURE.md, then delete it.

### Phase 1B: Install Chrome in Container (TODAY - 1-2 hours)

**Objective:** Enable Cursor Browser + Chrome DevTools MCP

#### Step 1: Investigate Container (15 min)

```bash
# Check container type
cat /etc/os-release

# Check package manager
which apt-get && echo "Debian/Ubuntu" || which yum && echo "RHEL/CentOS" || which apk && echo "Alpine"

# Check write permissions
touch /tmp/test && rm /tmp/test && echo "Writable" || echo "Read-only"

# Check disk space
df -h
```

#### Step 2: Install Chrome (30-45 min)

**For Debian/Ubuntu containers:**

```bash
# Update package list
sudo apt-get update

# Install dependencies
sudo apt-get install -y wget gnupg2

# Add Google Chrome repository
wget -q -O - https://dl.google.com/linux/linux_signing_key.pub | sudo apt-key add -
echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" | sudo tee /etc/apt/sources.list.d/google-chrome.list

# Install Chrome
sudo apt-get update
sudo apt-get install -y google-chrome-stable

# Verify
google-chrome --version
```

**For Alpine containers:**

```bash
apk add --no-cache chromium
chromium-browser --version
```

#### Step 3: Configure Chrome DevTools MCP (15 min)

Add to Cursor's MCP settings:

```json
{
  "mcpServers": {
    "chrome-devtools": {
      "command": "npx",
      "args": ["-y", "chrome-devtools-mcp@latest"]
    }
  }
}
```

#### Step 4: Test Installation (15 min)

1. Restart Cursor
2. Try Cursor Browser feature
3. Try Chrome DevTools MCP
4. Document any issues

### Phase 2: Testing Infrastructure (Days 2-3)

**Focus:** Set up Chrome MCP-first testing, minimal Jest/Playwright

[Details to be refined after Phase 1 complete]

### Phase 3: Fill Testing Gaps (Days 3-5)

**Focus:** Browser-driven tests for Hello World features

[Details to be refined after Phase 2 complete]

---

## Immediate Next Steps (RIGHT NOW)

**Phase 1A Execution Order:**

1. ✅ Create this revised plan
2. ⏳ Execute Step 1: Archive legacy files
3. ⏳ Execute Step 2: Deprecate demo mode
4. ⏳ Execute Step 3: Update README.md
5. ⏳ Execute Step 4: Create `.cursor/rules/` structure
6. ⏳ Execute Step 5: Update product-requirements.md
7. ⏳ Execute Step 6: Merge quick-reference.md, delete
8. ⏳ Git commit all changes
9. ⏳ Move to Phase 1B: Install Chrome

**Estimated Time:** 2 hours for Phase 1A

**Your Approval Needed:**

- ✅ Start Phase 1A now? (Step 1-8 above)
- ⏳ Then immediately proceed to Phase 1B (Chrome install)?

Ready to execute when you give the word! 🚀
