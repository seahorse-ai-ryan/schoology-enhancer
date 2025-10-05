#!/usr/bin/env node

/**
 * Import grades for existing assignments
 * Simpler script that only handles grade creation
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

// Schoology API configuration
const SCHOOLOGY_BASE_URL = 'https://api.schoology.com/v1';
const ADMIN_KEY = process.env.SCHOOLOGY_ADMIN_KEY;
const ADMIN_SECRET = process.env.SCHOOLOGY_ADMIN_SECRET;
const SUPER_TEACHER_ID = 140836120; // From previous runs

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

// Helper to make authenticated requests
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
    throw new Error(`API error (${response.status}): ${errorText}`);
  }

  return response.json();
}

// Get user ID from school_uid
async function getUserId(schoolUid) {
  try {
    const data = await schoologyRequest('GET', `/users?school_uids=${schoolUid}`);
    if (data.user && data.user.length > 0) {
      return data.user[0].uid;
    }
  } catch (error) {
    console.error(`⚠️  Failed to get user ID for ${schoolUid}`);
  }
  return null;
}

async function main() {
  console.log('🎯 Grade Import for Existing Assignments\n');
  
  if (!seedData.grades || seedData.grades.length === 0) {
    console.log('❌ No grades found in seed-data-master.json');
    process.exit(1);
  }
  
  console.log(`📊 Found ${seedData.grades.length} grades to import\n`);
  
  let totalCreated = 0;
  let totalFailed = 0;
  let totalSkipped = 0;
  
  // Get section mapping for Super Teacher
  console.log('📋 Getting section mappings...\n');
  const sectionsData = await schoologyRequest('GET', `/users/${SUPER_TEACHER_ID}/sections`);
  const sections = Array.isArray(sectionsData.section) ? sectionsData.section : [sectionsData.section];
  
  const sectionMap = new Map();
  sections.forEach(s => {
    sectionMap.set(s.section_school_code, s.id);
  });
  
  console.log(`✅ Mapped ${sectionMap.size} sections\n`);
  
  // Group grades by section for bulk upload
  const gradesBySection = new Map();
  for (const grade of seedData.grades) {
    if (!gradesBySection.has(grade.course_school_code)) {
      gradesBySection.set(grade.course_school_code, []);
    }
    gradesBySection.get(grade.course_school_code).push(grade);
  }
  
  console.log(`📝 Processing ${gradesBySection.size} sections\n`);
  
  for (const [sectionCode, grades] of gradesBySection) {
    const sectionId = sectionMap.get(sectionCode);
    
    if (!sectionId) {
      console.log(`⚠️  ${sectionCode}: Section not found, skipping ${grades.length} grades`);
      totalSkipped += grades.length;
      continue;
    }
    
    console.log(`\n📊 ${sectionCode} (${grades.length} grades)`);
    
    try {
      // Get assignments for this section
      const assignmentsData = await schoologyRequest('GET', `/sections/${sectionId}/assignments`);
      const assignments = Array.isArray(assignmentsData.assignment) ? assignmentsData.assignment : [assignmentsData.assignment];
      
      // Get enrollments for this section
      const enrollData = await schoologyRequest('GET', `/sections/${sectionId}/enrollments`);
      const enrollments = Array.isArray(enrollData.enrollment) ? enrollData.enrollment : [enrollData.enrollment];
      
      // Build submission and grade payloads
      const gradePayload = [];
      const submissionsToCreate = [];
      
      for (const grade of grades) {
        // Find assignment by title
        const assignment = assignments.find(a => a.title === grade.assignment_title);
        if (!assignment) {
          console.log(`   ⚠️  Assignment "${grade.assignment_title}" not found`);
          totalSkipped++;
          continue;
        }
        
        // Find student enrollment
        const studentUserId = await getUserId(grade.student_school_uid);
        if (!studentUserId) {
          console.log(`   ❌ ${grade.student_school_uid}: User not found`);
          totalFailed++;
          continue;
        }
        
        const enrollment = enrollments.find(e => e.uid === studentUserId);
        if (!enrollment) {
          console.log(`   ❌ ${grade.student_school_uid}: Not enrolled`);
          totalFailed++;
          continue;
        }
        
        // Track submission to create
        submissionsToCreate.push({
          assignmentId: assignment.id,
          userId: studentUserId,
          studentUid: grade.student_school_uid,
          assignmentTitle: grade.assignment_title
        });
        
        // Add to bulk grade payload
        const gradeEntry = {
          assignment_id: String(assignment.id),
          enrollment_id: String(enrollment.id),
          grade: String(grade.grade)
        };
        
        if (grade.comment) {
          gradeEntry.comment = grade.comment;
        }
        
        gradePayload.push(gradeEntry);
        console.log(`   ✓ Prepared: ${grade.student_school_uid} - ${grade.assignment_title}: ${grade.grade}`);
      }
      
      if (gradePayload.length === 0) {
        console.log(`   ⚠️  No valid grades to upload`);
        continue;
      }
      
      // CRITICAL: Create submissions first (required for grades to appear in UI)
      console.log(`\n   📝 Creating ${submissionsToCreate.length} submissions (IMPERSONATING STUDENTS)...`);
      let submissionsCreated = 0;
      
      for (const sub of submissionsToCreate) {
        try {
          // CRITICAL: Impersonate the STUDENT (not teacher) for submissions
          // Submissions are a student action, so we need X-Schoology-Run-As: {student_id}
          await schoologyRequest(
            'POST',
            `/sections/${sectionId}/submissions/${sub.assignmentId}/users/${sub.userId}`,
            {},  // Empty body creates placeholder
            sub.userId  // IMPERSONATE STUDENT (not SUPER_TEACHER_ID)
          );
          submissionsCreated++;
          console.log(`   ✓ Created submission for ${sub.studentUid} - ${sub.assignmentTitle}`);
          
          // Rate limiting
          await new Promise(resolve => setTimeout(resolve, 100));
        } catch (error) {
          // Submission might already exist (409 conflict), that's OK
          if (error.message.includes('409')) {
            submissionsCreated++;
            console.log(`   ✓ Submission already exists for ${sub.studentUid} - ${sub.assignmentTitle}`);
          } else {
            console.log(`   ⚠️  Submission failed for ${sub.studentUid}:`);
            console.log(`       Error: ${error.message}`);
            console.log(`       Student ID: ${sub.userId}, Assignment ID: ${sub.assignmentId}, Section ID: ${sectionId}`);
          }
        }
      }
      
      console.log(`   ✅ Created ${submissionsCreated}/${submissionsToCreate.length} submissions`);
      
      // Now upload grades using correct format
      console.log(`\n   📤 Uploading ${gradePayload.length} grades...`);
      
      const bulkPayload = {
        grades: {
          grade: gradePayload
        }
      };
      
      await schoologyRequest(
        'PUT',
        `/sections/${sectionId}/grades`,
        bulkPayload,
        SUPER_TEACHER_ID
      );
      
      console.log(`   ✅ Successfully uploaded ${gradePayload.length} grades!`);
      totalCreated += gradePayload.length;
      
      // Rate limiting between sections
      await new Promise(resolve => setTimeout(resolve, 200));
      
    } catch (error) {
      console.log(`   ❌ Section failed: ${error.message}`);
      totalFailed += grades.length;
    }
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('📊 Grade Import Complete\n');
  console.log(`Grades:`);
  console.log(`   ✅ Created: ${totalCreated}`);
  console.log(`   ⚠️  Skipped: ${totalSkipped}`);
  console.log(`   ❌ Failed: ${totalFailed}`);
  console.log('='.repeat(60));
}

main().catch(error => {
  console.error('\n💥 Fatal error:', error);
  process.exit(1);
});
