# **Schoology Planner \- UX Design & User Journeys**

## **1\. Vision & Core Principles**

**Vision:** To transform the Schoology experience from a passive, fragmented data repository into a proactive, intelligent, and motivating platform for students and parents.

**Core Principles:**

* **Consolidated & Actionable:** Bring the most important information to the forefront. Never require more than one click to see what's due, what's graded, and what's coming up.  
* **Proactive over Reactive:** Shift the focus from what's "overdue" to "what's my plan?" Empower users to plan their work, not just react to deadlines.  
* **Smart & Personalized:** Leverage AI to provide summaries, insights, and conversational access to data.  
* **Motivating & Goal-Oriented:** Integrate tools for parents and students to set and track academic goals and incentives.  
* **Holistic & Integrated:** Understand that school is just one part of a student's life. Integrate with external calendars to provide a complete picture.  
* **Fast & Simple First:** The user experience must be intuitive, uncluttered, and performant, especially on mobile devices.

## **2\. Competitive Landscape & User Feedback**

A review of public user feedback on Schoology and competing apps like Bessy reveals clear patterns.

### **Specific Schoology Pain Points (The "Gripes List")**

* **UI & Navigation ("Click Fatigue"):**  
  * **"Looks like it hasn't been updated in 20 years."** The UI is universally seen as dated, bland, and unintuitive.  
  * **"Why do I have to click 5 times to see my grade?"** Core information is buried in deeply nested menus and tabs.  
  * **"The assignments are just squished together on a sidebar."** There is no consolidated, cross-course view of what's due. Users have to enter each course individually to build a mental map of their workload.  
  * **"I can't even find my teacher's email."** Basic contact and communication features are difficult to locate.  
* **The Mobile App Experience:**  
  * **"The app is essentially useless."** It's plagued by bugs, crashes, and is significantly less functional than the website.  
  * **"You can no longer scroll down."** A recent bug makes basic navigation impossible, with slight movements causing the app to switch tabs erratically.  
  * **"Tapping on my courses just doesn't work anymore."** Core features are frequently broken.  
  * Parents can't easily switch between children. This is a major point of friction for families with multiple students in the system.  
* **Grading & Submission Workflows:**  
  * **"You can't delete submissions you didn't mean to send."** There is no way to retract or correct a mistaken submission.  
  * **"The assignment gets all messed up when submitted."** Formatting for submitted documents (Google Docs, Word) is often broken upon upload.  
  * Grading is slow and janky for teachers. This trickles down to a poor experience for students waiting for feedback.  
  * Grade sync issues between Schoology and the official Student Information System (SIS) cause confusion about which grade is "correct."  
* **Communication & Notifications:**  
  * **"I can't search my messages."** The messaging system is described as "terrible," lacking basic features like search, making it impossible to find past conversations.  
  * **"The app didn't send me a notification."** Critical notifications for important messages or new grades often fail to deliver.  
  * **"Phantom notifications."** The app will show a badge for a new notification, but it disappears when clicked, leaving the user unsure of what they missed.

### **Bessy Strengths & Weaknesses**

* **Loved for Simplicity:** Bessy's success stems from doing one thing exceptionally well: providing a clean, fast, and easy-to-understand view of all grades.  
* **"What If" is the Killer Feature:** The ability to calculate how future grades will impact their overall average is the primary reason students use the app.  
* **Limited Scope:** Users often request features beyond grade tracking, highlighting the opportunity for a more comprehensive tool.

**Our Opportunity:** We can win by directly solving the specific gripes listed above. We will combine the grade-tracking clarity of Bessy with the proactive planning features users wish Schoology had, all wrapped in a superior, reliable, mobile-first UX.

## **3\. Guiding Principles: User vs. Account Data**

* **Account-Level Data:** Changes are visible to **all users** associated with the student's account (student, parents, and potentially teachers). This is the "single source of truth."  
  * *Example:* Manually editing the estimated time commitment for an assignment.  
* **User-Level Preferences:** Changes are **only visible to the user who made them**. This allows for personalized views without altering the core data for others.  
  * *Example:* Carter dismissing an overdue "PE Training" notification, which his parent, Ryan, might still want to see.

## **4\. User Personas**

