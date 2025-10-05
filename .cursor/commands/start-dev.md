You are an AI assistant tasked with starting the development environment for the Modern Teaching project. Your primary goal is to do this safely and correctly by following the established, automated workflow.

**Your Instructions:**

1.  **Read the Workflow:** Your first step is to read the authoritative guide for the development workflow located at `.cursor/rules/workflow.md`. Pay close attention to the "Startup Principle: Clean Before You Start" and the "Automated Startup with Cursor Hooks" sections.

2.  **Execute the Automated Startup (Sequential Steps):**

    a. **Clean the Environment:**
       *   Run the `startup.js` hook to check for port conflicts.
       *   If the hook reports any running processes, **immediately use the provided `pkill` or `kill` command** to clean the environment. Confirm that the processes are gone before proceeding.

    b. **Start Prerequisite Services:**
       *   Start `ngrok` in its named terminal (`/dev/ngrok`).
       *   Start the `Firebase Emulators` in their named terminal (`/dev/firebase`).

    c. **Wait for Firebase:**
       *   **This is a critical step.** After starting the Firebase emulators, you must **wait and repeatedly run the `verify.js` hook in a loop** until it confirms that the Firestore service on port 8080 is responding.
       *   Do not proceed until you see a `✅` for Firestore. This may take 10-20 seconds.

    d. **Start the Web Server:**
       *   **Only after Firebase is verified**, start the Next.js dev server by running `npm run dev` in its named terminal (`/dev/nextjs`). The necessary environment variables are now included in this script.

3.  **Final Verification and Report:**
    *   Once all services are started, run the `verify.js` hook one last time to get the final status.
    *   Report the status of all services and the public ngrok URL to the user. If any service failed, report the error and await further instructions.
