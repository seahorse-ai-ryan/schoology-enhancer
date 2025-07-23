# **Schoology Enhancer App \- Architectural Plan**

This document outlines the architecture for the Schoology Enhancer application, with a focus on the development workflow within Firebase Studio.

## **1. System Overview**

*   **Frontend:** Next.js with React Server Components.
*   **Backend:** Firebase Functions (Node.js).
*   **Database:** Firestore.
*   **Testing:** Jest for backend integration tests, using the Firebase Emulator Suite and MSW for mocking.

## **2\. The Firebase Studio Development Workflow: The "Two Servers" Model**

Developing a full-stack application in Firebase Studio requires understanding how the frontend and backend development servers work together.

1.  **Backend Server (Automatic):**
    *   **Service:** The Firebase Emulator Suite (Functions, Firestore, Hosting).
    *   **How it Runs:** It is configured in `.idx/dev.nix` to start **automatically** as a background service when the workspace loads. We do not run `firebase emulators:start` in the terminal.
    *   **Purpose:** It runs our compiled backend functions, simulates our database, and, most importantly, the **Hosting Emulator** acts as the main entry point, proxying requests to the correct service using the `rewrites` in `firebase.json`.

2.  **Frontend Server (Manual):**
    *   **Service:** The Next.js development server (`npm run dev`).
    *   **How it Runs:** It is started manually by the user via the **"Preview" button** in the IDE's bottom bar. This opens the UI in an IDE tab.
    *   **Purpose:** It provides the fast, modern frontend development experience with features like Hot Reload.

3.  **Manual Testing Workflow:**
    *   To test the full application, we start both servers.
    *   The correct URL for testing is the one for the **Hosting Emulator (port 5000)**, which is found in the "BACKEND PORTS" panel. This URL correctly routes both frontend and backend requests.

## **3\. Key Project Boundaries**

*   **No Browser E2E Testing in Studio:** Full browser E2E tests are not runnable in the Studio container.
*   **Backend Testing is Node-Native:** We use Jest, not Vite, for our backend code.

## 4. Environment Reloading
*   Changes to the deep environment configuration in `.idx/dev.nix` require a full reload of the workspace via the Command Palette: **"Firebase Studio: Hard Restart"**.
