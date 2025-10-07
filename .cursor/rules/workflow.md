# Development Workflow

**Environment:** Native macOS Development

---

## 🚀 Startup & Verification

This project uses a simple, robust workflow based on three core slash commands.

### 1. `/start` - To Start All Services

-   **What it does:** Cleans the environment and starts `ngrok`, Firebase emulators, and the Next.js dev server in the background.
-   **When to use:** Use this at the beginning of a development session to bring up the entire environment.
-   **Note:** After starting services, you must manually log in via the browser to authenticate.

---

## 🔐 Authentication & Testing Workflow

**✅ Automated browser testing is fully supported!**

### For Automated Testing (Recommended)

**One-time setup:**
1. Launch persistent Chrome: `npm run chrome:test`
2. Manually complete OAuth login (bypasses hCaptcha via anti-automation flags)
3. Capture auth state: `node scripts/capture-auth-state.js`

**Every test run:**
```bash
node scripts/inject-auth-state.js
```
This launches a fresh, **automatically authenticated** browser without manual login!

### Manual Browser Testing

Simply navigate to `https://modernteaching.ngrok.dev` in your regular browser and log in normally.

**See:** `docs/guides/BROWSER-AUTOMATION.md` for complete automation guide.

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
2.  **Clean Before Starting:** The `/start` command handles all cleanup. Agents should not attempt to manage processes individually.

This protocol, enforced by our slash commands, is the "Named Persistent Terminals" strategy.

---

## Agent Tool Call Protocol

**Attention Agents:** The slash commands (`/start`, `/verify`) now contain all necessary logic. You do not need to call `run_terminal_cmd` with specific parameters for services. Simply execute the slash commands as requested by the user.

---

## ✅ Final Startup Verification

After all services are running:

1.  **Check Service Health:**
    - ngrok should show "started tunnel" message
    - Firebase should show "All emulators ready!"
    - Next.js should show "Ready in Xms"

2.  **Manual Authentication:**
    - User must log in via browser
    - No automated verification available due to hCaptcha

3.  **Verify in Browser:**
    - Navigate to `https://modernteaching.ngrok.dev`
    - Confirm login works and dashboard loads

---

## Testing Strategy

### Primary: Puppeteer with Auth Injection (✅ PROVEN)

**Recommended approach for all authenticated E2E testing:**

```bash
# One-time setup
npm run chrome:test                    # Manual auth
node scripts/capture-auth-state.js     # Capture cookie

# Every test
node scripts/inject-auth-state.js      # Automated!
```

**Proven capabilities:**
- ✅ Open/close browser programmatically
- ✅ Authenticate without manual login
- ✅ Navigate, scroll, click, hover
- ✅ Extract data from pages
- ✅ Take screenshots
- ✅ No hCaptcha blocking

**Scripts:**
- `scripts/inject-auth-state.js` - Full automation
- `scripts/prove-automation.js` - Comprehensive demo
- `scripts/quick-test-authenticated.js` - Quick test

### Alternative: Jest (Backend/Unit Only)

- Unit tests for data transformations
- API route logic testing
- Firebase integration tests
- Command: `npm run test:emu`

### Alternative: Cursor Playwright MCP (Public Pages Only)

- Quick exploration of unauthenticated pages
- Visual regression on landing page
- ❌ Cannot authenticate (hCaptcha blocks)

**See:** `docs/guides/BROWSER-AUTOMATION.md` for complete guide.

---

## Testing Workflow

### After Making Changes

1. **Save files** - Next.js auto-reloads
2. **Watch terminal** for "✓ Compiled" message
3. **Verify with automated browser testing:**
   ```bash
   node scripts/inject-auth-state.js
   ```
   Then navigate to changed pages and verify behavior
4. **Take screenshots** for evidence:
   ```javascript
   await page.screenshot({ path: 'test-results/my-change.png' });
   ```
5. **Report findings** with evidence

### Expected Console Behavior

**Normal 401 Errors (NOT bugs!):**
- `/api/auth/status` returns 401 when user not logged in
- Landing page and dashboard handle this gracefully
- These are intentional security checks, not failures

---

## Prerequisites

The Firebase Emulators are Java-based. You must have a Java Runtime Environment (JRE) installed on your system for them to function.

- **Verification:** You can check if Java is installed by running `java -version` in your terminal.
- **Installation:** If it is not installed, you can download it from [java.com](https://www.java.com/en/download/).

Our automated `startup.js` hook will check for this and provide an error if Java is missing.

---

## Common Commands

```bash
# Development
npm run dev          # Next.js dev server (port 9000)
npm run typecheck    # TypeScript type checking
npm run lint         # ESLint code quality

# Browser Testing (Primary)
npm run chrome:test  # Launch persistent Chrome (one-time auth)
node scripts/capture-auth-state.js     # Capture auth (after login)
node scripts/inject-auth-state.js      # Automated testing
node scripts/prove-automation.js       # Demo all capabilities

# Backend Testing
npm run test:emu     # Jest backend tests

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

---

## 🧪 UI Verification Protocol (Mandatory)

**CRITICAL:** After making ANY change that could affect the UI, you **MUST** run the verification command:

1.  **Run the Command:**
    `/verify`
2.  **Analyze:** The agent will display the resulting `verification-screenshot.png` and report the status. Confirm the changes look correct.

This is the final gate check for all UI-related work.

---

## ⚠️ Handling Verification Failures

If the browser tools fail or are blocked (e.g., by hCaptcha), **DO NOT** ask the user for manual help. Instead, follow these debugging steps:

1.  **Check for hCaptcha/Authentication Blocks:**
    -   Examine the inline screenshot. If you see a CAPTCHA or login screen, the persistent authentication session is likely invalid.

2.  **Consult the Architecture Decision:**
    -   The solution for this is documented in `docs/roadmaps/TECHNICAL-ARCHITECTURE-DECISIONS.md` under **TAD-002**. This document explains our strategy for persistent browser context.

3.  **Attempt to Fix the Script:**
    -   Ensure the `chromium.launchPersistentContext` call in `scripts/browser-screenshot-test.js` includes the necessary arguments to appear as a normal browser (e.g., disabling automation features).

4.  **Manually Re-Authenticate if Necessary:**
    -   If the script is correct but the session has expired, you may need to guide the user through a one-time manual login to refresh the `.auth/chrome-profile/` directory. Propose this as a solution only after verifying the script itself is not the issue.

Only after following these steps should you report a persistent, unresolvable blocker.

---

## 🚨 Safety Protocols & Command Usage

**CRITICAL:** Your primary goal is to assist without causing disruption to the user's environment.

-   **NEVER Use Broad Process Killing Commands:** You are strictly forbidden from using overly broad commands like `pkill -f "Google Chrome"`, `killall chrome`, or similar commands that could affect the user's personal applications.
-   **Targeted Process Management Only:** If a process needs to be stopped, it must be targeted specifically. For issues like a locked browser profile, the correct and safe procedure is to delete the specific profile directory (e.g., `rm -rf .auth/some-test-profile/`) to clean the state, not to kill the parent application.
-   **Ask Before Destructive Operations:** For any file or process operation that could be considered destructive and is outside of the project directory (e.g., system-level changes), you must explain the command and ask for confirmation before running it.

Violation of these safety protocols is a critical failure.

---

## 📂 Quick Navigation
