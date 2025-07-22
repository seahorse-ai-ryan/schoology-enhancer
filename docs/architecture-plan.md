# **Schoology Enhancer App \- Architectural Plan**

This document outlines the architecture for a web application integrating with Schoology via OAuth 1.0, utilizing Firebase Studio, GitHub, and Google Cloud services for development, deployment, and secure operation. It focuses on the technical structure and environment setup.

## **1\. System Overview**

The following systems are involved in the application's architecture:

* **Web Application (Frontend):** User interface for your application, providing a clean, intuitive, and responsive interface for web and mobile.  
  * **Technology Stack:** React (with Vite) or SvelteKit.  
  * **Styling:** Tailwind CSS.  
* **Firebase Functions (Backend):** Server-side logic for handling Schoology OAuth 1.0 handshake and secure API calls.  
  * **Technology Stack:** Node.js (with Express.js).  
* **Firestore Database:** Primary data store for user information and a fast cache for Schoology records.  
* **Schoology API:** The third-party service providing user authentication and data (calendar, course materials, assignments, tests, events).  
* **Firebase Studio:** Cloud-based integrated development environment (IDE) for coding, testing, and deployment.  
* **GitHub:** Source code repository and central point for continuous integration/continuous deployment (CI/CD).  
* **Google Cloud Project:** The underlying cloud infrastructure hosting Firebase services.  
  * **Google Secret Manager:** Secure storage for sensitive OAuth keys.  
  * **IAM (Identity and Access Management):** Manages permissions for users and service accounts.  
* **AI Agents (Gemini 2.5 Pro, Gemini CLI, Cursor):** Used for code generation, debugging, and workflow automation.  
* **Playwright:** End-to-end (E2E) browser automation framework for testing.

## **2\. OAuth 1.0 Integration Strategy (Schoology)**

The application will implement the Schoology OAuth 1.0 "three-legged" authentication flow.

### **2.1. OAuth Flow Steps**

1. **Request Token:** Your backend (Firebase Function) initiates a request to Schoology to obtain a temporary "Request Token." This request must be signed using your application's Consumer Key and Secret.  
2. **User Authorization:** Your frontend redirects the user to Schoology's authorization URL, passing the Request Token. The user logs into Schoology (if not already) and grants your application permission.  
3. **Callback & Access Token:** Schoology redirects the user back to your application's registered **Callback/Redirect URI**, including the authorized Request Token and a Verifier. Your backend then exchanges these for a permanent "Access Token" and Access Token Secret. This Access Token pair is used for all subsequent authenticated API calls to Schoology.

### **2.2. Key Management with Google Secret Manager**

* **Schoology OAuth Consumer Key:** Stored securely in Google Secret Manager.  
* **Schoology OAuth Consumer Secret:** Stored securely in Google Secret Manager.  
* **Access Token & Access Token Secret (per user):** These will be obtained after a successful OAuth flow and must be securely stored in Firestore, encrypted at rest, and linked to the user's profile.

**Accessing Secrets in Firebase Functions:**

* Use firebase functions:secrets:set \<SECRET\_NAME\> via the Firebase CLI to store secrets in Google Secret Manager.  
* In Firebase Functions code, reference secrets using defineSecret and runWith({ secrets: \[...\] }) to ensure secure injection as environment variables at runtime.

### **2.3. Redirect URI Challenge**

OAuth 1.0 requires a fixed, pre-registered Redirect URI.

* **Solution:** Utilize **Firebase Hosting Preview Channels** with a **custom domain** (or a wildcard DNS setup like \*.preview.your-app.com).  
  * Register https://dev-oauth.your-app.com/auth/schoology/callback (or similar) with Schoology.  
  * Deploy specific feature branches to Firebase Hosting Preview Channels (e.g., feature-x--\<hash\>.web.app).  
  * Configure your DNS (e.g., Cloudflare) to point dev-oauth.your-app.com to the Firebase Hosting Preview Channel's dynamic URL, or use a wildcard for all preview channels. This provides a consistent, fixed domain for Schoology's redirect, even if the underlying Firebase Hosting preview URL changes.

## **3\. Data Management (Firestore)**

Firestore will serve as the primary database for your application.

### **3.1. User Information**

* Store core user profiles in Firestore, linked to their Schoology user ID.  
* Securely store encrypted Schoology Access Tokens and Access Token Secrets associated with each user's profile in Firestore.

### **3.2. Schoology Data Cache**

* **Purpose:** Minimize API calls to Schoology and provide fast access to frequently used data.  
* **Data Stored:** Copies of Schoology records (e.g., courses, assignments, grades, submissions). This will support features like a unified "Week Ahead" view.  
* **Update Strategy:**  
  * Perform initial full syncs when a user connects or on demand.  
  * Implement **incremental updates** using Schoology's API (if available, e.g., last modified timestamps, webhooks) to fetch only changes, not full datasets.  
  * Use Firebase Functions to manage these sync processes (triggered by user actions, schedules, or webhooks from Schoology if supported).  
* **User-Created Data:** Firestore will also store user-created planning data (custom to-do items, sub-tasks associated with Schoology assignments) for the "Proactive Planner" phase.

### **3.3. Firestore Security Rules**

