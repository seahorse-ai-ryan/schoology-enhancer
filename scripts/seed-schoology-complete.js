#!/usr/bin/env node

/**
 * Complete Schoology Seeding Script
 * 
 * This script performs a complete seeding workflow:
 * 1. Creates grading categories for each course (with weights)
 * 2. Creates assignments (assigned to proper categories)
 * 3. Creates grades for assignments
 * 
 * Prerequisites:
 * - Users, courses, and enrollments must be imported via CSV
 * - SCHOOLOGY_ADMIN_KEY and SCHOOLOGY_ADMIN_SECRET in .env.local
 * 
 * Usage:
 *   node scripts/seed-schoology-complete.js
 */

const fs = require('fs');
const path = require('path');
const OAuth = require('oauth-1.0a');
const crypto = require('crypto');

// Load environment variables
if (fs.existsSync('.env.local')) {
  require('dotenv').config({ path: '.env.local' });
}

// Load seed data
const SEED_DATA_PATH = path.join(__dirname, '..', 'seed', 'sandbox', 'seed-data-master.json');
const seedData = JSON.parse(fs.readFileSync(SEED_DATA_PATH, 'utf8'));

const SCHOOLOGY_BASE_URL = 'https://api.schoology.com/v1';
const ADMIN_KEY = process.env.SCHOOLOGY_ADMIN_KEY;
const ADMIN_SECRET = process.env.SCHOOLOGY_ADMIN_SECRET;
const SUPER_TEACHER_ID = 140836120; // super_teacher_20250930

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
    throw new Error(`API error (${response.status}): ${errorText.substring(0, 200)}`);
  }

  return response.json();
}

// Cache for mappings
const cache = {
  sections: new Map(), // section_school_code → { sectionId, teacherId, categories: Map }
  users: new Map(), // school_uid → numeric ID
};

// Get user ID from school_uid
async function getUserId(schoolUid) {
  if (cache.users.has(schoolUid)) {
    return cache.users.get(schoolUid);
  }

  try {
    const data = await schoologyRequest('GET', `/users?school_uids=${schoolUid}`);
    if (data.user && data.user.length > 0) {
      const userId = data.user[0].uid;
      cache.users.set(schoolUid, userId);
      return userId;
    }
  } catch (error) {
    console.error(`   ⚠️  Failed to get user ID for ${schoolUid}`);
  }
  return null;
}

// Build section mappings
async function buildSectionMappings() {
  console.log('📋 Step 1: Building section mappings...\n');
  
  const data = await schoologyRequest('GET', `/users/${SUPER_TEACHER_ID}/sections`);
  const sections = Array.isArray(data.section) ? data.section : [data.section];
  
  sections.forEach(section => {
    cache.sections.set(section.section_school_code, {
      sectionId: section.id,
      teacherId: SUPER_TEACHER_ID,
      categories: new Map(), // Will be populated after category creation
    });
  });
  
  console.log(`✅ Mapped ${cache.sections.size} sections\n`);
}

// Create grading categories for a section
async function createGradingCategories(sectionCode, sectionId, categoriesWithWeights) {
  console.log(`   Creating ${Object.keys(categoriesWithWeights).length} grading categories...`);
  
  const categoryMap = new Map(); // category_name → category_id
  
  for (const [categoryName, weight] of Object.entries(categoriesWithWeights)) {
    try {
      const categoryData = {
        title: categoryName,
        weight: weight,
        calculation_type: 2, // 2 = weighted by points
      };
      
      const result = await schoologyRequest(
        'POST',
        `/sections/${sectionId}/grading_categories`,
        categoryData,
        SUPER_TEACHER_ID
      );
      
      categoryMap.set(categoryName, result.id);
      console.log(`      ✅ ${categoryName} (${weight}%) - ID: ${result.id}`);
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
    } catch (error) {
      console.log(`      ⚠️  ${categoryName}: ${error.message}`);
      // Continue with other categories
    }
  }
  
  // Store in cache
  const sectionInfo = cache.sections.get(sectionCode);
  if (sectionInfo) {
    sectionInfo.categories = categoryMap;
  }
  
  return categoryMap;
}

