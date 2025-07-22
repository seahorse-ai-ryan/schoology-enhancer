# Schoology Enhancer App - Project Plan

## 1. Project Vision & Goals

The primary goal is to create a new, modern application that acts as a superior client for the Schoology platform. The existing Schoology interface is often cited as having a poor user experience. This project aims to fix that by providing a clean, intuitive, and responsive interface for web and mobile.

**Core Objectives:**

*   **Improved User Experience:** Deliver a user-centric design that makes navigating courses, assignments, and grades effortless.
*   **Proactive Planning Tools:** Move beyond simply displaying information. The app will empower students, parents, and teachers to proactively plan their time, break down large assignments, and avoid last-minute stress.
*   **Modern & Responsive:** The application must work beautifully on both desktop and mobile devices.
*   **Read-Only First, Then Write:** We will start by focusing on displaying data from the Schoology API, then progressively add features that allow users to create and manage their own planning data.

## 2. Guiding Principles

This is an experimental, single-person project. Our process should reflect that.

*   **Vibe Coding:** We will use a documentation-driven approach. A `PRODUCT_REQUIREMENTS.md` will define *what* we're building, this `PLAN.md` will define *how*, and a `LOG.md` will track our journey. This separates ideation from implementation.
*   **Iterate Quickly:** Start small, prove the core concept (API authentication), and build outwards. Each phase should deliver tangible value.
*   **Local First:** All development will be done locally to start. We will plan for an eventual move to a public repository on GitHub.
*   **User-Centric:** Every feature decision should be weighed against the primary goal: does this make life easier and less stressful for the user?

## 3. Proposed Technology Stack

The sample application uses PHP, but for a modern, interactive UI, a JavaScript-based stack is recommended.

*   **Frontend:** **React (with Vite)** or **SvelteKit**.
    *   *Why?* They are excellent for building modern, fast, and interactive user interfaces. Vite provides a fantastic, fast development experience. SvelteKit is also a strong contender for its simplicity and performance. We can finalize this choice before coding begins.
*   **Backend:** **Node.js (with Express.js)**.
    *   *Why?* To handle the Schoology API authentication (OAuth 1.0a is tricky on the client-side and exposes secrets), we need a backend proxy. Node.js is a natural fit for a JS frontend, keeping the language context consistent.
*   **Database:** **SQLite**.
    *   *Why?* As per the Schoology documentation, we need to store user OAuth tokens. SQLite is a simple, file-based database that requires no separate server, making it perfect for local development. It's easy to migrate to a more robust database like PostgreSQL later if needed.
*   **Styling:** **Tailwind CSS**.
    *   *Why?* It's a utility-first CSS framework that allows for rapid, modern UI development without writing custom CSS.

## 4. Phased Rollout Plan

### Phase 0: Foundation & Authentication (The First Step)

This is the most critical and foundational phase. The goal is to successfully authenticate with the Schoology API and prove we can retrieve data.

*   **Tasks:**
    1.  Initialize the project structure (Vite/React or SvelteKit frontend, Node/Express backend).
    2.  Implement the server-side logic to handle the Schoology OAuth 1.0a three-legged authentication flow. This will be our biggest initial technical hurdle.
    3.  Create a simple database schema with SQLite to store the `oauth_token` and `oauth_token_secret` for users.
    4.  Create a minimal UI with a "Login with Schoology" button.
    5.  Upon successful authentication, fetch the user's profile and a list of their courses from the `/users/me/sections` endpoint.
    6.  Display the raw course list data on the page to confirm the end-to-end connection works.

### Phase 1: The "Week Ahead" Dashboard (Core Read-Only MVP)

With authentication solved, we'll build the core read-only experience.

*   **Tasks:**
    1.  Design a clean, modern dashboard layout.
    2.  Fetch all upcoming assignments, events, and assessments for the user's courses.
    3.  Create a "Week Ahead" view that presents this information in an easy-to-digest format.
    4.  Implement a clear navigation structure to switch between courses.
    5.  Ensure the layout is fully responsive.

### Phase 2: The Planner (Interactive Features)

This is where we introduce the app's signature feature: proactive planning.

*   **Tasks:**
    1.  Design the data model for user-created "plans" or "tasks".
    2.  Build UI components that allow users to create a study plan associated with a specific assignment (e.g., "Draft outline on Monday", "Write first draft on Wednesday").
    3.  Integrate these user-created plans into the "Week Ahead" dashboard.
    4.  Expand the database to store this new planning data.

## 5. Project Documentation & Workflow

To support the "vibe coding" methodology, we will maintain the following files:

*   `PLAN.md` (this file): The strategic and technical plan. We will update this as our approach evolves.
*   `PRODUCT_REQUIREMENTS.md` (to be created): A high-level document outlining features, user stories, and success metrics. This is where you, as the product manager, will primarily live.
*   `TODO.md` (to be created): A simple, checkbox-based list of immediate tasks to keep development focused.
*   `LOG.md` (to be created): A developer journal to log progress, key decisions, and learnings. This is invaluable for tracking the "why" behind our work.

## 6. Next Steps & Information Needed

Before we proceed to Phase 0, I'll need some information from you. We don't need to act on this immediately, but please have it ready.

*   **Technology Preference:** Do you have a preference between **React** and **SvelteKit** for the frontend? If not, I recommend we start with React due to its larger ecosystem.
*   **Schoology API Credentials:** You will need to register an application with Schoology to get a **Consumer Key** and **Consumer Secret**. These will be required to implement the OAuth flow. Please keep them secure and do not share them in a public repository.
*   **Top 3 Pain Points:** What are the top 3 most frustrating things about the current Schoology user experience that you want this app to solve first? This will help guide the design of the Phase 1 dashboard. 