* Implement strict Firestore Security Rules to ensure:  
  * Users can only read/write their own data.  
  * Sensitive data (like encrypted OAuth tokens) is protected.  
  * Firebase Functions have appropriate read/write permissions for data sync.

## **4\. Development & Testing Workflow**

### **4.1. Primary Development Environment**

* **Firebase Studio:** All core development will happen here. It provides a browser-based IDE, terminal access, and integrated Firebase tools.  
* **GitHub:** All code changes are committed and pushed to GitHub, serving as the central version control system.

### **4.2. Automated Testing Strategy**

* **Unit Tests:**  
  * **Scope:** Individual Firebase Functions, frontend components (React, etc.), utility functions.  
  * **Tools:** Jest, Vitest (for JavaScript/TypeScript).  
  * **Execution:** Run within Firebase Studio's terminal or as part of CI/CD.  
* **Integration Tests:**  
  * **Scope:** Interactions between Firebase Functions and Firestore, or between frontend components and Firebase Functions.  
  * **Tools:** Firebase Emulator Suite (for mocking Firebase services locally/in CI), standard testing frameworks.  
  * **Execution:** Run within Firebase Studio's terminal or CI/CD.  
* **End-to-End (E2E) Tests:**  
  * **Scope:** Full user flows, including Schoology OAuth 1.0, data fetching, and UI interactions. These tests will verify user stories like seeing all assignments on a dashboard and distinguishing work status.  
  * **Tools:** Playwright.  
  * **Execution:** Run Playwright tests from Firebase Studio's terminal or within CI/CD.

### **4.3. Dev vs. Prod Builds**

* **Configuration:** Maintain separate configuration files or environment variables for development (e.g., test Schoology API credentials, staging Redirect URI) and production (production Schoology API credentials, production Redirect URI).  
* **Deployment:** Use Firebase CLI commands (e.g., firebase deploy \--only hosting \--except functions or firebase deploy \--only functions) with environment-specific flags or .env files (for non-secrets) to ensure correct configuration for each environment.

### **4.4. Third-Party API Stubbing/Mocking**

Crucial for efficient and reliable testing without hitting the real Schoology API.

* **Playwright Network Interception:**  
  * **Purpose:** For E2E tests, intercept network requests made by your frontend to the Schoology API (via your Firebase Functions backend).  
  * **Method:** Use Playwright's page.route() to intercept requests to your Firebase Function endpoints that call Schoology. Return mocked responses directly from the Playwright test, simulating different Schoology API states (e.g., successful data fetch, API errors, empty data).  
* **Firebase Emulators:**  
  * **Purpose:** Mock Firebase services (Firestore, Functions, Auth) for local/CI testing without incurring cloud costs or affecting live data.  
  * **Method:** Run firebase emulators:start. Your Firebase Functions will interact with the local emulated Firestore, and your frontend can connect to the emulated Functions.  
* **Dedicated Mock Server (for Schoology API calls from Functions):**  
  * **Purpose:** For integration tests of your Firebase Functions that call Schoology, you need to mock the *Schoology API itself*.  
  * **Method:** Implement a simple mock server (e.g., a small Node.js Express app, or a library like Mock Service Worker for Node.js) that runs locally (or in CI) and simulates Schoology's OAuth 1.0 and data API responses. Your Firebase Functions would be configured (via environment variables) to point to this mock server's URL in dev/test environments.

### **4.5. CI/CD (GitHub Actions)**

* Set up GitHub Actions to:  
  * Run unit and integration tests on every push to a branch.  
  * Run E2E Playwright tests on pushes to feature branches and Pull Requests.  
  * Deploy to Firebase Hosting Preview Channels on Pull Request creation/updates.  
  * Deploy to production Firebase Hosting/Functions on merge to main (or master).

## **5\. IAM Permissions**

The **project administrator** (e.g., \[YOUR\_ADMIN\_EMAIL\]) will require the following Google Cloud IAM roles on the project:

* **Owner / Editor:** For full administrative control over Firebase and Google Cloud resources.  
* **Secret Manager Admin (roles/secretmanager.admin):** To create, manage, and grant access to secrets in Google Secret Manager.  
* **Cloud Functions Developer (roles/cloudfunctions.developer):** To deploy and manage Firebase Functions.  
* **Firebase Admin SDK Administrator Service Agent (roles/firebase.admin.sdkServiceAgent):** For Firebase Admin SDK operations within functions.  
* **Service Account User (roles/iam.serviceAccountUser):** To impersonate service accounts (e.g., for Firebase Functions).

The **Firebase Functions runtime service account** (e.g., your-project-id@appspot.gserviceaccount.com) will require:

* **Secret Manager Secret Accessor (roles/secretmanager.secretAccessor):** To read the Schoology OAuth keys from Secret Manager.  
* **Cloud Datastore User (roles/datastore.user) / Cloud Firestore User (roles/datastore.viewer or roles/datastore.editor):** To read/write data in Firestore.  
* **Cloud Functions Invoker (roles/cloudfunctions.invoker):** If other services or users need to trigger your functions.

## **6\. Future Considerations (TODO)**

* **Local Dev Environment Sync:** Establish a robust workflow for syncing the Firebase Studio project with a local development environment on a MacBook Pro using Cursor. This will involve ensuring consistent environment variables, dependencies, and potentially local emulator setups.