// Create assignment with category
async function createAssignment(sectionId, assignment, teacherId, categoryId = null) {
  const assignmentData = {
    title: assignment.title,
    description: assignment.description || assignment.category || '',
    due: assignment.due || assignment.due_date || new Date().toISOString().slice(0, 10),
    max_points: assignment.points || assignment.max_points || 100,
    allow_dropbox: 0, // Critical: grades visible immediately
  };
  
  // Add category if available
  if (categoryId) {
    assignmentData.grading_category_id = categoryId;
  }

  const result = await schoologyRequest(
    'POST',
    `/sections/${sectionId}/assignments`,
    assignmentData,
    teacherId
  );
  
  return result;
}

// Create grades in bulk for a section
async function createGradesForSection(sectionId, gradesBatch, teacherId) {
  if (gradesBatch.length === 0) return { created: 0, failed: 0 };
  
  const gradesData = {
    grades: {
      grade: gradesBatch
    }
  };
  
  try {
    await schoologyRequest(
      'PUT',
      `/sections/${sectionId}/grades`,
      gradesData,
      teacherId
    );
    return { created: gradesBatch.length, failed: 0 };
  } catch (error) {
    console.log(`      ⚠️  Bulk grade upload failed: ${error.message}`);
    return { created: 0, failed: gradesBatch.length };
  }
}

