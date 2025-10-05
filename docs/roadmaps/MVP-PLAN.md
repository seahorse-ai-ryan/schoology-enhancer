# Modern Teaching - MVP Roadmap

**Created:** October 1, 2025  
**Last Updated:** October 1, 2025  
**Status:** Approved by Product Owner  
**Target Launch:** Q1 2026 (3-4 months)

---

## 🎯 MVP Vision

**Build a complete read-only mirror of ALL Schoology data with an AI conversational interface that provides immediate value to parents and students.**

**Core Value Proposition:**
"Check your classes, grades, and assignments faster than Schoology, and ask our AI questions about your data in plain English or by voice."

**Not in MVP:**
- User data entry/editing
- Executive function planning tools
- Notifications
- Calendar integration
- "What If" calculator

---

## 📊 MVP Scope

### ✅ In Scope

**Core Functionality:**
- Complete read-only view of ALL Schoology data
  - Courses
  - Assignments
  - Grades
  - Announcements
  - School information
- Data mirroring to our Firestore database
- Sync during active user sessions (polling)
- Parent-to-student account mapping
- Parent viewing of multiple children's data
- Two-click child switching

**AI Features:**
- Conversational AI interface (text + voice)
- Query answering: "What's due this week?", "When is my next math test?", "What is my child overdue on?"
- Use Gemini Nano (client-side) + Gemini Flash (cloud)
- Support for parents querying about children

**User Experience:**
- Simple UX (no wizards/tutorials)
- Bottom tabs navigation (mobile)
- Left side navigation (desktop)
- <2 second performance target
- Aggressive client caching
- Dynamic URLs for bookmarks and deep links

**Data & Privacy:**
- Mirror Schoology data visibility rules
- Design for future private user-added data (not in MVP)

**Infrastructure:**
- Firebase + Firestore
- Google Analytics
- Audit trail for admin actions
- Whitelisted users and schools (controlled growth)

