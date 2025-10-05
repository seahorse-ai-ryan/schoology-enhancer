#!/usr/bin/env node

/**
 * E2E Test: Complete workflow for a single course
 * 
 * Tests the full pipeline:
 * 1. Create grading categories
 * 2. Delete existing assignments
 * 3. Create new assignments with category IDs
 * 4. Create grades
 * 
 * Test Course: AP Biology (Section: 8067479367)
 * Test Student: Carter Mock
 */

const fs = require('fs');
const path = require('path');
const OAuth = require('oauth-1.0a');
const crypto = require('crypto');

// Load environment variables
if (require('fs').existsSync('.env.local')) {
  const dotenv = require('dotenv');
  dotenv.config({ path: '.env.local' });
}

// Load data files
const SEED_DATA_PATH = path.join(__dirname, '..', 'seed', 'sandbox', 'seed-data-master.json');
const REAL_GRADES_PATH = path.join(__dirname, '..', 'seed', 'sandbox', 'temp-real-seed-grades.json');

const seedData = JSON.parse(fs.readFileSync(SEED_DATA_PATH, 'utf8'));
const realGradesData = JSON.parse(fs.readFileSync(REAL_GRADES_PATH, 'utf8'));

// Schoology API configuration
const SCHOOLOGY_BASE_URL = 'https://api.schoology.com/v1';
const ADMIN_KEY = process.env.SCHOOLOGY_ADMIN_KEY;
const ADMIN_SECRET = process.env.SCHOOLOGY_ADMIN_SECRET;
const SUPER_TEACHER_ID = 140836120;

if (!ADMIN_KEY || !ADMIN_SECRET) {
  console.error('❌ Error: SCHOOLOGY_ADMIN_KEY and SCHOOLOGY_ADMIN_SECRET must be set');
  process.exit(1);
}

// OAuth setup
const oauth = new OAuth({
  consumer: { key: ADMIN_KEY, secret: ADMIN_SECRET },
  signature_method: 'HMAC-SHA1',
  hash_function(base_string, key) {
    return crypto.createHmac('sha1', key).update(base_string).digest('base64');
  },
});

// Helper to make authenticated requests with impersonation
async function schoologyRequest(method, endpoint, data = null, impersonateUserId = null) {
  const url = `${SCHOOLOGY_BASE_URL}${endpoint}`;
  const request_data = { url, method };
  const authHeader = oauth.toHeader(oauth.authorize(request_data));
  
  const headers = {
    ...authHeader,
    'Content-Type': 'application/json',
  };
  
  if (impersonateUserId) {
    headers['X-Schoology-Run-As'] = String(impersonateUserId);
  }
  
  const options = { method, headers };
  if (data) {
    options.body = JSON.stringify(data);
  }
  
  const response = await fetch(url, options);
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`${response.status}: ${errorText}`);
  }
  
  return response.json();
}

// Cache for ID mappings
const idCache = {
  users: new Map(),
  categories: new Map(),
};

// Get Schoology numeric user ID from school_uid
async function getUserId(schoolUid) {
  if (idCache.users.has(schoolUid)) {
    return idCache.users.get(schoolUid);
  }
  
  try {
    const response = await schoologyRequest('GET', `/users?school_uids=${schoolUid}`);
    if (response && response.user && response.user.length > 0) {
      const userId = response.user[0].id;
      idCache.users.set(schoolUid, userId);
      return userId;
    }
  } catch (error) {
    console.error(`Error getting user ID for ${schoolUid}: ${error.message}`);
  }
  return null;
}

// Step 1: Create grading categories
async function createGradingCategories(sectionId, courseName) {
  console.log('\n' + '═'.repeat(60));
  console.log('STEP 1: Creating Grading Categories');
  console.log('═'.repeat(60) + '\n');
  
  // Find categories from real grades data
  let categories = [];
  for (const student of realGradesData) {
    const course = student.courses.find(c => c.course_name.includes('AP Biology'));
    if (course && course.categories) {
      categories = course.categories;
      break;
    }
  }
  
  if (categories.length === 0) {
    console.log('⚠️  No categories found in real grades data');
    return {};
  }
  
  console.log(`📚 ${courseName}`);
  console.log(`   Section ID: ${sectionId}`);
  console.log(`   Found ${categories.length} categories to create\n`);
  
  const categoryMap = {};
  const categoryPayload = {
    grading_categories: {
      grading_category: categories.map(cat => ({
        title: cat.category_name,
        weight: parseFloat(cat.weight.replace('%', '')) || 0,
      }))
    }
  };
  
  try {
    console.log('📤 Creating categories...');
    const result = await schoologyRequest(
      'POST',
      `/sections/${sectionId}/grading_categories`,
      categoryPayload,
      SUPER_TEACHER_ID
    );
    
    if (result.grading_category) {
      const created = Array.isArray(result.grading_category) 
        ? result.grading_category 
        : [result.grading_category];
      
      created.forEach((cat, idx) => {
        if (cat.id) {
          const originalCat = categories[idx];
          categoryMap[originalCat.category_name] = cat.id;
          console.log(`   ✅ ${originalCat.category_name}: ${originalCat.weight} → ID: ${cat.id}`);
          idCache.categories.set(`${sectionId}-${originalCat.category_name}`, cat.id);
        }
      });
    }
    
    console.log(`\n✅ Created ${Object.keys(categoryMap).length} categories\n`);
    return categoryMap;
    
  } catch (error) {
    console.error(`❌ Failed to create categories: ${error.message}`);
    return {};
  }
}