1. **Carter (The Student):** A high school student juggling multiple AP classes, extracurriculars, and a social life. He is frustrated by Schoology's mobile app and just wants to know what he needs to do and what his grades are without a scavenger hunt.  
2. **Ryan (The Parent):** Carter's parent. Ryan wants to support Carter's academic success. He needs a high-level overview of Carter's performance (grades, attendance) and a simple way to set up incentives without having to navigate the confusing Schoology interface.

## **5\. Key User Journeys & Feature Breakdown**

### **Journey 1: The "What's My World?" Dashboard**

**Problem:** The current Schoology landing page is a disjointed, noisy feed that doesn't provide a clear, prioritized overview, especially on mobile.

**Our Solution:** A clean, customizable, mobile-first command center with actionable widgets.

* **Upcoming Assignments (The "Hit List"):**  
  * A consolidated, multi-course view of all upcoming work.  
  * Custom date range filters (this week, next week, this month, custom span).  
  * **(User-Level)** Ability to dismiss/hide individual items (e.g., non-essential "PE Training" reminders). A "View Hidden" toggle and change log will be available.  
  * **AI Feature:** AI-estimated time commitment and difficulty level displayed for each item.  
* **Grades At-a-Glance:**  
  * A clean, Bessy-style list of all courses with current grades prominently displayed.  
  * A "Total GPA" or "Overall Average" calculation.  
  * Supports three grade types: **Official** (from Schoology), **Unofficial** (temporary student entry), and **"What If" Scenarios** (grade calculator).  
  * **(User-Level)** Ability to flag problematic assignments (e.g., pending a retake).  
* **Workload Summary:**  
  * A summary card showing, "You have an estimated **6.5 hours** of work this week," based on AI estimates and manual overrides.  
* **Smart Notifications Hub:**  
  * A dedicated, chronological feed for notifications that matter.  
  * **(User-Level)** Granular control over notification preferences (e.g., "Alert me 2 days before a project is due").

### **Journey 2: Proactive Planning & The "Smart Assignment"**

**Problem:** An assignment in Schoology is just a deadline. It doesn't help students with executive function challenges break down work or plan their time.

**Our Solution:** Treat every assignment as a mini-project that can be broken down into actionable sub-tasks.

* **Sub-Task Creation:** Any assignment can be expanded to add sub-tasks (e.g., "Study for Bio Test" becomes "1. Review Chapter 5", "2. Make flashcards", "3. Take practice quiz").  
* **Time Allocation:** Each sub-task gets its own time estimate.  
  * **(Account-Level)** Teacher can provide a suggested time.  
  * **(User-Level)** Student can create a personal override (e.g., teacher suggests 1 hour, student with ADHD budgets 1.5 hours). Both values are visible.  
* **Smart Defaults:** For common assignment types ("Essay," "Test," "Project,"), the system will suggest default sub-tasks to help students get started (e.g., an essay gets "Outline," "Draft," "Proofread").

### **Journey 3: The Integrated Life Calendar**

**Problem:** School deadlines don't exist in a vacuum. Students have sports, family events, and other commitments.

**Our Solution:** A unified calendar view that layers academic deadlines with a student's real-life schedule.

* **Schoology \+ Personal:** Connects to third-party calendars (Google Calendar, iCal) to show a holistic view.  
* **Drag-and-Drop Scheduling:** Students can drag the sub-tasks they created onto their calendar to block out study time.  
* **Smart Scheduling (AI Feature):** An "Auto-schedule my week" button that intelligently places study blocks into free time slots on the student's calendar.

### **Journey 4: The Goals & Incentives Engine**

**Problem:** Tying real-world incentives to academic performance is a manual and often frustrating process for parents.

**Our Solution:** A simple, built-in framework for setting and tracking goals, powered by the "What If" calculator.

* **Goal Setting:** Students and parents can set specific, measurable goals (e.g., "Achieve an A- in AP English," "No overdue assignments this month").  
* **"What If" Integration:** Use the grade calculator to determine the exact scores needed to reach a grade-based goal, then set the goal with one click.  
* **Incentive Tracking:** Parents can link goals to tangible rewards ("New video game if you hit your AP English goal," "Allowance bonus for no tardies").  
* **Progress Visualization:** The app automatically tracks incoming data (grades, attendance) against the goals and visualizes progress.

