# Documentation Guide

Last Updated: October 1, 2025
Scope: This document defines the structure and philosophy for all documentation in this repository. Its purpose is to ensure that information is easy to find, maintain, and properly separated between public-facing and private development contexts.

---

## 1. Guiding Principles

*   **Simple & Scalable:** The structure should be intuitive for a solo developer but able to grow.
*   **Clear Boundaries:** It should be obvious where a new document belongs.
*   **Public vs. Private:** We must clearly separate evergreen, public-facing documentation from our internal development journal and local-only tooling files.

---

## 2. Directory Structure Overview

Our documentation is organized into four distinct locations, based on its purpose and audience.

### A. `/` (Root) - The Public Entry Point

*   **`README.md`**
    *   **Audience:** The public, potential users, and future contributors.
    *   **Content:** The high-level "what and why" of the project. A concise vision statement, link to the live application, and a brief guide on how to get started as a developer. This is the front door to the project.

### B. `/docs` - The "How It Works Now" Library

*   **Audience:** Developers (present and future).
*   **Content:** Evergreen, technical, and product documentation that describes the **current, stable state** of the application. If you want to understand how the system is designed and how to work with it *today*, this is the place to look.
*   **Examples:** `ARCHITECTURE.md`, `USER-JOURNEIS.md`, `STARTUP.md`, `TESTING.md`.

### C. `/roadmaps` - The "Where We Are Going" Blueprint

*   **Audience:** Product Owner & Lead Developer.
*   **Content:** Future-facing product vision, design specifications, and strategic plans. This directory contains the detailed plans for **what we are building next**.
*   **Examples:** `STRATEGIC-ROADMAP.md`, `PRODUCT-REQUIREMENTS.md`.

### D. `/.journal` - The "What We Have Done" Log (Local-Only)

*   **Audience:** You and the AI Agent.
*   **Content:** The historical record of our development process. This includes session summaries, point-in-time audits, second opinions, and other ephemeral documents that are crucial for context and continuity but are not part of the permanent project documentation.
*   **Git Status:** This directory is **intentionally included in `.gitignore`** and should not be committed to the public repository. It is our private development log.

### E. `/.cursor` - AI & Workflow Tooling (Local-Only)

*   **Audience:** You and the AI Agent.
*   **Content:** IDE-specific settings, AI rules, custom slash commands, and hooks that streamline our development workflow.
*   **Git Status:** This directory is **intentionally included in `.gitignore`**.

---

## 3. Best Practices for "Vibe Coding"

*   **Start with the Right Location:** Before creating a new document, ask: "Is this about the past, present, or future?"
    *   Past -> `/.journal/`
    *   Present -> `/docs`
    *   Future -> `/roadmaps`
*   **Code-Adjacent Docs First:** The best documentation lives as close to the code as possible. Use TSDoc comments for functions and components before writing a separate, long-form document.
*   **Embrace the Journal:** Use the `/.journal/` directory liberally for notes, logs, and temporary files. It's a safe, private space to think and record progress without cluttering the main project structure.
*   **Review and Refactor Docs:** Just like code, our documentation should be reviewed periodically. As we complete features from the `/roadmaps` directory, the relevant parts of `/docs` (like `USER-JOURNEYS.md`) should be updated to reflect the new reality.
