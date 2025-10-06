#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const OAuth = require('oauth-1.0a');
const crypto = require('crypto');

if (fs.existsSync('.env.local')) {
  require('dotenv').config({ path: '.env.local' });
}

const DATA_PATH = path.join(__dirname, '..', 'seed', 'sandbox', 'additional-assignments-Oct2025.json');
const additionalData = JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));

const SCHOOLOGY_BASE_URL = 'https://api.schoology.com/v1';
const ADMIN_KEY = process.env.SCHOOLOGY_ADMIN_KEY;
const ADMIN_SECRET = process.env.SCHOOLOGY_ADMIN_SECRET;
const SUPER_TEACHER_ID = 140836120;

if (!ADMIN_KEY || !ADMIN_SECRET) {
  console.error('❌ Missing admin credentials');
  process.exit(1);
}

const oauth = new OAuth({
  consumer: { key: ADMIN_KEY, secret: ADMIN_SECRET },
  signature_method: 'HMAC-SHA1',
  hash_function(base_string, key) {
    return crypto.createHmac('sha1', key).update(base_string).digest('base64');
  },
});

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
    throw new Error(`API error (${response.status}): ${errorText.substring(0, 200)}`);
  }

  const text = await response.text();
  if (!text || text.trim() === '') {
    return { success: true };
  }
  
  return JSON.parse(text);
}

async function main() {
  console.log('\n🌱 Seeding Additional Assignments\n');
  console.log('='.repeat(60) + '\n');
  
  // Get section mappings
  const sectionsData = await schoologyRequest('GET', `/users/${SUPER_TEACHER_ID}/sections`);
  const sections = Array.isArray(sectionsData.section) ? sectionsData.section : [sectionsData.section];
  
  const sectionMap = new Map();
  sections.forEach(s => sectionMap.set(s.section_school_code, s.id));
  
  // Get user IDs
  const getUserId = async (schoolUid) => {
    const data = await schoologyRequest('GET', `/users?school_uids=${schoolUid}`);
    return data.user?.[0]?.uid;
  };
  
  const userIds = {};
  for (const assignment of additionalData.assignments) {
    if (!userIds[assignment.student_school_uid]) {
      userIds[assignment.student_school_uid] = await getUserId(assignment.student_school_uid);
    }
  }
  
  let created = 0;
  let graded = 0;
  
  // Group by section
  const bySection = {};
  additionalData.assignments.forEach(a => {
    if (!bySection[a.section_school_code]) {
      bySection[a.section_school_code] = [];
    }
    bySection[a.section_school_code].push(a);
  });
  
  for (const [sectionCode, assignments] of Object.entries(bySection)) {
    const sectionId = sectionMap.get(sectionCode);
    if (!sectionId) {
      console.log(`⚠️  Section not found: ${sectionCode}`);
      continue;
    }
    
    console.log(`\n📝 ${sectionCode}`);
    
    // Get categories for this section
    const categoriesData = await schoologyRequest(
      'GET',
      `/sections/${sectionId}/grading_categories`,
      null,
      SUPER_TEACHER_ID
    );
    const categories = categoriesData.grading_category || [];
    const categoryMap = new Map();
    categories.forEach(cat => categoryMap.set(cat.title, cat.id));
    
    for (const assignment of assignments) {
      try {
        // Create assignment
        const assignmentData = {
          title: assignment.title,
          due: assignment.due,
          max_points: assignment.max_points,
          allow_dropbox: 0,
        };
        
        // Add category if found
        const categoryId = categoryMap.get(assignment.category);
        if (categoryId) {
          assignmentData.grading_category_id = categoryId;
        }
        
        const result = await schoologyRequest(
          'POST',
          `/sections/${sectionId}/assignments`,
          assignmentData,
          SUPER_TEACHER_ID
        );
        
        console.log(`   ✅ ${assignment.title}`);
        created++;
        
        // If assignment has a grade or comment, add it
        if (assignment.grade !== null || assignment.comment) {
          const studentId = userIds[assignment.student_school_uid];
          if (!studentId) {
            console.log(`      ⚠️  Student not found: ${assignment.student_school_uid}`);
            continue;
          }
          
          // Get enrollment ID
          const enrollData = await schoologyRequest('GET', `/sections/${sectionId}/enrollments`);
          const enrollments = Array.isArray(enrollData.enrollment) ? enrollData.enrollment : [enrollData.enrollment];
          const studentEnroll = enrollments.find(e => e.uid === studentId);
          
          if (studentEnroll) {
            const gradeData = {
              grades: {
                grade: [{
                  assignment_id: result.id,
                  enrollment_id: studentEnroll.id,
                  grade: String(assignment.grade || 0),
                  comment: assignment.comment || '',
                }]
              }
            };
            
            await schoologyRequest(
              'PUT',
              `/sections/${sectionId}/grades`,
              gradeData,
              SUPER_TEACHER_ID
            );
            
            console.log(`      ✅ Graded: ${assignment.grade}, Comment: ${assignment.comment ? 'Yes' : 'No'}`);
            graded++;
          }
        }
        
        await new Promise(resolve => setTimeout(resolve, 150));
        
      } catch (error) {
        console.log(`   ❌ ${assignment.title}: ${error.message}`);
      }
    }
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('📊 Complete\n');
  console.log(`   ✅ Created: ${created} assignments`);
  console.log(`   ✅ Graded: ${graded} assignments`);
  console.log('='.repeat(60) + '\n');
}

main();
