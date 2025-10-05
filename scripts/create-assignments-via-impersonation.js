#!/usr/bin/env node

/**
 * Create assignments via Schoology API using X-Schoology-Run-As header
 * 
 * This approach uses System Admin API keys to impersonate teachers
 * and create assignments in their sections, without needing:
 * - Super Teacher accounts
 * - Admin enrollment in courses
 * - OAuth token management
 * 
 * See: docs/guides/API-USER-IMPERSONATION.md
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

// Load seed data
const SEED_DATA_PATH = path.join(__dirname, '..', 'seed', 'sandbox', 'seed-data-master.json');
const seedData = JSON.parse(fs.readFileSync(SEED_DATA_PATH, 'utf8'));

// Schoology API configuration - Use ADMIN keys (permanent)
const SCHOOLOGY_BASE_URL = 'https://api.schoology.com/v1';
const ADMIN_KEY = process.env.SCHOOLOGY_ADMIN_KEY;
const ADMIN_SECRET = process.env.SCHOOLOGY_ADMIN_SECRET;

if (!ADMIN_KEY || !ADMIN_SECRET) {
  console.error('❌ Error: SCHOOLOGY_ADMIN_KEY and SCHOOLOGY_ADMIN_SECRET must be set');
  console.error('These are your System Admin API credentials (permanent keys)');
  process.exit(1);
}

// OAuth setup with admin credentials
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
  
  // Important: Schoology's OAuth does NOT include POST body in signature
  // This is non-standard but required for their API
  const request_data = { url, method };
  
  const authHeader = oauth.toHeader(oauth.authorize(request_data));

  const headers = {
    ...authHeader,
    'Content-Type': 'application/json', // Schoology uses JSON for POST
  };
  
  // Add impersonation header if provided
  if (impersonateUserId) {
    headers['X-Schoology-Run-As'] = String(impersonateUserId);
  }

  const options = { method, headers };

  // Send data as JSON for POST/PUT
  if (data) {
    options.body = JSON.stringify(data);
  }

  const response = await fetch(url, options);
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Schoology API error (${response.status}): ${errorText}`);
  }

  return response.json();
}

// Cache for ID mappings
const idMappingCache = {
  users: new Map(), // school_uid → numeric Schoology user ID
  sections: new Map(), // section_school_code → { sectionId, teacherId }
};

// Fetch numeric user ID for a school_uid
async function getUserId(schoolUid) {
  if (idMappingCache.users.has(schoolUid)) {
    return idMappingCache.users.get(schoolUid);
  }

  try {
    const data = await schoologyRequest('GET', `/users?school_uids=${schoolUid}`);
    if (data.user && data.user.length > 0) {
      const userId = data.user[0].uid;
      idMappingCache.users.set(schoolUid, userId);
      return userId;
    }
  } catch (error) {
    console.error(`   ⚠️  Failed to get user ID for ${schoolUid}: ${error.message}`);
  }
  return null;
}

// Fetch section mappings using Super Teacher (who has all sections)
async function buildSectionMappings() {
  console.log('📋 Building section ID mappings...\n');
  
  // Use Super Teacher who is enrolled in all sections
  const SUPER_TEACHER_SCHOOL_UID = 'super_teacher_20250930';
  
  process.stdout.write(`   Fetching all sections via Super Teacher...`);
  
  // Get Super Teacher's numeric ID
  const superTeacherId = await getUserId(SUPER_TEACHER_SCHOOL_UID);
  if (!superTeacherId) {
    console.log(' ❌ Super Teacher not found!');
    throw new Error('Super Teacher account not found in Schoology');
  }
  
  try {
    // Get all sections for Super Teacher
    const data = await schoologyRequest('GET', `/users/${superTeacherId}/sections`);
    
    if (data.section) {
      const sections = Array.isArray(data.section) ? data.section : [data.section];
      
      // Map each section, but preserve the actual teacher from seed data for impersonation
      sections.forEach(section => {
        // Find the course in seed data to get the real teacher
        const course = seedData.courses.find(c => c.section_school_code === section.section_school_code);
        
        idMappingCache.sections.set(section.section_school_code, {
          sectionId: section.id,
          teacherId: superTeacherId, // Use Super Teacher for API calls
          realTeacherSchoolUid: course ? course.teacher_uid : null // Track for reference
        });
      });
      console.log(` ✅ ${sections.length} sections mapped`);
    } else {
      console.log(' ⚠️  No sections found');
    }
  } catch (error) {
    console.log(` ❌ ${error.message}`);
    throw error;
  }
  
  console.log(`\n✅ Mapped ${idMappingCache.sections.size} sections\n`);
}

// Get section info (ID and teacher ID) for a course code
function getSectionInfo(sectionSchoolCode) {
  return idMappingCache.sections.get(sectionSchoolCode) || null;
}

// Create a single assignment
async function createAssignment(sectionId, assignment, teacherUid) {
  // Use only the essential fields that Schoology requires
  const assignmentData = {
    title: assignment.title,
    description: assignment.category || assignment.description || '',
    due: assignment.due || assignment.due_date || new Date().toISOString().slice(0, 10),
    max_points: assignment.points || assignment.max_points || 100,
    allow_dropbox: 0, // CRITICAL: 0 = no submission required, grades visible immediately!
    // Note: grading_category_id could be set here if categories exist
    // Leave unset to use course defaults or "Ungraded" category
  };

  try {
    const result = await schoologyRequest(
      'POST',
      `/sections/${sectionId}/assignments`,
      assignmentData,
      teacherUid // Impersonate the teacher
    );
    return result;
  } catch (error) {
    console.error(`   ❌ Failed to create assignment "${assignment.title}": ${error.message}`);
    return null;
  }
}

// Test with a single assignment
async function testSingleAssignment() {
  console.log('🧪 Testing Assignment Creation via API Impersonation\n');
  
  // Get first assignment from AP Biology course
  const testAssignment = seedData.assignments.find(a => a.course_school_code === 'AP-BIO-3120-S1');
  
  if (!testAssignment) {
    console.error('❌ Could not find test assignment for AP-BIO-3120-S1');
    process.exit(1);
  }
  
  // Use Super Teacher (who is enrolled in all sections) for testing
  const SUPER_TEACHER_ID = 140836120; // super_teacher_20250930's Schoology user ID
  const AP_BIO_SECTION_ID = 8067479367; // AP-BIO-3120-S1's Schoology section ID
  
  console.log('📝 Test Assignment:');
  console.log(`   Section: AP-BIO-3120-S1 (Schoology ID: ${AP_BIO_SECTION_ID})`);
  console.log(`   Title: "${testAssignment.title}"`);
  console.log(`   Impersonate: Super Teacher (ID: ${SUPER_TEACHER_ID})\n`);
  
  console.log(`🚀 Creating assignment (as Super Teacher)...`);
  
  try {
    const result = await createAssignment(
      AP_BIO_SECTION_ID, // Use numeric Schoology section ID
      testAssignment,
      SUPER_TEACHER_ID // Use numeric Schoology user ID
    );
    
    if (result) {
      console.log('\n✅ SUCCESS! Assignment created:');
      console.log(`   Assignment ID: ${result.id}`);
      console.log(`   Title: ${result.title}`);
      console.log(`\n🎉 API impersonation works! Ready for bulk import.`);
      process.exit(0);
    } else {
      console.log('\n❌ Failed to create assignment');
      process.exit(1);
    }
  } catch (error) {
    console.error('\n❌ FAILED:', error.message);
    console.error('\n🔍 Troubleshooting:');
    console.error('   - Are SCHOOLOGY_ADMIN_KEY/SECRET correct?');
    console.error('   - Does the teacher exist in Schoology?');
    console.error('   - Does the section exist?');
    console.error('   - Is API impersonation enabled for your org?');
    process.exit(1);
  }
}

// Main bulk import function
async function bulkImportAssignments() {
  console.log('📚 Bulk Assignment & Grade Import via API Impersonation\n');
  
  // Step 1: Build ID mappings
  await buildSectionMappings();
  
  // Group assignments by section
  const assignmentsBySection = {};
  seedData.assignments.forEach((assignment, idx) => {
    const sectionCode = assignment.course_school_code;
    if (!assignmentsBySection[sectionCode]) {
      assignmentsBySection[sectionCode] = [];
    }
    assignmentsBySection[sectionCode].push({ ...assignment, index: idx });
  });

  console.log(`📊 Summary:`);
  console.log(`   - ${Object.keys(assignmentsBySection).length} sections with assignments`);
  console.log(`   - ${seedData.assignments.length} total assignments\n`);

  let totalCreated = 0;
  let totalFailed = 0;
  const createdAssignments = []; // Track for grade creation

  // Step 2: Create assignments for each section
  for (const [sectionCode, assignments] of Object.entries(assignmentsBySection)) {
    const sectionInfo = getSectionInfo(sectionCode);
    
    if (!sectionInfo) {
      console.log(`\n⚠️  Section: ${sectionCode} - Not found in Schoology, skipping`);
      totalFailed += assignments.length;
      continue;
    }
    
    console.log(`\n📝 Section: ${sectionCode} (${assignments.length} assignments)`);
    console.log(`   Section ID: ${sectionInfo.sectionId}, Teacher ID: ${sectionInfo.teacherId}`);
    
    for (const assignment of assignments) {
      process.stdout.write(`   Creating: "${assignment.title}"...`);
      
      const result = await createAssignment(
        sectionInfo.sectionId,
        assignment,
        sectionInfo.teacherId
      );
      
      if (result) {
        console.log(` ✅ Created (ID: ${result.id})`);
        totalCreated++;
        createdAssignments.push({
          assignmentId: result.id,
          sectionId: sectionInfo.sectionId,
          sectionCode: sectionCode,
          teacherId: sectionInfo.teacherId,
          seedAssignment: assignment
        });
      } else {
        console.log(` ❌ Failed`);
        totalFailed++;
      }
      
      // Rate limiting: wait 100ms between requests
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('📊 Assignment Import Complete\n');
  console.log(`Assignments:`);
  console.log(`   ✅ Created: ${totalCreated}`);
  console.log(`   ❌ Failed: ${totalFailed}`);
  console.log('='.repeat(60));
  
  // Step 3: Create grades
  if (createdAssignments.length > 0 && seedData.grades && seedData.grades.length > 0) {
    console.log('\n\n🎯 Starting Grade Import...\n');
    await bulkImportGrades(createdAssignments);
  }
}

// Create grades for assignments
async function bulkImportGrades(createdAssignments) {
  let totalCreated = 0;
  let totalFailed = 0;
  
  // Get enrollment IDs for students
  const enrollmentCache = new Map(); // studentSchoolUid → { sectionCode → enrollmentId }
  
  console.log('📋 Fetching student enrollment IDs...\n');
  
  for (const assignment of createdAssignments) {
    // Get grades for this assignment from seed data
    const assignmentGrades = seedData.grades.filter(g => 
      g.assignment_title === assignment.seedAssignment.title &&
      g.course_school_code === assignment.sectionCode
    );
    
    if (assignmentGrades.length === 0) continue;
    
    console.log(`\n📊 Adding grades for "${assignment.seedAssignment.title}" (${assignmentGrades.length} students)...`);
    
    for (const grade of assignmentGrades) {
      // Get enrollment ID for this student in this section
      let enrollmentId = null;
      
      try {
        // Fetch enrollments for this section if not cached
        const cacheKey = `${grade.student_school_uid}-${assignment.sectionCode}`;
        if (!enrollmentCache.has(cacheKey)) {
          const enrollData = await schoologyRequest('GET', `/sections/${assignment.sectionId}/enrollments`);
          if (enrollData.enrollment) {
            const enrollments = Array.isArray(enrollData.enrollment) ? enrollData.enrollment : [enrollData.enrollment];
            
            // Find this student's enrollment
            const studentUserId = await getUserId(grade.student_school_uid);
            const studentEnroll = enrollments.find(e => e.uid === studentUserId);
            
            if (studentEnroll) {
              enrollmentCache.set(cacheKey, studentEnroll.id);
              enrollmentId = studentEnroll.id;
            }
          }
        } else {
          enrollmentId = enrollmentCache.get(cacheKey);
        }
        
        if (!enrollmentId) {
          console.log(`   ⚠️  ${grade.student_school_uid}: Enrollment not found`);
          totalFailed++;
          continue;
        }
        
        // Create the grade
        const gradeData = {
          enrollment_id: enrollmentId,
          grade: String(grade.grade),
          comment: grade.comment || ''
        };
        
        await schoologyRequest(
          'POST',
          `/sections/${assignment.sectionId}/assignments/${assignment.assignmentId}/grades`,
          gradeData,
          assignment.teacherId
        );
        
        console.log(`   ✅ ${grade.student_school_uid}: ${grade.grade}`);
        totalCreated++;
        
        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (error) {
        console.log(`   ❌ ${grade.student_school_uid}: ${error.message}`);
        totalFailed++;
      }
    }
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('📊 Grade Import Complete\n');
  console.log(`Grades:`);
  console.log(`   ✅ Created: ${totalCreated}`);
  console.log(`   ❌ Failed: ${totalFailed}`);
  console.log('='.repeat(60));
}

// Run based on command line arg
const mode = process.argv[2] || 'test';

if (mode === 'test') {
  testSingleAssignment().catch(error => {
    console.error('\n💥 Fatal error:', error);
    process.exit(1);
  });
} else if (mode === 'bulk') {
  bulkImportAssignments().catch(error => {
    console.error('\n💥 Fatal error:', error);
    process.exit(1);
  });
} else {
  console.log('Usage:');
  console.log('  node scripts/create-assignments-via-impersonation.js test  # Test with 1 assignment');
  console.log('  node scripts/create-assignments-via-impersonation.js bulk  # Create all 103 assignments');
  process.exit(1);
}

module.exports = { testSingleAssignment, bulkImportAssignments };

