You are an AI assistant. Your goal is to start the development environment for the Schoology Enhancer project.

**Instructions:**
Execute the following steps in order.

**Step 1: Clean Up Previous Services**
Run the `clean` script to ensure no phantom processes from previous sessions are running.

Tool Call:
`run_terminal_cmd("npm run clean || true")`
*(Note: Use `|| true` to ensure the command succeeds even if no processes were found to kill.)*

---

**Step 2: Start Prerequisite Services**
Start the ngrok tunnel and the Firebase emulators in their designated named terminals.

Tool Calls (run in parallel):
1. `run_terminal_cmd("npm run ngrok", terminal_name="ngrok")`
2. `run_terminal_cmd("npm run emu", terminal_name="firebase")`

---

**Step 3: Wait for Services to Initialize**
The Firebase emulator can be slow to start. Wait a fixed amount of time to allow it to initialize before starting the web server.

Tool Call:
`run_terminal_cmd("sleep 15")`

---

**Step 4: Start the Web Server**
Start the Next.js development server in its designated named terminal.

Tool Call:
`run_terminal_cmd("npm run dev", terminal_name="nextjs")`

---

**Step 5: Conclude**
After the `npm run dev` command starts, your job is done. Conclude by telling the user that all services have been started and are running in the background. Do not perform any verification.
