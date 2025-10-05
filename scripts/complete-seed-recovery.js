#!/usr/bin/env node

/**
 * Recovery script to complete failed assignments and grades
 * Includes proper rate limiting and category fetching
 */

const fs = require('fs');
const path = require('path');
const OAuth = require('oauth-1.0a');
const crypto = require('crypto');

if (require('fs').existsSync('.env.local')) {
  const dotenv = require('dotenv');
  dotenv.config({ path: '.env.local' });
}

const SEED_DATA_PATH = path.join(__dirname, '..', 'seed', 'sandbox', 'seed-data-master.json');
const REAL_GRADES_PATH = path.join(__dirname, '..', 'seed', 'sandbox', 'temp-real-seed-grades.json');
const SUPPLEMENTAL_PATH = path.join(__dirname, '..', 'seed', 'sandbox', 'supplemental-assignments-and-grades.json');

const seedData = JSON.parse(fs.readFileSync(SEED_DATA_PATH, 'utf8'));
const realGradesData = JSON.parse(fs.readFileSync(REAL_GRADES_PATH, 'utf8'));
const supplementalData = JSON.parse(fs.readFileSync(SUPPLEMENTAL_PATH, 'utf8'));

const SCHOOLOGY_BASE_URL = 'https://api.schoology.com/v1';
const ADMIN_KEY = process.env.SCHOOLOGY_ADMIN_KEY;
const ADMIN_SECRET = process.env.SCHOOLOGY_ADMIN_SECRET;
const SUPER_TEACHER_ID = 140836120;

const oauth = new OAuth({
  consumer: { key: ADMIN_KEY, secret: ADMIN_SECRET },
  signature_method: 'HMAC-SHA1',
  hash_function(base_string, key) {
    return crypto.createHmac('sha1', key).update(base_string).digest('base64');
  },
});

// Rate limiting tracker
let requestCount = 0;
let windowStart = Date.now();

