# Schoology CSV Bulk Import Guide

This document captures detailed information about Schoology's CSV bulk import process, based on hands-on experience with the developer sandbox.

## Import Sequence

The correct order for bulk importing data into Schoology:

1. **Teachers (Users)** - Import first
2. **Courses + Sections** - Import together in ONE file
3. **Enrollments** - Assign teachers and students to sections

## 1. User Import (Teachers)

### Required Fields

- `school_uid` - Username (must be unique across the school)
- `name_first` - First name
- `name_last` - Last name
- `primary_email` - Email address
- `role_name` - Must be "Teacher", "Student", or "Parent"

### Optional Fields

- `name_title` - Title (e.g., "Mr.", "Ms.", "Dr.")
- `name_middle` - Middle name
- `name_first_preferred` - Preferred first name
- `password` - Leave blank to let Schoology generate
- `gender` - Gender
- `grad_year` - Graduation year (for students)

### Username Requirements

- Must contain only: letters, numbers, periods (.), dashes (-), underscores (\_), tildes (~)
- **Invalid characters**: slashes (/), commas (,), spaces, special characters
- Must be unique within the school

### Email Conflicts

- **Don't allow duplicates** (default) - Import will fail if email exists
- **Create account with Username** - Allows duplicate emails, uses school_uid as username

### Important Notes

- Students typically don't need email addresses (can be omitted)
- `school_uid` becomes the User Unique ID in Schoology
- Existing users (matched by `school_uid`) can be updated

## 2. Course + Section Import

### Key Insight: Courses and Sections are Imported Together

Schoology imports courses AND their sections in a **single CSV file**, not separately.

### Required Fields

- `course_code` - Unique course identifier (e.g., "US-GOVERNMENT")
- `course_title` - Course name (e.g., "US Government")
- `section_title` - Section name (e.g., "Period 1")
- `section_school_code` - Unique section identifier (e.g., "US-GOVERNMENT-S1")

### Optional Fields

- `description` - Course description
- `department` - Department name
- `credits` - Credit value (e.g., "1", "0.5")
- `section_code` - Alternative to section_school_code
- `section_description` - Section-specific description
- `location` - Room/location
- `district_course_name` - District-level course name

### Grading Periods

**Two Options:**

1. **Select in UI (Simpler)**:

   - During import, click "Select Periods"
   - Choose the grading period from the dropdown
   - All courses/sections will use this period

2. **Use Import File (Advanced)**:
   - Add a column in your CSV with grading period values
   - During import, click "Select Periods > Use Import File"
   - Map the CSV column to "CSV Value" for each grading period
   - Allows different courses to use different grading periods

### School Selection

- Must select a school during the import process
- Cannot be set in the CSV file
- Developer sandboxes typically have one school (Seahorse AI)

### Important Rules

- **Course Code Matching**: Existing courses (matched by `course_code`) will be reused
- **Section Uniqueness**: Section codes must be unique across:
  - All courses
  - All grading periods
  - Example: Course "ENG1" can only have ONE section "1a" for grading period "QTR1"
- **Update Existing Records**: Option to update courses/sections that already exist

### Import Process

1. Upload CSV file
2. Map columns to Schoology fields
3. Select School (from dropdown)
4. Select Grading Period(s) (via UI or Import File)
5. Preview/confirm
6. Run import

## 3. Enrollment Import

### Required Fields

- `section_school_code` - Section identifier (must match section from course import)
- `unique_user_id` - User's school_uid (from user import)
- `enrollment_type` - Enrollment type: `1` for admins (teachers), `2` for members (students)

### Optional Fields

- `course_code` - Course identifier (helps Schoology match enrollments, recommended)

### Enrollment Options (During Import)

**Enroll based on:**

- **Section Code** (recommended) - Match enrollments to sections by section_school_code
- **Section School Code** - Alternative matching method

**Enrollment Type:**
Schoology provides a dropdown to map enrollment types from your CSV:

- **--Use Import File--** (default) - CSV contains an `enrollment_type` column with numeric values:
  - In the UI, enter `1` for "Admin CSV Value"
  - In the UI, enter `2` for "Member CSV Value"
