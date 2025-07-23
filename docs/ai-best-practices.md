# AI Best Practices & Vibe Coding Guide

This document outlines our methodology for working effectively with Gemini in Firebase Studio.

## The "Vibe Coding" Workflow

"Vibe Coding" is a documentation-driven approach where we use markdown files to maintain the state, plan, and context of our project. This allows us to work effectively with AI agents like Gemini.

Our workflow relies on three key documents:

1.  **`docs/action-plan.md`**: Our "TODO list". This is where we define the high-level goals and the concrete steps to achieve them.
2.  **`.idx/airules.md`**: The "rulebook" for the AI agent. This is the most critical file for AI context, containing its persona, environmental constraints, and core directives.
3.  **`docs/LOG.md`**: Our "memory" or session journal. We use this to record the outcome of actions, significant errors, and the state of the project at the end of a session. This file is always updated with the newest entries at the top.

## The Firebase Studio "Golden Path"

After significant trial and error, we have established the correct, native workflow for full-stack development in this IDE. The AI has these rules in its core instructions, but they are documented here for human reference.

1.  **Backend Runs Automatically:** The Firebase Emulators are configured in `.idx/dev.nix` to start automatically in the background when the workspace loads. We **do not** run `firebase emulators:start` in the terminal.

2.  **Frontend Runs Manually:** The Next.js frontend server is started by using the **"Preview" button** in the IDE's bottom bar. This opens the UI in a new IDE tab.

3.  **Use the Right URL for Testing:** The URL for manual end-to-end testing is the one provided by the **Hosting Emulator (port 5000)** in the "BACKEND PORTS" panel.

4.  **Reloading the Environment:** To apply changes to the `.idx/dev.nix` file, the entire environment must be reloaded using the Command Palette action: **"Firebase Studio: Hard Restart"**.

## AI Agent Interaction ("YOLO Mode")

*   The AI agent's primary directive is to make progress. It will propose an action and immediately provide the tool call to execute it.
*   The user's role is to provide the final approval by clicking the **blue "Run..." button**. This is our core workflow for rapid iteration.
