# Modern Teaching - Tactical Roadmap (Q4 2025)

**Last Updated:** September 30, 2025  
**Planning Period:** October - December 2025  
**Current Phase:** Phase 1 - Foundation & Core Value

---

## 🎯 Q4 2025 Objectives

**Primary Goal:** Deliver a working MVP that provides immediate value over native Schoology

**Success Criteria:**
- User can authenticate and view real data <2 seconds
- Dashboard shows all courses, grades, assignments
- Parent can switch between children seamlessly
- Grade normalization working (points/letters/percentages)
- 100% mobile responsive
- Zero critical bugs

---

## 📅 Sprint Plan (2-Week Sprints)

### Sprint 1: Oct 1-14 - Data Foundation ✅ COMPLETE

**Goals:**
- ✅ OAuth authentication with persistent sessions
- ✅ E2E test infrastructure
- ✅ Repository cleanup
- ✅ Technical documentation

**Completed:**
- Persistent browser auth (no hCaptcha on re-run)
- 7 automated E2E tests
- Removed 36 old/unused files
- Strategic roadmap created

---

### Sprint 2: Oct 15-28 - Rich Data & Display

**Goals:**
1. **Seed Data Expansion** ⭐ HIGH PRIORITY
   - Expand Tazio Mock: Add 20+ assignments across all courses
   - Add Carter Mock: Different course load, different grade profile
   - Add variety: Tests, quizzes, projects, homework, essays
   - Include grading scales: Points, percentages, letter grades
   - Add realistic due dates (past, present, future)

2. **Dashboard Refinement**
   - Implement 3 key widgets:
     - Upcoming Assignments (consolidated view)
     - Grades At-a-Glance (Bessy-style)
     - Workload Summary (total hours)
   - Mobile-first responsive layout
   - Loading states and error handling

3. **Grade Normalization**
   - Fetch grading scales from API
   - Calculate percentages from points
   - Map to letter grades
   - Display: "B (85% - 85/100)"

**Success Metrics:**
- Dashboard loads all widgets <2s
- Grades display correctly (all 3 formats)
- At least 20 assignments per student
- Mobile UI looks polished

**Risks:**
- Schoology API rate limits
- Complex grading scale edge cases
- Time estimation for tasks

**Mitigation:**
- Implement caching aggressively
- Test with various grading scales
- Start simple, iterate

---

### Sprint 3: Oct 29 - Nov 11 - Parent Experience & Navigation

**Goals:**
1. **Parent-Child Switching** ⭐ CRITICAL
   - Smooth profile switcher UI
   - Preserve scroll position on switch
   - Show which child is active
   - Handle loading states gracefully

2. **Navigation Structure**
   - Implement bottom tab bar (mobile)
   - Dashboard, Planner, Grades, Settings tabs
   - Context-aware drill-downs
   - Breadcrumb navigation

3. **Settings & Preferences**
   - User vs Account data architecture
   - Notification preferences UI
   - Connected accounts management
   - Hidden items log

**Success Metrics:**
- Parent can switch children <1s
- Tab navigation intuitive
- Settings persist correctly
- User/Account data separated

---

### Sprint 4: Nov 12-25 - Grades Tab & "What If" Calculator

**Goals:**
1. **Dedicated Grades View** ⭐ KILLER FEATURE
   - Bessy-style clean list
   - Overall GPA calculation
   - Course detail drill-down
   - Grade trend visualization

2. **"What If" Calculator**
   - Add hypothetical grades
   - See real-time impact
   - "What do I need to get an A?" mode
   - Save scenarios (user-level)

3. **Unofficial Grades**
   - Parent/student can add paper grades
   - Clearly marked as "Unofficial"
   - Include in calculations
   - Sync when official grade appears

**Success Metrics:**
- "What If" feature works accurately
- Users understand unofficial vs official
- Calculator is mobile-friendly
- Performance stays <2s

---

### Sprint 5: Nov 26 - Dec 9 - Planner & Assignments

**Goals:**
1. **Planner Tab**
   - Consolidated assignment list
   - Filter by date, type, course
   - Checkboxes for completion
   - Time estimates visible

2. **Assignment Detail View**
   - Full assignment info
   - Due date, description, attachments
   - Submission status
   - Grade (if graded)

