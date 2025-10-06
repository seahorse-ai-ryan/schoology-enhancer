# AI Task Kickoff Protocol

**CRITICAL: Follow this protocol at the start of ANY new development task (bug fix, feature, etc.). This supersedes generic information discovery.**

---

### Rule #0: Review Primary Directives
Before proceeding, quickly re-read the critical rules in `.cursor/rules/core.md`, especially the **DO NOT REFACTOR** directive.

---

### Step 1: Deconstruct the User's Request
Identify the key technical nouns from the user's request.

*   **Example Request:** "fix the missing grades on the dashboard"
*   **Keywords:** `grades`, `dashboard`

---

### Step 2: Perform Targeted Code Analysis
Immediately use the keywords to find the most relevant code. **Prioritize this step over reading high-level documents like `USER-JOURNEYS.md`.** The code is the ground truth for a technical task.

1.  **Grep for Keywords:** Use `grep` to find exact matches for your keywords in the codebase. Prioritize these file types:
    *   API Routes: `src/app/api/**`
    *   UI Components: `src/components/**`
    *   Data Libraries: `src/lib/**`

2.  **Trace the Data Flow:** Read the files you found. Start with the UI component (e.g., `UserDashboard.tsx`) and find where it fetches its data. Follow that `fetch` call to the API route (e.g., `src/app/api/schoology/grades/route.ts`) that provides the data. This is your primary area of focus.

**After you have analyzed the code**, you may consult high-level documents like `USER-JOURNEYS.md` or `ARCHITECTURE.md` if the business logic or overall intent of the code is still unclear.

---

### Step 3: Consult Internal Technical Documentation
If you need to understand the behavior of an external service like the Schoology API, **DO NOT use a web search.**

1.  **Check Architecture Docs:** The `docs/current/ARCHITECTURE.md` file contains links to all relevant external API documentation.
2.  **Review Existing Code:** Examine how other, similar parts of the codebase (like `src/lib/schoology.ts`) interact with the service.
3.  **Check Implementation Guides:** For common tasks:
    - Seeding data: `docs/guides/SCHOOLOGY-SEEDING-COMPLETE-GUIDE.md`
    - Grades: `docs/guides/GRADES-IMPLEMENTATION-GUIDE.md`
    - Troubleshooting: `docs/guides/GRADES-TROUBLESHOOTING.md`

---

### Step 4: Formulate a Precise Plan
Based on your targeted analysis of the code and the internal documentation, propose a specific, surgical plan that **does not involve refactoring**.

*   **Good Plan:** "I will modify the `grades/route.ts` file to correctly parse the `final_grade` object from the Schoology API response, based on the structure described in their developer docs."
*   **Bad Plan:** "I will create a new generic `schoologyGet` function in `schoology.ts` to make the code cleaner and then use it in the grades route."

By following this protocol, you will avoid redundant exploration and focus directly on solving the problem at hand.
