# Extensibility & Automations

Last Updated: September 30, 2025
Scope: Customizable layouts, sharable presets, MCP server, smart triggers/notifications, user-authored scripts.

---

## 1) Extensible UI Layouts

- **Widget model**: Each dashboard module implements a contract `{ id, inputs, dataDeps, render, loadingPolicy }`.
- **Layout engine**: Grid with movable widgets (desktop) and reorder-only (mobile). Save named presets per user.
- **Sharing**: Export/import layout JSON via signed links; parent can share with other parent or student.

---

## 2) MCP Server (Developer Extensibility)

- Stand up an MCP server exposing read-only app APIs (assignments, grades, courses) with OAuth on behalf of user.
- Rate-limit and scope tokens; publish schema and examples.
- Use for internal automations and third-party academic tools.

---

## 3) Smart Triggers & Notification Recipes

- **Trigger sources**: grade changed, assignment due in X, workload > Y hrs/week, missing submission detected
- **Actions**: send in-app alert, schedule a study block, add a sub-task, notify parent/tutor, generate summary
- **Builder**: simple rule UI → (If [trigger] and [condition]) then [action]
- **AI Assist**: user types “Warn me if any course drops below B” → generates rule and confirms

---

## 4) User Scripts (Advanced)

- Sandbox scripts (TypeScript subset) with time and API quotas
- Scripts can read account-level data; writes gated behind confirmation or flags
- Publish gallery of vetted community recipes later

---

## 5) Sharing & Permissions

- Layouts: user-level; optional share to account
- Triggers/scripts: user-level; parents can share to viewer with read-only visibility
- Provenance recorded on all shared artifacts

---

## 6) Roadmap

- Phase 2: Define widget contract; implement Grades/Assignments widgets
- Phase 3: Save/load layouts; simple reorder
- Phase 4–5: Sharing; basic triggers (pre-baked)
- Phase 6+: AI-generated recipes; scripts sandbox (beta)
