# Modern Teaching

Next.js application enhancing Schoology with modern UI, offline support, and AI-ready data architecture.

## Status

✅ **Hello World Milestone Achieved** (September 30, 2025)

**What Works:**
- OAuth 1.0a authentication with Schoology
- Parent-child account switching
- Live course data from Schoology API
- Firestore caching for offline access
- Mock student data for development/testing

**Current:** v0.1 - Hello World  
**Next:** v0.2 - Smart Caching & Assignments

## Features

### Current (v0.1)

- **Authentication:** Schoology OAuth 1.0a with secure token storage
- **Parent Accounts:** Select and switch between multiple children
- **Course Display:** Real-time data fetched from Schoology API
- **Offline Support:** Firestore caching with automatic fallback
- **Mock Data:** Seeded test accounts (Carter, Tazio, Livio Mock) in Schoology sandbox
- **Admin Tools:** CSV generation for bulk import, grading period management

### Planned (v0.2)

- TTL-based cache staleness checks (1min/10min/1hr)
- Assignments and grades display
- Announcements and deadlines
- Manual data refresh button
- Background cache updates

## Tech Stack

- **Frontend:** Next.js 14 (App Router), React, TypeScript, Tailwind CSS
- **Backend:** Firebase Functions (Node.js), Next.js API Routes
- **Database:** Firestore (caching & user data)
- **Authentication:** Schoology OAuth 1.0a
- **External API:** Schoology REST API v1
- **Development:** ngrok (static domain), Firebase Emulators
- **Testing:** Chrome DevTools MCP, Jest, Playwright
- **Deployment:** Firebase Hosting + Functions (planned: modernteaching.com)

## Quick Start

### Prerequisites

