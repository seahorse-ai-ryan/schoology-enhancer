# Modern Teaching - Product Requirements Document (PRD)

**Version:** 1.0  
**Last Updated:** September 30, 2025  
**Status:** Draft - Iterating based on development

---

## 📋 Document Purpose

This PRD defines detailed requirements for Modern Teaching features, organized by strategic phase. Each feature includes:
- User stories
- Acceptance criteria
- UI/UX specifications
- Technical considerations
- Dependencies
- Open questions

---

## 🎯 Phase 1: Foundation & Core Value

### Feature 1.1: OAuth Authentication ✅ COMPLETE

**User Story:**  
As a parent/student, I want to securely connect my Schoology account so that I can view my academic data.

**Acceptance Criteria:**
- [x] User clicks "Sign In with Schoology"
- [x] OAuth flow completes successfully
- [x] Session persists across browser sessions
- [x] User redirected to dashboard after auth
- [x] Error handling for failed auth

**Status:** ✅ Complete with persistent browser sessions

---

### Feature 1.2: Dashboard - Upcoming Assignments Widget

**User Story:**  
As a student, I want to see all my upcoming assignments in one place so I don't have to check each course individually.

**Acceptance Criteria:**
- [ ] Widget shows assignments from all courses
- [ ] Assignments sorted by due date (earliest first)
- [ ] Each assignment shows:
  - Assignment title
  - Course name
  - Due date (relative: "Today", "Tomorrow", "In 3 days")
  - Assignment type (Test, Quiz, Homework, Project)
  - Points possible
  - Time estimate (if available)
- [ ] Default filter: "This Week"
- [ ] Toggle for "Today" view
- [ ] Empty state: "No assignments due this week! 🎉"
- [ ] Loading state: Skeleton UI
- [ ] Error state: Retry button

**UI/UX Specifications:**
```
┌─────────────────────────────────┐
│ Upcoming Assignments     ▼ This Week │
├─────────────────────────────────┤
│ TODAY                            │
│                                  │
│ • Biology Test              100pts│
│   AP Bio - Due 3:00 PM           │
│   Est. 2h study time             │
│                                  │
│ TOMORROW                         │
│                                  │
│ • Essay Outline              20pts│
│   English - Due 11:59 PM         │
│   Est. 1h                        │
│                                  │
│ [Show More]                      │
└─────────────────────────────────┘
```

**Technical Considerations:**
- Query: Get assignments with due_date >= today and due_date <= end_of_week
- Cache results in Firestore for 15 minutes
- Implement virtualized list for 100+ assignments
- Support pull-to-refresh on mobile

**Dependencies:**
- Rich seed data with varied assignments
- API route: `/api/schoology/assignments`
- Time estimation system (Phase 2)

**Open Questions:**
- Q: How many assignments to show before "Show More"?
- Q: Should completed assignments be hidden or dimmed?
- Q: How to handle assignments without due dates?

---

### Feature 1.3: Dashboard - Grades At-a-Glance Widget

**User Story:**  
As a student, I want to quickly see my current grade in every class without clicking into each course.

**Acceptance Criteria:**
- [ ] Widget shows all active courses
- [ ] Each course shows:
  - Course name
  - Current grade (letter AND percentage)
  - Trend indicator (↑↓→)
  - Number of graded assignments
- [ ] Overall GPA/average at top
- [ ] Color coding: A=green, B=blue, C=yellow, D/F=red
- [ ] Tap course → navigate to Grades tab detail view
- [ ] Show "Not yet graded" for courses with no grades

**UI/UX Specifications:**
```
┌─────────────────────────────────┐
│ Grades                           │
│ Overall Average: 3.6 GPA    ─────│
├─────────────────────────────────┤
│ AP Biology              A  94% ↑ │
│ 12 graded assignments            │
│                                  │
│ US History              B+ 88% → │
│ 8 graded assignments             │
│                                  │
│ English                 A- 91% ↓ │
│ 15 graded assignments            │
│                                  │
│ [View Full Grades]               │
└─────────────────────────────────┘
```

**Technical Considerations:**
- Grade normalization: points → percentage → letter
- Fetch grading scale for each course
- Calculate weighted average if applicable
- Handle extra credit (>100%)

**Dependencies:**
- Grade normalization system
- API route: `/api/schoology/grades`
- Grading scales API integration

**Open Questions:**
- Q: How to calculate GPA (4.0 scale, weighted, unweighted)?
- Q: Show semester grade or current grading period?
- Q: How often to refresh grade data?

