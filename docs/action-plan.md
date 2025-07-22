# Schoology Enhancer App - Action Plan

This document outlines the concrete steps we will take to build the Schoology Enhancer application. It is a living document that will be updated as we complete tasks and move through the development phases. Our workflow is documentation-driven, and this plan serves as our primary guide for execution.

## Guiding Principles

*   **Open Source:** This is a public, open-source project. All work should be done with the understanding that it will be visible to the community. This requires a high standard of documentation, security (no committed secrets), and clear contribution guidelines.
*   **Vibe Coding:** We use documentation to drive our development. The core of vibe coding is rapid, AI-driven iteration, which requires fast and reliable automated tests that run directly in the development environment.
*   **Test-Driven:** We commit to a test-first mentality. Our backend integration tests are the key to verifying complex flows like OAuth without manual intervention.

---

## **Phase 0: Foundation & Environment Setup**

**Goal:** Establish a robust, secure, and automated development environment suitable for an open-source project.

### **Step 1: Project Setup for Open Source (Completed)**
*   [x] **Action:** Cleaned up legacy files and simplified the project structure.
*   [x] **Action:** Created a comprehensive `.gitignore` file.
*   [x] **Action:** Added an MIT `LICENSE` file.
*   [x] **Action:** Created a high-quality `README.md` for contributors.

### **Step 2: GitHub & Repository Setup**
*   [ ] **Action:** Initialize a Git repository for this project.
*   [ ] **Action:** Create a new **public** repository on GitHub.
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
// Remainder of the plan is unchanged...