// Step 2: Delete existing assignments
async function deleteExistingAssignments(sectionId) {
  console.log('\n' + '═'.repeat(60));
  console.log('STEP 2: Deleting Existing Assignments');
  console.log('═'.repeat(60) + '\n');
  
  try {
    // Get all assignments for this section
    const assignmentsData = await schoologyRequest(
      'GET',
      `/sections/${sectionId}/assignments`,
      null,
      SUPER_TEACHER_ID
    );
    
    const assignments = assignmentsData.assignment 
      ? (Array.isArray(assignmentsData.assignment) ? assignmentsData.assignment : [assignmentsData.assignment])
      : [];
    
    console.log(`📋 Found ${assignments.length} existing assignments\n`);
    
    let deleted = 0;
    let failed = 0;
    
    for (const assignment of assignments) {
      try {
        console.log(`   Deleting: ${assignment.title} (ID: ${assignment.id})`);
        await schoologyRequest(
          'DELETE',
          `/sections/${sectionId}/assignments/${assignment.id}`,
          null,
          SUPER_TEACHER_ID
        );
        deleted++;
        console.log(`   ✅ Deleted`);
        
        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 200));
      } catch (error) {
        console.log(`   ❌ Failed: ${error.message}`);
        failed++;
      }
    }
    
    console.log(`\n✅ Deleted ${deleted} assignments`);
    if (failed > 0) {
      console.log(`⚠️  Failed to delete ${failed} assignments`);
    }
    console.log();
    
  } catch (error) {
    console.error(`❌ Failed to fetch assignments: ${error.message}`);
  }
}

// Step 3: Create new assignments with category IDs
async function createAssignmentsWithCategories(sectionId, categoryMap) {
  console.log('\n' + '═'.repeat(60));
  console.log('STEP 3: Creating Assignments with Categories');
  console.log('═'.repeat(60) + '\n');
  
  // Create 2 test assignments in different categories
  const testAssignments = [
    {
      title: 'Enzyme Activity Lab',
      description: 'Lab report on enzyme activity',
      due: '2025-01-15',
      max_points: 100,
      category: 'Full AP Labs',
    },
    {
      title: 'DNA Structure Homework',
      description: 'Homework assignment on DNA structure and function',
      due: '2025-01-20',
      max_points: 50,
      category: 'Homework Assignments',
    }
  ];
  
  const createdAssignments = [];
  
  for (const assignment of testAssignments) {
    const categoryId = categoryMap[assignment.category];
    
    if (!categoryId) {
      console.log(`⚠️  Category "${assignment.category}" not found, skipping assignment`);
      continue;
    }
    
    const assignmentData = {
      title: assignment.title,
      description: assignment.description,
      due: assignment.due,
      max_points: assignment.max_points,
      allow_dropbox: 0, // No submission required for grades to show
      grading_category_id: categoryId, // ← The key addition!
    };
    
    try {
      console.log(`📝 Creating: ${assignment.title}`);
      console.log(`   Category: ${assignment.category} (ID: ${categoryId})`);
      console.log(`   Points: ${assignment.max_points}`);
      
      const result = await schoologyRequest(
        'POST',
        `/sections/${sectionId}/assignments`,
        assignmentData,
        SUPER_TEACHER_ID
      );
      
      if (result && result.id) {
        createdAssignments.push({
          id: result.id,
          title: assignment.title,
          category: assignment.category,
          max_points: assignment.max_points,
        });
        console.log(`   ✅ Created (ID: ${result.id})\n`);
      }
      
      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 200));
      
    } catch (error) {
      console.error(`   ❌ Failed: ${error.message}\n`);
    }
  }
  
  console.log(`✅ Created ${createdAssignments.length}/${testAssignments.length} assignments\n`);
  return createdAssignments;
}