**Target Users:**
- Parents (priority #1)
- Students (priority #2)

**Target Districts:**
- Palo Alto Unified School District
- Fremont Unified School District
- Goal: 500 happy Bay Area users

---

### ❌ Explicitly Out of Scope (Post-MVP)

**Features:**
- User data entry and editing
- Private notes, sub-tasks, or TODOs
- Assignment sub-tasks and planning
- Calendar integration (Google, Apple)
- "What If" grade calculator
- Scheduling and time blocking
- Notifications and alerts
- Background data syncing (outside user sessions)
- Teacher access / LTI integration
- External party access (grandparents, tutors)
- Payment processing

**Technical:**
- Full offline support (plane mode with local edits)
- Real-time data push (polling only in MVP)
- Advanced AI features (proactive insights, layout customization)

---

## 🏗️ Technical Architecture (MVP)

### Stack

**Frontend:**
- Next.js 15 (React 19)
- TypeScript
- Tailwind CSS
- shadcn/ui components
- Bottom tabs (mobile), left nav (desktop)

**Backend:**
- Next.js API routes (no Firebase Functions)
- Firestore for data storage and caching
- Firebase Authentication

**AI:**
- Gemini Nano (client-side, in-browser/on-device)
- Gemini Flash (cloud, via Vertex AI / Genkit)
- Text + voice input support

**State Management:**
- React Context for global state (user, activeChild, schoolYear)
- SWR for server data fetching/caching
- (Can upgrade to Zustand post-MVP if needed)

**Auth:**
- Schoology OAuth 1.0a
- Persistent browser sessions
- Support for ClassLink auth flow

---

### Data Model

**Firestore Structure:**
```
/users/{userId}
  - role: 'parent' | 'student'
  - name, email, schoologyId
  - children: [studentIds] (if parent)
  - preferences: {} (future)

/students/{studentId}
  - name, grade, schoolId
  - parentIds: [userId, ...]

/courses/{courseId}
  - studentId, schoolYear
  - name, teacher, section, gradeScale
  - syncedAt (timestamp)

/assignments/{assignmentId}
  - courseId, studentId
  - title, description, type, dueDate
  - pointsPossible, grade (if graded)
  - syncedAt

/grades/{gradeId}
  - courseId, assignmentId, studentId
  - pointsEarned, pointsPossible, letterGrade, percentage
  - gradedAt, syncedAt

/announcements/{announcementId}
  - courseId, studentId
  - title, body, postedAt
  - syncedAt

/schools/{schoolId}
  - name, district, address
  - contacts: {office, absence, etc.}
  - calendar: [] (holidays, special days)
```

---

### Caching Strategy

**Data Sync:**
- Sync during active user sessions only
- Poll for changes once per minute while user active
- Mirror all data to Firestore (don't constantly hit Schoology API)

**Client Caching:**
- Aggressive caching using SWR
- Dedupe requests within 1 minute
- Show cached data immediately, refresh in background

**Performance Target:**
- <2s for all our app operations
- Accept Schoology API times (track but can't control)

---

## 📱 MVP Features & User Journeys

### Feature 1: Authentication & Onboarding

**User Story:** As a parent/student, I want to sign in with my Schoology account

**Flow:**
1. User lands on homepage
2. Clicks "Sign In with Schoology"
3. OAuth flow (via ClassLink if applicable)
4. First-time setup:
   - For parents: Link children's accounts
   - For students: Confirm profile info
5. Redirect to Dashboard

**Success Criteria:**
- OAuth works reliably
- ClassLink auth supported
- Session persists across app closes
- <30 seconds from landing to Dashboard

---

### Feature 2: Dashboard

**User Story:** As a user, I want to see an at-a-glance overview of academic status

**Components:**
- Quick stats (# courses, upcoming this week, overdue, GPA/average)
- Today's snapshot (assignments due today)
- This week preview (grouped by day)
- Recent activity (recently graded items)
- **AI quick access (prominent):** "Ask about your classes"

**Success Criteria:**
- All data visible without scrolling (mobile)
- <2s load time
- Empty states for no data
- Loading skeletons

---

### Feature 3: Course List & Detail

**User Story:** As a user, I want to browse all my courses and dive into details

**Course List:**
- All enrolled courses
- Current grade (if available)
- Teacher, section, quick stats
- Click → Course Detail

**Course Detail:**
- Course info (teacher, meeting times, grading scale)
- Tabs: Overview, Assignments, Grades, Materials, Announcements
- Upcoming work preview
- Recent grades

**Success Criteria:**
- All Schoology course data visible
- Navigate between courses quickly
- Deep linking works (bookmarkable URLs)

---

### Feature 4: Assignments (Cross-Course View)

**User Story:** As a user, I want to see all my assignments from all courses in one place

**Features:**
- Filter by: Course, Status, Type, Date range
- Sort by: Due date, Course, Type, Points
- Grouped by due date (Today, Tomorrow, This Week, etc.)
- Assignment detail page with full info

**Success Criteria:**
- Can find any assignment in <5 seconds
- Filters work intuitively
- Assignment detail shows everything Schoology has

---

### Feature 5: Grades Overview

**User Story:** As a user, I want to see grades across all courses

**Features:**
- Overall GPA/average (if calculable)
- List of all courses with current grades
- Color coding by letter grade
- Trend indicators (if data available)
- Course detail → Grades tab for deep dive

**Success Criteria:**
- Grades display correctly (letter + percentage + points)
- Handle different grading scales gracefully
- Recent grade changes highlighted

---

### Feature 6: Parent-Child Switching

**User Story:** As a parent, I want to easily switch between viewing my children's data

**UX:**
- Profile avatar shows current child
- Click avatar → menu with all children
- Select child → switch in <1 second
- Dynamic URL updates

**Success Criteria:**
- Two-click operation
- Fast switching (<1s)
- All data pre-loaded (fetched at login)
- Clear indication of active child

---

### Feature 7: AI Conversational Interface ⭐ DIFFERENTIATOR

**User Story:** As a user, I want to ask questions about my data in natural language

**Features:**
- Text input: "What's due this week?"
- Voice input: Tap mic, speak question
- Chat history (scrollable)
- Sample queries shown
- AI responds with formatted data

**Example Queries:**
- "What's due this week?"
- "When is my next math test?"
- "What am I overdue on?"
- (Parents) "What is Carter overdue on?"
- "Show my grades in biology"
- "When is spring break?"

**Technical:**
- Gemini Nano for on-device queries (fast, private)
- Gemini Flash for complex cloud queries
- Context includes all user data
- Log queries + responses for improvement

**Success Criteria:**
- 90% of queries answered correctly
- <3s response time
- Voice input works reliably
- Users prefer AI over manual navigation (measure)

---

### Feature 8: School Information

**User Story:** As a user, I want quick access to school contact info and calendar

**Data:**
- School name, district, address
- Contact info (office, absence hotline, email)
- Key personnel (principal, counselors)
- Important dates (holidays, early dismissals)
- Links to school/district websites

**Success Criteria:**
- All relevant school info accessible
- Integration with Schoology calendar for dates

---

### Feature 9: Data Schema Future-Proofing

**User Story:** As a developer, I want our schema to support multi-year data so we can add a school year picker post-MVP without major refactoring

**Implementation:**
- Design schema to include school year, grading periods, and semesters
- Current year data only (Schoology API limitation)
- No UI picker in MVP (will add post-MVP)
- Data structure ready for:
  - Historical years (2025-26, 2024-25, 2023-24)
  - Summer school semesters
  - Repeated grades ("Junior year 2024-25", "Junior year 2025-26")

**Success Criteria:**
- Schema includes year/period/semester fields
- Code uses terminology that supports future multi-year queries
- Adding year picker post-MVP requires minimal refactoring

---

### Feature 10: Settings

**User Story:** As a user, I want to manage my account and preferences

**Sections:**
- Account info (name, email, role)
- Children linked (for parents)
- Preferences (language, starting page, date/time format)
- About (version, privacy, terms, support, feedback)
- Logout

**Success Criteria:**
- All account management accessible
- Clear, simple settings UI

---

## 🎨 UI/UX Requirements

### Design Principles

1. **Simple & Fast:** No tutorials, intuitive navigation
2. **Mobile-First:** Thumb-friendly, <44px tap targets
3. **Performance:** <2s load times, smooth scrolling
4. **Clarity:** Clear labels, no jargon
5. **Accessibility:** WCAG 2.1 AA compliance

### Mockups Required

**Priority 1 (Create First):**
1. Dashboard
2. Course List
3. Course Detail - Overview
4. AI Chat Interface
5. Assignments List
6. Assignment Detail
7. Grades Overview

**Priority 2:**
8. Course Detail - Assignments tab
9. Course Detail - Grades tab
10. Settings
11. School Information

**Mockup Spec:** See `UI-MOCKUP-SPEC.md`

---

## 📅 MVP Development Timeline

### Phase 1: Foundation & Setup (Weeks 1-2)

**Week 1:**
- ✅ Fix TypeScript errors (remove ignoreBuildErrors)
- ✅ Standardize API route patterns
- ✅ Create AppContext + SWR setup
- ✅ Update documentation

**Week 2:**
- Create UI mockups (Figma + Nano Banana)
- Get feedback on mockups
- Expand seed data (25+ assignments per student)
- Set up monitoring/alerting (Firebase, Sentry)

**Deliverables:**
- Clean TypeScript codebase
- Approved UI mockups
- Rich seed data for testing
- Monitoring infrastructure

---

### Phase 2: Core Read-Only Features (Weeks 3-6)

**Week 3:**
- Dashboard implementation
- Course List implementation
- Navigation (bottom tabs mobile, side nav desktop)

**Week 4:**
- Course Detail page (all tabs)
- Assignment List (cross-course)
- Assignment Detail page

**Week 5:**
- Grades Overview
- Grades Detail (per course)
- School Information page

**Week 6:**
- Settings page (with language selector)
- Parent-child switching
- Schema supports future school year data (no UI picker in MVP)
- Polish and bug fixes

**Deliverables:**
- Complete read-only app
- All Schoology data accessible
- Parent multi-child support
- Schema ready for historical data (UI picker post-MVP)

---

### Phase 3: AI Integration (Weeks 7-8)

**Week 7:**
- AI chat UI implementation
- Gemini Nano integration (client-side)
- Gemini Flash integration (cloud)
- Text input working

**Week 8:**
- Voice input implementation
- Context building (pass user data to AI)
- Query logging and analytics
- Sample queries and prompts

**Deliverables:**
- Working AI conversational interface
- Text + voice input
- Query answering functional
- Analytics tracking

---

### Phase 4: Performance & Polish (Weeks 9-10)

**Week 9:**
- Performance optimization (<2s target)
- Caching refinements
- Loading states polish
- Error handling improvements

**Week 10:**
- Cross-browser testing
- Mobile device testing (iOS, Android)
- Accessibility audit (WCAG 2.1 AA)
- Final bug fixes

**Deliverables:**
- Performance targets met
- Tested on major browsers/devices
- Accessible to users with disabilities
- Bug-free experience

---

### Phase 5: Beta Launch (Weeks 11-12)

**Week 11:**
- Beta user onboarding (friends & family)
- Monitoring and feedback collection
- Quick bug fixes and tweaks

**Week 12:**
- User feedback analysis
- Priority fixes based on feedback
- Prepare for wider beta

**Deliverables:**
- 10-20 beta users actively testing
- Feedback collected and prioritized
- MVP ready for wider beta

---

## 📊 Success Metrics

### MVP Launch Metrics

**User Acquisition:**
- Target: 50 beta users in first month
- Target: 500 users by end of Q1 2026

**Engagement:**
- Daily active users: >40% of total
- Sessions per day per user: 2+
- AI query usage: >50% of users try AI within first week

**Performance:**
- Page load time: <2s (95th percentile)
- API response time: <1s (95th percentile)
- Error rate: <1%

**User Satisfaction:**
- NPS (Net Promoter Score): >50
- Users prefer Modern Teaching over Schoology: >80%
- Would recommend to friends: >70%

**AI Quality:**
- Query success rate: >90%
- Voice input accuracy: >85%
- Users satisfied with AI responses: >80%

---

## 🚧 Risks & Mitigation

### Risk 1: Schoology API Instability

**Risk:** API downtime or rate limiting blocks our app

**Mitigation:**
- Data mirroring (use our cache when API down)
- Aggressive caching (reduce API calls)
- User messaging when API issues detected
- Monitor Schoology status page

---

### Risk 2: ClassLink Auth Complexity

**Risk:** ClassLink integration more complex than expected

**Mitigation:**
- Research ClassLink OAuth early (Week 1-2)
- Test with real ClassLink users in beta
- Fallback: Direct Schoology auth if ClassLink fails

---

### Risk 3: AI Query Quality

**Risk:** AI gives wrong/unhelpful answers, users lose trust

**Mitigation:**
- Start with simple queries (factual retrieval)
- Log all queries and responses for review
- User feedback ("Was this helpful?")
- Iterate prompts based on logs
- Clear disclaimers for complex queries

---

### Risk 4: Performance at Scale

**Risk:** App slows down with more data or users

**Mitigation:**
- Performance testing with large datasets
- Query optimization (Firestore indexes)
- Code splitting and lazy loading
- Monitoring and alerting for slowdowns

---

### Risk 5: User Adoption

**Risk:** Users don't see value, don't switch from Schoology

**Mitigation:**
- Focus on pain points (slow Schoology, poor mobile)
- Highlight AI differentiator
- Get testimonials from beta users
- Word-of-mouth in target schools

---

## 📝 Open Questions & Next Steps

### Immediate Actions (This Week)

1. ✅ Create UI mockups (Figma + Nano Banana)
   - Use `UI-MOCKUP-SPEC.md` as guide
   - Get Ryan's feedback

2. ✅ Research ClassLink integration
   - OAuth flow documentation
   - Test accounts if available

3. ✅ Set up monitoring
   - Firebase Performance Monitoring
   - Sentry for error tracking
   - Google Analytics for usage

4. ✅ Expand seed data
   - 25+ assignments per student
   - Variety of types, statuses, dates
   - Multiple grading scales

---

### Medium-Term Research (Weeks 3-4)

5. ⏳ Infinite Campus integration (attendance)
   - API availability
   - Auth flow differences
   - Feasibility assessment

6. ⏳ i18n strategy (translation)
   - Next.js i18n libraries
   - Translation services for Schoology data
   - Cost estimates

7. ⏳ Schoology API deep dive
   - Change detection capabilities
   - Rate limits
   - Data freshness markers

---

### Post-MVP Planning (Weeks 10+)

8. ⏳ Pricing strategy finalization
   - Use `PRICING-STRATEGY-EXPLORATION.md` with external AI
   - Decide on free vs paid tiers
   - Set launch pricing

9. ⏳ Post-MVP feature prioritization
   - Based on user feedback
   - What do users want most?
   - What's highest ROI?

10. ⏳ Scaling plan
    - When to lift whitelist?
    - How to handle viral growth?
    - Infrastructure scaling

---

## 🎯 Definition of Done (MVP Launch)

### MVP is complete when:

**Functionality:**
- ✅ All Schoology data accessible read-only
- ✅ Parent-child switching works seamlessly
- ✅ AI text + voice queries work reliably
- ✅ Performance targets met (<2s loads)
- ✅ Works on mobile and desktop
- ✅ Schema supports multi-year data (UI picker post-MVP)

**Quality:**
- ✅ Zero critical bugs
- ✅ <1% error rate in production
- ✅ Accessible (WCAG 2.1 AA)
- ✅ All E2E tests passing
- ✅ Load tested with realistic data volumes

**User Validation:**
- ✅ 10+ beta users actively using (1 week+)
- ✅ Positive feedback on core value prop
- ✅ Users prefer Modern Teaching over Schoology
- ✅ AI feature used and valued
- ✅ No major UX complaints

**Business:**
- ✅ Whitelisting system working
- ✅ Monitoring and alerting operational
- ✅ Analytics tracking usage
- ✅ Support channels ready (email, feedback form)
- ✅ Privacy policy and terms published

---

## 📚 Related Documentation

**Reference:**
- `DECISIONS-SUMMARY.md` - All Product Owner decisions
- `UI-MOCKUP-SPEC.md` - Complete UI specification
- `STATE-MANAGEMENT-RECOMMENDATION.md` - Technical state management approach
- `FOLLOW-UP-QUESTIONS.md` - Items requiring research
- `PRICING-STRATEGY-EXPLORATION.md` - Pricing analysis (external AI)

**Updated Roadmaps:**
- `STRATEGIC-ROADMAP.md` - Post-MVP phases
- `TACTICAL-ROADMAP.md` - Sprint-by-sprint execution
- `TECHNICAL-ARCHITECTURE-DECISIONS.md` - Technical choices

---

## 🚀 Let's Build!

**MVP Goal:** Provide immediate value to parents and students with a fast, clean, AI-powered interface to their Schoology data.

**Timeline:** 10-12 weeks to beta launch

**Target:** 500 happy Bay Area users by Q1 2026

**Differentiation:** AI conversational interface + modern UX

**Post-MVP:** Executive function planning, notifications, calendar, and more

---

**MVP Roadmap Complete. Ready to execute!**

