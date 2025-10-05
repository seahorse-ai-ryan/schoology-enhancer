# Development Workflow

**Environment:** Native macOS Development

## Startup Sequence

### Startup Principle: Clean Before You Start

When starting the development environment, always assume the environment might be in an unknown or "borked" state. The default procedure is to **clean up before starting**.

The `startup.js` hook is the source of truth for detecting conflicts. If this script reports any running processes, the **immediate next step** is to run the provided `pkill` or `kill` command to ensure a completely clean slate before attempting to start any services.

### Automated Startup with Cursor Hooks

The preferred method is to use the built-in startup hook, which automates port checking and service startup in the correct order within named, persistent terminals.

**To Start All Services:**
Open a new chat and use the following slash command:

`/start-dev`

The agent will then execute the logic defined in that command, which includes running the startup hooks, cleaning up zombie processes, starting services in the correct named terminals, and verifying the final state.

### Manual Startup (If Needed)

If you need to start services manually, follow the same sequence and use the same named terminals to maintain consistency.

1.  **Check for conflicts:** `node .cursor/hooks/startup.js`
2.  **Clean up if needed:** `pkill -9 -f "next dev|firebase emulators|ngrok"`
3.  **Start services** in the three separate terminals as listed above, ensuring you wait for Firebase to be ready before starting Next.js.
4.  **Verify:** `node .cursor/hooks/verify.js`

**Static Domain:** `https://modernteaching.ngrok.dev` (eliminates manual URL updates)

---

## Working in a Parallel Chat Session (Side Tasks)

If you have a stable development environment running and want to start a new, parallel chat for a non-disruptive task (like documentation, analysis, or writing a new script), use the prompt below to initialize the agent.

This instructs the agent to learn the project context **without** attempting to manage the development environment.

### How to Start a Parallel Chat Session

To start a new, non-disruptive workstream, open a new chat and use the following slash command:

`/parallel-work`

This command contains all the necessary instructions to prevent the new agent from interfering with your running services. You can then give it a specific, non-disruptive task, such as:
- "Please write a new script to analyze the seed data."
- "Draft the documentation for the new component we just built."
- "Review the `docs/roadmaps/MVP-PLAN.md` and suggest any inconsistencies."

---

## Agent Terminal Protocol (Named Persistent Terminals)

To ensure stability and prevent resource conflicts, all AI agents **must** adhere to the following protocol for managing terminals.

1.  **Always Use Named Terminals:** Agents must not create unnamed terminals for long-running services. Use the established names: `/dev/ngrok`, `/dev/firebase`, `/dev/nextjs`.
2.  **Check Before Starting:** Before launching a service, the agent must check if a terminal with that name already exists and if the correct process is running. The `startup.js` hook handles this.
3.  **Reuse, Don't Recreate:** If a service is already running correctly in its named terminal, the agent must reuse it.
4.  **Graceful Shutdown:** When stopping services, agents should use the `stop-dev-env.md` slash command (to be created) which will gracefully stop processes rather than killing terminals.

This protocol, enforced by our hooks and agent rules, is the "Named Persistent Terminals" strategy.

---

## Agent Tool Call Protocol

**Attention Agents:** To ensure a stable development environment, you **MUST** use the following parameters when calling the `run_terminal_cmd` tool to start services. Do not deviate from this pattern.

### 1. To Start Ngrok
- **Tool:** `run_terminal_cmd`
- **Parameters:**
  - `command`: `"ngrok http --url=modernteaching.ngrok.dev 9000 --log stdout"`
  - `terminalName`: `"/dev/ngrok"`
  - `is_background`: `true`

### 2. To Start Firebase Emulators
- **Tool:** `run_terminal_cmd`
- **Parameters:**
  - `command`: `"export PATH="/opt/homebrew/opt/openjdk@17/bin:$PATH" && firebase emulators:start --import=./.firebase/emulator-data --export-on-exit=./.firebase/emulator-data"`
  - `terminalName`: `"/dev/firebase"`
  - `is_background`: `true`

### 3. To Start Next.js Dev Server
- **Tool:** `run_terminal_cmd`
- **Parameters:**
  - `command`: `"export FIRESTORE_EMULATOR_HOST="localhost:8080" && npm run dev"`
  - `terminalName`: `"/dev/nextjs"`
  - `is_background`: `true`

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
1.  Run the startup hook: `node .cursor/hooks/startup.js`
2.  It will provide a command to kill the specific zombie processes.

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
2. Kill any zombie Next.js processes (use `startup.js` hook to find them)
3. Restart dev server fresh

### Tests Failing

**Checklist:**
1. Are Firebase Emulators running? (Use `verify.js` hook)
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
```

**Firebase Projects:**
- `demo-project` - Local emulators (offline)
- `modernteaching` - Production (future)

---

## Links to Other Rules

- `.cursor/rules/core.md` - Project status and priorities
- `docs/ARCHITECTURE.md` - Technical architecture
- `docs/guides/STARTUP.md` - Detailed setup guide (to be deprecated by this doc)
- `docs/CURRENT-TASKS.md` - Active work and TODOs