---

### Feature 1.4: Dashboard - Workload Summary Widget

**User Story:**  
As a student, I want to know how much work I have this week in hours so I can plan my time.

**Acceptance Criteria:**
- [ ] Widget shows total estimated hours for the week
- [ ] Breakdown by day (bar chart or list)
- [ ] Breakdown by course (pie chart)
- [ ] Color coding for heavy days (>4 hours = red)
- [ ] Tap to see detailed breakdown

**UI/UX Specifications:**
```
┌─────────────────────────────────┐
│ Workload This Week               │
│                                  │
│ Est. 8.5 hours total             │
│                                  │
│ Mon ████░░ 3.5h                  │
│ Tue ██░░░░ 1.5h                  │
│ Wed ██████ 3.5h                  │
│ Thu ░░░░░░ 0h                    │
│ Fri ░░░░░░ 0h                    │
│                                  │
│ [View Details]                   │
└─────────────────────────────────┘
```

**Technical Considerations:**
- Sum time estimates for all assignments
- Handle missing time estimates (show "Unknown")
- Use AI estimates when available
- Allow manual overrides (user-level)

**Dependencies:**
- Time estimation system (AI or manual)
- Assignment data with due dates
- Sub-task system (Phase 3)

**Open Questions:**
- Q: How to handle students who work slower/faster?
- Q: Include study time for tests?
- Q: Account for breaks/non-academic time?

---

## 🎯 Phase 2: The "Bessy Killer" - Grades & Planning

### Feature 2.1: "What If" Calculator ⭐ KILLER FEATURE

**User Story:**  
As a student, I want to calculate "What grade do I need on the final to get an A?" so I can set realistic goals.

**Acceptance Criteria:**
- [ ] Available on each course detail page
- [ ] Shows current grade calculation breakdown
- [ ] User can add hypothetical assignment:
  - Assignment name
  - Points possible
  - Expected score
- [ ] Calculator shows:
  - New overall grade after hypothetical
  - Difference from current grade
  - "You need X% to reach Y grade"
- [ ] Can test multiple scenarios
- [ ] Save scenarios (user-level preference)
- [ ] Share scenario with parent (optional)

**UI/UX Specifications:**
```
┌─────────────────────────────────┐
│ AP Biology - What If Calculator  │
├─────────────────────────────────┤
│ Current Grade: B+ (88%)          │
│                                  │
│ Add Hypothetical Assignment:     │
│ Name: [Final Exam          ]     │
│ Points: [200               ]     │
│ Score: [???                ]     │
│                                  │
│ ┌─────────────────────────────┐ │
│ │ To get an A (90%):          │ │
│ │ You need 185/200 (93%)      │ │
│ └─────────────────────────────┘ │
│                                  │
│ [Calculate] [Save Scenario]      │
└─────────────────────────────────┘
```

**Technical Considerations:**
- Weighted vs unweighted grades
- Extra credit handling
- Rounding rules
- Category weighting (if applicable)
- Save scenarios to Firestore (user document)

**Dependencies:**
- Grade normalization working
- Understanding of grading weights
- Course grade calculation logic

**Open Questions:**
- Q: How to handle category-weighted grades?
- Q: Maximum number of saved scenarios?
- Q: Should this work for individual categories?

---

### Feature 2.2: Unofficial Grades

**User Story:**  
As a student, I want to enter grades I got on paper assignments before they're in Schoology so my grade view is complete.

**Acceptance Criteria:**
- [ ] "Add Unofficial Grade" button on course page
- [ ] Form fields:
  - Assignment name
  - Points earned
  - Points possible
  - Date received (optional)
- [ ] Clearly marked with "Unofficial" badge
- [ ] Included in grade calculations
- [ ] When official grade appears, prompt to reconcile:
  - "Official grade now available: 85/100. Your unofficial: 88/100. Update?"
- [ ] Can edit or delete unofficial grades
- [ ] Visible to account (student + parents)

**UI/UX Specifications:**
```
Assignment List:
┌─────────────────────────────────┐
│ Essay Draft          88/100  ✓  │
│ Due: Oct 15  UNOFFICIAL          │
│ [Edit] [Delete]                  │
└─────────────────────────────────┘

Reconciliation Prompt:
┌─────────────────────────────────┐
│ Official Grade Available         │
│                                  │
│ Essay Draft                      │
│ Official:   85/100               │
│ Unofficial: 88/100               │
│                                  │
│ [Use Official] [Keep Unofficial] │
└─────────────────────────────────┘
```

