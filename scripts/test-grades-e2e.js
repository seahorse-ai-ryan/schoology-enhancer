#!/usr/bin/env node

/**
 * End-to-End Grades Test
 * 
 * Tests the complete flow:
 * 1. Fetch grades from Schoology API
 * 2. Verify our API endpoint returns them correctly
 * 3. Compare results
 */

const path = require('path');
const { config } = require('dotenv');
const OAuth = require('oauth-1.0a');
const crypto = require('crypto');

config({ path: path.resolve(__dirname, '..', '.env.local') });

const SCHOOLOGY_API_URL = 'https://api.schoology.com/v1';
const APP_API_URL = 'http://localhost:9000';

async function makeSchoologyRequest(url, targetUserId) {
  const consumerKey = process.env.SCHOOLOGY_ADMIN_KEY || '';
  const consumerSecret = process.env.SCHOOLOGY_ADMIN_SECRET || '';
  if (!consumerKey || !consumerSecret) throw new Error('Admin credentials not configured.');

  const oauth = new OAuth({
    consumer: { key: consumerKey, secret: consumerSecret },
    signature_method: 'HMAC-SHA1',
    hash_function(base_string, key) {
      return crypto.createHmac('sha1', key).update(base_string).digest('base64');
    },
  });

  const requestData = { url, method: 'GET' };
  const headers = {
    ...oauth.toHeader(oauth.authorize(requestData)),
    'Accept': 'application/json',
    'X-Schoology-Run-As': String(targetUserId),
  };

  const response = await fetch(url, { headers });
  if (!response.ok) throw new Error(`Schoology API Error: ${response.status}`);
  return response.json();
}

async function testGradesE2E(studentName, studentId) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`🧪 Testing Grades E2E: ${studentName}`);
  console.log('='.repeat(60) + '\n');
  
  // Step 1: Fetch from Schoology directly
  console.log('📡 Step 1: Fetching from Schoology API...');
  const sectionsResponse = await makeSchoologyRequest(
    `${SCHOOLOGY_API_URL}/users/${studentId}/sections`,
    studentId
  );
  const sections = sectionsResponse.section || [];
  
  const schoologyGrades = {};
  for (const section of sections) {
    try {
      const gradeData = await makeSchoologyRequest(
        `${SCHOOLOGY_API_URL}/sections/${section.id}/grades`,
        studentId
      );
      const finalGrade = gradeData?.final_grade?.[0]?.period?.[0]?.grade;
      if (finalGrade !== null && finalGrade !== undefined) {
        schoologyGrades[section.id] = Math.round(finalGrade);
      }
    } catch (error) {
      console.error(`  ⚠️  Failed to get grade for ${section.course_title}`);
    }
  }
  
  console.log(`  ✅ Found ${Object.keys(schoologyGrades).length} grades from Schoology\n`);
  
  // Step 2: Fetch from our API
  console.log('🔌 Step 2: Fetching from our API...');
  const appResponse = await fetch(`${APP_API_URL}/api/schoology/grades`, {
    headers: {
      'Cookie': `schoology_user_id=${studentId}`,
    },
  });
  
  if (!appResponse.ok) {
    throw new Error(`Our API returned ${appResponse.status}`);
  }
  
  const appData = await appResponse.json();
  const appGrades = appData.grades || {};
  
  console.log(`  ✅ Our API returned ${Object.keys(appGrades).length} grades\n`);
  
  // Step 3: Compare
  console.log('🔍 Step 3: Comparing results...\n');
  
  const allSectionIds = new Set([
    ...Object.keys(schoologyGrades),
    ...Object.keys(appGrades)
  ]);
  
  let matches = 0;
  let mismatches = 0;
  
  for (const sectionId of allSectionIds) {
    const schoologyGrade = schoologyGrades[sectionId];
    const appGrade = appGrades[sectionId]?.grade;
    const section = sections.find(s => s.id === sectionId);
    const courseName = section?.course_title || `Section ${sectionId}`;
    
    if (schoologyGrade === appGrade) {
      console.log(`  ✅ ${courseName}: ${appGrade}%`);
      matches++;
    } else {
      console.log(`  ❌ ${courseName}: Schoology=${schoologyGrade}%, Our API=${appGrade}%`);
      mismatches++;
    }
  }
  
  console.log(`\n📊 Results: ${matches} matches, ${mismatches} mismatches`);
  
  if (mismatches === 0) {
    console.log('✅ Perfect match! Grades are correct.\n');
  } else {
    console.log('⚠️  Discrepancies found. Check API logic.\n');
  }
}

async function main() {
  console.log('\n🧪 End-to-End Grades Testing\n');
  
  const students = [
    { name: 'Carter Mock', id: '140834636' },
    { name: 'Tazio Mock', id: '140834637' },
  ];
  
  for (const student of students) {
    try {
      await testGradesE2E(student.name, student.id);
    } catch (error) {
      console.error(`\n❌ Test failed for ${student.name}:`, error.message);
    }
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('✨ E2E Testing Complete\n');
}

main();
