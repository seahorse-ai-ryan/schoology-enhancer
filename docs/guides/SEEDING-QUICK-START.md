# Schoology Seeding Quick Start

**⏱️ Total Time:** ~5-10 minutes  
**📋 Prerequisites:** CSV data already imported, admin API keys configured

---

## One-Command Seeding

```bash
./scripts/seed-all.sh
```

This runs all 4 steps automatically.

---

## Manual Step-by-Step

If you need to run steps individually:

```bash
# 1. Create assignments (✅ ~2 min)
node scripts/create-assignments-via-impersonation.js bulk

# 2. Update category weights (✅ ~1 min)
node scripts/update-category-weights.js

# 3. Assign categories (✅ ~1 min)
node scripts/assign-categories-to-assignments.js

# 4. Upload grades (✅ ~1 min)
node scripts/import-grades-only.js
```

---

## Verify Results

```bash
# Show all student grades
node scripts/show-all-student-grades.js

# Test API endpoint
node scripts/test-grades-e2e.js
```

---

## Expected Results

After seeding, you should see:

**Carter Mock (12th):**
- 100% - Kinesiology Dual Enr 15
- 84% - AP English Literature
- 79% - AP Biology
- 73% - AP Statistics
- 49% - PE Weight Training
- 25% - US Government

**Tazio Mock (11th):**
- 75% - Academic Planning
- 73% - US History
- 67% - Auto 3
- 60% - Physics
- 59% - AP Computer Science
- 56% - Pre Calculus
- 0% - American Literature 11

*And similar grades for Livio and Lily...*

---

## Troubleshooting

### No grades showing

```bash
# Re-run the complete workflow
./scripts/seed-all.sh
```

### Categories have 0% weight

```bash
node scripts/update-category-weights.js
```

### Assignments not categorized

```bash
node scripts/assign-categories-to-assignments.js
```

---

## Full Documentation

For complete details, see:
- `docs/guides/SCHOOLOGY-DATA-SEEDING.md` - Complete seeding workflow
- `docs/guides/GRADES-IMPLEMENTATION-GUIDE.md` - How grades work
- `seed/README.md` - Seed data reference
- `scripts/README.md` - All scripts explained
