# Identity & Access Design (I&A)

Last Updated: September 30, 2025
Scope: Family sharing, support roles (tutors/therapists), third-party SSO, viewer-only roles.

---

## 1) Accounts & Actors

- **Account**: Represents a student + linked caretakers (parents/guardians). Multiple students can share an account (siblings) or multiple accounts can reference one parent.
- **Users**: student, parent, viewer (tutor/coach/therapist), admin (internal)

---

## 2) Roles & Capabilities

- **student**
  - Read all personal data
  - Write: unofficial grades (optional), sub-task customization, time overrides (user scope)
- **parent**
  - Read child data
  - Write: unofficial grades, goals, incentives (account scope) where allowed
  - Cannot silently override student-hidden items without “parent override” mechanism (audited)
- **viewer (support person)**
  - Read-only access to selected scopes (configurable): grades only, assignments only, calendar only
  - Time-bounded invites (e.g., 30 days) with renewal

---

## 3) Linking & Invitations

- **Parent invites viewer** via email; accepts via magic link + optional SSO; select scopes and duration
- **Audit**: invitation creation, acceptance, scope changes stored with actor provenance

---

## 4) Third-Party SSO (non-Schoology viewers)

- **Supported**: Google, Apple, Microsoft (Meta optional later)
- **Mapping**: External SSO → App user; no Schoology tokens granted; only viewer/parent access to account data
- **RBAC**: Scopes assigned at invite; revocation immediately disables access

---

## 5) Fine-Grained Sharing Controls

- **Scopes** (toggle per viewer): grades, assignments, calendar, goals, incentives, progress
- **Data masking**: hide teacher names/emails if parent chooses; show course nicknames instead
- **Time-bounded**: default 30 days; renewable; auto-expire reminders

---

## 6) Privacy Boundaries

- **Hidden items**: user-level; parent can request a “visibility audit” (explicit feature) rather than silent override
- **Notes/comments** (if added later): opt-in visibility; consider E2EE for sensitive notes (Phase 6+)

---

## 7) Admin/Support Access

- **Break-glass**: Internal admin can read anonymized metadata only (counts, health) by default
- **Support session**: User grants temporary support token (15 mins) for targeted troubleshooting; logs every read

---

## 8) Implementation Outline

- Firestore paths
  - `/accounts/{accountId}/roles/{userId}` → { role, scopes: [], expires_at }
  - `/invites/{inviteId}` → { accountId, invited_email, scopes, expires_at, status }
- Security rules enforce role + scope + expiry
- UI surfaces: Access management page for parents

---

## 9) Open Questions

- Should tutors be allowed to suggest sub-tasks (comment-only vs write)?
- Should students be allowed to hide items from parents at all? If yes, what categories?
- Do we need “school official” viewer roles for counselors with district emails? (pilot-only)
