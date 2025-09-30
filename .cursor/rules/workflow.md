# Development Workflow

**Environment:** Native macOS Development

## Startup Sequence

### Persistent Named Terminals

Start services in the project root directory (`/Users/ryanhickman/code/web-apps/schoology-enhancer`).

```bash
# Terminal 1: "Cursor (ngrok http)"
ngrok http --url=modernteaching.ngrok.dev 9000 --log stdout

# Terminal 2: "Cursor (firebase emulators:start)"
firebase emulators:start

# Terminal 3: "Cursor (npm run)"
npm run dev
```

**Best Practices:**
- ✅ Start from project root directory
- ✅ Use `is_background: true` in run_terminal_cmd tool calls
- ✅ Restart Next.js in-place (Ctrl+C then `npm run dev`)
- ❌ Don't create new terminals or use pkill during active development
- ✅ All services run natively on macOS (no containers)

**Static Domain:** `https://modernteaching.ngrok.dev` (eliminates manual URL updates)

---

## Testing Strategy

### Browser-First Approach

**Priority 1: Chrome DevTools MCP**
- AI agent controls Chrome directly via MCP
- Best for E2E user journeys
- Interactive debugging and verification
- Can inspect network, console, DOM
- Can take screenshots for verification
- See: https://github.com/ChromeDevTools/chrome-devtools-mcp/

**Priority 2: Jest (Backend/Unit Only)**
- Unit tests for data transformations
- API route logic testing
- Firebase integration tests
- Server-side utilities
- Command: `npm run test:emu`

**Priority 3: Playwright (Minimal Use)**
- Only when browser automation isn't suitable
- Headless testing for CI/CD (future)
- Command: `npm run test:simple`

**Rationale:** Vibe coding requires interactive browser testing. Chrome MCP enables AI agents to see what's happening, debug issues, and verify changes in real-time.

---

## Testing Workflow

### After Making Changes

1. **Save files** - Next.js auto-reloads
2. **Watch terminal** for "✓ Compiled" message
3. **Use Chrome DevTools MCP** to verify changes:
   - Navigate to page
   - Check console for errors
   - Verify network requests
   - Take screenshot if needed
4. **Report findings** with evidence

### Expected Console Behavior

**Normal 401 Errors (NOT bugs!):**
- `/api/auth/status` returns 401 when user not logged in
- Landing page and dashboard handle this gracefully
- These are intentional security checks, not failures

---

## Common Commands

```bash
# Development
npm run dev          # Next.js dev server (port 9000)
npm run build        # Build Firebase Functions
npm run typecheck    # TypeScript type checking
npm run lint         # ESLint code quality

# Testing
npm run test:emu     # Jest backend tests
npm run test:simple  # Playwright (use sparingly)

# Deployment
firebase deploy      # Deploy to production
```

---

## Common Issues & Solutions

### Services Won't Start

**Symptoms:**
- Port already in use
- Terminals at shell prompt immediately
- "EADDRINUSE" errors

**Solutions:**
1. Check for zombie processes
2. Delete terminals and restart fresh
3. Ensure ports free: 9000, 5001, 8080, 4000

### OAuth Callback Fails

**Error:** "Unable to authenticate, there was no valid return URL found"

**Solutions:**
1. Verify `SCHOOLOGY_CALLBACK_URL` in `.env.local`:
   ```
   SCHOOLOGY_CALLBACK_URL=https://modernteaching.ngrok.dev/api/callback
   ```
2. Check Schoology Developer App domain matches ngrok **root domain**
3. Callback URL in OAuth flow must include `oauth_callback` parameter

### Firebase Emulator Authentication Error

**Error:** "You are not currently authenticated..."

**Solution:**
- Using `demo-project` in `.firebaserc` - this is correct!
- `demo-project` is a special Firebase project ID for fully offline development
- No authentication needed for local emulators

### Next.js Static Asset 404s

**Symptoms:**
- `/_next/static/` files return 404
- CSS/JS not loading

**Solutions:**
1. Clear `.next` build directory: `rm -rf .next`
2. Kill any zombie Next.js processes
3. Restart dev server fresh

### Tests Failing

**Checklist:**
1. Are Firebase Emulators running?
2. Is Firestore seeded with mock data?
3. Does test user have admin role?
4. Are environment variables set correctly?

---

## File Access & URLs

**Dev Environment:**
- App: https://modernteaching.ngrok.dev
- Firestore UI: http://localhost:4000
- Ngrok Dashboard: http://localhost:4040

**Ports:**
- Next.js: 9000
- Firebase Functions: 5001
- Firestore: 8080
- Emulator UI: 4000
- Ngrok Dashboard: 4040

---

## Deployment Workflow (Future)

**Target:** Firebase Hosting for modernteaching.com

```bash
# Build for production
npm run build

# Deploy to Firebase
firebase deploy

# Deploy specific services
firebase deploy --only hosting
firebase deploy --only functions
```

**Firebase Projects:**
- `demo-project` - Local emulators (offline)
- `modernteaching` - Production (future)

---

## Links to Other Rules

- `.cursor/rules/core.md` - Project status and priorities
- `docs/ARCHITECTURE.md` - Technical architecture
- `docs/STARTUP.md` - Detailed setup guide
- `docs/CURRENT-STATUS.md` - Active work and TODOs
