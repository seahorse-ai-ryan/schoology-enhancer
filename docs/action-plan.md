# Schoology Enhancer App - Action Plan

This document outlines the concrete steps we will take to build the Schoology Enhancer application, following best practices for the Firebase Studio environment.

## Guiding Principles

- **Open Source:** This is a public, open-source project.
- **Test-Driven:** We commit to a test-first mentality. Our backend integration tests are the key to verifying complex flows without manual intervention.
- **AI-Ready:** Our data architecture is designed for LLM processing, RAG applications, and semantic search.

---

## **Phase 0: Foundation & Environment Setup (Completed)**

**Goal:** Establish a robust, secure, and automated development environment suitable for Firebase Studio.

### **Step 1: Project Setup for Open Source (Completed)**

- [x] Cleaned up legacy files, created `.gitignore`, `LICENSE`, and `README.md`.

### **Step 2: GitHub & Repository Setup (Completed)**

- [x] Pushed the initial project to a public GitHub repository.

### **Step 3: Firebase Project & Security (Completed)**

- [x] Stored Schoology API credentials in Google Secret Manager and configured IAM.

### **Step 4: Testing Framework Reset (Completed)**

- [x] Uninstalled Vitest.
- [x] Installed and configured **Jest** as our backend test runner.
- [x] Installed and configured **MSW** for API mocking within the Jest environment.
- [x] Configured Jest to work with the Firebase Emulator Suite.

---

## **Phase 1: Schoology OAuth 1.0a & Data Sync (Completed)**

**Goal:** Achieve a successful "hello world" demonstration validated by our new, robust automated testing suite.

### **Step 1: Test-Driven OAuth Implementation with Jest (Completed)**

- [x] Refactored `schoology-auth.integration.spec.ts` to use the centralized MSW mocking setup.
- [x] Verified that the test calls `requestToken` and `callback` functions.
- [x] Confirmed that the test asserts correct interaction with the emulated Firestore database.

### **Step 2: Implement the OAuth Handshake (Completed)**

- [x] Confirmed the logic in `src/functions/schoology-auth.logic.ts` is correct and passes all tests.

---

## **Phase 2: Modern Data Architecture & UI Foundation (Completed)**

**Goal:** Create a beautiful, responsive user interface with modern, LLM-optimized data structures.

### **Step 1: Modern Data Architecture (Completed)**

- [x] Redesigned all data interfaces to be LLM-friendly and RAG-optimized.
- [x] Added rich metadata, semantic fields, and AI optimization capabilities.
- [x] Implemented embedding fields, semantic keywords, and AI-generated summary fields.
- [x] Created protocol buffer-compatible interfaces while maintaining backward compatibility.

### **Step 2: Beautiful UI Components (Completed)**

- [x] Built responsive dashboard with Shadcn/ui components.
- [x] Implemented data source indicators (Mock/Cached/Live).
- [x] Created comprehensive course, assignment, and announcement displays.
- [x] Added loading states and error handling.

### **Step 3: Data Caching Strategy (Completed)**

- [x] Implemented Firestore-based caching for performance.
- [x] Created fallback to mock data for testing and development.
- [x] Added data quality and sync status tracking.

---

## **Phase 3: Hello World Journeys (MCP-first)**

**Goal:** Complete the OAuth flow with comprehensive testing and real user experience validation.

### **Step 1: Test Infrastructure Improvements (Completed)**

- [x] Created robust test runner scripts that don't hang inline chat.
- [x] Added `npm run test:simple` and `npm run test:runner` commands.
- [x] Set up MSW browser integration for API mocking.

### **Step 2: MCP-Driven Smoke**

- [ ] Add/verify `data-testid` and console event hooks.
- [ ] Create MCP scripts or agent prompts to navigate landing → demo → dashboard → switch → logout.
- [ ] Use DevTools network listing to confirm requests and provenance.

Terminal Policy

- One persistent terminal per service: “npm run” for Next.js; “firebase emulators:start” for emulators; “ngrok http 9000” for tunneling.
- To restart Next.js, stop in the existing “npm run” terminal (Ctrl+C) and run `npm run dev` again. Do not spawn new terminals.

### **Step 3: OAuth Flow Testing (Pending, uses oauth-1.0a)**

- [ ] Test login button visibility and functionality.
- [ ] Verify OAuth redirect flow to Schoology.
- [ ] Test callback handling and user session creation.
- [ ] Validate dashboard data display after authentication.

---

## **Phase 4: Live API Integration & Production Readiness (Pending)**

**Goal:** Connect to live Schoology API and prepare for production deployment.

### **Step 1: Live Schoology API Integration (Pending)**

- [ ] Implement live API calls to Schoology endpoints.
- [ ] Add real-time data synchronization.
- [ ] Implement proper error handling for API failures.

### **Step 2: Production Security & Deployment (Pending)**

- [ ] Configure production Firebase project.
- [ ] Set up production Secret Manager integration.
- [ ] Implement proper authentication and authorization.
- [ ] Deploy to Firebase Hosting and Functions.

---

## **Phase 5: AI-Powered Features & Advanced Analytics (Future)**

**Goal:** Leverage our modern data architecture to provide intelligent insights and recommendations.

### **Step 1: LLM Integration (Future)**

- [ ] Implement embedding generation for course content.
- [ ] Add semantic search capabilities.
- [ ] Create AI-generated study recommendations.

### **Step 2: Advanced Analytics (Future)**

- [ ] Build learning analytics dashboard.
- [ ] Implement predictive deadline management.
- [ ] Add performance tracking and insights.

---

## **Current Status & Next Steps**

### **Immediate Priority (This Session)**

1. **Restart Next.js in existing terminal** to clear 404’d chunk URLs; avoid new terminals.
2. **Complete OAuth Testing**: Verify the end-to-end authentication flow works correctly.
3. **Dashboard Data Display**: Ensure all components render properly with mock data.

### **Technical Debt & Improvements**

- [ ] Fix remaining linter errors in `src/lib/schoology-data.ts`.
- [ ] Optimize MSW handlers for better test performance.
- [ ] Add comprehensive error boundaries and fallback UI.

### **Success Metrics**

- [x] All Jest backend tests passing (`npm run test:emu`).
- [ ] All Playwright E2E tests passing (`npm run test:simple`).
- [ ] Complete OAuth flow working end-to-end.
- [ ] Dashboard displaying data with proper source indicators.

---

**Last Updated:** 2025-07-27  
**Current Phase:** Phase 3 - End-to-End Testing & OAuth Flow  
**Next Milestone:** Complete MSW integration and OAuth flow testing
