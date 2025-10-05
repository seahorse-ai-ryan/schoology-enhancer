# UX Experimentation Plan

Last Updated: September 30, 2025
Scope: How to test UI/UX rapidly without full builds.

---

## 1) Thin-Slice Demos

- Build read-only versions first (Planner, Calendar) behind flags.
- Ship minimal data-binding with seed fixtures; avoid write paths.
- Use screenshots + short videos to collect feedback asynchronously.

## 2) Prototyping Tiers

- Tier 0: Figma quick mock (hours)
- Tier 1: Clickable HTML mock (static, Tailwind) (half-day)
- Tier 2: Read-only widget in app (1–2 days)
- Tier 3: Partial data-binding (another day)

## 3) Feature Flags & Cohorts

- Remote config toggles by user/email/school.
- A/B small cohorts; collect usage metrics and drop-off heat.

## 4) Feedback Capture

- In-widget “Was this helpful?” thumbs + text box.
- Optional quick-form with a 3-question survey (task success, clarity, speed).

## 5) Experiment Kill Switch

- Every experiment must be removable in 1 commit or 1 flag flip.
- Set auto-expiry on flags (e.g., 14 days) to avoid zombie experiments.

## 6) Success Criteria (examples)

- Grades widget: users can identify worst course in <3s.
- Planner: users find “Show only this week’s tests” in <2 taps.
- Calendar: event conflict indicator noticed without tooltip.

## 7) Research Cadence

- Weekly: 2–3 participant usability sessions (remote, 15 minutes).
- Monthly: synthesize findings; update PRD acceptance criteria.
