#!/usr/bin/env node

/**
 * Bulk import assignments and grades to Schoology via REST API
 * 
 * Usage:
 *   node scripts/import-assignments-grades.js
 * 
 * Prerequisites:
 *   - Users, courses, and enrollments must already be imported
 *   - SCHOOLOGY_API_KEY and SCHOOLOGY_API_SECRET must be set in environment
 */

// Set emulator host FIRST, before any Firebase imports
// Use 127.0.0.1 instead of localhost to force IPv4
if (!process.env.FIRESTORE_EMULATOR_HOST) {
  process.env.FIRESTORE_EMULATOR_HOST = '127.0.0.1:8080';
}

const fs = require('fs');
const path = require('path');
const OAuth = require('oauth-1.0a');
const crypto = require('crypto');

// Load environment variables from .env.local if available
if (require('fs').existsSync('.env.local')) {
  const dotenv = require('dotenv');
  dotenv.config({ path: '.env.local' });
}

// Load seed data
const SEED_DATA_PATH = path.join(__dirname, '..', 'seed', 'sandbox', 'seed-data-master.json');
const seedData = JSON.parse(fs.readFileSync(SEED_DATA_PATH, 'utf8'));

// Schoology API configuration
const SCHOOLOGY_BASE_URL = 'https://api.schoology.com/v1';
const API_KEY = process.env.SCHOOLOGY_CONSUMER_KEY || process.env.SCHOOLOGY_API_KEY || process.env.NEXT_PUBLIC_SCHOOLOGY_KEY;
const API_SECRET = process.env.SCHOOLOGY_CONSUMER_SECRET || process.env.SCHOOLOGY_API_SECRET || process.env.NEXT_PUBLIC_SCHOOLOGY_SECRET;

if (!API_KEY || !API_SECRET) {
  console.error('❌ Error: Schoology API credentials not found');
  console.error('Set SCHOOLOGY_CONSUMER_KEY and SCHOOLOGY_CONSUMER_SECRET in .env.local');
  process.exit(1);
}

// OAuth 1.0a setup
const oauth = new OAuth({
  consumer: { key: API_KEY, secret: API_SECRET },
  signature_method: 'HMAC-SHA1',
  hash_function(base_string, key) {
    return crypto
      .createHmac('sha1', key)
      .update(base_string)
      .digest('base64');
  },
});

