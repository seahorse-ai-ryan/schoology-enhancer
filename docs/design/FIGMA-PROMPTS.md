# UI Mockup Prompts - Intro & Context

**Created:** October 3, 2025  
**Purpose:** AI-ready intro prompts for Figma and Gemini Nano Banana  

---

## 📖 How To Use

### For Gemini Nano Banana (Quick Visual Exploration):
1. Copy **"Gemini Intro"** + **"Shared Context"** → Start session
2. Feed one screen prompt at a time from UI-PROMPTS-SCREENS.md
3. Generate multiple variations quickly
4. Explore colors, layouts, visual hierarchy

### For Figma AI (Interactive Prototype):
1. Copy **"Figma Intro"** + **"Shared Context"** → Start session
2. Let it build navigation first
3. Feed screen prompts one at a time from UI-PROMPTS-SCREENS.md
4. Build connected prototype

---

# 🎨 FIGMA INTRO PROMPT

You are designing an interactive prototype for **Modern Teaching**, a mobile-first PWA for viewing Schoology student data.

**Project:**
- Read-only view of courses, assignments, grades, announcements
- AI conversational interface (text + voice)
- Target: Parents and high school students (Bay Area)
- Platform: Progressive Web App (mobile-first)

**Navigation (Critical for Figma):**

**Mobile:** Bottom tabs: Dashboard, Courses, Assignments, Grades, Settings
**Desktop:** Left sidebar (same 5 items)
**Header:** Logo, user avatar, child selector (for parents)
**AI:** Floating action button on all screens

**Design Principles:**
1. Simple & Fast - no tutorials, <2s load times
2. Mobile-First - 44px min tap targets
3. Performance - skeleton loading states
4. Clarity - clear labels, no jargon
5. Accessibility - 4.5:1 contrast, color + icon/text

**Colors:**
- Primary: Blue (#3B82F6)
- A Grade: Green (#10B981)
- B Grade: Blue (#3B82F6)
- C Grade: Yellow (#F59E0B)
- D/F Grade: Red (#EF4444)
- Neutral: Gray (#6B7280)

**Typography:** Sans-serif, 16px desktop, 14px mobile min

**Spacing:** 8px grid, 16-24px padding on mobile

**Patterns:** Cards, status badges, course color coding, pull-to-refresh

Build connected pages with working navigation.

---

# 🖼️ GEMINI INTRO PROMPT

Generate UI mockup images for **Modern Teaching**, a mobile-first web app for viewing Schoology student data.

**App:** Students/parents view courses, assignments, grades with AI assistant

**Audience:** High school students (14-18) and parents, tech-savvy, Bay Area

**Design Goals:**
- Modern, clean, minimalist (like Notion, Linear, Apple Notes)
- Fast-looking, minimal clutter
- Mobile-first (iPhone/Android)
- Accessible, high contrast
- Professional but friendly

**Visual Style:**
- Color: Professional blue/teal primary, grade colors (Green=A, Blue=B, Yellow=C, Red=D/F)
- Typography: Sans-serif, readable, generous line height
- Layout: Card-based, ample whitespace
- Icons: Simple, consistent (outline or filled)

**Key Elements:**
- Status badges (colored pills)
- Course color coding
- Circular avatars
- Clear CTAs

**Do NOT:** Stock photos, childish design, dense tables, tiny text, low contrast

**Output:** Mobile viewport (375x812px), high fidelity, realistic data

---

# 📦 SHARED CONTEXT

**Append to either intro:**

## Persona: Tazio Mock (11th Grade Student)

**Courses (9):**
1. AP Biology (Ms. Johnson) - A- (92%)
2. US History (Mr. Chen) - B+ (88%)
3. English 11 (Ms. Rodriguez) - A (94%)
4. Pre-Calculus (Mr. Patel) - B (85%)
5. Spanish III (Sra. Garcia) - A (96%)
6. Chemistry (Dr. Smith) - B+ (89%)
7. PE (Coach Williams) - A (98%)
8. Economics (Ms. Brown) - B (83%)
9. Art History (Ms. Taylor) - A- (91%)

**GPA:** 3.6 | **Profile:** Mixed grades, some overdue, busy junior

## Sample Assignments:

1. Chapter 5 Test - Cellular Respiration | AP Biology | Wed Oct 9, 11:59 PM | 100 pts | Upcoming
2. Weekly Vocabulary Quiz | Spanish III | Fri Oct 4, 9:00 AM | 20 pts | Due Tomorrow
3. Problem Set 3.2 | Pre-Calculus | Thu Oct 3, 11:59 PM | 10 pts | Due Today
4. Research Paper - WWII | US History | Mon Oct 21, 11:59 PM | 150 pts | Upcoming
5. Photosynthesis Lab Report | AP Biology | Wed Oct 3, 3:00 PM | 30 pts | Overdue

## UI Patterns:

**Status Badges:** Upcoming (Blue), Due Today (Orange), Overdue (Red), Completed (Green), Graded (Purple)

**Grade Colors:** A (Green), B (Blue), C (Yellow), D/F (Red), Ungraded (Gray)

**Current:** Tuesday, October 1, 2025 at 2:30 PM | Q1 2025-26

---

**End of Intro & Context - Use with screen prompts from UI-PROMPTS-SCREENS.md**
