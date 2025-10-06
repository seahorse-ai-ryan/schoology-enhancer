# Documentation Consolidation - October 5, 2025

## What Was Done

### Seeding Documentation Cleanup

**Problem:** 6+ overlapping seeding guides in `/docs/guides/`, plus redundant files in `/seed/`

**Solution:** Consolidated into clear hierarchy

### New Structure

**In `/seed/`:**
- `README.md` ← **Primary reference** for seed data
  - All test accounts with IDs
  - Expected grades for all students
  - Quick start seeding instructions
  - How the grade system works

**In `/docs/guides/`:**
- `SCHOOLOGY-DATA-SEEDING.md` ← **Complete workflow** (CSV + API)
- `GRADES-IMPLEMENTATION-GUIDE.md` ← **Technical implementation**
- `GRADES-TROUBLESHOOTING.md` ← **Fix common issues**
- `EXPECTED-GRADES-REFERENCE.md` ← **Verification reference**
- `API-USER-IMPERSONATION.md` ← **X-Schoology-Run-As details**

**In `/docs/`:**
- `SEEDING-QUICK-START.md` ← **Quick reference card**

### Archived to `.journal/`

**Moved from `/docs/guides/`:**
- SCHOOLOGY-CSV-IMPORT.md → ARCHIVED-2025-10-05-SCHOOLOGY-CSV-IMPORT.md
- SCHOOLOGY-API-SEEDING.md → ARCHIVED-2025-10-05-SCHOOLOGY-API-SEEDING.md
- SCHOOLOGY-SEED-DATA-GUIDE.md → ARCHIVED-2025-10-05-SCHOOLOGY-SEED-DATA-GUIDE.md
- SEEDING-OVERVIEW.md → ARCHIVED-2025-10-05-SEEDING-OVERVIEW.md
- SEED-DATA-REFERENCE.md → ARCHIVED-2025-10-05-SEED-DATA-REFERENCE.md
- SEED-DATA-EXPANSION-PLAN.md → ARCHIVED-2025-10-05-SEED-DATA-EXPANSION-PLAN.md

**Moved from `/docs/`:**
- MANUAL-TESTING-CHECKLIST.md → 2025-10-05-MANUAL-TESTING-CHECKLIST.md
- GRADES-FEATURE-SUMMARY.md → 2025-10-05-GRADES-FEATURE-SUMMARY.md

**Moved from `/` (root):**
- GRADES-COMPLETION-REPORT.md → 2025-10-05-GRADES-COMPLETION-REPORT.md

**Moved from `/seed/sandbox/`:**
- temp-real-seed-grades.json → ARCHIVED-real-seed-grades-2025-10-04.json
- supplemental-assignments-and-grades.json → ARCHIVED-supplemental-assignments-2025-10-04.json
- category-mappings-test.json → ARCHIVED-category-mappings-test-2025-10-04.json

### Updated Cross-References

**Files updated with new paths:**
- `docs/README.md` - Q&A section
- `docs/CURRENT-TASKS.md` - Completion notes
- `docs/SEEDING-QUICK-START.md` - References
- `docs/guides/GRADES-IMPLEMENTATION-GUIDE.md` - Related docs
- `docs/guides/GRADES-TROUBLESHOOTING.md` - Help section
- `docs/guides/EXPECTED-GRADES-REFERENCE.md` - Data sources
- `docs/current/ARCHITECTURE.md` - Project docs section
- `scripts/README.md` - Related documentation

---

## Benefits

### Before
- 6 overlapping seeding guides
- Redundant seed data files
- Session-specific docs mixed with permanent guides
- Confusing cross-references
- Information duplicated across multiple files

### After
- 1 comprehensive seeding guide
- 1 seed data master file (`seed-data-master.json`)
- Clear separation: permanent guides vs session journals
- All cross-references updated and consistent
- Single source of truth for each topic

---

## File Count Reduction

**Docs guides:** 11 → 5 (removed 6 redundant guides)  
**Seed data:** 4 JSON files → 1 master file  
**Root docs:** 3 session files → moved to journal  

---

## Remaining Structure

### `/seed/` (1 README, 1 data file)
```
seed/
├── README.md                      ← Primary seed reference
└── sandbox/
    ├── seed-data-master.json      ← Single source of truth
    ├── category-mappings.json     (generated)
    ├── category-mappings-complete.json (generated)
    └── csv-exports/               (generated CSVs)
```

### `/docs/guides/` (5 seeding-related guides)
```
guides/
├── SCHOOLOGY-DATA-SEEDING.md      ← Complete workflow
├── GRADES-IMPLEMENTATION-GUIDE.md  ← Technical details
├── GRADES-TROUBLESHOOTING.md      ← Fix issues
├── EXPECTED-GRADES-REFERENCE.md   ← Verification
└── API-USER-IMPERSONATION.md      ← Technical reference
```

### `/docs/` (1 quick reference)
```
docs/
└── SEEDING-QUICK-START.md         ← Quick reference card
```

---

## Documentation Principles Established

1. **Permanent guides** in `/docs/guides/` - Technical, evergreen content
2. **Session artifacts** in `.journal/` - Completion reports, checklists, discoveries
3. **Quick references** in `/docs/` root - Single-page cheat sheets
4. **Data references** in `/seed/` - What data exists, how to use it
5. **Script docs** in `/scripts/` - How to use automation

**No more random doc proliferation!**