// Main seeding function
async function seedSchoology() {
  console.log('🌱 Complete Schoology Seeding Process\n');
  console.log('=' .repeat(60) + '\n');
  
  const stats = {
    categories: { created: 0, failed: 0 },
    assignments: { created: 0, failed: 0 },
    grades: { created: 0, failed: 0 },
  };
  
  // Step 1: Build section mappings
  await buildSectionMappings();
  
  // Step 2: Create grading categories for each course
  console.log('📊 Step 2: Creating grading categories...\n');
  
  for (const course of seedData.courses) {
    if (!course.grading_categories || Object.keys(course.grading_categories).length === 0) {
      console.log(`⏭️  ${course.section_school_code}: No categories defined, skipping\n`);
      continue;
    }
    
    const sectionInfo = cache.sections.get(course.section_school_code);
    if (!sectionInfo) {
      console.log(`⚠️  ${course.section_school_code}: Section not found in Schoology\n`);
      continue;
    }
    
    console.log(`📝 ${course.title} (${course.section_school_code})`);
    
    try {
      const categoryMap = await createGradingCategories(
        course.section_school_code,
        sectionInfo.sectionId,
        course.grading_categories
      );
      stats.categories.created += categoryMap.size;
      console.log();
    } catch (error) {
      console.log(`   ❌ Failed: ${error.message}\n`);
      stats.categories.failed++;
    }
  }
  
  // Step 3: Create assignments with category assignments
  console.log('\n📚 Step 3: Creating assignments...\n');
  
  // Group assignments by section
  const assignmentsBySection = {};
  seedData.assignments.forEach(assignment => {
    const sectionCode = assignment.course_school_code;
    if (!assignmentsBySection[sectionCode]) {
      assignmentsBySection[sectionCode] = [];
    }
    assignmentsBySection[sectionCode].push(assignment);
  });
  
  const createdAssignments = []; // Track for grade creation
  
  for (const [sectionCode, assignments] of Object.entries(assignmentsBySection)) {
    const sectionInfo = cache.sections.get(sectionCode);
    
    if (!sectionInfo) {
      console.log(`⚠️  ${sectionCode}: Section not found, skipping ${assignments.length} assignments\n`);
      stats.assignments.failed += assignments.length;
      continue;
    }
    
    console.log(`📝 ${sectionCode} (${assignments.length} assignments)`);
    
    for (const assignment of assignments) {
      try {
        // Find category ID for this assignment
        let categoryId = null;
        if (assignment.category && sectionInfo.categories.has(assignment.category)) {
          categoryId = sectionInfo.categories.get(assignment.category);
        } else if (assignment.description && sectionInfo.categories.has(assignment.description)) {
          categoryId = sectionInfo.categories.get(assignment.description);
        }
        
        const result = await createAssignment(
          sectionInfo.sectionId,
          assignment,
          sectionInfo.teacherId,
          categoryId
        );
        
        console.log(`   ✅ ${assignment.title}${categoryId ? ' [categorized]' : ''}`);
        
        createdAssignments.push({
          assignmentId: result.id,
          sectionId: sectionInfo.sectionId,
          sectionCode: sectionCode,
          teacherId: sectionInfo.teacherId,
          title: assignment.title,
        });
        
        stats.assignments.created++;
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (error) {
        console.log(`   ❌ ${assignment.title}: ${error.message}`);
        stats.assignments.failed++;
      }
    }
    console.log();
  }
  
  // Step 4: Create grades
  console.log('\n🎯 Step 4: Creating grades...\n');
  
  // Group grades by section
  const gradesBySection = {};
  seedData.grades.forEach(grade => {
    const sectionCode = grade.section_school_code || grade.course_school_code;
    if (!gradesBySection[sectionCode]) {
      gradesBySection[sectionCode] = [];
    }
    gradesBySection[sectionCode].push(grade);
  });
  
  for (const [sectionCode, grades] of Object.entries(gradesBySection)) {
    const sectionInfo = cache.sections.get(sectionCode);
    if (!sectionInfo) {
      console.log(`⚠️  ${sectionCode}: Section not found, skipping ${grades.length} grades`);
      stats.grades.failed += grades.length;
      continue;
    }
    
    console.log(`📊 ${sectionCode} (${grades.length} grades)`);
    
    // Build grade batch for this section
    const gradesBatch = [];
    
    for (const grade of grades) {
      try {
        // Find the assignment that was created
        const assignment = createdAssignments.find(a => 
          a.sectionCode === sectionCode && 
          a.title === grade.assignment_title
        );
        
        if (!assignment) {
          console.log(`   ⚠️  Assignment not found for grade: ${grade.assignment_title}`);
          stats.grades.failed++;
          continue;
        }
        
        // Get student's enrollment ID
        const studentId = await getUserId(grade.student_school_uid);
        if (!studentId) {
          console.log(`   ⚠️  Student not found: ${grade.student_school_uid}`);
          stats.grades.failed++;
          continue;
        }
        
        // Get enrollments for this section to find enrollment_id
        const enrollData = await schoologyRequest('GET', `/sections/${sectionInfo.sectionId}/enrollments`);
        const enrollments = Array.isArray(enrollData.enrollment) ? enrollData.enrollment : [enrollData.enrollment];
        const studentEnroll = enrollments.find(e => e.uid === studentId);
        
        if (!studentEnroll) {
          console.log(`   ⚠️  Enrollment not found for ${grade.student_school_uid}`);
          stats.grades.failed++;
          continue;
        }
        
        gradesBatch.push({
          assignment_id: assignment.assignmentId,
          enrollment_id: studentEnroll.id,
          grade: String(grade.grade || grade.numeric_grade),
          comment: grade.comment || '',
        });
        
      } catch (error) {
        console.log(`   ⚠️  Error preparing grade: ${error.message}`);
        stats.grades.failed++;
      }
    }
    
    // Upload grades in batch
    if (gradesBatch.length > 0) {
      const result = await createGradesForSection(
        sectionInfo.sectionId,
        gradesBatch,
        sectionInfo.teacherId
      );
      stats.grades.created += result.created;
      stats.grades.failed += result.failed;
      console.log(`   ✅ Uploaded ${result.created} grades`);
    }
    
    console.log();
    await new Promise(resolve => setTimeout(resolve, 200));
  }
  
  // Final summary
  console.log('\n' + '='.repeat(60));
  console.log('🎉 Seeding Complete!\n');
  console.log('📊 Summary:');
  console.log(`   Categories: ✅ ${stats.categories.created} created, ❌ ${stats.categories.failed} failed`);
  console.log(`   Assignments: ✅ ${stats.assignments.created} created, ❌ ${stats.assignments.failed} failed`);
  console.log(`   Grades: ✅ ${stats.grades.created} created, ❌ ${stats.grades.failed} failed`);
  console.log('='.repeat(60));
}

// Run the seeding
seedSchoology()
  .then(() => {
    console.log('\n✨ Done!');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n💥 Fatal error:', error);
    process.exit(1);
  });