**Technical Considerations:**
- Store in Firestore: `/accounts/{accountId}/unofficial_grades/`
- Flag as "reconciled" when official appears
- Exclude from sync (don't overwrite with API data)
- Include in all grade calculations

**Dependencies:**
- Grade calculation system
- Account-level data architecture

**Open Questions:**
- Q: What if unofficial and official don't match significantly?
- Q: Should we warn if grades are very different?
- Q: Archive unofficial after reconciliation?

---

## 🎯 Phase 3: Proactive Planning Engine

### Feature 3.1: Assignment Sub-Tasks

**User Story:**  
As a student with ADHD, I want to break down large assignments into smaller steps so I don't feel overwhelmed.

**Acceptance Criteria:**
- [ ] "Add Sub-task" button on assignment detail
- [ ] Each sub-task has:
  - Title (e.g., "Create outline")
  - Time estimate
  - Checkbox for completion
  - Optional notes
- [ ] Teacher can provide default sub-tasks (account-level)
- [ ] Student can override/customize (user-level)
- [ ] Sub-tasks show progress: "2 of 5 complete"
- [ ] Can reorder sub-tasks (drag-and-drop)

**UI/UX Specifications:**
```
┌─────────────────────────────────┐
│ Research Paper               75pts│
│ Due: Nov 15                      │
│                                  │
│ Progress: ████░░░░ 50% (2/4)     │
│                                  │
│ ☑ Choose topic         (0.5h)    │
│ ☑ Research sources     (2h)      │
│ ☐ Write outline        (1h)      │
│ ☐ Write draft          (3h)      │
│                                  │
│ [+ Add Sub-task]                 │
└─────────────────────────────────┘
```

**Technical Considerations:**
- Store sub-tasks in Firestore
- Teacher defaults: account-level
- Student customizations: user-level
- Track completion state per user
- Calculate time remaining

**Dependencies:**
- Assignment detail view
- Time estimation system
- Teacher interface (Phase 7)

**Open Questions:**
- Q: Max number of sub-tasks per assignment?
- Q: Should completion sync across student/parent?
- Q: Templates for common assignment types?

---

### Feature 3.2: Smart Sub-Task Defaults

**User Story:**  
As a teacher, I want to provide suggested sub-tasks for my assignments so students know how to approach the work.

**Acceptance Criteria:**
- [ ] Teacher can add "Planning Template" to assignment
- [ ] Templates based on assignment type:
  - Essay: Outline, Draft, Proofread, Final
  - Test: Review notes, Practice problems, Study group, Review again
  - Project: Research, Plan, Build, Test, Present
  - Reading: Read chapter, Take notes, Answer questions
- [ ] Students see template as starting point
- [ ] Students can accept, modify, or ignore
- [ ] Templates are suggestions, not requirements

**Technical Considerations:**
- Built-in templates for common types
- Teacher can create custom templates
- Store in `/assignments/{id}/planning_template`
- Student creates personal copy on first view

**Dependencies:**
- Teacher LTI interface (Phase 7)
- Sub-task system working
- Assignment type classification

**Open Questions:**
- Q: Who creates default templates (us or teachers)?
- Q: How to handle assignment types we don't recognize?
- Q: Should AI generate templates?

---

## 📋 Cross-Cutting Requirements

### Requirement: User vs Account Data Architecture

**Description:**  
Clear separation between data visible to all (account-level) and personal preferences (user-level).

**Account-Level Data (Shared):**
- Assignment details from Schoology
- Official grades
- Course information
- Teacher-provided time estimates
- Teacher-provided sub-task templates
- Unofficial grades added by student/parent

**User-Level Data (Personal):**
- Hidden/dismissed assignments
- Flagged assignments
- Personal time estimate overrides
- Sub-task customizations
- "What If" scenarios
- Notification preferences
- UI preferences (dark mode, default view)

**Technical Implementation:**
```
Firestore Structure:
/accounts/{accountId}/
  - assignments/ (account-level)
  - grades/ (account-level)
  - courses/ (account-level)
  - unofficial_grades/ (account-level)
  
/users/{userId}/
  - preferences/ (user-level)
  - hidden_items/ (user-level)
  - scenarios/ (user-level)
  - time_overrides/ (user-level)
```

---

### Requirement: Grade Normalization

**Description:**  
Consistently display grades regardless of original format (points, percentages, letters).

**Process:**
1. Fetch raw grade (e.g., 85 points earned)
2. Fetch max points (e.g., 100 points possible)
3. Calculate percentage (85/100 = 85%)
4. Fetch grading scale for course
5. Map percentage to letter (85% = B)
6. Display all three: "B (85% - 85/100)"

**Edge Cases:**
- Extra credit (>100%)
- Dropped assignments
- Weighted categories
- Pass/Fail assignments
- Not yet graded

**Technical Implementation:**
- Create `GradeNormalizer` utility class
- Cache grading scales
- Handle missing data gracefully
- Support multiple display formats

---

### Requirement: Mobile-First Responsive Design

**Description:**  
All features must work beautifully on mobile devices (375px width minimum).

**Breakpoints:**
- Mobile: 375px - 767px
- Tablet: 768px - 1023px
- Desktop: 1024px+

**Mobile Optimizations:**
- Bottom tab navigation
- Thumb-friendly tap targets (44px minimum)
- Swipe gestures for common actions
- Collapsible sections
- Infinite scroll vs pagination
- Optimistic UI updates

---

### Requirement: Performance Targets

**All Pages:**
- Initial load: <2 seconds
- Navigation: <500ms
- API response: <1 second
- Smooth animations: 60fps

**Optimization Strategies:**
- Code splitting by route
- Image lazy loading
- Firebase query optimization
- Aggressive caching (15min TTL)
- Service worker for offline

---

## 📝 Open Questions for Product Owner

**Priority Classification:**
1. **Strategy** - Affects product direction
2. **User Experience** - Impacts usability
3. **Technical** - Influences architecture
4. **Business** - Revenue/cost implications

---

### STRATEGY Questions

**Q1:** Who is our primary target user?
- Option A: High-achieving students (AP/Honors) who want optimization
- Option B: Struggling students who need organizational help
- Option C: Parents who want oversight and control
- **Impact:** Determines feature priority and UX tone

**Q2:** Freemium model - which features are premium?
- Option A: Basic grades/assignments free, advanced (AI, goals) premium
- Option B: Free for students, paid for parents with multiple children
- Option C: Completely free, monetize through partnerships
- **Impact:** Development priority, infrastructure costs

**Q3:** Geographic scope?
- US only (focus on large districts)
- International (multi-language support needed)
- **Impact:** Complexity, compliance (GDPR, etc.)

---

### USER EXPERIENCE Questions

**Q4:** Default notification settings for new users?
- Conservative (opt-in for most) vs Aggressive (opt-out model)
- **Impact:** User annoyance vs engagement

**Q5:** How much can students hide from parents?
- Nothing (full transparency)
- Soft preferences (can hide but parent can unhide)
- Hard privacy (some things parent can't see)
- **Impact:** Trust, adoption, family dynamics

**Q6:** Onboarding - show or discover?
- Detailed tutorial on first use
- Minimal hints, let users explore
- Contextual tooltips as needed
- **Impact:** Time to value, user confusion

---

### TECHNICAL Questions

**Q7:** AI Provider for future features?
- Google Gemini (ecosystem integration, potentially cheaper)
- OpenAI GPT (better quality, more expensive)
- Self-hosted open source (upfront cost, full control)
- **Impact:** Costs, capabilities, vendor lock-in

**Q8:** When to move beyond Firebase?
- Stay on Firebase indefinitely
- Plan migration at X users
- Hybrid (Firebase + custom backend)
- **Impact:** Development velocity, costs at scale

**Q9:** Offline mode priority?
- Phase 1 (critical)
- Phase 5 (nice-to-have)
- Never (always-online assumption)
- **Impact:** Complexity, user expectations

---

### BUSINESS Questions

**Q10:** Customer acquisition strategy?
- Direct to consumer (app stores, marketing)
- School district partnerships
- Teacher referrals
- **Impact:** Sales process, pricing model

**Q11:** Support model?
- Self-service only (docs, FAQ)
- Email support
- Live chat
- Phone support
- **Impact:** Headcount, costs, user satisfaction

---

## 📚 Related Documents

- **Strategic Roadmap:** Long-term vision (18-24 months)
- **Tactical Roadmap:** Sprint-by-sprint execution
- **Current Status:** Weekly progress tracking
- **User Journeys:** Implemented user flows
- **Architecture:** Technical system design

---

**This PRD is a living document. Update as features are implemented, requirements change, or new insights emerge!**
