# Documentation Hub

**Last Updated:** October 5, 2025

---

## 💡 The Vision

**"A fast, modern interface to ALL your Schoology data with an AI you can talk to."**

---

## 🎯 Start Here (Critical Docs)

**For Immediate Tasks:**
- 📍 **Current Tasks:** `CURRENT-TASKS.md` ⭐⭐ - **WHAT TO DO NOW** (atomic action items)

**For Product Understanding:**
- 🗺️ **MVP Plan:** `roadmaps/MVP-PLAN.md` - Complete 12-week roadmap
- ✅ **Product Decisions:** `roadmaps/PRODUCT-DECISIONS.md` - Why we chose this approach

**For Development:**
- 🚀 **Workflow:** `.cursor/rules/workflow.md` - **START HERE** (Startup, testing, and workflow)
- 🏗️ **Architecture:** `current/ARCHITECTURE.md` - Data flow, caching, auth
- 📍 **What's Built:** `current/USER-JOURNEYS.md` - Implemented features
- 🧪 **Testing:** `guides/TESTING-QUICK-START.md` - How to run tests

---

## ❓ Common Questions

**Q: What should I work on NOW?**  
→ `.cursor/rules/core.md` (Check the "Current Priority" section)

**Q: What's in MVP vs post-MVP?**  
→ `roadmaps/MVP-PLAN.md` (Section: "MVP Scope")

**Q: Why did we decide to use [X]?**  
→ `roadmaps/PRODUCT-DECISIONS.md`

**Q: How do I start the development environment?**  
→ `.cursor/rules/workflow.md`

**Q: What tests do we have?**  
→ `guides/TESTING-QUICK-START.md` + `guides/TEST-COVERAGE-PLAN.md`

**Q: What data should I use for testing?**  
→ `guides/SEED-DATA-REFERENCE.md` (2 parents, 4 students, courses, assignments)

**Q: How should I implement state management?**  
→ `guides/STATE-MANAGEMENT.md`

**Q: What about internationalization?**  
→ `guides/I18N-STRATEGY.md` (UI only for MVP)

---

## 🏗️ Tech Stack Quick Reference

**Frontend:** Next.js 15 + React 19 + TypeScript + Tailwind CSS + shadcn/ui  
**Backend:** Next.js API Routes + Firestore  
**State:** Zustand (global), SWR (server data)  
**Auth:** Schoology OAuth 1.0a  
**AI:** Gemini Nano (client) + Gemini Flash (cloud)  
**Testing:** Chrome DevTools MCP, Jest, Playwright  
**Deployment:** Firebase Hosting (planned: modernteaching.com)

---

## 💡 MVP Philosophy

**What We're Building:**
- Complete read-only view of ALL Schoology data
- AI chat (text + voice) makes it magical
- Simple, fast UX (no tutorials needed)
- Parents are priority #1, students #2

**Not In MVP:**
- User data entry/editing
- Sub-tasks, planning, calendar tools
- "What If" grade calculator
- Notifications or payment processing

**Stay Focused:** Build what users need NOW, not everything they might want LATER.

---

## 📚 Complete Documentation Index

### Strategic Planning (`roadmaps/`)

**Current Focus:**
- `roadmaps/MVP-PLAN.md` ⭐ - 12-week timeline to beta launch
- `roadmaps/PRODUCT-DECISIONS.md` ⭐ - Product Owner decisions

**Long-Term:**
- `roadmaps/STRATEGIC-ROADMAP.md`
- `roadmaps/TACTICAL-ROADMAP.md`
- `roadmaps/PRODUCT-REQUIREMENTS.md`
- `roadmaps/TECHNICAL-ARCHITECTURE-DECISIONS.md`

### Current State (What's Built Now)

**In `current/`:**
- `ARCHITECTURE.md` - System design, data flow, how it works TODAY
- `USER-JOURNEYS.md` - All implemented features
- `RELEASE-NOTES.md` - Changelog

### Developer Guides (How To Work With It)

**In `guides/`:**
- `TESTING.md` - Comprehensive testing strategy
- `TESTING-QUICK-START.md` - Quick test commands
- `STATE-MANAGEMENT.md` ⭐ - State management implementation
- `I18N-STRATEGY.md` ⭐ - Internationalization
- `THIRD-PARTY-INTEGRATIONS.md` ⭐ - ClassLink, Infinite Campus
- `TEST-COVERAGE-PLAN.md` - Coverage goals
- `SEED-DATA-REFERENCE.md` ⭐ - Test personas (2 parents, 4 students)
- `SCHOOLOGY-SEED-DATA-GUIDE.md` - Seeding Schoology sandbox
- `SCHOOLOGY-CSV-IMPORT.md` - CSV import procedures
- `API-USER-IMPERSONATION.md` - Guide to using API impersonation
- `BULK-ASSIGNMENT-IMPORT.md` - Guide for bulk data imports

### Future Planning (Not Yet Built)

**In `future/`:**
- `OPERATIONAL-READINESS-PLAN.md` - Production deployment prep
- `PERF-OPTIMIZATION-PLAN.md` - Performance improvements
- `SECURITY-PLAN.md` - Threat model & security
- `IDENTITY-ACCESS-DESIGN.md` - Auth philosophy
- `PRICING-STRATEGY.md` ⭐ - Monetization research
- `MARKETING-COLLATERAL-PLAN.md` - Go-to-market strategy
- `EXTENSIBILITY-AUTOMATIONS.md` - Future automation
- `MOBILE-NATIVE-OPPORTUNITIES.md` - Native app potential
- `UX-EXPERIMENTATION-PLAN.md` - A/B testing plans

### Design & UI

**In `design/`:**
- `FIGMA-PROMPTS.md` ⭐ - AI prompts for Figma/Gemini
- `SCREEN-SPECS.md` ⭐ - 12 screen specifications
- `UI-DESIGN-SYSTEM.md` - Design system overview

**Meta:**
- `DOCUMENTATION-GUIDE.md` - How to maintain these docs

---
## 🔍 Quick Reference

**Need to find:**
- What should I work on NOW? → `CURRENT-TASKS.md` ⭐⭐
- What's built today? → `current/USER-JOURNEYS.md`
- How does it work? → `current/ARCHITECTURE.md`
- MVP scope? → `roadmaps/MVP-PLAN.md`
- Why we decided X? → `roadmaps/PRODUCT-DECISIONS.md`
- How to start services? → `.cursor/rules/workflow.md`
- How to implement state? → `guides/STATE-MANAGEMENT.md`
- UI mockup content? → `design/SCREEN-SPECS.md`
- Test personas? → `guides/SEED-DATA-REFERENCE.md`
- ClassLink integration? → `guides/THIRD-PARTY-INTEGRATIONS.md`
- Security strategy? → `future/SECURITY-PLAN.md`
- Pricing research? → `future/PRICING-STRATEGY.md`

---

**⭐ = Recently updated (Oct 2025) - Start here for current plans**