**Required:**
- **Node.js 20+** installed
- **Java 17+** for Firebase Emulators (`brew install openjdk@17` on Mac)
- **Firebase CLI** (`npm install -g firebase-tools`)
- **Schoology Developer Account** - [Register here](https://developers.schoology.com)
  - Create a new app in the Developer Portal
  - Note your Consumer Key and Secret (for OAuth)
  - Get your Admin API credentials from Schoology Settings → Integration
- **ngrok Account** - [Sign up](https://dashboard.ngrok.com/signup)
  - Free account: Ephemeral URLs (changes each restart)
  - Paid account: Static domain (recommended for development)
  - Get your auth token from [dashboard](https://dashboard.ngrok.com/get-started/your-authtoken)

### Installation

```bash
# Clone repository
git clone https://github.com/seahorse-ai-ryan/schoology-enhancer.git
cd schoology-enhancer

# Install dependencies
npm install

# Build Firebase Functions
npm run build
```

### Configuration

**1. Set up Schoology Developer App:**

Visit [Schoology Developer Portal](https://developers.schoology.com) and create a new app:
- **App Name:** Choose any name (e.g., "Modern Teaching Dev")
- **App Domain:** Your ngrok domain (e.g., `your-domain.ngrok.dev`)
  - ⚠️ **Important:** Use root domain only, NO paths (e.g., `/api/callback`)
  - ✅ Correct: `your-domain.ngrok.dev`
  - ❌ Wrong: `your-domain.ngrok.dev/api/callback`
- Copy your **Consumer Key** and **Consumer Secret**

**2. Get Schoology Admin API Credentials:**

Go to Schoology → Settings → Integration → API Credentials:
- These are separate from OAuth credentials
- Used for seeding test data and admin operations

**3. Configure Environment Variables:**

```bash
# Copy template
cp .env.local.example .env.local

# Edit .env.local with your actual values:
nano .env.local

# Required variables:
# - SCHOOLOGY_CONSUMER_KEY       (from Developer Portal)
# - SCHOOLOGY_CONSUMER_SECRET    (from Developer Portal)
# - SCHOOLOGY_ADMIN_KEY          (from Schoology Settings)
# - SCHOOLOGY_ADMIN_SECRET       (from Schoology Settings)
# - NGROK_AUTH_TOKEN             (from ngrok dashboard)
# - NEXT_PUBLIC_APP_URL          (your ngrok URL)
# - SCHOOLOGY_CALLBACK_URL       (your ngrok URL + /api/callback)
```

See `.env.local.example` for complete documentation of all variables.

### Start Development

Run these commands in **separate terminals**:

```bash
# Terminal 1: ngrok tunnel
# Replace YOUR_DOMAIN with your ngrok static domain or use without --url for ephemeral URL
ngrok http --url=YOUR_DOMAIN.ngrok.dev 9000 --log stdout

# Terminal 2: Firebase Emulators (requires Java 17+)
export PATH="/opt/homebrew/opt/openjdk@17/bin:$PATH"  # Mac only
firebase emulators:start

# Terminal 3: Next.js Dev Server
npm run dev
```

**Notes:**
- If using ngrok free account, omit `--url` flag to get ephemeral URL
- Update `NEXT_PUBLIC_APP_URL` and `SCHOOLOGY_CALLBACK_URL` in `.env.local` to match your ngrok URL
- Don't prefix commands with `cd` if using Cursor IDE (breaks terminal naming)

### Access

- **App:** Your ngrok URL (e.g., `https://your-domain.ngrok.dev`)
- **Firebase Emulator UI:** http://localhost:4000
- **Ngrok Web Interface:** http://localhost:4040 (shows tunnel info)
- **Next.js (local):** http://localhost:9000

## Development

See comprehensive guides in `/docs`:

- **[ARCHITECTURE.md](docs/ARCHITECTURE.md)** - Data flow, caching strategy, auth flow, API endpoints
- **[STARTUP.md](docs/STARTUP.md)** - Detailed environment setup and troubleshooting
- **[USER-JOURNEYS.md](docs/USER-JOURNEYS.md)** - All implemented features and user flows
- **[CURRENT-STATUS.md](docs/CURRENT-STATUS.md)** - Active development status and TODOs

## Testing

### Browser-Based Testing (Primary)

Uses Chrome DevTools MCP for AI-driven browser automation:

```bash
# Chrome DevTools MCP enables AI agent to control browser
# See: https://github.com/ChromeDevTools/chrome-devtools-mcp/
```

### Backend Tests (Jest)

Unit tests for data transformations, API logic, Firebase integration:

```bash
npm run test:emu
```

### E2E Tests (Playwright)

Minimal use for cases where browser automation isn't suitable:

```bash
npm run test:simple
```

## Project Structure

```
src/
├── app/                      # Next.js app router
│   ├── api/                  # API routes
│   │   ├── schoology/        # Schoology API endpoints
│   │   ├── parent/           # Parent-child functionality
│   │   └── admin/            # Admin tools
│   ├── (authenticated)/      # Protected pages
│   └── layout.tsx            # Root layout
├── components/               # React components
│   ├── dashboard/            # Dashboard components
│   ├── layout/               # Layout components (nav, etc.)
│   └── ui/                   # Shadcn/ui components
├── lib/                      # Shared utilities
│   └── schoology-data.ts     # Data models and service
├── functions/                # Firebase Functions
│   └── schoology-auth.logic.ts  # OAuth logic
└── test/                     # Jest backend tests

tests/
└── e2e/                      # Playwright E2E tests

seed/
└── sandbox/                  # Mock student data (JSON)
```

## Data Architecture

**LLM-Ready Data Models:**
- Rich metadata (difficulty, objectives, credits)
- Embedding fields for semantic search
- AI-generated summaries
- RAG-optimized relationships
- Protocol buffer compatible

**See [ARCHITECTURE.md](docs/ARCHITECTURE.md) for complete details.**

## Deployment

**Target:** Firebase Hosting + Functions  
**Domain:** modernteaching.com (planned)  
**Current:** Local development only (ngrok)

```bash
# When ready for deployment
firebase deploy
```

## Documentation

**Core Docs:**
- [ARCHITECTURE.md](docs/ARCHITECTURE.md) - System architecture
- [STARTUP.md](docs/STARTUP.md) - Environment setup
- [USER-JOURNEYS.md](docs/USER-JOURNEYS.md) - Feature documentation
- [CURRENT-STATUS.md](docs/CURRENT-STATUS.md) - Development status

**Reference:**
- [SCHOOLOGY-CSV-IMPORT.md](docs/SCHOOLOGY-CSV-IMPORT.md) - Bulk import guide
- [SCHOOLOGY-SEED-DATA-GUIDE.md](docs/SCHOOLOGY-SEED-DATA-GUIDE.md) - Mock data best practices
- [DEMO-MODE-DEPRECATED.md](docs/DEMO-MODE-DEPRECATED.md) - Why demo mode was removed

## Common Commands

```bash
# Development
npm run dev          # Next.js dev server (port 9000)
npm run build        # Build Firebase Functions
npm run typecheck    # TypeScript type checking
npm run lint         # ESLint code quality

# Testing
npm run test:emu     # Jest backend tests
npm run test:simple  # Playwright E2E (minimal use)

# Deployment
firebase deploy      # Deploy to production
```

## Common Issues

### Services Won't Start
- Check for zombie processes in terminals
- Ensure ports are free: 9000, 5001, 8080, 4000
- Delete terminals and restart fresh

### OAuth Callback Fails
- Verify `SCHOOLOGY_CALLBACK_URL` in `.env.local` matches ngrok URL
- Check Schoology Developer App domain matches ngrok root domain
- See [STARTUP.md](docs/STARTUP.md) for detailed troubleshooting

### Tests Failing
- Ensure Firebase Emulators are running
- Check Firestore has mock data seeded
- Verify admin role granted to test user

## License

MIT

---

**Modern Teaching** - Enhancing education through modern technology