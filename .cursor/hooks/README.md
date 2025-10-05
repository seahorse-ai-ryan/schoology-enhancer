# Cursor Hooks for Modern Teaching

These hooks automate development environment setup and verification.

## Available Hooks

### `startup.js`
Checks for port conflicts before starting services. Run this first to ensure a clean startup.

```bash
node .cursor/hooks/startup.js
```

### `verify.js`
Verifies all services are running and accessible. Run after starting all services.

```bash
node .cursor/hooks/verify.js
```

## Startup Workflow

1. **Check environment:**
   ```bash
   node .cursor/hooks/startup.js
   ```

2. **Start services in order** (in separate named terminals):

   **Terminal 1: "Cursor (ngrok http)"**
   ```bash
   ngrok http --url=modernteaching.ngrok.dev 9000 --log stdout
   ```

   **Terminal 2: "Cursor (firebase emulators:start)"**
   ```bash
   export PATH="/opt/homebrew/opt/openjdk@17/bin:$PATH"
   firebase emulators:start
   ```
   ⚠️ **WAIT** for "✔ All emulators ready!" message

   **Terminal 3: "Cursor (npm run)"**
   ```bash
   export FIRESTORE_EMULATOR_HOST="localhost:8080"
   npm run dev
   ```

3. **Verify everything:**
   ```bash
   node .cursor/hooks/verify.js
   ```

## Troubleshooting

If ports are in use, kill zombie processes:
```bash
pkill -9 -f "next dev|firebase emulators|ngrok"
```

Or target specific PIDs:
```bash
kill -9 <PID1> <PID2> <PID3>
```

## Cursor Integration

These hooks can be called by Cursor Agent to:
- Auto-check environment before starting work
- Verify services after startup
- Clean up zombie processes
- Report status to user

See `.cursor/rules/workflow.md` for more details.

