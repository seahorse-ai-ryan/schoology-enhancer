# Modern Teaching

Next.js application enhancing Schoology with modern UI, offline support, and AI-ready data architecture.

## Status

✅ **"Hello World" Milestone Achieved** (September 30, 2025)

**What Works:**
- OAuth 1.0a authentication with Schoology
- Parent-child account switching
- Live course data from Schoology API
- Firestore caching for offline access
- Mock student data for development/testing

**Current:** v0.1 - Hello World  
**Next:** v0.2 - Smart Caching & Assignments

## Tech Stack

- **Frontend:** Next.js 14 (App Router), React, TypeScript, Tailwind CSS
- **Backend:** Next.js API Routes
- **Database:** Firestore (caching & user data)
- **Authentication:** Schoology OAuth 1.0a
- **External API:** Schoology REST API v1
- **Development:** ngrok (static domain), Firebase Emulators
- **Testing:** Chrome DevTools MCP, Jest, Playwright
- **Deployment:** Firebase Hosting (planned: modernteaching.com)

## Quick Start

For a complete guide on setting up the development environment and running the application, please refer to the official workflow documentation:

- **`.cursor/rules/workflow.md`**

This file contains the automated startup sequence, manual steps, and troubleshooting information.

## Documentation

Comprehensive project documentation is located in the `/docs` directory. Here are the most important entry points:

- **`docs/README.md`**: A quick navigation guide to the most essential documents.
- **`docs/INDEX.md`**: A complete index of all documentation.
- **`docs/current/ARCHITECTURE.md`**: An overview of the system architecture, data flow, and caching strategy.

## Project Structure

```
src/
├── app/                  # Next.js app router
│   ├── api/              # API routes
│   └── (authenticated)/  # Protected pages
├── components/           # React components
├── lib/                  # Shared utilities and data services
└── test/                 # Jest backend tests

seed/
└── sandbox/              # Mock student data (JSON)
```

## License

MIT
