# MVP Customer Support Plan

**Last Updated:** October 4, 2025
**Status:** Proposed

---

## 1. Guiding Principles

*   **Simplicity:** For the MVP, the support system must be simple to implement and manage for a solo developer.
*   **Responsiveness:** Provide a clear channel for users to report issues and receive acknowledgment.
*   **Data-Driven:** Automatically capture as much technical context as possible for bugs and performance issues.

---

## 2. Support Channels

### Channel 1: Proactive Bug & Crash Reporting (Automated)

**Tool:** Firebase Crashlytics

**Implementation:**
1.  Integrate the Firebase Crashlytics SDK into the Next.js application.
2.  All crashes will be automatically reported to the Firebase console.
3.  User identifiers will be attached to crash reports to allow for follow-up.

**Workflow:**
1.  Crash occurs on a user's device.
2.  Crashlytics automatically captures the stack trace, device state, and user ID.
3.  The report appears in the Firebase Crashlytics dashboard.
4.  The developer is automatically alerted to new, high-impact crashes.
5.  The developer can analyze the crash data to identify the root cause and prioritize a fix.

### Channel 2: User-Initiated Feedback & Bug Reports (Manual)

**Tool:** A simple "Contact Us" page that sends an email.

**Implementation:**
1.  Create a "Contact Us" or "Feedback" page within the application, accessible from the Settings page.
2.  The page will contain a simple form with:
    *   A dropdown to classify the feedback (`Bug Report`, `Feature Request`, `General Feedback`).
    *   A text area for the user's message.
3.  Submitting the form will trigger a `mailto:` link that opens the user's default email client, pre-populated with the support email address and the form contents.

**Email Details:**
*   **Support Address:** `support@modernteaching.com` (to be created).
*   **Pre-populated Subject:** "Modern Teaching Feedback: [Category]"
*   **Pre-populated Body:** The user's message, along with automatically appended debugging information (e.g., App Version, User ID, Browser/OS).

**Workflow:**
1.  A user encounters a non-crash bug or has a feature idea.
2.  They navigate to the "Contact Us" page.
3.  They fill out the form and click "Submit."
4.  Their email client opens with a pre-filled email.
5.  The user sends the email.
6.  The email arrives in the `support@modernteaching.com` inbox for review.

### Why `mailto:` for MVP?

*   **Simplicity:** It requires no backend infrastructure (like Cloud Functions or a third-party email service) to implement. It's a single line of frontend code.
*   **User Control:** The user has a clear record of what they sent in their "Sent" email folder.
*   **Low Cost:** There are no costs associated with sending the email.

This can be upgraded to a Cloud Function-triggered email system (using a service like SendGrid) post-MVP if volume increases.

---

## 3. Monitoring

### Performance Monitoring

**Tool:** Firebase Performance Monitoring

**Implementation:**
1.  Integrate the Performance Monitoring SDK.
2.  It will automatically track key performance metrics like page load times and network request latency.
3.  Custom traces will be added to monitor the performance of critical user flows (e.g., "time to load courses," "time to switch children").

**Workflow:**
1.  The SDK collects performance data from user devices.
2.  Data is aggregated in the Firebase Performance dashboard.
3.  The developer can identify performance bottlenecks (e.g., slow API routes, slow rendering components) and prioritize optimizations.

---

## 4. MVP Support and Response Strategy

*   **Triage:** All incoming support emails will be reviewed within 24 hours.
*   **Acknowledgment:** A reply will be sent to the user acknowledging receipt of their feedback.
*   **Prioritization:** Bugs will be prioritized based on severity and impact. Critical bugs (e.g., data loss, security issues) will be addressed immediately.
*   **Communication:** For significant bugs, affected users will be notified once a fix has been deployed.

This plan provides a simple yet effective way to handle customer support for the MVP, combining automated crash reporting with a direct, user-initiated feedback channel.


