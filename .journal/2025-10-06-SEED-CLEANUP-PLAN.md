# Seed Directory Cleanup Plan - Oct 6, 2025

## Current State (Messy)
```
seed/
├── README.md (297 lines)
└── sandbox/
    ├── README.md (219 lines)
    ├── seed-data-master.json (2580 lines - everything)
    ├── category-mappings*.json (runtime-generated)
    ├── temp-events-announcements.json (subset of master)
    ├── additional-assignments-Oct2025.json (new data)
    └── csv-exports/
        ├── README.md (21 lines)
        └── *.csv files
```

## Proposed Clean Structure
```
seed/
├── README.md (single comprehensive guide)
├── .schoology-instance.json (gitignored - instance-specific IDs)
├── csv-exports/
│   ├── users.csv
│   ├── courses.csv
│   ├── enrollments.csv
│   └── parent_associations.csv
└── data/
    ├── users.json (parents, students, teachers)
    ├── courses.json (with grading categories)
    ├── enrollments.json
    ├── parent-associations.json
    ├── assignments.json (all assignments)
    ├── grades.json (all grades)
    └── announcements-events.json (announcements & calendar events)
```

## Migration Steps

1. **Split seed-data-master.json** into focused files in `data/`
2. **Move CSV files** from `sandbox/csv-exports/` to `seed/csv-exports/`
3. **Create .schoology-instance.json** with runtime IDs (gitignore it)
4. **Consolidate READMEs** into single seed/README.md
5. **Archive temp files** to .journal/
6. **Delete** category-mappings (runtime-generated)
7. **Update** all script references to new paths

## Instance-Specific Data

**Create `.schoology-instance.json` (gitignored):**
```json
{
  "school_group_id": "8068284260",
  "super_teacher_id": "140836120",
  "student_ids": {
    "carter_mock": "140834636",
    "tazio_mock": "140834637",
    "livio_mock": "140834638",
    "lily_mock": "140834639"
  },
  "parent_ids": {
    "christina_mock": "140834634",
    "ryan_mock": "140834635"
  }
}
```

**Benefits:**
- Scripts can read instance IDs from this file
- New developers generate their own after CSV upload
- Generic seed data works for everyone
- Your specific IDs preserved but gitignored

## Scripts to Update

**Remove instance-specific IDs from:**
- `scripts/README.md` - Remove hardcoded user IDs
- Individual scripts - Read from `.schoology-instance.json` instead

**Document in README:**
- How to generate `.schoology-instance.json` after first CSV upload
- Script to auto-populate it by querying Schoology API

## Next Session Actions

- [ ] Execute the cleanup (file moves, splits)
- [ ] Update all script imports
- [ ] Update generate-seed-csvs.js to read from data/ folder
- [ ] Create helper script to generate .schoology-instance.json
- [ ] Test that seeding workflow still works
- [ ] Update all documentation references

---

**Estimated Time:** 30-45 minutes  
**Risk:** Low (all files preserved, can revert if issues)  
**Benefit:** Clean, maintainable structure for future developers