- **Manually select** - Choose enrollment type in UI if all users have same role

**Important** (per [official PowerSchool documentation](https://uc.powerschool-docs.com/en/schoology/latest/import-course-enrollments-with-a-csv-xls-file)):

- CSV field name: `enrollment_type`
- CSV values: `1` = Admin (teachers), `2` = Member (students)
- During import, select "Use Import File" and map: Admin=1, Member=2

### Important Notes

- Users must exist before enrollment
- Sections must exist before enrollment
- Each section can have multiple teachers and students
- Duplicate enrollments are typically ignored
- Including `course_code` improves matching accuracy and helps avoid errors

## Common Pitfalls

### ❌ Invalid Usernames

```csv
school_uid,name_first,name_last,role_name
snell/harris,Snell,Harris,Teacher  ❌ Has slash
cronin,tari,Cronin,Tari,Teacher     ❌ Has comma in name
```

**Fix:**

```csv
school_uid,name_first,name_last,role_name
snell_harris_20250930,Snell,Harris,Teacher  ✅
cronin_tari_20250930,Cronin,Tari,Teacher    ✅
```

### ❌ Missing Required Fields

- Course import without section_title
- User import without email (when required)
- Enrollment without matching section_school_code

### ❌ Grading Period Not Mapped

- Error: "You must map one or more grading periods in the course import"
- **Fix**: Create a grading period first, then select it during import

## Grading Periods

### Creating a Grading Period

**Via UI:**

1. Go to School Management > Grade Settings > Grading Periods
2. Click "+ Add Grading Period"
3. Enter: Title, Start Date, End Date
4. Example: "2025-2026 Full Year" from Aug 11, 2025 to Jun 12, 2026

**Via API:**

```bash
POST /v1/schools/{school_id}/gradingperiods
{
  "title": "2025-2026 Full Year",
  "start": "2025-08-11",
  "end": "2026-06-12"
}
```

### Grading Period Requirements

- Courses/sections MUST be assigned to at least one grading period
- Grading periods determine when a course section is "active"
- Can create multiple periods (e.g., quarters, semesters, full year)

## CSV Format Best Practices

### Character Encoding

- Use UTF-8 encoding
- Escape quotes: `"quoted ""value"" here"` becomes `quoted "value" here`

### CSV Escaping

```typescript
const escapeCsv = (str: string) => {
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
};
```

### File Size Limits

- Max file size: 10 GB
- XLS files with >10,000 rows may fail to import properly
- Use CSV for large imports

## Testing Strategy

### Developer Sandbox Testing

1. Create 3 mock students with unique school_uids (e.g., `carter_mock_20250930`)
2. Create 2 mock parents
3. Create mock teachers (deduplicate by name)
4. Import courses with realistic section names
5. Enroll students and teachers
6. Verify associations appear in API responses

### Verification

- Check Schoology UI for imported users/courses
- Use API endpoints to verify data:
  - `/v1/users/{id}` - User details
  - `/v1/courses/{id}` - Course details
  - `/v1/sections/{id}` - Section details
  - `/v1/sections/{id}/enrollments` - Enrollment list

## Schoology API Documentation

- **Bulk Import**: No official API documentation for CSV format
- **REST API**: https://developers.schoology.com/api-documentation/rest-api-v1/
- **User Management**: https://developers.schoology.com/api-documentation/rest-api-v1/user/
- **Course Management**: https://developers.schoology.com/api-documentation/rest-api-v1/course/

## Lessons Learned

1. **Courses + Sections = One File**: Don't create separate section CSVs
2. **Grading Periods Are Required**: Create them first, select during import
3. **Username Sanitization**: Always sanitize special characters
4. **Section Code Uniqueness**: Use course code + section suffix (e.g., "ENG1-S1")
5. **School Selection**: Always manual during import (can't be in CSV)
6. **Email Conflicts**: For students, omit email or use conflict resolution
7. **Testing First**: Always test with small CSVs before bulk import

---

**Last Updated**: September 30, 2025  
**Tested With**: Schoology Developer Sandbox (School: Seahorse AI)
