# AI Best Practices & Vibe Coding Guide

This document outlines our methodology for working effectively with Gemini in Firebase Studio. The goal is to establish a workflow that is efficient, consistent, and mitigates the known challenges of context loss and environment-specific instructions.

## The "Vibe Coding" Workflow

"Vibe Coding" is a documentation-driven approach where we use markdown files to maintain the state, plan, and context of our project. This allows us to work effectively with AI agents like Gemini, which may not have perfect memory between sessions.

Our workflow relies on three key documents:

1.  **`docs/action-plan.md`**: Defines the concrete, sequential tasks to be done. It is our "TODO list".
2.  **`.idx/airules.md`**: A special file that provides persistent, project-wide instructions to Gemini. It is our "rulebook".
3.  **`docs/LOG.md`**: A chronological journal of our development sessions. It is our "memory".

## 1. The Rulebook: `.idx/airules.md`

**Problem Solved:** How to give Gemini persistent instructions, rules, and context without repeating ourselves in every prompt.

**How it Works:** As per the Firebase documentation, Gemini in Firebase chat automatically loads a file named `.idx/airules.md` at the start of a session. This file acts as a persistent system prompt, allowing us to define our project's standards, technical stack, and Gemini's persona.

**Usage:** We will use this file to tell Gemini things like:
*   Its persona (e.g., "You are an expert Firebase and Next.js developer").
*   Our coding standards (e.g., "Use TypeScript, functional components, and Tailwind CSS").
*   **Crucially, environment constraints** (e.g., "You are working inside Firebase Studio, not a local desktop IDE. All terminal commands must be compatible with this environment. Do not suggest installing tools that require root access.").
*   Key architectural decisions it should always remember.

## 2. The Memory: `docs/LOG.md`

**Problem Solved:** How to overcome context loss when switching between Firebase Studio views (Prototyper vs. Code) or starting a new session.

**How it Works:** The `LOG.md` file will serve as a chronological journal of our work. At the end of a session, we will write a brief entry summarizing what was accomplished, what the next step is, and any key learnings or decisions made.

**Usage:** At the beginning of a new session, our first prompt to Gemini will be to read the latest entry from `docs/LOG.md` and the relevant section of `docs/action-plan.md`. This will immediately bring the AI up to speed on our current status and objective.

**Example Log Entry:**

```markdown
### 2024-07-29

**Accomplished:**
*   Successfully implemented the `/request_token` endpoint in the `schoology-auth` Firebase Function.
*   Wrote a Playwright test to mock the initial leg of the OAuth flow.

**Next Step:**
*   Implement the `/callback` endpoint to handle the user's return from Schoology and exchange the request token for an access token.

**Blockers:**
*   None.
```

By adhering to this process, we create a robust system for AI collaboration that is resilient to the limitations of the current tooling.
