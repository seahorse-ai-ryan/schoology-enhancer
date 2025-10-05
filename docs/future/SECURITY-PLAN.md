# Security Plan & Threat Model

Last Updated: September 30, 2025
Scope: Authentication, authorization, data scopes, provenance, appsec controls, audits, monitoring.

---

## 1) Authentication & Session

- **Primary**: Schoology OAuth 1.0a (tokens stored encrypted at rest)
- **Secondary (later)**: Google/Apple/Microsoft SSO for non-Schoology viewers (read-only roles)
- **Session**: HttpOnly, Secure cookies; short-lived access tokens; refresh via OAuth flow; device binding optional

---

## 2) Authorization Model

- **Scopes**
  - `student`: full personal data
  - `parent`: read child data; limited writes (unofficial grades, flags) 
  - `viewer`: read-only (authorized family/support members)
- **RBAC in Firestore**
  - `/accounts/{accountId}/roles/{userId}` mapping
  - Security rules enforce role-based reads/writes by document path

---

## 3) Data Classification & PII Protections

- **PII**: Names, emails, school IDs, course rosters, grades
- **Controls**
  - Encrypt tokens and sensitive fields (KMS) 
  - Never log PII; redaction in logger
  - Minimize data retention; TTL for volatile caches

---

## 4) Provenance & Audit Trails

- Add fields to all mutable records: `created_by`, `actor_role`, `scope (user|account)`, `last_modified_by`, `change_reason` (optional)
- Write-only “audit_log” collection per account with append-only events
- Monthly integrity check to detect tampering (hash chain optional)

---

## 5) Threat Model (STRIDE-lite)

- **Spoofing**: Stolen session → use device/browser binding hints; suspicious IP geo checks
- **Tampering**: Firestore writes via compromised role → rules + provenance + audit trail + anomaly alerts
- **Repudiation**: Disputes over changes → audit log + explicit actor identity
- **Information Disclosure**: Overbroad rules → principle of least privilege; test rules with unit tests; redaction in logs
- **Denial of Service**: API rate limits; backoff; quotas with alerts
- **Elevation of Privilege**: Admin-only operations in isolated paths; no client-elevated flags; server validates entitlements

---

## 6) Firestore Security Rules Strategy

- Separate collections by sensitivity
- Pattern: deny-all default; allow by role; verify `request.auth.uid` membership in `/roles`
- Unit-test rules with emulator; include negative cases (parent writing student-only field)

---

## 7) Secrets & Config

- Use Firebase/Google Secret Manager; local `.env.local` never committed
- Rotate OAuth credentials quarterly; monitor token leakage with Honeytokens in CI (later)

---

## 8) Secure SDLC & Audits

- **Pre-commit**: lint, type-check, basic dependency scan (npm audit, OSV)
- **Pre-release**: run E2E + security rule tests; check bundle for accidental PII strings
- **Quarterly**: dependency upgrade day; review rules; run ZAP/DAST against staging
- **Annual**: external security review (budget permitting)

---

## 9) Monitoring & Alerting

- Alerts on: abnormal auth failures, read/write spikes, rule denies, CPU/network anomalies
- Create dashboards for: auth success rate, grade-normalization confidence, cache-hit ratio

---

## 10) Incident Response

- Severity definitions (P1 data breach → P4 minor bug)
- P1 flow: contain (revoke tokens/keys) → notify affected users (template prepared) → forensics → postmortem in `/docs/postmortems/`

---

## 11) Roadmap for Security Enhancements

- Add device/session management UI (sign out other devices)
- Implement IP allowlists for school/district pilots
- Add TOTP/Passkeys for non-Schoology SSO viewers (Phase 6+)
- Optional E2EE for notes/comments if needed (later)
