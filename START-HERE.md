# 👋 START HERE - Vibe Coding Session

**Last Updated:** October 1, 2025  
**For:** The next AI agent session  
**Purpose:** To kick off a major documentation refactor and strategic alignment phase.

---

## 🎯 Current Mandate: Operation Golden Docs

**Your mission is to lead a comprehensive refactoring of all planning and architectural documents.** The goal is to consolidate the various AI-generated inputs into a single, unified, and comprehensive vision for the project.

When this phase is complete, the repository should be so clear and well-documented that it would impress any experienced developer who found it, especially knowing it's a solo "vibe coding" effort.

---

## 📚 Project Context & Philosophy

Before you begin, understand the following context:

*   **Multiple AI Collaborators:** The initial roadmaps and architecture were drafted by **Claude 4.5 Sonnet**. Subsequently, **GPT-5, Gemini Pro, and GPT-5-Codex** have all provided second opinions, audits, and new plans.
*   **Expect Contradictions:** Because of the multiple AI inputs, there are likely conflicting suggestions and plans. Your first job is to identify these.
*   **Awaiting Decisions:** Many of the documents contain open questions for me, the Product Owner. These need to be consolidated and presented to me for decision-making.
*   **My Role:** I am a former Product Manager and Technical Program Manager at Google, not a Senior SWE. I will provide product direction, strategic decisions, and user-centric feedback. I will rely on you for technical leadership and best-practice implementation.
*   **Documentation Style:**
    *   Follow the principles in `docs/DOCUMENTATION-GUIDE.md`.
    *   Replace obnoxious "milestone achieved" headers with simple "Last Updated" dates. Consistency is key.
    *   The `/docs`, `/roadmaps`, and `/.journal` structure is intentional and should be maintained.

---

## 🗺️ High-Level Execution Plan

We will follow this precise sequence. Do not proceed to the next step until the previous one is complete and approved.

1.  **Phase 1: Doc Analysis & Refactor (Your Current Task)**
    *   **Goal:** Consolidate all plans and AI feedback into a single, coherent strategy.
    *   **Action:** Conduct a meta-analysis, resolve contradictions, get my decisions on open questions, and rewrite the documentation to be consistent and clear.

2.  **Phase 2: Seed Data Expansion**
    *   **Goal:** Enrich our test environment with diverse and realistic data.
    *   **Action:** I will provide new seed data based on real-world examples. You will need to guide me on how to either provide this data or integrate it via API calls using my admin key. This must be done before we can achieve full test coverage.

3.  **Phase 3: Achieve 100% Test Coverage**
    *   **Goal:** Ensure every user journey and critical function is covered by an automated test.
    *   **Action:** Write the necessary E2E and unit tests to fill any gaps identified in our test plans.

4.  **Phase 4: Code Refactoring**
    *   **Goal:** Elevate the existing codebase to be scalable, efficient, secure, and easily maintainable.
    *   **Action:** With a full test suite providing a safety net, refactor the application to align with our newly solidified architectural plans.

5.  **Phase 5: Final Polish & "Golden" Commit**
    *   **Goal:** Create a "golden" state of the repository.
    *   **Action:** Run all tests one last time, perform a final review, and commit the fully refactored and documented codebase. The public `README.md` will be updated as the final step.

---

## 🚀 Immediate Action Items for This Session

**Read this file, then get to work. Here is your plan:**

1.  **Create a Temporary Workspace:**
    *   Create a new directory named `/.temp-doc-refactor`. This directory should be added to `.gitignore`.
    *   This will be your workspace for drafting the new, consolidated documents without modifying the existing ones until we are ready.

2.  **Conduct Meta-Analysis:**
    *   Read all documents in the `/roadmaps` and `/.journal` directories.
    *   **Your Goal:** Synthesize the different perspectives from Claude, GPT-5, Gemini, and Codex.
    *   **Deliverable 1:** Create a new file, `/.temp-doc-refactor/META-ANALYSIS.md`, that summarizes the key strategies, identifies all contradictions between the plans, and lists the major strategic choices we need to make.

3.  **Consolidate Open Questions:**
    *   As you read, extract every open question directed at me (the Product Owner).
    *   **Deliverable 2:** Create a second file, `/.temp-doc-refactor/CONSOLIDATED-QUESTIONS.md`. List every question, grouped by topic (e.g., Product, Architecture, UX), and cite the source file for each.

4.  **Request Human Interaction:**
    *   Once the two deliverables are complete, pause and ask me to review them. This will be my entry point to make the necessary decisions to unblock the rest of the refactoring process.

5.  **Incorporate External Schoology Context (New Task):**
    *   After I have reviewed your analysis and provided decisions, your next task is to integrate the following platform context into our documentation.
    *   **Deliverable 3:** Create a new reference document at `docs/SCHOOLOGY-PLATFORM-GUIDE.md`. This document should become the central repository for external links and key summaries. Populate it with:
        *   **User-Facing Docs:** [Schoology System Admin Guide](https://uc.powerschool-docs.com/en/schoology/latest/system-administrators)
        *   **API Overview:** [Schoology API Documentation](https://developers.schoology.com/api/)
        *   **Core API Reference:** [REST API v1](https://developers.schoology.com/api-documentation/rest-api-v1/)
        *   **App Examples:** [Schoology App Center](https://app.schoology.com/apps/)
        *   **Developer Portal:** [My Apps Publisher Page](https://app.schoology.com/apps/publisher)
    *   **Deliverable 4:** Update the `roadmaps/STRATEGIC-ROADMAP.md`. Integrate the "Schoology App Center Submission" process as a major future milestone (e.g., "Phase 4: Public Launch"). Based on the contents of `temp-schoology-app-submit-guide.md`, this plan must include sub-tasks for:
        *   Creating and provisioning the required test user: `sgy-app-tester@powerschool.com`.
        *   Preparing detailed launch and configuration instructions for the Schoology review team.
        *   Allocating a 30-day window for the approval process.
    *   **Deliverable 5:** Update the `roadmaps/TECHNICAL-ARCHITECTURE-DECISIONS.md`. Add a new section titled "LTI Integration Analysis." In this section, analyze the LTI standard from [1EdTech LTI Standard](https://www.1edtech.org/standards/lti) and discuss the potential benefits (e.g., deeper integration, official platform support) and drawbacks (e.g., implementation complexity, architectural changes) of adopting it for this project.

Do not begin rewriting or refactoring any documents in `/roadmaps` or `/docs` until I have reviewed your analysis and provided decisions. Good luck.
