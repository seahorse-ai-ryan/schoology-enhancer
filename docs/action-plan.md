# Schoology Enhancer App - Action Plan

This document outlines the concrete steps we will take to build the Schoology Enhancer application. It is a living document that will be updated as we complete tasks and move through the development phases. Our workflow is documentation-driven, and this plan serves as our primary guide for execution.

## Guiding Principles

*   **Vibe Coding:** We use documentation to drive our development. The core of vibe coding is rapid, AI-driven iteration, which requires fast and reliable automated tests that run directly in the development environment.
*   **Test-Driven:** We commit to a test-first mentality. Our backend integration tests are the key to verifying complex flows like OAuth without manual intervention.

---

## **Phase 0: Foundation & Environment Setup**

**Goal:** Establish a robust, secure, and automated development environment.

**Priority:** High - This phase is a prerequisite for all other work.

### **Step 1: Cleanup & Strategy Update**

*   [ ] **Action:** Uninstall unused Playwright dependencies.
*   [ ] **Action:** Update all documentation to reflect the two-app (Dev/Prod) strategy for Schoology OAuth. (This is complete).

### **Step 2: GitHub & Repository Setup**

*   [ ] **Action:** Initialize a Git repository for this project.
*   [ ] **Action:** Create a new private repository on GitHub.
*   [ ] **Action:** Push the initial project structure to the GitHub repository.

### **Step 3: Firebase Project & Security (Completed)**

*   [x] **Action:** Set up the Firebase project and configure Firestore and Firebase Functions.
*   [x] **Action:** Store the Schoology **Consumer Key** and **Consumer Secret** in Google Secret Manager.
*   [x] **Action:** Create a dedicated service account (`firebase-functions-sa`) and grant it the **Secret Manager Secret Accessor** IAM role.

### **Step 4: Testing Framework Setup (Completed)**

*   [x] **Action:** Configure Vitest for unit testing.
*   [x] **Action:** Install and configure **Mock Service Worker (MSW)** for backend integration testing.
*   [x] **Action:** Create a setup file for MSW that initializes a mock server for our Vitest tests.

---

## **Phase 1: Schoology OAuth 1.0a & Data Sync**

**Goal:** Achieve a successful "hello world" demonstration validated by our automated backend integration tests.

### **Step 1: Test-Driven OAuth Implementation**

*   [ ] **Action:** Create a new test file: `schoology-auth.integration.spec.ts`.
*   [ ] **Action (in the test file):**
    1.  Set up MSW handlers to mock the Schoology API endpoints.
    2.  Write a test case named "should handle the full three-legged OAuth 1.0a flow".
    3.  Within the test, call your (not-yet-written) `/request_token` function.
    4.  Assert that it correctly calls the (mocked) Schoology API and returns the expected redirect URL.
    5.  Call your (not-yet-written) `/callback` function with the parameters Schoology would provide.
    6.  Assert that it correctly saves the final access token to the emulated Firestore.

### **Step 2: Implement the OAuth Handshake**

*   [ ] **Action:** Create a new Firebase Function (e.g., `schoology-auth`).
*   [ ] **Action:** Implement the `/request_token` and `/callback` logic until the integration test from Step 1 passes.

### **Step 3: "Hello World" - Fetching & Displaying Data**

*   [ ] **Action:** Create a new authenticated Firebase Function (e.g., `getSchoologyData`).
*   [ ] **Action:** Write an integration test for this function using MSW to mock the Schoology `/users/me` endpoint.
*   [ ] **Action:** On the frontend dashboard page, call the `getSchoologyData` function and display the raw JSON response.

---

## **Phase 2: "Week Ahead" Dashboard MVP**

*   [ ] **Action:** To be detailed further upon completion of Phase 1.
