# Schoology Enhancer App - Action Plan

This document outlines the concrete steps we will take to build the Schoology Enhancer application, following best practices for the Firebase Studio environment.

## Guiding Principles

*   **Open Source:** This is a public, open-source project.
*   **Test-Driven:** We commit to a test-first mentality. Our backend integration tests are the key to verifying complex flows without manual intervention.

---

## **Phase 0: Foundation & Environment Setup (Completed)**

**Goal:** Establish a robust, secure, and automated development environment suitable for Firebase Studio.

### **Step 1: Project Setup for Open Source (Completed)**
*   [x] Cleaned up legacy files, created `.gitignore`, `LICENSE`, and `README.md`.

### **Step 2: GitHub & Repository Setup (Completed)**
*   [x] Pushed the initial project to a public GitHub repository.

### **Step 3: Firebase Project & Security (Completed)**
*   [x] Stored Schoology API credentials in Google Secret Manager and configured IAM.

### **Step 4: Testing Framework Reset (Completed)**
*   [x] Uninstalled Vitest.
*   [x] Installed and configured **Jest** as our backend test runner.
*   [x] Installed and configured **MSW** for API mocking within the Jest environment.
*   [x] Configured Jest to work with the Firebase Emulator Suite.

---

## **Phase 1: Schoology OAuth 1.0a & Data Sync (Completed)**

**Goal:** Achieve a successful "hello world" demonstration validated by our new, robust automated testing suite.

### **Step 1: Test-Driven OAuth Implementation with Jest (Completed)**

*   [x] Refactored `schoology-auth.integration.spec.ts` to use the centralized MSW mocking setup.
*   [x] Verified that the test calls `requestToken` and `callback` functions.
*   [x] Confirmed that the test asserts correct interaction with the emulated Firestore database.

### **Step 2: Implement the OAuth Handshake (Completed)**

*   [x] Confirmed the logic in `src/functions/schoology-auth.logic.ts` is correct and passes all tests.

---
// Remainder of plan is unchanged
