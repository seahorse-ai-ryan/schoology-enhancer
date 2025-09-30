# Firebase Studio Rules (Cloud Deployment Only)

**Note:** Primary development happens in Cursor on Mac. Use Firebase Studio for cloud-specific work only.

---

## When to Use Firebase Studio

- Deploying to Firebase Hosting (modernteaching.com)
- Managing Firebase cloud resources
- Production debugging and monitoring
- Firebase-specific configuration

**For daily development:** Use Cursor on Mac with ngrok + local emulators.

---

## Firebase Studio Specifics

### Two Servers Model

1. **Backend (Automatic):** Firebase Emulators auto-start in background
2. **Frontend (Manual):** Next.js dev server via "Preview" button

### Commands

- **Hard Restart:** Command Palette → "Firebase Studio: Hard Restart"
- **Rebuild Environment:** Needed after `.idx/dev.nix` changes

### Testing in Firebase Studio

- Prefer Chrome DevTools MCP when available
- Use local emulators for backend testing
- Manual testing URL: Hosting Emulator (port 5000)

---

## Shared Context

**All project rules and context are in Cursor-compatible files:**

1. `.cursor/rules/core.md` - Project status, priorities, critical rules
2. `.cursor/rules/workflow.md` - Dev workflow, testing strategy
3. `docs/ARCHITECTURE.md` - Complete technical architecture
4. `docs/CURRENT-STATUS.md` - Active work and TODOs
5. `docs/USER-JOURNEYS.md` - Implemented features

**Read these files for complete context** - they work across both Cursor and Firebase Studio.

---

## Deployment

```bash
# Deploy to production
firebase deploy

# Deploy specific services
firebase deploy --only hosting
firebase deploy --only functions
```

**Firebase Projects:**
- `demo-project` - Local emulators (offline development)
- `modernteaching` - Production (future, when DNS configured)

---

## Critical: Do Not Refactor Code

Testing coverage must be complete before any code refactoring.

See `.cursor/rules/core.md` for current priorities and approved work.