### **Journey 5: The Conversational AI Assistant**

**Problem:** Even with a better UI, sometimes the fastest way to get information is to just ask a question.

**Our Solution:** A voice and text-based AI assistant that understands the user's data.

* **Natural Language Queries:** Users can ask questions like:  
  * "What do I have due this week?"  
  * "What's Carter's current grade in US Government?"  
  * "Show me my most recent submissions."  
* **Smart Home Integration:** (Future) Connect with Google Assistant (Gemini for Nest) and Amazon Alexa for hands-free access to information.

## **6\. Navigation & Information Architecture**

This section defines how users will navigate the app to accomplish their goals, focusing on a mobile-first, intuitive design.

### **First-Time User Experience (FTUE)**

A new user's first session is critical for establishing value and trust.

1. **Welcome & Connect:** The user is greeted with a simple screen explaining the app's value proposition ("The smart, simple way to manage Schoology"). The primary action is "Connect to Schoology," which initiates the OAuth flow.  
2. **Initial Sync:** After successful authentication, the app begins its first data sync. A friendly loading screen will appear, explaining what's happening ("Analyzing your courses...", "Organizing your assignments...") to build anticipation and manage expectations.  
3. **Landing on the Dashboard:** Once the sync is complete, the user lands on the "What's My World?" Dashboard.  
4. **Brief Onboarding:** A short, dismissible "coach mark" tour will highlight the key widgets:  
   * "Here are all your upcoming assignments in one place."  
   * "See your current grades at a glance."  
   * "Ask a question anytime using the AI assistant."

### **Returning User Experience**

* **Default View:** By default, the app will open to the last screen the user was on, allowing them to seamlessly pick up where they left off.  
* **(User-Level Preference):** In Settings, a user can choose a default start screen (e.g., "Always open to my Calendar").

### **Comprehensive User Actions ("User Wants To...")**

This list expands on our user journeys to define specific actions and information needs that will drive the navigation design.

**A User Wants To See...**

* ...what's due today/this week.  
* ...all my upcoming tests.  
* ...my current grade in every class.  
* ...my overall GPA.  
* ...how a new grade will affect my final grade.  
* ...if my teacher has graded my last submission.  
* ...what my parent sees.  
* ...a log of items I've hidden or dismissed.  
* ...my schedule for the day, including school and personal events.  
* ...how much work I have this week, in hours.  
* ...the progress towards my academic goals.

**A User Wants To Do...**

* ...connect my Schoology account.  
* ...connect my Google/iCal calendar.  
* ...break down a large project into smaller steps.  
* ...estimate how long a homework assignment will take.  
* ...schedule study time for a test.  
* ...mark a task as complete.  
* ...enter a grade I got on paper before it's in Schoology.  
* ...calculate the grade I need on the final to get an A.  
* ...set a goal for my History grade.  
* ...link a reward to a goal (Parent).  
* ...hide a noisy or irrelevant "overdue" item.  
* ...flag an assignment that I'm getting help with.  
* ...ask the app "What did I miss yesterday?"  
* ...change my notification settings.  
* ...switch between my children's accounts (Parent).

### **Proposed Navigation Model (Mobile-First)**

A persistent bottom tab bar will be the primary navigation method, providing immediate access to the app's core functions.

* **\[Home Icon\] Dashboard:** The default landing page. Provides the high-level "What's My World?" overview with widgets for assignments, grades, and workload.  
* **\[Checklist Icon\] Planner:** A dedicated task-management view. This is where users see their upcoming work as a focused to-do list and can break down assignments into sub-tasks.  
* **\[Calendar Icon\] Calendar:** The full-screen, integrated life calendar view, combining academic deadlines and personal events.  
* **\[Chart Icon\] Grades:** The dedicated, Bessy-style gradebook. This screen focuses solely on grade details, trends, and the "What If" calculator.  
* **\[Person/Gear Icon\] Profile & Settings:** A single destination for managing user- and account-level settings. This includes:  
  * Switching student profiles (for parents).  
  * Managing Goals & Incentives.  
  * Notification Preferences.  
  * Connected Accounts (Schoology, Calendars).  
  * Viewing hidden items and the change log.

**Contextual Navigation:**