async function waitForRateLimit() {
  requestCount++;
  
  if (requestCount >= 45) { // Conservative limit (45 instead of 50)
    const elapsed = Date.now() - windowStart;
    if (elapsed < 5000) {
      const waitTime = 5000 - elapsed + 500; // Extra 500ms buffer
      console.log(`   ⏸️  Rate limit approaching, waiting ${Math.round(waitTime/1000)}s...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
      requestCount = 0;
      windowStart = Date.now();
    } else {
      requestCount = 0;
      windowStart = Date.now();
    }
  }
}

async function schoologyRequest(method, endpoint, data = null, impersonateUserId = null) {
  await waitForRateLimit();
  
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
  
  if (response.status === 204) {
    return { success: true };
  }
  
  if (response.status === 429) {
    console.log('   ⚠️  Hit rate limit, backing off 10s...');
    await new Promise(resolve => setTimeout(resolve, 10000));
    return schoologyRequest(method, endpoint, data, impersonateUserId); // Retry
  }
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`${response.status}: ${errorText}`);
  }
  
  const text = await response.text();
  return text ? JSON.parse(text) : { success: true };
}

const idCache = {
  users: new Map(),
  sections: new Map(),
  categories: new Map(),
  assignments: new Map(),
};

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

async function buildSectionMappings() {
  console.log('\n📋 Building section mappings...\n');
  
  const sectionsData = await schoologyRequest('GET', `/users/${SUPER_TEACHER_ID}/sections`, null, SUPER_TEACHER_ID);
  const sections = Array.isArray(sectionsData.section) ? sectionsData.section : [sectionsData.section];
  
  for (const section of sections) {
    if (section.section_school_code) {
      idCache.sections.set(section.section_school_code, {
        sectionId: section.id,
        courseName: section.course_title,
      });
    }
  }
  
  console.log(`✅ Mapped ${idCache.sections.size} sections\n`);
}

async function fetchAllCategories() {
  console.log('\n📊 Fetching existing categories from all sections...\n');
  
  let totalCategories = 0;
  
  for (const [courseCode, sectionInfo] of idCache.sections.entries()) {
    const { sectionId } = sectionInfo;
    
    try {
      const cats = await schoologyRequest('GET', `/sections/${sectionId}/grading_categories`, null, SUPER_TEACHER_ID);
      
      if (cats.grading_category) {
        const categories = Array.isArray(cats.grading_category) ? cats.grading_category : [cats.grading_category];
        
        for (const cat of categories) {
          idCache.categories.set(`${sectionId}-${cat.title}`, cat.id);
          totalCategories++;
        }
      }
    } catch (error) {
      // Skip sections without categories
    }
  }
  
  console.log(`✅ Cached ${totalCategories} category mappings\n`);
}

async function createMissingAssignments() {
  console.log('\n📝 Creating missing assignments...\n');
  
  // Get all assignments to create (same logic as before)
  const allAssignments = [];
  
  for (const student of realGradesData) {
    for (const course of student.courses) {
      const match = course.course_name.match(/^([^:]+)/);
      if (!match) continue;
      
      const courseCode = match[1].trim();
      
      for (const category of course.categories) {
        for (const assignment of category.assignments) {
          const existing = allAssignments.find(a => 
            a.courseCode === courseCode && a.title === assignment.assignment_title
          );
          
          if (!existing) {
            allAssignments.push({
              courseCode: courseCode,
              title: assignment.assignment_title,
              category: category.category_name,
              description: '',
              due: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
              points: 100,
            });
          }
        }
      }
    }
  }
  
  for (const assignment of supplementalData.new_assignments) {
    const existing = allAssignments.find(a => 
      a.courseCode === assignment.course_school_code && a.title === assignment.title
    );
    
    if (!existing) {
      allAssignments.push({
        courseCode: assignment.course_school_code,
        title: assignment.title,
        category: assignment.category,
        description: '',
        due: assignment.due.slice(0, 10),
        points: assignment.points,
      });
    }
  }
  
  console.log(`📋 Total assignments to create: ${allAssignments.length}\n`);
  
  let created = 0;
  let skipped = 0;
  
  for (const assignment of allAssignments) {
    const sectionInfo = idCache.sections.get(assignment.courseCode);
    if (!sectionInfo) {
      skipped++;
      continue;
    }
    
    const { sectionId } = sectionInfo;
    const categoryId = idCache.categories.get(`${sectionId}-${assignment.category}`);
    
    if (!categoryId) {
      skipped++;
      continue;
    }
    
    // Check if already exists
    const cacheKey = `${sectionId}-${assignment.title}`;
    if (idCache.assignments.has(cacheKey)) {
      skipped++;
      continue;
    }
    
    try {
      const result = await schoologyRequest('POST', `/sections/${sectionId}/assignments`, {
        title: assignment.title,
        description: assignment.description,
        due: assignment.due,
        max_points: assignment.points,
        allow_dropbox: 0,
      }, SUPER_TEACHER_ID);
      
      if (result && result.id) {
        // Update with category
        await schoologyRequest('PUT', `/sections/${sectionId}/assignments/${result.id}`, {
          grading_category: categoryId
        }, SUPER_TEACHER_ID);
        
        idCache.assignments.set(cacheKey, result.id);
        created++;
        
        if (created % 10 === 0) {
          console.log(`   ✅ Progress: ${created} created, ${skipped} skipped`);
        }
      }
    } catch (error) {
      if (!error.message.includes('409')) {
        console.log(`   ❌ ${assignment.courseCode} - ${assignment.title}: ${error.message}`);
      }
      skipped++;
    }
  }
  
  console.log(`\n✅ Created ${created} assignments, skipped ${skipped}\n`);
}

async function uploadAllGrades() {
  console.log('\n📊 Uploading all grades...\n');
  
  const allGrades = [];
  
  for (const grade of supplementalData.new_grades) {
    allGrades.push({
      courseCode: grade.course_school_code,
      studentUid: grade.student_school_uid,
      assignmentTitle: grade.assignment_title,
      grade: grade.grade,
      comment: grade.comment || '',
    });
  }
  
  const gradeConversion = {
    'A+': '100', 'A': '95', 'A-': '90',
    'B+': '88', 'B': '85', 'B-': '82',
    'C+': '78', 'C': '75', 'C-': '72',
    'D+': '68', 'D': '65', 'D-': '62',
    'F': '55',
  };
  
  for (const student of realGradesData) {
    for (const course of student.courses) {
      const match = course.course_name.match(/^([^:]+)/);
      if (!match) continue;
      
      const courseCode = match[1].trim();
      const studentUid = student.student_name.toLowerCase().replace(/ /g, '_').replace('carter_hickman', 'carter_mock');
      
      for (const category of course.categories) {
        for (const assignment of category.assignments) {
          if (assignment.grade) {
            const numericGrade = gradeConversion[assignment.grade] || assignment.grade;
            
            allGrades.push({
              courseCode: courseCode,
              studentUid: studentUid,
              assignmentTitle: assignment.assignment_title,
              grade: numericGrade,
              comment: assignment.comments || '',
            });
          }
        }
      }
    }
  }
  
  const gradesBySectionAndStudent = new Map();
  
  for (const grade of allGrades) {
    const sectionInfo = idCache.sections.get(grade.courseCode);
    if (!sectionInfo) continue;
    
    const { sectionId } = sectionInfo;
    const assignmentId = idCache.assignments.get(`${sectionId}-${grade.assignmentTitle}`);
    
    if (!assignmentId) continue;
    
    const key = `${sectionId}-${grade.studentUid}`;
    
    if (!gradesBySectionAndStudent.has(key)) {
      gradesBySectionAndStudent.set(key, {
        sectionId,
        studentUid: grade.studentUid,
        grades: [],
      });
    }
    
    gradesBySectionAndStudent.get(key).grades.push({
      assignmentId,
      grade: grade.grade,
      comment: grade.comment,
    });
  }
  
  console.log(`📤 Uploading grades for ${gradesBySectionAndStudent.size} student-section pairs...\n`);
  
  let uploaded = 0;
  let failed = 0;
  
  for (const [key, data] of gradesBySectionAndStudent.entries()) {
    const { sectionId, studentUid, grades } = data;
    
    const studentId = await getUserId(studentUid);
    if (!studentId) {
      failed += grades.length;
      continue;
    }
    
    try {
      const enrollmentsData = await schoologyRequest('GET', `/sections/${sectionId}/enrollments`, null, SUPER_TEACHER_ID);
      const enrollments = Array.isArray(enrollmentsData.enrollment) ? enrollmentsData.enrollment : [enrollmentsData.enrollment];
      const studentEnrollment = enrollments.find(e => String(e.uid) === String(studentId));
      
      if (!studentEnrollment) {
        failed += grades.length;
        continue;
      }
      
      const gradePayload = {
        grades: {
          grade: grades.map(g => ({
            assignment_id: String(g.assignmentId),
            enrollment_id: String(studentEnrollment.id),
            grade: String(g.grade),
            comment: g.comment,
          }))
        }
      };
      
      await schoologyRequest('PUT', `/sections/${sectionId}/grades`, gradePayload, SUPER_TEACHER_ID);
      
      uploaded += grades.length;
      
      if (uploaded % 20 === 0) {
        console.log(`   ✅ Progress: ${uploaded} grades uploaded`);
      }
    } catch (error) {
      console.log(`   ❌ Failed for ${studentUid}: ${error.message}`);
      failed += grades.length;
    }
  }
  
  console.log(`\n✅ Uploaded ${uploaded} grades, ${failed} failed\n`);
}

async function main() {
  console.log('\n🔧 RECOVERY: Completing Failed Seed Data\n');
  console.log('═'.repeat(60) + '\n');
  
  try {
    await buildSectionMappings();
    await fetchAllCategories();
    await createMissingAssignments();
    await uploadAllGrades();
    
    console.log('\n' + '═'.repeat(60));
    console.log('✅ RECOVERY COMPLETE!');
    console.log('═'.repeat(60) + '\n');
  } catch (error) {
    console.error('\n❌ RECOVERY FAILED:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

main();
