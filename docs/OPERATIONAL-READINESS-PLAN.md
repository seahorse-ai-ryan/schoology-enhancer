# Operational Readiness Plan

Last Updated: September 30, 2025
Scope: Dev→Beta→Prod environments, releases/rollbacks, backups, support, feedback, cost/perf, billing, access control.

---

## 1) Environments & Release Strategy

- **Environments**
  - Dev (local + emulators): full-featured, seeded data, feature flags on by default
  - Beta (staging): Firebase Hosting channel, real OAuth with sandbox tenants, seeded + live toggle
  - Prod: Firebase Hosting production site, conservative flags, error budgets enforced

- **Branching**
  - `main` = always deployable
  - `feature/*` → PR → preview deploy (Firebase preview channel)
  - Merge to `main` triggers Beta deploy; manual promote to Prod

- **Versioning**
  - Semver for app (vX.Y.Z). Tag every Prod release. Keep release notes in `docs/RELEASE-NOTES.md`.

- **Deploy flow**
  - Build → run E2E (persistent-auth locally) → manual QA on Beta → promote to Prod with one command

---

## 2) Rollbacks (Code & Data)

- **Code rollback**
  - Use Firebase Hosting version pinning: keep last 5 deploys; instant rollback via CLI/Console
  - Keep a `releases.json` manifest with commit SHA, tag, hosting version ID

- **Data rollback**
  - Firestore point-in-time recovery plan (if enabled) or scheduled exports
  - Use `gcloud firestore export gs://<bucket>/backups/YYYY-MM-DD/` nightly
  - Restoration drills monthly: import to a staging project, run smoke tests

- **Schema migrations**
  - Always write migration scripts idempotently (e.g., `migrations/2025-10-01-add-provenance.ts`)
  - Blue/green collections for high-risk changes; dual-write during transition; verify counts; cutover

---

## 3) Backups & Restoration Testing

- **Backups**
  - Firestore exports nightly; retain 30 days
  - Storage (if used) lifecycle policy: versioned + 30-day retention

- **Restoration drills**
  - Quarterly: Full restore in a temp staging project; validate integrity and E2E flows
  - Document RTO/RPO assumptions: RTO ≤ 4h, RPO ≤ 24h for GA

---

## 4) Support & Feedback Channels

- **Support tool**
  - Start with HelpScout or Zendesk (email + web widget)
  - Triage categories: Auth, Data freshness, Grades math, Calendar, UX issue, Bug

- **In-app feedback**
  - Lightweight widget: “Send feedback” with screenshot upload + console log hash
  - Route automatically to support tool; include device + app version + flag state

- **SLA (solo dev realistic)**
  - Beta: 48h first-response, 7 days resolve P1; Prod: 24h first-response, 72h P1

---

## 5) Google Infra Optimization (GCP, Gemini, Vertex, Nest)

- **Hosting/Infra**
  - Firebase Hosting + Firestore as core; Cloud Run only for scheduled sync if needed
  - Cloud Scheduler → Cloud Run for nightly schema-diff/contract tests

- **AI**
  - Plan Vertex AI/Gemini via Genkit (Phase 6). Start with Flash for cost; upgrade if needed.

- **Nest/Google Home**
  - Defer smart home actions until Phase 6; track discovery with Assistant V2 APIs

---

## 6) Cost & Performance (SLOs)

- **SLOs**
  - LCP < 2.0s p75 on mid-tier phones; API p95 < 500ms; TTI < 1.5s dashboard
  - Error rate < 1%; uptime 99.9%

- **Perf guardrails**
  - Static generation for non-auth pages; code-split widgets; lazy load heavy charts
  - Cache-first for read paths; dedupe requests; prefetch on hover

- **Cost controls**
  - Firestore: reduce hot partitions; composite indexes only when necessary; batch reads
  - Vertex AI: Flash/default; cap per-user/day; spend alerts

---

## 7) Billing & Pricing

- **Phase 0 (beta)**: Free; collect interest; learn usage patterns
- **Phase 1**: Freemium—free grade/assignment views; premium What-If scenarios, Planner templates, calendar integration, multi-child advanced views
- **Billing**: Stripe Billing; monthly/annual; student-only vs family plan; coupons for districts
- **Ops**: Feature flags gated by Stripe customer portal entitlement

---

## 8) Access Control & Feature Flags

- **Allowlists**: Early-access by email/domain; school/district allowlists for pilot
- **Flags**: Remote config (Firestore/JSON) keyed by user/account; evaluated at boot
- **Rollout**: Gradual % rollout by cohort; instant disable for problematic features

---

## 9) Incident Response & Monitoring

- **Monitoring**: Crashlytics/Sentry, Firebase logs, performance traces, uptime checks
- **Alerts**: p95 latency > 800ms; error rate > 2%; auth failures spike; quota approaching 80%
- **IR runbook**: Triage → mitigate via rollback/flag off → root cause → postmortem in `/docs/postmortems/YYYY-MM-DD.md`

---

## 10) Release Checklist (Prod)

- [ ] All E2E tests green
- [ ] Smoke test Beta with seed + live data
- [ ] Error budget within SLO
- [ ] Docs updated (CHANGELOG, release notes)
- [ ] Rollback plan verified (previous hosting version ID noted)
- [ ] Support team notified; status page updated
