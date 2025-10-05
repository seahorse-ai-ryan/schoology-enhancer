# Seed Data Expansion Plan

Last Updated: September 30, 2025
Scope: Expand mock Schoology data for realistic demos and testing.

---

## Objectives

- Provide rich, varied data for dashboard, grades, planner, and calendar surfaces
- Cover edge cases: weighted grades, extra credit, missing due dates, pass/fail, late submissions

## Students

- **Tazio Mock**: 9 courses, mid-tier GPA, heavy assignment load
- **Carter Mock**: 8 courses, higher GPA, AP-heavy schedule
- **Livio Mock**: 6 courses, mixed performance, electives

## Courses (examples per student)

- AP Biology, US History, English, Pre-Calc, Physics, Computer Science, Advisory, PE, Art/Elective

## Assignments Inventory Targets

- Per student: 20–30 assignments across 4 weeks
- Types: tests (20%), quizzes (15%), homework (35%), projects (10%), essays (10%), labs (10%)
- Status mix: overdue (10%), due today (5%), due this week (50%), due next week (25%), future (10%)

## Grading Scales & Weights

- Standard 90/80/70… letter mapping
- Weighted categories per course (e.g., Tests 40%, HW 30%, Labs 30%) for at least 3 courses
- Include 1 course with pass/fail assignments
- Include 1 course with extra credit ( >100% )

## Data Fields per Assignment

- title, course_id, type, due_date, points_possible, points_earned (or null), weight_category (optional), description snippet

## Generation Approach

- Author JSON in `seed/sandbox/*.json` with deterministic IDs
- Provide a small Node script `scripts/generate-seed-calendars.ts` to add calendar items based on due dates (read-only)
- Maintain a “diff log” to track changes across runs

## Validation & Testing

- Unit tests for grade normalization against seed fixtures
- E2E screenshot comparisons for dashboard widgets with seed profiles

## Timeline

- Week 1: Tazio expansion complete; add grading scales
- Week 2: Carter/Livio expansion; add project/essay heavy weeks
- Week 3: Edge-case infusion (extra credit, pass/fail, missing due dates)