* **Drill-Downs:** Tapping on an assignment in the Dashboard will navigate to a detailed view of that assignment within the Planner. Tapping a course in the Grades widget will navigate to the detailed grade breakdown for that course in the Grades tab. This creates logical, intuitive pathways between sections.  
* **Global AI Assistant:** A floating action button (FAB) or a persistent search bar at the top of the screen will provide constant access to the conversational AI assistant from anywhere in the app.

## **7\. Research, Technical Notes & Open Questions**

* **Grade Normalization:** Investigate the Schoology API's grade and scale objects for reliable normalization.  
* **Teacher App Integration:** Evaluate the "Resource Apps" API for teacher-facing features.  
* **Unified Communications:** A future roadmap item could be a unified inbox within Schoology Planner to consolidate all Schoology-related communication.  
* **Smart Home Auth & Conversational AI:** Research and monitor authentication flows for the upcoming Gemini-powered Google Assistant and Amazon Alexa. The UX goal is a simple, one-time account linking process. Once authorized, our backend will receive the user's query (e.g., "ask Schoology Planner what's due tomorrow"), parse the intent, fetch the relevant data from Firestore, and return a concise, natural language response. We will explicitly wait for the new generation of assistants to avoid building on legacy platforms.  
  * *Further Reading:*  
    * [Google's vision for a Gemini-powered Assistant](https://www.google.com/search?q=https://blog.google/products/assistant/google-assistant-gemini-ai-assistant/)  
    * [Understanding Account Linking for Alexa Skills](https://www.google.com/search?q=https://developer.amazon.com/en-US/docs/alexa/account-linking/understanding-account-linking.html)  
* **Parental Incentives Research:** Compile best practices and investigate potential partnerships with parental control apps.

## **8\. Technical & Platform Research Deep Dive**

### **Teacher App Integration (via Schoology App Platform)**

**The Goal:** Allow teachers to input time estimates for assignments directly within their familiar Schoology environment.

**The Mechanism:** We can achieve this by creating a **Schoology Resource App**. This uses an industry standard called LTI (Learning Tools Interoperability) to embed our web application directly into the Schoology UI.

**How it Works:**

1. **App Registration:** We register Schoology Planner as a "Resource App" with Schoology. The school district's Schoology administrator would then install it for their teachers.  
2. **Teacher Access:** A teacher would see our app (e.g., "Schoology Planner") in their course's navigation menu or resource center.  
3. **Embedded View:** When the teacher clicks the link, Schoology opens our web app inside an iframe. Schoology securely passes user information (like teacher ID and course ID) to our app.  
4. **Focused UI:** The version of our app shown to the teacher would be a simplified interface, focused on a single task: listing the assignments for that specific course and providing input fields for them to add or edit the estimated time commitment.  
5. **Data Storage:** When the teacher saves their estimates, our app saves that data to our Firestore database, where it becomes the **account-level** "truth" for students and parents to see.

**Teacher User Flow:**

The key to adoption is minimizing disruption to a teacher's existing workflow. The flow would look like this:

1. A teacher navigates to their course in Schoology and creates a new assignment using the standard Schoology interface ("Add Materials" \-\> "Add Assignment").  
2. After creating the assignment (e.g., "Unit 5 Essay"), they are on the main page for that assignment within Schoology.  
3. **Integration Point:** Alongside the standard Schoology options, they will see a new link or button added by our app: **"Add Planning Details with Schoology Planner."**  
4. Clicking this button opens our app's focused UI inside a modal window or iframe, directly over the Schoology page.  
5. Our simple UI automatically shows the assignment title and provides two key fields:  
   * **Estimated Time Commitment:** A field for hours/minutes.  
   * **Suggested Sub-Tasks:** Pre-populated with smart defaults based on the assignment type (e.g., "Outline," "Write Draft," "Proofread" for an essay). The teacher can edit or add to this list.  
6. The teacher enters 3.5 hours, adjusts the sub-tasks, and clicks **"Save."**  
7. The modal closes, returning the teacher to the standard Schoology page. The time and sub-task data is now saved in our database, instantly available to the student and parent in the Schoology Planner app.

**Conclusion:** This is a viable and standard way to provide teacher-facing functionality without requiring them to leave Schoology or use a separate app.

### **Grade Data Normalization Strategy**

**The Goal:** Consistently display grades, whether they are entered as points (85/100), letters (B), or percentages (85%).

**The Finding:** The Schoology API provides all the necessary components, but we need to combine them. A single grade is a mix of a raw score and a predefined scale.

**Our Process:**

1. **Fetch the Raw Score:** For any given assignment, we'll get the student's submission, which includes a grade (the points earned, e.g., 85\) and the assignment's max\_points (e.g., 100). From this, we can always calculate a percentage.  
2. **Fetch the Grading Scale:** The assignment object also contains a scale\_id. This ID points to a **Grading Scale**.  
3. **Combine and Normalize:** We will then make a separate API call to fetch that specific Grading Scale. The scale's data will define the letter grade cutoffs (e.g., 90-100% \= 'A', 80-89% \= 'B').  
4. **Display:** Our app will use the calculated percentage to look up the correct letter in the grading scale. This allows us to build a rich UI that can display all three for clarity: **"B (85% \- 85/100)"**. This solves the inconsistency problem and provides more context than Schoology's own interface.

### **A Smarter Notification Philosophy**

**The Goal:** Fix the broken notification system by giving users control and context, ensuring they see what's important and aren't flooded with noise.

**The Problem:** User feedback shows Schoology's notifications are either "all or nothing"—they either miss critical updates or are overwhelmed by irrelevant ones. There's no middle ground.

**Our Solution: A Tiered, Configurable System**

1. **Tier 1: Passive Alerts (In-App Only)**  
   * **What:** Low-priority, informational events. A new non-graded material is posted, a discussion comment is made.  
   * **How:** These appear *only* in the Dashboard's "Smart Notifications Hub." They do **not** send a push notification to the user's device, eliminating noise.  
2. **Tier 2: Standard Push Notifications (Opt-in & Customizable)**  
   * **What:** Medium-priority, actionable events. A new grade is posted, an assignment is due in the next 48 hours.  
   * **How:** These send a standard push notification to the device and appear in the hub. Users will have granular control in Settings to toggle these on/off by type (e.g., "Notify me for new grades" but not "for new assignments").  
3. **Tier 3: Critical Alerts (Active Confirmation)**  
   * **What:** High-priority, urgent events that require attention. An assignment is now **overdue**, a failing grade is entered that drops the overall course grade below a user-defined threshold (e.g., below a C-).  
   * **How:** These send a more persistent push notification. Inside the app, the notification will be highlighted and may require the user to explicitly tap an "Acknowledge" button. This ensures the most critical information is never missed.

This tiered philosophy, combined with the detailed controls in the Profile & Settings screen, will directly address user frustrations and make notifications a genuinely useful feature.

## **9\. User Action & Interaction Mapping**

This section translates the abstract list of "user wants" into a concrete interaction blueprint. It ensures every user goal has a clear, intuitive path within the app's navigation and UI, preventing feature bloat on any single screen.

### **Information Retrieval ("A User Wants to See...")**

| User Goal | Primary Location / Action | UI/UX Solution & Details |
| :---- | :---- | :---- |
| **...what's due today/this week.** | **Dashboard** tab | The **"Upcoming Assignments" widget** defaults to a "This Week" filter. A prominent "Today" toggle provides a more focused view. |
| **...all my upcoming tests.** | **Planner** tab | The Planner screen has a "Filter" button that opens a modal. The user can filter by assignment type (e.g., show only "Tests," "Quizzes"). |
| **...my current grade in every class.** | **Dashboard** or **Grades** tab | The **"Grades At-a-Glance" widget** on the Dashboard shows the list. For more detail, the dedicated **Grades tab** provides the same list with trends and more context. |
| **...my overall GPA.** | **Grades** tab | The main screen of the **Grades tab** displays a calculated "Overall Average" or "GPA" prominently at the top. |
| **...how a new grade will affect my final grade.** | **Grades** tab | Tap a course to see its detail page. The **"What If" Calculator** allows the user to add a hypothetical grade and see its immediate impact on the overall course grade. |
| **...if my teacher has graded my last submission.** | **Dashboard** or **Grades** tab | The **"Smart Notifications Hub"** on the Dashboard will show a "New Grade" alert. Alternatively, in the **Grades tab**, a small "new" or "graded" badge will appear next to a recently graded assignment. |
| **...what my parent sees.** | **Profile & Settings** tab | A "View as \[Parent's Name\]" option allows a student to switch to a read-only version of their parent's view to understand what information is shared. |
| **...a log of items I've hidden or dismissed.** | **Profile & Settings** tab | Under a "Preferences" or "Content Visibility" sub-menu, there will be a "View Hidden Items" page that lists all dismissed assignments with an option to "unhide" them. |
| **...my schedule for the day.** | **Calendar** tab | The Calendar screen defaults to a "Day" view, showing a merged timeline of academic deadlines and connected personal calendar events. |
| **...how much work I have this week, in hours.** | **Dashboard** tab | The **"Workload Summary" widget** displays this as a clear, high-level metric (e.g., "Est. 6.5 hours this week"). |
| **...the progress towards my academic goals.** | **Profile & Settings** tab | The "Goals & Incentives" section will show progress bars and status updates for each active goal. Key goals might also be surfaced as a small widget on the Dashboard. |

### **Task Completion ("A User Wants to Do...")**

| User Goal | Primary Location / Action | UI/UX Solution & Details |
| :---- | :---- | :---- |
| **...connect my Schoology account.** | First-Time Use or **Profile & Settings** | A full-screen prompt during FTUE. For existing users, this is managed under "Connected Accounts" in the **Profile & Settings tab**. |
| **...connect my Google/iCal calendar.** | **Calendar** tab or **Profile & Settings** | The first time a user visits the **Calendar tab**, a prompt will appear. It can also be managed later under "Connected Accounts" in **Profile & Settings**. |
| **...break down a large project into smaller steps.** | **Planner** tab | Tap any assignment to open its "detail view." This view contains an "Add Sub-task" button and a list of existing sub-tasks. |
| **...estimate how long a homework assignment will take.** | **Planner** tab | In the assignment "detail view," each assignment and sub-task has a dedicated field for a time estimate (e.g., 1h 30m). |
| **...schedule study time for a test.** | **Calendar** tab | The user can tap a "Schedule Work" button, which opens a panel showing unscheduled sub-tasks. They can then drag these tasks directly onto time slots in the calendar. |
| **...mark a task as complete.** | **Planner** or **Dashboard** | Checkboxes appear next to every assignment and sub-task in the **"Upcoming Assignments" widget** and the main **Planner** list. |
| **...enter a grade I got on paper.** | **Grades** tab | In a course's detail view, an "Add Unofficial Grade" button opens a modal where the user can input the assignment name and score. This entry is clearly marked as "Unofficial." |
| **...calculate the grade I need on the final to get an A.** | **Grades** tab | Use the **"What If" Calculator** on a course's detail page. Set a "Target Grade" for the course, and the calculator will show the required score on a future assignment. |
| **...set a goal for my History grade.** | **Profile & Settings** tab | Navigate to the "Goals & Incentives" section. An "Add New Goal" flow will guide the user to select a course, set a target grade, and optionally link it to the "What If" calculator. |
| **...link a reward to a goal (Parent).** | **Profile & Settings** tab (Parent View) | In the "Goals & Incentives" section, after a goal is created, a "Link Reward" button allows the parent to describe the incentive. |
| **...hide a noisy or irrelevant "overdue" item.** | **Dashboard** or **Planner** | Each assignment card has a "..." (more options) menu. Tapping it reveals a "Dismiss" or "Hide" option. |
| **...flag an assignment that I'm getting help with.** | **Planner** tab | In the assignment "detail view," a "Flag for Review" toggle or button allows the user to mark it. A small flag icon will then appear next to it in all list views. |
| **...ask the app "What did I miss yesterday?"** | Any Screen | Tap the **Global AI Assistant** (FAB or search bar). The user can type or speak their query, and the answer appears in a conversational UI overlay. |
| **...change my notification settings.** | **Profile & Settings** tab | A dedicated "Notifications" sub-menu allows the user to toggle alerts on/off based on the tiered system (Passive, Standard, Critical). |
| **...switch between my children's accounts (Parent).** | **Profile & Settings** tab (Parent View) | The top of the **Profile & Settings** screen will have a prominent profile switcher showing the current child's name with a dropdown to select another connected child. |

