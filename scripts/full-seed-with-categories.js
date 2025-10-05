#!/usr/bin/env node

/**
 * Complete seed workflow with grading categories
 * 
 * Processes BOTH data sources:
 * - temp-real-seed-grades.json (real grade data with categories)
 * - supplemental-assignments-and-grades.json (additional diverse assignments)
 * 
 * Workflow:
 * 1. Extract all unique categories per course from both sources
 * 2. Create grading categories for all sections
 * 3. Delete all existing assignments
 * 4. Create all assignments with proper category IDs
 * 5. Create all grades
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
const SUPPLEMENTAL_PATH = path.join(__dirname, '..', 'seed', 'sandbox', 'supplemental-assignments-and-grades.json');

const seedData = JSON.parse(fs.readFileSync(SEED_DATA_PATH, 'utf8'));
const realGradesData = JSON.parse(fs.readFileSync(REAL_GRADES_PATH, 'utf8'));
const supplementalData = JSON.parse(fs.readFileSync(SUPPLEMENTAL_PATH, 'utf8'));

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
  
  // Handle 204 No Content (successful DELETE)
  if (response.status === 204) {
    return { success: true, status: 204 };
  }
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`${response.status}: ${errorText}`);
  }
  
  return response.json();
}

// Cache for ID mappings
const idCache = {
  users: new Map(),
  sections: new Map(),
  categories: new Map(), // Map of "sectionId-categoryName" -> categoryId
  assignments: new Map(), // Map of "sectionId-assignmentTitle" -> assignmentId
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

// Build section mappings from Super Teacher's sections
async function buildSectionMappings() {
  console.log('\n📋 Building section mappings...\n');
  
  try {
    const sectionsData = await schoologyRequest(
      'GET',
      `/users/${SUPER_TEACHER_ID}/sections`,
      null,
      SUPER_TEACHER_ID
    );
    
    const sections = Array.isArray(sectionsData.section) 
      ? sectionsData.section 
      : [sectionsData.section];
    
    for (const section of sections) {
      if (section.section_school_code) {
        idCache.sections.set(section.section_school_code, {
          sectionId: section.id,
          courseName: section.course_title,
        });
      }
    }
    
    console.log(`✅ Mapped ${idCache.sections.size} sections\n`);
  } catch (error) {
    console.error(`❌ Error building section mappings: ${error.message}`);
    process.exit(1);
  }
}

// Extract categories from both data sources
function extractCategoriesByCourse() {
  console.log('\n📊 Extracting categories from data sources...\n');
  
  const courseCategories = new Map(); // Map of courseCode -> Set of {name, weight}
  
  // Extract from real grades data
  for (const student of realGradesData) {
    for (const course of student.courses) {
      // Extract course code from "AP Biology-3120: Teacher Name"
      const match = course.course_name.match(/^([^:]+)/);
      if (match) {
        const courseCode = match[1].trim();
        
        if (!courseCategories.has(courseCode)) {
          courseCategories.set(courseCode, new Map());
        }
        
        const categories = courseCategories.get(courseCode);
        
        if (course.categories) {
          for (const cat of course.categories) {
            const weight = cat.weight ? parseFloat(cat.weight.replace('%', '')) : 0;
            categories.set(cat.category_name, weight);
          }
        }
      }
    }
  }
  
  // Extract from supplemental data (infer generic weights if not present)
  for (const assignment of supplementalData.new_assignments) {
    const courseCode = assignment.course_school_code;
    const category = assignment.category;
    
    if (!courseCategories.has(courseCode)) {
      courseCategories.set(courseCode, new Map());
    }
    
    const categories = courseCategories.get(courseCode);
    
    // Only add if not already present (real data takes precedence)
    if (!categories.has(category)) {
      // Assign generic weight (will be distributed evenly)
      categories.set(category, 0);
    }
  }
  
  // Normalize weights for courses with 0-weight categories
  for (const [courseCode, categories] of courseCategories.entries()) {
    const totalWeight = Array.from(categories.values()).reduce((sum, w) => sum + w, 0);
    
    if (totalWeight === 0) {
      // Distribute evenly
      const evenWeight = Math.floor(100 / categories.size);
      for (const [catName, _] of categories.entries()) {
        categories.set(catName, evenWeight);
      }
    } else if (totalWeight < 100 && categories.size > 0) {
      // Distribute remaining weight to categories with 0
      const zeroWeightCats = Array.from(categories.entries()).filter(([_, w]) => w === 0);
      if (zeroWeightCats.length > 0) {
        const remainingWeight = 100 - totalWeight;
        const weightPerCat = Math.floor(remainingWeight / zeroWeightCats.length);
        for (const [catName, _] of zeroWeightCats) {
          categories.set(catName, weightPerCat);
        }
      }
    }
  }
  
  console.log(`✅ Found ${courseCategories.size} courses with categories\n`);
  
  // Log summary
  for (const [courseCode, categories] of courseCategories.entries()) {
    console.log(`   ${courseCode}: ${categories.size} categories`);
  }
  console.log();
  
  return courseCategories;
}

// Step 1: Create grading categories for all courses
async function createAllGradingCategories(courseCategories) {
  console.log('\n' + '═'.repeat(60));
  console.log('STEP 1: Creating Grading Categories for All Courses');
  console.log('═'.repeat(60) + '\n');
  
  let totalCreated = 0;
  let totalSkipped = 0;
  
  for (const [courseCode, categories] of courseCategories.entries()) {
    // Find matching section
    const sectionInfo = idCache.sections.get(courseCode);
    if (!sectionInfo) {
      console.log(`⚠️  ${courseCode}: No matching section found, skipping`);
      continue;
    }
    
    const { sectionId, courseName } = sectionInfo;
    
    console.log(`📚 ${courseCode} (${courseName})`);
    console.log(`   Section ID: ${sectionId}`);
    console.log(`   Creating ${categories.size} categories...`);
    
    const categoryPayload = {
      grading_categories: {
        grading_category: Array.from(categories.entries()).map(([name, weight]) => ({
          title: name,
          weight: weight,
        }))
      }
    };
    
    try {
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
        
        const categoryNames = Array.from(categories.keys());
        created.forEach((cat, idx) => {
          if (cat.id) {
            const catName = categoryNames[idx];
            idCache.categories.set(`${sectionId}-${catName}`, cat.id);
            console.log(`   ✅ ${catName}: ${categories.get(catName)}% → ID: ${cat.id}`);
            totalCreated++;
          }
        });
      }
      
      console.log();
      
      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 300));
      
    } catch (error) {
      if (error.message.includes('409')) {
        console.log(`   ⚠️  Categories already exist, fetching IDs...\n`);
        totalSkipped += categories.size;
        
        // Fetch existing categories
        try {
          const existingCats = await schoologyRequest(
            'GET',
            `/sections/${sectionId}/grading_categories`,
            null,
            SUPER_TEACHER_ID
          );
          
          if (existingCats.grading_category) {
            const cats = Array.isArray(existingCats.grading_category) 
              ? existingCats.grading_category 
              : [existingCats.grading_category];
            
            cats.forEach(cat => {
              idCache.categories.set(`${sectionId}-${cat.title}`, cat.id);
              console.log(`   📌 ${cat.title}: ID ${cat.id}`);
            });
          }
          console.log();
        } catch (fetchError) {
          console.log(`   ❌ Failed to fetch existing categories: ${fetchError.message}\n`);
        }
      } else {
        console.log(`   ❌ Failed: ${error.message}\n`);
        totalSkipped += categories.size;
      }
    }
  }
  
  console.log(`✅ Created ${totalCreated} categories, ${totalSkipped} skipped\n`);
}

// Step 2: Delete all existing assignments
async function deleteAllAssignments() {
  console.log('\n' + '═'.repeat(60));
  console.log('STEP 2: Deleting All Existing Assignments');
  console.log('═'.repeat(60) + '\n');
  
  let totalDeleted = 0;
  let totalFailed = 0;
  
  for (const [courseCode, sectionInfo] of idCache.sections.entries()) {
    const { sectionId, courseName } = sectionInfo;
    
    try {
      const assignmentsData = await schoologyRequest(
        'GET',
        `/sections/${sectionId}/assignments`,
        null,
        SUPER_TEACHER_ID
      );
      
      const assignments = assignmentsData.assignment 
        ? (Array.isArray(assignmentsData.assignment) ? assignmentsData.assignment : [assignmentsData.assignment])
        : [];
      
      if (assignments.length === 0) {
        continue;
      }
      
      console.log(`📚 ${courseCode}: ${assignments.length} assignments`);
      
      for (const assignment of assignments) {
        try {
          await schoologyRequest(
            'DELETE',
            `/sections/${sectionId}/assignments/${assignment.id}`,
            null,
            SUPER_TEACHER_ID
          );
          totalDeleted++;
          console.log(`   ✅ Deleted: ${assignment.title}`);
          
          // Rate limiting
          await new Promise(resolve => setTimeout(resolve, 200));
        } catch (error) {
          console.log(`   ❌ Failed: ${assignment.title}`);
          totalFailed++;
        }
      }
      
      console.log();
      
    } catch (error) {
      console.error(`❌ Failed to fetch assignments for ${courseCode}: ${error.message}\n`);
    }
  }
  
  console.log(`✅ Deleted ${totalDeleted} assignments`);
  if (totalFailed > 0) {
    console.log(`⚠️  Failed to delete ${totalFailed} assignments`);
  }
  console.log();
}

// Step 3: Create all assignments from both sources
async function createAllAssignments(courseCategories) {
  console.log('\n' + '═'.repeat(60));
  console.log('STEP 3: Creating All Assignments with Categories');
  console.log('═'.repeat(60) + '\n');
  
  // Combine assignments from both sources
  const allAssignments = [];
  
  // From real grades data
  for (const student of realGradesData) {
    for (const course of student.courses) {
      const match = course.course_name.match(/^([^:]+)/);
      if (!match) continue;
      
      const courseCode = match[1].trim();
      
      for (const category of course.categories) {
        for (const assignment of category.assignments) {
          // Check if already added
          const existing = allAssignments.find(a => 
            a.courseCode === courseCode && a.title === assignment.assignment_title
          );
          
          if (!existing) {
            allAssignments.push({
              courseCode: courseCode,
              title: assignment.assignment_title,
              category: category.category_name,
              // Set generic values (will be overridden if in seed-data-master.json)
              description: '',
              due: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
              points: 100,
            });
          }
        }
      }
    }
  }
  
  // From supplemental data
  for (const assignment of supplementalData.new_assignments) {
    // Check if already added
    const existing = allAssignments.find(a => 
      a.courseCode === assignment.course_school_code && a.title === assignment.title
    );
    
    if (!existing) {
      allAssignments.push({
        courseCode: assignment.course_school_code,
        title: assignment.title,
        category: assignment.category,
        description: '',
        due: assignment.due.slice(0, 10), // Extract YYYY-MM-DD
        points: assignment.points,
      });
    }
  }
  
  console.log(`📝 Creating ${allAssignments.length} assignments...\n`);
  
  let totalCreated = 0;
  let totalFailed = 0;
  
  for (const assignment of allAssignments) {
    const sectionInfo = idCache.sections.get(assignment.courseCode);
    if (!sectionInfo) {
      totalFailed++;
      continue;
    }
    
    const { sectionId } = sectionInfo;
    const categoryId = idCache.categories.get(`${sectionId}-${assignment.category}`);
    
    if (!categoryId) {
      console.log(`⚠️  ${assignment.courseCode} - ${assignment.title}: Category "${assignment.category}" not found, skipping`);
      totalFailed++;
      continue;
    }
    
    const assignmentData = {
      title: assignment.title,
      description: assignment.description,
      due: assignment.due,
      max_points: assignment.points,
      allow_dropbox: 0, // No submission required for grades to show
    };
    
    try {
      // Step 1: Create assignment (category will be 0)
      const result = await schoologyRequest(
        'POST',
        `/sections/${sectionId}/assignments`,
        assignmentData,
        SUPER_TEACHER_ID
      );
      
      if (result && result.id) {
        idCache.assignments.set(`${sectionId}-${assignment.title}`, result.id);
        
        // Step 2: Update assignment with category (required separate step)
        try {
          await schoologyRequest(
            'PUT',
            `/sections/${sectionId}/assignments/${result.id}`,
            { grading_category: categoryId },
            SUPER_TEACHER_ID
          );
        } catch (updateError) {
          console.log(`   ⚠️  Created but failed to set category for: ${assignment.title}`);
        }
        
        totalCreated++;
        
        if (totalCreated % 10 === 0) {
          console.log(`   ✅ Progress: ${totalCreated}/${allAssignments.length}`);
        }
      }
      
      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 300));
      
    } catch (error) {
      console.log(`   ❌ Failed: ${assignment.courseCode} - ${assignment.title}: ${error.message}`);
      totalFailed++;
    }
  }
  
  console.log(`\n✅ Created ${totalCreated}/${allAssignments.length} assignments`);
  if (totalFailed > 0) {
    console.log(`⚠️  Failed to create ${totalFailed} assignments`);
  }
  console.log();
}

// Step 4: Create all grades
async function createAllGrades() {
  console.log('\n' + '═'.repeat(60));
  console.log('STEP 4: Creating All Grades');
  console.log('═'.repeat(60) + '\n');
  
  // Combine grades from both sources
  const allGrades = [];
  
  // From supplemental data
  for (const grade of supplementalData.new_grades) {
    allGrades.push({
      courseCode: grade.course_school_code,
      studentUid: grade.student_school_uid,
      assignmentTitle: grade.assignment_title,
      grade: grade.grade,
      comment: grade.comment || '',
    });
  }
  
  // From real grades data (convert letter grades to numeric)
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
  
  console.log(`📊 Processing ${allGrades.length} grades...\n`);
  
  // Group grades by section
  const gradesBySectionAndStudent = new Map();
  
  for (const grade of allGrades) {
    const sectionInfo = idCache.sections.get(grade.courseCode);
    if (!sectionInfo) continue;
    
    const { sectionId } = sectionInfo;
    const assignmentId = idCache.assignments.get(`${sectionId}-${grade.assignmentTitle}`);
    
    if (!assignmentId) {
      continue; // Assignment wasn't created
    }
    
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
  
  let totalUploaded = 0;
  let totalFailed = 0;
  
  for (const [key, data] of gradesBySectionAndStudent.entries()) {
    const { sectionId, studentUid, grades } = data;
    
    // Get student ID
    const studentId = await getUserId(studentUid);
    if (!studentId) {
      console.log(`⚠️  Student not found: ${studentUid}`);
      totalFailed += grades.length;
      continue;
    }
    
    // Get enrollment ID
    try {
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
        console.log(`⚠️  Enrollment not found for ${studentUid} in section ${sectionId}`);
        totalFailed += grades.length;
        continue;
      }
      
      // Upload grades
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
      
      await schoologyRequest(
        'PUT',
        `/sections/${sectionId}/grades`,
        gradePayload,
        SUPER_TEACHER_ID
      );
      
      totalUploaded += grades.length;
      
      if (totalUploaded % 20 === 0) {
        console.log(`   ✅ Progress: ${totalUploaded} grades uploaded`);
      }
      
      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 300));
      
    } catch (error) {
      console.log(`   ❌ Failed to upload grades for ${studentUid}: ${error.message}`);
      totalFailed += grades.length;
    }
  }
  
  console.log(`\n✅ Uploaded ${totalUploaded} grades`);
  if (totalFailed > 0) {
    console.log(`⚠️  Failed to upload ${totalFailed} grades`);
  }
  console.log();
}

// Main function
async function main() {
  console.log('\n' + '═'.repeat(60));
  console.log('🎯 COMPLETE SEED WORKFLOW WITH CATEGORIES');
  console.log('═'.repeat(60));
  console.log('\nData Sources:');
  console.log('  📄 temp-real-seed-grades.json');
  console.log('  📄 supplemental-assignments-and-grades.json');
  console.log('\nWorkflow:');
  console.log('  1. Build section mappings');
  console.log('  2. Extract categories from both sources');
  console.log('  3. Create all grading categories');
  console.log('  4. Delete all existing assignments');
  console.log('  5. Create all assignments with category IDs');
  console.log('  6. Create all grades');
  console.log('\n' + '═'.repeat(60));
  
  try {
    // Step 0: Build section mappings
    await buildSectionMappings();
    
    // Step 0.5: Extract categories
    const courseCategories = extractCategoriesByCourse();
    
    // Step 1: Create grading categories
    await createAllGradingCategories(courseCategories);
    
    // Step 2: Delete existing assignments
    await deleteAllAssignments();
    
    // Step 3: Create all assignments
    await createAllAssignments(courseCategories);
    
    // Step 4: Create all grades
    await createAllGrades();
    
    // Save category mappings
    const mappingsPath = path.join(__dirname, '..', 'seed', 'sandbox', 'category-mappings-complete.json');
    const mappingsData = {};
    for (const [key, value] of idCache.categories.entries()) {
      mappingsData[key] = value;
    }
    fs.writeFileSync(mappingsPath, JSON.stringify(mappingsData, null, 2));
    
    console.log('\n' + '═'.repeat(60));
    console.log('✅ COMPLETE SEED WORKFLOW FINISHED!');
    console.log('═'.repeat(60));
    console.log(`\n💾 Category mappings saved to: ${mappingsPath}\n`);
    console.log('📊 NEXT STEPS:\n');
    console.log('1. Log in to Schoology with test accounts');
    console.log('2. Verify assignments appear with proper categories');
    console.log('3. Verify grades are visible and weighted correctly');
    console.log('4. Check that course grades calculate properly\n');
    
  } catch (error) {
    console.error('\n❌ WORKFLOW FAILED:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}