3. **Smart Filtering**
   - Show only tests
   - Show only this week
   - Show only ungraded
   - Custom date ranges

**Success Metrics:**
- All assignments visible in one view
- Filters work intuitively
- Detail view comprehensive
- Mobile UX smooth

---

### Sprint 6: Dec 10-23 - Polish & Performance

**Goals:**
1. **Performance Optimization**
   - Reduce initial load time
   - Optimize Firebase queries
   - Implement proper caching
   - Lazy load images/components

2. **Error Handling**
   - Graceful API failures
   - Offline mode basics
   - User-friendly error messages
   - Retry logic

3. **UX Polish**
   - Smooth animations
   - Loading skeletons
   - Empty states
   - Success confirmations

4. **Testing & Bug Fixes**
   - Run full E2E suite
   - Fix all critical bugs
   - Cross-browser testing
   - Mobile device testing

**Success Metrics:**
- Load time <2s consistently
- Zero critical bugs
- Smooth animations
- Positive user feedback

---

## 🚀 Quick Wins (Any Sprint)

These can be tackled opportunistically:

- ✅ Fix TypeScript/ESLint errors in next.config.ts
- ✅ Update .idx/ files for Firebase Studio compatibility
- ✅ Add more comprehensive error logging
- ✅ Implement basic analytics (page views, feature usage)
- ✅ Create onboarding tooltips
- ✅ Add keyboard shortcuts
- ✅ Dark mode toggle

---

## 📊 Metrics to Track

**Weekly:**
- Load time (p50, p95, p99)
- API response time
- Error rate
- Test pass rate

**Bi-Weekly:**
- Feature completion %
- Bug count (critical, major, minor)
- Code coverage %
- Technical debt items

**Sprint Retro:**
- Velocity (story points)
- Blockers encountered
- Learnings & improvements
- User feedback themes

---

## 🎯 Definition of Done

**For Any Feature:**
- [ ] Code written and reviewed
- [ ] E2E test added/updated
- [ ] Mobile responsive
- [ ] Error handling implemented
- [ ] Loading states added
- [ ] Documentation updated
- [ ] No new TypeScript errors
- [ ] Performance <2s target met
- [ ] Deployed to staging
- [ ] Product owner approved

---

## 🚧 Known Blockers & Dependencies

### Current Blockers:
1. **Seed Data Quality**
   - Need realistic variety of assignments
   - Different grading scales
   - Past/present/future due dates
   - **Resolution:** Sprint 2 focus

2. **Grade Normalization Complexity**
   - Multiple grading scales
   - Edge cases (extra credit, weighted)
   - **Resolution:** Start simple, iterate

3. **Mobile Testing**
   - Need real device testing
   - iOS vs Android differences
   - **Resolution:** Test on personal devices, use BrowserStack

### Dependencies:
- Schoology API stability ✅
- Firebase costs remain reasonable ✅
- Next.js 15 compatibility ✅

---

## 📝 Technical Debt Register

**High Priority:**
1. Remove `ignoreBuildErrors` from next.config.ts
2. Fix all TypeScript errors
3. Implement proper error boundaries
4. Add request deduplication

**Medium Priority:**
5. Optimize Firebase queries (batch reads)
6. Implement service worker for offline
7. Add request caching headers
8. Refactor data transformation logic

**Low Priority:**
9. Add Storybook for component library
10. Implement E2E visual regression tests
11. Add performance monitoring
12. Create component documentation

---

## 🎉 Sprint Ceremonies

**Monday:**
- Sprint Planning (if new sprint)
- Review backlog priorities
- Estimate upcoming work

**Wednesday:**
- Mid-sprint check-in
- Unblock any issues
- Adjust scope if needed

**Friday:**
- Sprint Review/Demo
- Retrospective
- Plan next sprint

**Daily:**
- Async updates (no meetings)
- Track progress in CURRENT-STATUS.md
- Flag blockers immediately

---

## 📚 Related Documents

- **Strategic Roadmap:** `STRATEGIC-ROADMAP.md` - Long-term vision
- **Product Requirements:** `PRODUCT-REQUIREMENTS.md` - Feature specs
- **Current Status:** `CURRENT-STATUS.md` - Daily progress
- **Architecture:** `ARCHITECTURE.md` - Technical design

---

**This is a living document. Update weekly or when priorities shift!**
