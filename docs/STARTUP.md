# Modern Teaching - Development Environment Startup Guide

**Last Updated**: September 30, 2025  
**Environment**: Native macOS Development

## 🎯 Quick Start

### Prerequisites

- **macOS** (native development environment)
- Node.js 20+ installed
- Firebase CLI installed (`npm install -g firebase-tools`)
- Ngrok account with static domain configured
- Chrome or Chromium installed (for browser automation)
- `.env.local` file with credentials (see below)

### Starting Development Services

Run these **three commands in separate terminals** (in order):

```bash
# Terminal 1: Start ngrok tunnel
ngrok http --url=modernteaching.ngrok.dev 9000 --log stdout

# Terminal 2: Start Firebase emulators
firebase emulators:start

# Terminal 3: Start Next.js dev server
npm run dev
```

**Important**:

- Start in the project root directory (`/Users/ryanhickman/code/web-apps/schoology-enhancer`)
- Let each service initialize before starting the next
- All services run natively on macOS (no containers)

### Expected Terminal Names in Cursor

1. `Cursor (ngrok http)` - Ngrok tunnel
2. `Cursor (firebase emulators:start)` - Firebase emulators
3. `Cursor (npm run)` - Next.js dev server

---

## 📋 Environment Configuration

### Static Ngrok Domain

We use a **paid ngrok account** with a static domain to eliminate manual URL updates.

**Domain**: `https://modernteaching.ngrok.dev`

### Required `.env.local` File

```bash
# Schoology OAuth Credentials (for parent/user login)
SCHOOLOGY_CONSUMER_KEY=your_consumer_key_here
SCHOOLOGY_CONSUMER_SECRET=your_consumer_secret_here
SCHOOLOGY_CALLBACK_URL=https://modernteaching.ngrok.dev/api/callback

# Schoology Admin API Credentials (for seeding and admin operations)
SCHOOLOGY_ADMIN_KEY=your_admin_key_here
SCHOOLOGY_ADMIN_SECRET=your_admin_secret_here

# Firebase Configuration
FIREBASE_PROJECT_ID=demo-project
NEXT_PUBLIC_FIREBASE_PROJECT_ID=demo-project

# App Configuration
NEXT_PUBLIC_APP_URL=https://modernteaching.ngrok.dev
SCHOOLOGY_APP_URL=https://api.schoology.com
```

### Schoology Developer App Configuration

**Critical**: The Schoology Developer App domain setting must match the ngrok root domain:

