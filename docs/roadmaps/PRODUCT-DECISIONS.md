# Product Owner Decisions Summary

**Date:** October 1, 2025  
**Decided By:** Ryan Hickman  
**Source:** My-Decisions-Ryan_2025-10-01.md

---

## 📋 Critical Decisions Made

### C1. Feature Sequencing Philosophy → **"Complete Read-Only + AI Agent MVP"**

**Decision:** Build a comprehensive read-only mirror of ALL Schoology data, PLUS conversational AI in MVP

**MVP Scope:**
- ✅ Complete read-only view of everything in Schoology
- ✅ Mirror all data to our database (sync during user sessions)
- ✅ Parent-to-student mapping (parents see children's data)
- ✅ **AI conversational interface (text + voice)** - "Talk to your data"
- ✅ Support for parents (priority #1), students (priority #2)

**Post-MVP:**
- ⏳ Executive function planning (sub-tasks, scheduling, calendar)
- ⏳ User data entry and editing capabilities
- ⏳ Teacher access within Schoology (LTI integration)
- ⏳ External party access (grandparents, tutors)

**Rationale:**
- Not much diversity of data per user in Schoology → cover it all
- Read-only provides immediate value (alternative to checking Schoology)
- Mirroring data = performance + no API saturation
- AI is the differentiator for this era
- Don't need write features until strong support channels established

---

### C2. Offline Mode Priority → **Performance-Focused Caching (Not Full Offline)**

**Decision:** Aggressive caching for performance, but NOT full offline support in MVP

**What We're Building:**
- ✅ Mirror Schoology data to our database (don't constantly hit their API)
- ✅ Aggressive client-side caching (modern web/mobile techniques)
- ✅ View-only mode with cached data if available
- ✅ Client-side AI models (e.g., Gemini Nano) work offline

**What We're NOT Building (Yet):**
- ❌ Full offline support (e.g., plane mode with local edits that sync later)
- ❌ Background syncing when user not active in app
- ❌ Offline notifications

**Future (Post-MVP):**
- ⏳ Background syncing for notifications and alerts
- ⏳ Security model for syncing outside user sessions

**Rationale:**
- About efficiency and performance, not enabling full offline
- Users don't need to make local entries/edits offline
- Background syncing needed for notifications later

---

### C3. Student Privacy Philosophy → **"Collaborative with Private Options"**

**Decision:** Hybrid approach - Schoology data shared, user-added data can be private

**Schoology Data (Read-Only):**
- Shared by all users (parents, teachers, students)
- Mirror what Schoology does today
- Everyone sees same assignments, grades, announcements

**User-Added Data (Post-MVP):**
- **Default:** Shared with all associated users
- **Option:** Mark as private (visible only to creator)
- **Examples:**
  - Student notes about test → can be private from parents
  - Student sub-tasks → can be private from parents
  - Parent TODOs → can be private from students
  - "Reach out to teacher about poor grades" → private

**User Preference Setting:**
- Switch default from "shared" to "hidden"
- For users who rarely/never want data seen by others

**Transparency:**
- Clear attribution: who added, who edited, when
- Change log available in profile/settings

**Rationale:**
- Start with transparency (default shared)
- Provide privacy when needed
- Empowers both students (autonomy) and parents (oversight)

---

### C4. What-If Calculator Accuracy → **Post-MVP, Best-Effort Approach**

**Decision:** Not in MVP (not read-only). Best-effort when added later.

**Rationale:**
- Not a read-only feature
- Need to explore Bessy first (Ryan hasn't used it)
- GIGO problem: varied grading systems across teachers/schools
- Some classes: just "82%" (no letter)
- Some classes: just "B" (no percentage)
- Middle schools: 1-4 scale (no letters or percentages)
- Will get user feedback and more real data before building

**Future Approach:**
- Best-effort calculator with transparent math shown
- Handle simple cases well
- Acknowledge complexity for edge cases
- Explore Schoology data schema depth first

---

### C5. AI Integration Timing → **MVP / Phase 1**

**Decision:** AI conversational interface (text + voice) is IN THE MVP

**MVP AI Features:**
- ✅ **Text queries:** "What's due this week?"
- ✅ **Voice queries:** "When is my next math test?"
- ✅ **Parent queries:** "What is my child overdue on?"
- ✅ Use LLM flexibility - don't need to anticipate all questions
- ✅ Provide metadata in format models can parse

**Technical Approach:**
- Use small models: Gemini Nano (client-side), Gemini Flash (cloud)
- Ship fast and adjust based on user feedback
- Log AI suggestions vs. user choices (weakly supervised feedback)
- Use for debugging, usage patterns, fine-tuning data
- Sanitize for PII and differential privacy

**Future AI Features (Post-MVP):**
- AI-driven notifications
- AI-suggested sub-tasks
- AI layout customization
- Proactive insights

**Rationale:**
- "This is the era of AI" - need to delight users beyond just fresh UX
- Biggest low-hanging fruit
- Users expect text + voice
- LLMs handle unexpected queries naturally

---

## 🎯 Additional Strategic Decisions

### Target User Priority

**Priority Order:**
1. **Parents** (#1) - They control wallets, no Bessy alternative, will pay
2. **Students** (#2) - Want AI to "talk" to data
3. **Teachers** (#3) - Post-MVP, need LTI integration
4. **External parties** (#4) - Grandparents, tutors, etc.

**Initial Target Districts:**
- Palo Alto Unified School District (Palo Alto High, Greene Middle)
- Fremont Unified School District (Fremont High)

---

### Pricing Strategy

**MVP:** Free
- Whitelisted individual users
- Whitelisted individual schools
- Can't go viral and cause unexpected costs

**Post-MVP:**
- Keep students FREE always
- Charge parents for revenue
- One payment per family (all users get same access)
- Some advanced AI features gated for students until payment

**Future Revenue Streams:**
- Sponsorships
- Referral programs

**TODO:** Create detailed pricing exploration document (external AI prompt)

---

### Student Privacy vs. Parent Oversight Philosophy

**Decision:** "Collaborative with Private Options"

**Schoology Data (Read-Only):**
- Shared by all associated users (parents, teachers, students), mirroring Schoology's current visibility rules. Everyone with access sees the same assignments, grades, and announcements.

**User-Added Data (Post-MVP):**
- **Default:** Shared. New data (notes, sub-tasks, etc.) is visible to all associated users by default.
- **Privacy Option:** Users can explicitly mark any item they create as "private," making it visible only to them.
- **User Preference:** A global setting will allow users to change their default from "shared" to "private" for all new items they create.

**Transparency:**
- All user-created or modified items will have clear attribution (e.g., "Note added by Ryan," "Task hidden by Carter").
- A change log will be accessible in the profile or settings area to provide an audit trail of user actions.

**Rationale:**
- This hybrid model fosters transparency and collaboration by default, which is essential for a family management tool.
- It also provides students with the autonomy and privacy needed for personal executive function planning, reducing the feeling of surveillance.
- The audit trail ensures that actions are never ambiguous, preventing disputes between users.

---

### Geographic & Language Support

**Launch:** US only
- Legal and technical complexity reasons
- Preserve whitelist capability for feature flags/betas

**Languages (Future):**
- High value in Bay Area: English, Spanish, Mandarin
- Need i18n for UI elements
- Optional translation of Schoology data (courses, assignments, announcements)
- Design MVP to make translation easier later (not major refactor)

**TODO:** Research i18n options for trivial implementation

---

### Notifications

**MVP:** None

**Post-MVP:**
- Requires offline data syncing (servers + mobile apps)
- AI-driven notification rules
- Examples:
  - Student: "Notify me if I have a test coming up and haven't studied for"
  - Parent: "Notify me right away if any assignment becomes past due"
- Structure: Map text to database query + cron OR save prompt and schedule agentic run
- In-app notifications first
- Later: Mobile app OS notifications
- Future: Push notifications (may not be needed if mobile apps work)

---

### Onboarding

**Philosophy:** No wizards or tutorials (Ryan hates them)

**Approach:**
- UX should be simple enough to not require guidance
- Promote underutilized features (e.g., AI mode)
- If user doesn't try AI shortly after login, highlight it (don't gate)
- Consider app-level notification permissions for later engagement

**Rationale:**
- Tutorials slow experience, add engineering overhead
- Simple UX > explanations

---

### Parent-Child Switching

**UX:** Two-click operation
1. Click current profile avatar (opens menu)
2. Click other child to switch

**Design:**
- Selected child becomes prominent profile avatar
- NO banner like Schoology's "You are viewing as Carter Mock"
- Profile avatar + name should suffice
- Use Schoology's profile image (not custom default)
- Schoology uses random color patterns - helps recognition

**Data Loading:**
- Pull ALL parent AND student data upon login
- Don't wait for parent to switch to fetch student data
- Switching should be instant

**Session Management:**
- NO per-student viewing positions (scroll, sub-page)
- Consider user preference for starting page (defer for now, use dashboard)
- Keep user on current page/tab until Schoology cookie expires
- Dynamic URLs for bookmarking and deep links

---

### Navigation

**Mobile:** Bottom tabs (confirmed)

**Desktop/Web:** Left-hand side nav
- More common UX for landscape experience
- Ryan welcomes suggestions

**Deep Linking:**
- Dynamic URLs for bookmarks
- Enable deep links between users
- Example: "Mom sends child text linking to math course"

---

### Analytics & Monitoring

**Analytics:**
- Use Firebase + Google Analytics (tight integration)
- Track user flows and macro activity trends
- Careful PII screening for user-entered data
- Secure storage and access controls

**Audit Trail:**
- Immutable audit trail for admin superuser tasks
- Example: Troubleshooting bug in student account
- Ethical standards and security compliance

**Monitoring & Alerting:**
- Alert on login failures (users unable to log in)
- Alert on repeated API call failures (Schoology downtime)
- Alert on crashes post-release
- **TODO:** Research 3rd party solutions
- **TODO:** Explore Firebase, GCP, iOS App Store, Android Play Store tools

---

### Historical Data & School Years

**Schoology Limitation:** Current school year only, no prior year access, blank in summer

**Modern Teaching Solution:**
- School year picker
- Preserve historical data across grades
- Handle student repeating grade: "Junior year 2024-25", "Junior year 2025-26"
- Optional summer school semesters

---

### Data Suppression vs. Privacy

**User-Entered Data:** Mark as private (covered in C3)

**Schoology Data (Annoying Noise):**
- Per-user suppression/archiving
- Teacher floods of unhelpful entries → user can dismiss
- Past due items never to be completed → user can archive
- **Important:** Per-USER, not per-ACCOUNT
  - Child archiving shouldn't hide from parent
- Future: Intelligent filtering to surface important items

---

### Performance Targets

**Our App:** <2 seconds for everything
- Page loads
- Data from Firestore
- Reject PRs that exceed 2s

**Schoology API:** Accept whatever it is
- Track metrics for monitoring
- Can't control their response times

**Exception:** Local client-side AI models (needs exploration)

**Data Freshness:**
- Poll for changes once per minute during active sessions
- **TODO:** Explore Schoology API high-water mark for recent changes

---

### Calendar Integration

**MVP/Phase 4:** Google Calendar + Apple iCal only

**Future:** Reconsider others if demand exists

---

### Support Model

**MVP:** Self-service
- Documentation
- FAQ
- Later: RAG doc for client AI model to answer "how to" questions

**Future:** 3rd party support teams for premium tickets

---

### State Management

**Decision:** Ryan needs more guidance

**TODO:** Provide clear recommendation with examples

---

## 🆕 New Features & Integrations Identified

### 1. ClassLink Auth Support

**Need:** Some users log in via PowerSchool-affiliated systems
- Example: Christina logs in at `https://login.classlink.com/my/pausd`
- Then redirected to Schoology
- **TODO:** Ensure our auth works with ClassLink flow

---

### 2. Infinite Campus Integration (Attendance)

**Need:** Schoology supports attendance, but local districts don't display it
- Have to use Infinite Campus instead
- **TODO:** Research Infinite Campus integration
- **Challenge:** Auth flow may be different from Schoology

---

### 3. School Information

**Data to Provide:**
- Mailing address
- Absence hotline
- Front desk phone
- Teacher contact info
- Leadership contact info
- Links to school/district websites

---

### 4. Holiday Schedules & Special Days

**Schoology Calendar Should Have:**
- Teacher work days
- Holidays
- Early dismissal days
- Late start days

**Value for AI Context:**
- "When is the next three-day weekend for school?"
- "What dates are spring break next year?"

**Parent Pain Point:** Keeping tabs on special schedules

---

### 5. AI-Driven Layout Customization (Future R&D)

**Phase 1 (MVP):** Pure text responses
- List or prose in response to queries

**Future:**
- "Stop showing my upcoming events for History" → suppress widget
- "Add a box showing my last test score to top of course pages"
- "Use the official colors of the 49ers" → adopt red and gold styling
- Mini R&D project to explore approaches

---

### 6. MCP Server for User Custom Apps

**Vision:** User can make entire app in Replit or Lovable
- Taps into Modern Teaching via MCP
- Provide base templates
- Users vibe code something new for themselves

---

### 7. MCP Integrations (Future)

**3rd Party Services:** Khan Academy, etc.
- Set up MCP server to talk to their MCP servers
- Modern approach vs. traditional API integrations

---

## 📝 Open Items Requiring Further Exploration

### 1. State Management Guidance (HIGH PRIORITY)

**Status:** Ryan needs more guidance to make decision  
**Need:** Clear recommendation with examples  
**Context:** Context + SWR vs. Zustand vs. other

---

### 2. Monitoring & Alerting Solutions (HIGH PRIORITY)

**Questions:**
- How to be alerted to downtime issues?
- How to detect login failures?
- How to detect repeated API call failures?
- How to detect post-release crashes?

**TODO:** Research:
- 3rd party monitoring solutions (affordable)
- Firebase/GCP tools
- iOS App Store tools
- Android Play Store tools

---

### 3. i18n Implementation Strategy (MEDIUM PRIORITY)

**Questions:**
- What options exist for trivial i18n?
- How to handle UI elements?
- How to optionally translate Schoology data?

**TODO:** Research translation approaches that:
- Are easy in MVP OR
- Design MVP to make later addition easier (not major refactor)

---

### 4. Pricing Strategy Deep Dive (MEDIUM PRIORITY)

**Need:** Detailed exploration of pricing strategies

**TODO:** Create external AI prompt document to explore:
- Market research
- Competitor pricing
- Willingness to pay (parents)
- Free student tier economics
- Family plan structures
- Feature gating strategies

---

### 5. Grade Weighting Complexity (MEDIUM PRIORITY)

**Status:** Need more real user data

**TODO:**
- Deeply explore Schoology data schema
- Understand complexity limits
- Test with real courses (few dozen assignments, 2-3 weight values)

**Before Building:**
- Get user feedback
- Have more real data to work with

---

### 6. Sub-Task AI Prompting (LOW PRIORITY - Post-MVP)

**Need:** Flesh out after trying AI models with real user data

**Approach:**
- Right system prompt + right context
- Not ready to explore yet
- Local edge AI: included feature
- Cloud AI + proactive notifications: paid tier

---

### 7. ClassLink Auth Integration (MEDIUM PRIORITY)

**TODO:** Research and test auth flow via ClassLink

---

### 8. Infinite Campus Integration (MEDIUM PRIORITY)

**TODO:**
- Research Infinite Campus API
- Understand auth flow differences
- Determine integration complexity

---

### 9. AI Model Performance for Local Use (LOW PRIORITY)

**Context:** <2s performance target may have exception for local client AI

**TODO:** Explore and test performance characteristics

---

### 10. Schoology API Freshness Detection (MEDIUM PRIORITY)

**Question:** Does Schoology API offer high-water mark for recent changes?

**TODO:** Research polling optimization strategies

---

## 📋 Documents to Create

### 1. UI Mockup Specification (IMMEDIATE)

**Ryan's Request:**
> "What I'll need from my AI agent in Cursor is to create a prompting document that lists each of the pages, tabs, icons, or affordances we want to mock up. It would have to include details of WHAT's in each region of the page, along with some mock example data, while not specifying the layout itself."

**Deliverable:** `UI-MOCKUP-SPEC.md`
- List all pages, tabs, icons, affordances
- Details of WHAT's in each region
- Mock example data
- NOT layout (that's for Figma/Nano Banana)

**Ryan can work on this while AI agent codes**

---

### 2. Pricing Strategy Exploration Prompt (IMMEDIATE)

**Purpose:** External AI exploration document

**Deliverable:** `PRICING-STRATEGY-EXPLORATION.md`
- Prompt for external AI (not Cursor)
- Deep dive into pricing models
- Market research approach
- Competitor analysis
- Feature gating strategies

---

## 🎯 Updated MVP Scope Summary

### In Scope for MVP

**Core Functionality:**
- ✅ Complete read-only view of ALL Schoology data
- ✅ Data mirroring to our database
- ✅ Parent-to-student account mapping
- ✅ Parent view of children's data
- ✅ Two-click child switching
- ✅ Dynamic URLs for bookmarks and deep links

**AI Features:**
- ✅ Conversational AI (text + voice)
- ✅ Query answering about data
- ✅ Gemini Nano (client-side) + Flash (cloud)

**User Experience:**
- ✅ Simple UX (no wizards/tutorials)
- ✅ Bottom tabs (mobile), left nav (desktop)
- ✅ <2s performance target
- ✅ Aggressive client caching

**Data & Privacy:**
- ✅ Mirror Schoology data visibility rules
- ✅ User preference for default sharing behavior (design for future)

**Infrastructure:**
- ✅ Firebase + Google Analytics
- ✅ Audit trail for admin actions
- ✅ Whitelisted users and schools

**Target Users:**
- ✅ Parents (priority #1)
- ✅ Students (priority #2)

---

### Explicitly Out of Scope for MVP

**Post-MVP Features:**
- ❌ User data entry and editing
- ❌ Sub-tasks for assignments
- ❌ Calendar integration
- ❌ "What If" calculator
- ❌ Scheduling and planning tools
- ❌ Notifications
- ❌ Background data syncing
- ❌ Teacher access / LTI integration
- ❌ External party access (grandparents, tutors)
- ❌ Full offline support
- ❌ Payment processing
- ❌ Advanced AI features (proactive insights, layout customization)

---

## ✅ Next Steps

1. **Create Updated Documentation:**
   - MVP-ROADMAP.md (new unified vision)
   - Update STRATEGIC-ROADMAP.md
   - Update TACTICAL-ROADMAP.md
   - Update TECHNICAL-ARCHITECTURE-DECISIONS.md

2. **Create New Documents:**
   - UI-MOCKUP-SPEC.md (for Figma/Nano Banana work)
   - PRICING-STRATEGY-EXPLORATION.md (external AI prompt)
   - FOLLOW-UP-QUESTIONS.md (items needing exploration)

3. **Provide Guidance:**
   - State management recommendation
   - Monitoring/alerting options
   - i18n implementation strategies

4. **Archive Old Plans:**
   - Move conflicting documents to `.journal/`
   - Preserve for historical reference

---

**Decisions Summary Complete. Ready to update all documentation.**