// Step 4: Create grades
async function createGrades(sectionId, createdAssignments, studentSchoolUid) {
  console.log('\n' + '═'.repeat(60));
  console.log('STEP 4: Creating Grades');
  console.log('═'.repeat(60) + '\n');
  
  // Get student's Schoology ID
  const studentId = await getUserId(studentSchoolUid);
  if (!studentId) {
    console.error(`❌ Could not find student: ${studentSchoolUid}`);
    return;
  }
  
  console.log(`👤 Student: ${studentSchoolUid} (ID: ${studentId})\n`);
  
  // Get student's enrollment ID
  const enrollmentsData = await schoologyRequest(
    'GET',
    `/sections/${sectionId}/enrollments`,
    null,
    SUPER_TEACHER_ID
  );
  
  const enrollments = Array.isArray(enrollmentsData.enrollment)
    ? enrollmentsData.enrollment
    : [enrollmentsData.enrollment];
  
  const studentEnrollment = enrollments.find(e => String(e.uid) === String(studentId));
  
  if (!studentEnrollment) {
    console.error(`❌ Student enrollment not found`);
    return;
  }
  
  console.log(`📋 Enrollment ID: ${studentEnrollment.id}\n`);
  
  // Create grades for all assignments
  const gradeData = {
    grades: {
      grade: createdAssignments.map((assignment, idx) => ({
        assignment_id: String(assignment.id),
        enrollment_id: String(studentEnrollment.id),
        grade: idx === 0 ? '95' : '48', // 95/100 for first, 48/50 for second
        comment: `Test grade for ${assignment.title}`,
      }))
    }
  };
  
  try {
    console.log('📤 Uploading grades...');
    createdAssignments.forEach((assignment, idx) => {
      const grade = idx === 0 ? '95/100' : '48/50';
      console.log(`   ${assignment.title}: ${grade}`);
    });
    
    await schoologyRequest(
      'PUT',
      `/sections/${sectionId}/grades`,
      gradeData,
      SUPER_TEACHER_ID
    );
    
    console.log('\n✅ Grades uploaded successfully\n');
    
  } catch (error) {
    console.error(`❌ Failed to upload grades: ${error.message}`);
  }
}

// Main E2E test
async function main() {
  console.log('\n' + '═'.repeat(60));
  console.log('🧪 E2E TEST: Single Course Workflow');
  console.log('═'.repeat(60));
  console.log('\nTest Course: AP Biology (Section 8067479367)');
  console.log('Test Student: Carter Mock (carter_mock)');
  console.log('\nWorkflow:');
  console.log('  1. Create grading categories');
  console.log('  2. Delete existing assignments');
  console.log('  3. Create 2 new assignments with category IDs');
  console.log('  4. Create grades for those assignments');
  console.log('\n' + '═'.repeat(60) + '\n');
  
  const TEST_SECTION_ID = 8067479367; // AP Biology
  const TEST_STUDENT_UID = 'carter_mock';
  const COURSE_NAME = 'AP Biology';
  
  try {
    // Step 1: Create grading categories
    const categoryMap = await createGradingCategories(TEST_SECTION_ID, COURSE_NAME);
    
    if (Object.keys(categoryMap).length === 0) {
      console.error('❌ Failed to create categories. Aborting test.');
      return;
    }
    
    // Step 2: Delete existing assignments
    await deleteExistingAssignments(TEST_SECTION_ID);
    
    // Step 3: Create new assignments with category IDs
    const createdAssignments = await createAssignmentsWithCategories(TEST_SECTION_ID, categoryMap);
    
    if (createdAssignments.length === 0) {
      console.error('❌ Failed to create assignments. Aborting test.');
      return;
    }
    
    // Step 4: Create grades
    await createGrades(TEST_SECTION_ID, createdAssignments, TEST_STUDENT_UID);
    
    // Final summary
    console.log('\n' + '═'.repeat(60));
    console.log('✅ E2E TEST COMPLETE!');
    console.log('═'.repeat(60) + '\n');
    console.log('📊 VERIFICATION STEPS:\n');
    console.log('1. Log in to Schoology as Carter Mock');
    console.log('2. Go to AP Biology course');
    console.log('3. Check Grades page\n');
    console.log('Expected Results:');
    console.log('  ✅ See 2 assignments (not old ones)');
    console.log('  ✅ "Enzyme Activity Lab" shows 95/100 under "Full AP Labs"');
    console.log('  ✅ "DNA Structure Homework" shows 48/50 under "Homework Assignments"');
    console.log('  ✅ Categories show proper weights');
    console.log('  ✅ Course grade calculated correctly\n');
    
    // Save category mappings
    const mappingsPath = path.join(__dirname, '..', 'seed', 'sandbox', 'category-mappings-test.json');
    fs.writeFileSync(mappingsPath, JSON.stringify({ [COURSE_NAME]: categoryMap }, null, 2));
    console.log(`💾 Category mappings saved to: ${mappingsPath}\n`);
    
  } catch (error) {
    console.error('\n❌ E2E TEST FAILED:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