- ✅ Correct: `modernteaching.ngrok.dev`
- ❌ Wrong: `modernteaching.ngrok.dev/api/callback` (don't include path)

---

## 🚀 Service Details

### 1. Ngrok Tunnel

**Command**: `ngrok http --url=modernteaching.ngrok.dev 9000 --log stdout`

**Purpose**: Exposes local Next.js server (port 9000) to the internet for Schoology OAuth callbacks

**Access Points**:

- Public URL: https://modernteaching.ngrok.dev
- Dashboard: http://localhost:4040

**Expected Output**:

```
started tunnel              obj=tunnels
                            name=command_line
                            addr=http://localhost:9000
                            url=https://modernteaching.ngrok.dev
```

### 2. Firebase Emulators

**Command**: `firebase emulators:start`

**Purpose**: Local Firebase services for development (Firestore, Functions, Hosting)

**Access Points**:

- Emulator UI: http://localhost:4000
- Firestore: http://localhost:8080
- Functions: http://localhost:5001
- Hosting: http://localhost:5002

**Expected Output**:

```
✔  All emulators ready! It is now safe to connect your app.
│ i  View Emulator UI at http://127.0.0.1:4000/
```

**Project Configuration**:

- Uses `demo-project` (configured in `.firebaserc`)
- Fully offline, no authentication required
- No connection to production Firebase
- Data persists only in memory/local files during session

### 3. Next.js Dev Server

**Command**: `npm run dev`

**Purpose**: Runs the Next.js application on port 9000

**Access Points**:

- Local: http://localhost:9000
- Via ngrok: https://modernteaching.ngrok.dev

**Expected Output**:

```
▲ Next.js 15.3.3
- Local:        http://localhost:9000
- Network:      http://172.17.0.2:9000
- Environments: .env.local

✓ Ready in 1270ms
```

**Common Issues**:

- **404 for static assets**: Run `rm -rf .next` then restart `npm run dev`
- **EADDRINUSE error**: Kill existing process with `lsof -ti:9000 | xargs kill -9`

---

## 🔍 Verification & Testing

### Check All Services Are Running

```bash
# 1. Check ngrok tunnel
curl -s http://localhost:4040/api/tunnels | jq -r '.tunnels[0].public_url'
# Expected: https://modernteaching.ngrok.dev

# 2. Check Firestore emulator
curl -s http://localhost:8080 > /dev/null && echo "✅ Firestore OK"

# 3. Check Next.js server
curl -s http://localhost:9000 > /dev/null && echo "✅ Next.js OK"
```

### Test Application in Browser

Visit: https://modernteaching.ngrok.dev

**Expected Behavior**:

- Landing page loads with "Schoology Planner" title
- Two buttons: "Explore Sample Dashboard" and "Sign In with Schoology"
- **No errors in browser console** (except expected 401s - see below)

### Expected Console Messages (Normal, Not Errors!)

When viewing the landing page without being logged in:

```
GET /api/auth/status 401 in 480ms
```

**This is correct!** The app checks if you're logged in. A 401 response means "not authenticated yet" - perfectly normal for the landing page.

---

## 🛠️ AI Agent Testing Capabilities

### Chrome DevTools MCP

The Chrome DevTools MCP allows AI agents to:

- Inspect network requests and responses
- Read console logs and errors
- Evaluate JavaScript in the page context
- Take screenshots for visual verification

### Cursor Browser Integration

The Cursor browser (announced Sept 29, 2025) enables:

- Automated testing workflows
- Visual verification of changes
- End-to-end flow testing

### Testing Workflow for AI Agents

1. **Make Code Changes**: Edit files using standard tools
2. **Wait for Hot Reload**: Next.js will auto-reload (watch terminal for "✓ Compiled")
3. **Verify in Browser**: Use Chrome DevTools MCP to check:
   - Network tab for API calls
   - Console for errors/warnings
   - Elements tab for rendered HTML
4. **Report Results**: Share findings with screenshots/logs

---

## 🐛 Troubleshooting

### Service Won't Start

**Symptom**: Terminal shows error or exits to shell prompt

**Solutions**:

1. Check if port is in use: `lsof -ti:PORT` (replace PORT with 9000, 8080, etc.)
2. Kill conflicting process: `kill -9 PID`
3. Clear stale build: `rm -rf .next`
4. Restart service

### Ngrok Session Errors

**Symptom**: Frequent reconnect loops in ngrok terminal

**Cause**: Network instability or ngrok service issues

**Solution**: Ngrok auto-reconnects. If persistent, restart ngrok terminal.

### Firebase Emulator Auth Error

**Symptom**: `Error: Failed to authenticate, have you run firebase login?`

**Cause**: `.firebaserc` set to a real project ID instead of `demo-project`

**Solution**:

```bash
# Update .firebaserc
echo '{"projects":{"default":"demo-project"}}' > .firebaserc

# Restart emulators
# (Ctrl+C in firebase terminal, then: firebase emulators:start)
```

### Next.js 404 for Static Assets

**Symptom**: Page loads but CSS/JS files return 404

**Cause**: Corrupt or stale `.next` build directory

**Solution**:

```bash
rm -rf .next
# Next.js will rebuild on next request
```

---

## 📝 Stopping Services

### Individual Service

Click on the terminal and press `Ctrl+C`

### All Services at Once

```bash
pkill ngrok && pkill -f 'firebase emulators' && pkill -f 'next dev'
```

---

## 🔄 Common Development Workflows

### Fresh Start (Clean Slate)

```bash
# 1. Stop all services
pkill ngrok && pkill -f 'firebase emulators' && pkill -f 'next dev'

# 2. Clear build artifacts
rm -rf .next

# 3. Start services in order (see Quick Start section)
```

### Restart Next.js Only (Code Changes)

```bash
# In the "Cursor (npm run)" terminal:
# 1. Press Ctrl+C
# 2. Run: npm run dev
```

### Check Firestore Data

Visit http://localhost:4000 and navigate to:

- Firestore tab: View/edit database documents
- Users collection: See registered users
- Sessions: Check active sessions

---

## 📚 Additional Resources

- [Ngrok Documentation](https://ngrok.com/docs)
- [Firebase Emulator Suite](https://firebase.google.com/docs/emulator-suite)
- [Next.js Development](https://nextjs.org/docs)
- [Schoology API Docs](https://developers.schoology.com/api-documentation)

---

**Need Help?** Check the main [README.md](../README.md) or session logs in [docs/LOG.md](./LOG.md)