// Helper to make authenticated requests
async function schoologyRequest(method, endpoint, data = null, token = null) {
  const url = `${SCHOOLOGY_BASE_URL}${endpoint}`;
  
  const request_data = {
    url,
    method,
  };

  const authHeader = token
    ? oauth.toHeader(oauth.authorize(request_data, token))
    : oauth.toHeader(oauth.authorize(request_data));

  const options = {
    method,
    headers: {
      ...authHeader,
      'Content-Type': 'application/json',
    },
  };

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

// Helper to get section ID from section_school_code
async function getSectionId(sectionSchoolCode, token) {
  // Schoology doesn't provide a direct lookup by section_school_code
  // We need to search through sections
  // For now, we'll use the section_school_code as the section_id
  // This may need adjustment based on actual Schoology section IDs
  
  console.log(`⚠️  Note: Using section_school_code as section_id: ${sectionSchoolCode}`);
  console.log('   You may need to map section codes to internal Schoology section IDs');
  
  return sectionSchoolCode;
}

// Create a single assignment
async function createAssignment(sectionId, assignment, token) {
  const assignmentData = {
    title: assignment.title,
    description: assignment.category || '',
    due: assignment.due || new Date().toISOString(),
    grading_scale: assignment.points || 100,
    grading_type: 1, // 1 = numeric
    max_points: assignment.points || 100,
  };

  try {
    const result = await schoologyRequest(
      'POST',
      `/sections/${sectionId}/assignments`,
      assignmentData,
      token
    );
    return result;
  } catch (error) {
    console.error(`   ❌ Failed to create assignment "${assignment.title}": ${error.message}`);
    return null;
  }
}

// Create a grade for an assignment
async function createGrade(sectionId, assignmentId, enrollment, grade, token) {
  const gradeData = {
    enrollment_id: enrollment.enrollment_id,
    assignment_id: assignmentId,
    grade: grade.score,
    comment: grade.comment || '',
  };

  try {
    await schoologyRequest(
      'POST',
      `/sections/${sectionId}/grades`,
      gradeData,
      token
    );
    return true;
  } catch (error) {
    console.error(`   ❌ Failed to create grade: ${error.message}`);
    return false;
  }
}

// Fetch OAuth tokens from Firestore
async function getTokensFromFirestore(userId) {
  try {
    const { getFirestore } = await import('firebase-admin/firestore');
    const { initializeApp, getApps } = await import('firebase-admin/app');
    
    if (!getApps().length) {
      initializeApp({
        projectId: process.env.FIREBASE_PROJECT_ID || 'demo-project',
      });
    }
    
    const db = getFirestore();
    const userDoc = await db.collection('users').doc(userId).get();
    
    if (!userDoc.exists) {
      console.error(`❌ User ${userId} not found in Firestore`);
      return null;
    }
    
    const userData = userDoc.data();
    if (!userData.accessToken || !userData.accessSecret) {
      console.error(`❌ User ${userId} has no OAuth tokens stored`);
      return null;
    }
    
    return {
      key: userData.accessToken,
      secret: userData.accessSecret,
    };
  } catch (error) {
    console.error('❌ Error fetching tokens from Firestore:', error.message);
    return null;
  }
}

// Main import function
async function importAssignmentsAndGrades() {
  console.log('📚 Schoology Assignment & Grade Bulk Importer\n');
  
  // Try to get OAuth tokens from environment or Firestore
  let token = null;
  
  if (process.env.OAUTH_TOKEN && process.env.OAUTH_TOKEN_SECRET) {
    console.log('✓ Using OAuth tokens from environment variables\n');
    token = {
      key: process.env.OAUTH_TOKEN,
      secret: process.env.OAUTH_TOKEN_SECRET,
    };
  } else if (process.env.SCHOOLOGY_USER_ID) {
    console.log(`✓ Fetching OAuth tokens from Firestore for user: ${process.env.SCHOOLOGY_USER_ID}\n`);
    token = await getTokensFromFirestore(process.env.SCHOOLOGY_USER_ID);
  } else {
    console.error('❌ Error: No OAuth tokens found\n');
    console.error('Option 1: Set environment variables:');
    console.error('   export OAUTH_TOKEN="your_token"');
    console.error('   export OAUTH_TOKEN_SECRET="your_secret"\n');
    console.error('Option 2: Set SCHOOLOGY_USER_ID to fetch from Firestore:');
    console.error('   export SCHOOLOGY_USER_ID="your_user_id"\n');
    console.error('💡 Tip: Authenticate through the web app first, then use your user ID');
    process.exit(1);
  }

  if (!token) {
    process.exit(1);
  }

  // Group assignments by section
  const assignmentsBySection = {};
  (seedData.assignments || []).forEach((assignment, idx) => {
    const sectionCode = assignment.course_school_code;
    if (!assignmentsBySection[sectionCode]) {
      assignmentsBySection[sectionCode] = [];
    }
    assignmentsBySection[sectionCode].push({
      ...assignment,
      index: idx,
    });
  });

  console.log(`📊 Summary:`);
  console.log(`   - ${Object.keys(assignmentsBySection).length} sections with assignments`);
  console.log(`   - ${seedData.assignments.length} total assignments`);
  console.log(`   - Will create grades for assignments with scores\n`);

  let totalCreated = 0;
  let totalFailed = 0;
  let totalGradesCreated = 0;
  let totalGradesFailed = 0;

  // Create assignments for each section
  for (const [sectionCode, assignments] of Object.entries(assignmentsBySection)) {
    console.log(`\n📝 Section: ${sectionCode} (${assignments.length} assignments)`);
    
    try {
      const sectionId = await getSectionId(sectionCode, token);
      
      for (const assignment of assignments) {
        process.stdout.write(`   Creating: "${assignment.title}"...`);
        
        const result = await createAssignment(sectionId, assignment, token);
        
        if (result) {
          console.log(` ✅ Created (ID: ${result.id})`);
          totalCreated++;
          
          // If this assignment has a score, create grades for enrolled students
          if (assignment.score !== undefined && assignment.score !== null) {
            // Find enrollments for this section
            const enrollments = seedData.enrollments.filter(
              e => e.course_school_code === sectionCode
            );
            
            for (const enrollment of enrollments) {
              const gradeCreated = await createGrade(
                sectionId,
                result.id,
                enrollment,
                { score: assignment.score, comment: '' },
                token
              );
              
              if (gradeCreated) {
                totalGradesCreated++;
              } else {
                totalGradesFailed++;
              }
            }
          }
        } else {
          console.log(` ❌ Failed`);
          totalFailed++;
        }
        
        // Rate limiting: wait 100ms between requests
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    } catch (error) {
      console.error(`   ❌ Error processing section: ${error.message}`);
      totalFailed += assignments.length;
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('📊 Import Complete\n');
  console.log(`Assignments:`);
  console.log(`   ✅ Created: ${totalCreated}`);
  console.log(`   ❌ Failed: ${totalFailed}`);
  console.log(`\nGrades:`);
  console.log(`   ✅ Created: ${totalGradesCreated}`);
  console.log(`   ❌ Failed: ${totalGradesFailed}`);
  console.log('='.repeat(60));
}

// Run the import
if (require.main === module) {
  importAssignmentsAndGrades()
    .then(() => {
      console.log('\n✨ Done!');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n❌ Fatal error:', error);
      process.exit(1);
    });
}

module.exports = { importAssignmentsAndGrades };

