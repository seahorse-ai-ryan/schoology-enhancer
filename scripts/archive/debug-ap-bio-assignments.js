#!/usr/bin/env node

const OAuth = require('oauth-1.0a');
const crypto = require('crypto');

if (require('fs').existsSync('.env.local')) {
  const dotenv = require('dotenv');
  dotenv.config({ path: '.env.local' });
}

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

async function main() {
  const sectionId = 8067479367;
  
  console.log('\n🔍 DEBUG: AP Biology Assignments\n');
  console.log('Section ID:', sectionId);
  console.log();
  
  // Get categories
  console.log('📋 CATEGORIES:');
  const cats = await schoologyRequest('GET', `/sections/${sectionId}/grading_categories`, null, SUPER_TEACHER_ID);
  if (cats.grading_category) {
    const categories = Array.isArray(cats.grading_category) ? cats.grading_category : [cats.grading_category];
    categories.forEach(cat => {
      console.log(`   ${cat.title} (ID: ${cat.id}, Weight: ${cat.weight}%)`);
    });
  }
  console.log();
  
  // Get assignments
  console.log('📝 ASSIGNMENTS:');
  const assignments = await schoologyRequest('GET', `/sections/${sectionId}/assignments`, null, SUPER_TEACHER_ID);
  if (assignments.assignment) {
    const assignmentList = Array.isArray(assignments.assignment) ? assignments.assignment : [assignments.assignment];
    console.log(`   Found ${assignmentList.length} assignments:\n`);
    assignmentList.forEach(a => {
      console.log(`   ${a.title}`);
      console.log(`      ID: ${a.id}`);
      console.log(`      Category ID: ${a.grading_category || 'none'}`);
      console.log(`      Points: ${a.max_points}`);
      console.log(`      Due: ${a.due}`);
      console.log();
    });
  } else {
    console.log('   ❌ NO ASSIGNMENTS FOUND\n');
  }
  
  // Get grades for Carter
  console.log('📊 GRADES FOR CARTER:');
  const carterUid = 'carter_mock';
  const usersData = await schoologyRequest('GET', `/users?school_uids=${carterUid}`);
  const carterId = usersData.user[0].id;
  console.log(`   Carter ID: ${carterId}\n`);
  
  const enrollments = await schoologyRequest('GET', `/sections/${sectionId}/enrollments`, null, SUPER_TEACHER_ID);
  const enrollmentList = Array.isArray(enrollments.enrollment) ? enrollments.enrollment : [enrollments.enrollment];
  const carterEnrollment = enrollmentList.find(e => String(e.uid) === String(carterId));
  
  if (carterEnrollment) {
    console.log(`   Enrollment ID: ${carterEnrollment.id}\n`);
    
    const grades = await schoologyRequest('GET', `/sections/${sectionId}/grades`, null, SUPER_TEACHER_ID);
    console.log('   Raw grades response:');
    console.log(JSON.stringify(grades, null, 2));
  } else {
    console.log('   ❌ Carter not enrolled in this section\n');
  }
}

main().catch(console.error);
