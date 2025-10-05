// Generate CSV files from seed-data-master.json for Schoology upload
const fs = require('fs');
const path = require('path');

const SEED_DATA_PATH = path.join(__dirname, '..', 'seed', 'sandbox', 'seed-data-master.json');
const OUTPUT_DIR = path.join(__dirname, '..', 'seed', 'sandbox', 'csv-exports');

// Read seed data
const seedData = JSON.parse(fs.readFileSync(SEED_DATA_PATH, 'utf8'));

// Create output directory
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Helper to escape CSV fields
function csvEscape(value) {
  if (value === null || value === undefined) return '';
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

// Helper to write CSV
function writeCSV(filename, headers, rows) {
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(csvEscape).join(','))
  ].join('\n');
  
  const filepath = path.join(OUTPUT_DIR, filename);
  fs.writeFileSync(filepath, csvContent);
  console.log(`✅ Created: ${filename} (${rows.length} rows)`);
}

console.log('📊 Generating CSV files from seed-data-master.json\n');

// 1. USERS CSV (Teachers + Parents + Students)
console.log('1️⃣ Generating users.csv...');
const userRows = [];

// Add teachers
(seedData.users.teachers || []).forEach(teacher => {
  userRows.push([
    teacher.school_uid,           // school_uid
    teacher.name,                 // name_display  
    teacher.full_name.split(', ')[1] || '', // name_first
    teacher.full_name.split(', ')[0] || '', // name_last
    'Teacher',                   // role (capitalized for Schoology)
    teacher.room_number || '',   // additional_info (room number)
  ]);
});

// Add parents
(seedData.users.parents || []).forEach(parent => {
  userRows.push([
    parent.school_uid,
    parent.name,
    parent.name.split(' ')[0],
    parent.name.split(' ')[1] || '',
    'Parent',                    // role (capitalized for Schoology)
    '',
  ]);
});

// Add students  
(seedData.users.students || []).forEach(student => {
  userRows.push([
    student.school_uid,
    student.name,
    student.name.split(' ')[0],
    student.name.split(' ')[1] || '',
    'Student',                   // role (capitalized for Schoology)
    `Grade ${student.grade_level}`,
  ]);
});

writeCSV('users.csv', [
  'school_uid',
  'name_display',
  'name_first',
  'name_last',
  'role',
  'additional_info'
], userRows);

// 2. COURSES CSV
console.log('2️⃣ Generating courses.csv...');
const courseRows = seedData.courses.map(course => [
  course.section_school_code,     // section_school_code
  course.course_code,             // course_code
  course.title,                   // course_title
  course.section,                 // section_title
  '',                            // section_code
  course.teacher_uid,            // teacher_school_uid
  '',                            // description
  '1',                           // active
  '',                            // grading_periods (will add separately)
]);

writeCSV('courses.csv', [
  'section_school_code',
  'course_code',
  'course_title',
  'section_title',
  'section_code',
  'teacher_school_uid',
  'description',
  'active',
  'grading_periods'
], courseRows);

// 3. ENROLLMENTS CSV
console.log('3️⃣ Generating enrollments.csv...');
const enrollmentRows = seedData.enrollments.map(enrollment => {
  // Extract course_code from section_school_code (e.g., "AP-BIO-3120-S1" → "AP-BIO-3120")
  const courseCode = enrollment.course_school_code.replace(/-S\d+$/, '');
  
  // Section override role for co-teachers
  // Use "1" for "Edit Grades / Edit Materials" (co-teacher role)
  // Only apply to super_teacher, leave empty for others
  let overrideRole = '';
  if (enrollment.student_school_uid === 'super_teacher_20250930' && enrollment.enrollment_type === 1) {
    overrideRole = '1'; // Edit Grades / Edit Materials
  }
  
  return [
    courseCode,                          // course_code (helps Schoology match)
    enrollment.course_school_code,       // section_school_code (required)
    enrollment.student_school_uid,       // student_school_uid
    String(enrollment.enrollment_type),  // enrollment_type: 1 = admin/teacher, 2 = student/member
    overrideRole,                        // override_role: 1 = Edit Grades/Edit Materials (co-teacher)
  ];
});

writeCSV('enrollments.csv', [
  'course_code',
  'section_school_code',
  'student_school_uid',
  'enrollment_type',
  'override_role'
], enrollmentRows);

// 4. PARENT ASSOCIATIONS CSV
console.log('4️⃣ Generating parent_associations.csv...');
const parentAssocRows = [];
(seedData.users.parents || []).forEach(parent => {
  parent.children_uids.forEach(childUid => {
    parentAssocRows.push([
      parent.school_uid,
      childUid
    ]);
  });
});

writeCSV('parent_associations.csv', [
  'parent_school_uid',
  'student_school_uid'
], parentAssocRows);

// 5. ASSIGNMENTS CSV (from top-level assignments array)
console.log('5️⃣ Generating assignments.csv...');
const assignmentRows = (seedData.assignments || []).map((assignment, idx) => {
  // Convert ISO date to YYYY-MM-DD format for Schoology
  let dueDate = '';
  if (assignment.due) {
    const d = new Date(assignment.due);
    dueDate = d.toISOString().split('T')[0]; // YYYY-MM-DD
  }
  
  return [
    `assignment_${idx + 1}`,                 // assignment_id
    assignment.course_school_code || '',     // section_school_code
    assignment.title || '',                  // title
    assignment.category || '',               // description (use category as description)
    dueDate,                                 // due_date (YYYY-MM-DD)
    assignment.points || '',                 // max_points
    assignment.type || 'assignment',         // type
  ];
});

writeCSV('assignments.csv', [
  'assignment_id',
  'section_school_code',
  'title',
  'description',
  'due_date',
  'max_points',
  'type'
], assignmentRows);

// 6. GRADES CSV (from assignments with scores)
console.log('6️⃣ Generating grades.csv...');
const gradeRows = [];

// Generate grades from assignments that have scores
(seedData.assignments || []).forEach((assignment, idx) => {
  if (assignment.score !== undefined && assignment.score !== null) {
    // Find which student this assignment belongs to by checking course enrollment
    const enrollment = seedData.enrollments.find(e => e.course_school_code === assignment.course_school_code);
    if (enrollment) {
      gradeRows.push([
        `grade_${idx + 1}`,              // grade_id
        assignment.course_school_code,   // section_school_code
        enrollment.student_school_uid,   // student_school_uid
        `assignment_${idx + 1}`,         // assignment_id
        assignment.score,                // numeric_grade
        assignment.points,               // max_points
        '',                              // comment
      ]);
    }
  }
});

writeCSV('grades.csv', [
  'grade_id',
  'section_school_code',
  'student_school_uid',
  'assignment_id',
  'numeric_grade',
  'max_points',
  'comment'
], gradeRows);

console.log('\n🎉 All CSV files generated successfully!');
console.log(`📁 Output directory: ${OUTPUT_DIR}`);
console.log('\n📋 Files created:');
console.log('   - users.csv');
console.log('   - courses.csv');
console.log('   - enrollments.csv');
console.log('   - parent_associations.csv');
console.log('   - assignments.csv');
console.log('   - grades.csv');
console.log('\n👉 Upload these to your Schoology sandbox to populate with realistic data!');

