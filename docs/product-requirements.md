# Product Requirements Document (PRD) - Schoology Enhancer

## 1. Problem Statement

The official Schoology application makes it difficult for students, parents, and teachers to get a clear, consolidated view of upcoming work. Navigating between different courses to find assignments, tests, and due dates is cumbersome and time-consuming. This lack of a centralized, actionable dashboard leads to confusion, missed assignments, and increased stress. The current system is reactive, showing what is past-due, rather than empowering users to be proactive.

As evidenced by user feedback, the key issues are:
*   Excessive navigation required to build a mental map of one's workload.
*   Difficulty tracking overdue assignments, retakes, and current work simultaneously.
*   Absence of any tools for planning or breaking down large assignments.

## 2. User Stories & Features

This document outlines the features we will build to address these problems.

### Phase 1: The "Week Ahead" Dashboard (Core MVP)

The goal of the MVP is to solve the primary problem of information visibility.

*   **User Story:** As a student/parent, I want to see all my assignments, tests, and events from all my courses on a single, clean dashboard so that I can quickly understand my workload for the upcoming week.
    *   **Feature:** A unified "Week Ahead" view that aggregates all dated items from the Schoology calendar and course materials.
    *   **Feature:** Clear visual distinction between item types (assignment, test, event).
    *   **Feature:** Prominent display of due dates and times.

*   **User Story:** As a student/parent, I want to easily distinguish between overdue, current, and future work so I can prioritize effectively.
    *   **Feature:** Visual cues (e.g., color-coding, icons) to flag overdue items.
    *   **Feature:** A toggle or filter to show/hide completed or past-due items.

### Phase 2: Proactive Planner

The goal of Phase 2 is to introduce write-capabilities that help with planning and time management.

*   **User Story:** As a student, when I see a large project or essay, I want to break it down into smaller, manageable sub-tasks with my own deadlines so that I can plan my work and avoid last-minute cramming.
    *   **Feature:** An in-app "Planner" tool.
    *   **Feature:** Allow users to create custom to-do items or sub-tasks associated with a specific Schoology assignment.
    *   **Feature:** Integrate these user-created tasks directly into the "Week Ahead" dashboard.

## 3. Success Metrics

*   **Primary:** Users can formulate a clear plan for their week within 90 seconds of opening the app.
*   **Secondary:** Reduced instances of "Missing" assignments for users who actively use the planning features.
*   **Qualitative:** Users report feeling more organized and less stressed about their schoolwork.

## 4. Technical Considerations

This application will be developed within Firebase Studio, leveraging a modern JavaScript ecosystem to achieve our goals.

*   **Frontend:** A responsive single-page application built with **Next.js** and styled with **Tailwind CSS**.
*   **Backend:** Server-side logic will be handled by **Firebase Functions** (Node.js) to manage the Schoology OAuth 1.0a handshake and all subsequent secure API calls.
*   **Database:** **Firestore** will be our primary database for storing user profiles, encrypted Schoology API tokens, and cached Schoology data (courses, assignments, etc.) to ensure fast load times and a seamless user experience.
*   **Authentication:** The primary authentication method will be Schoology's OAuth 1.0a flow. We will manage the complexities of this, including the secure storage of user-specific access tokens.
*   **Development & Testing:**
    *   **IDE:** Firebase Studio will be the primary development environment.
    *   **Version Control:** Git, with a central repository on GitHub.
    *   **Testing:** We will maintain a comprehensive testing suite, including:
        *   **Unit/Integration Tests** using Vitest.
        *   **End-to-End (E2E) Tests** using Playwright to validate full user flows.
        *   **Firebase Emulators** will be used for local development and testing to simulate a live environment without affecting production data.
    *   **API Mocking:** We will mock Schoology API responses during testing to ensure reliable and fast test runs without depending on the external service.
*   **Deployment:** We will utilize Firebase Hosting for the frontend and Firebase Functions for the backend. A CI/CD pipeline using **GitHub Actions** will be set up to automate testing and deployments, with distinct workflows for development (preview channels) and production environments.
*   **Security:** Sensitive credentials, such as the Schoology application Consumer Key and Secret, will be stored securely in **Google Secret Manager** and accessed by Firebase Functions at runtime, never exposed on the client-side.
