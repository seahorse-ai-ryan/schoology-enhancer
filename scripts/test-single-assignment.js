#!/usr/bin/env node

/**
 * Test creating a SINGLE assignment via Schoology API
 * Atomic test before bulk import
 */

// Set emulator host FIRST
if (!process.env.FIRESTORE_EMULATOR_HOST) {
  process.env.FIRESTORE_EMULATOR_HOST = '127.0.0.1:8080';
}

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
const API_KEY = process.env.SCHOOLOGY_CONSUMER_KEY || process.env.SCHOOLOGY_API_KEY;
const API_SECRET = process.env.SCHOOLOGY_CONSUMER_SECRET || process.env.SCHOOLOGY_API_SECRET;

if (!API_KEY || !API_SECRET) {
  console.error('❌ Error: Schoology API credentials not found');
  process.exit(1);
}

// OAuth setup
const oauth = new OAuth({
  consumer: { key: API_KEY, secret: API_SECRET },
  signature_method: 'HMAC-SHA1',
  hash_function(base_string, key) {
    return crypto.createHmac('sha1', key).update(base_string).digest('base64');
  },
});

// Get OAuth tokens from Firestore
async function getTokensFromFirestore(userId) {
  try {
    const { getFirestore } = await import('firebase-admin/firestore');
    const { initializeApp, getApps } = await import('firebase-admin/app');
    
    if (!getApps().length) {
      initializeApp({ projectId: process.env.FIREBASE_PROJECT_ID || 'demo-project' });
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

// Make authenticated Schoology request
async function schoologyRequest(method, endpoint, data = null, token = null) {
  const url = `${SCHOOLOGY_BASE_URL}${endpoint}`;
  
  const request_data = { url, method };
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

// Main test function
async function testSingleAssignment() {
  console.log('🧪 Testing Single Assignment Creation\n');
  
  const userId = process.env.SCHOOLOGY_USER_ID || '140836120';
  console.log(`✓ Using user ID: ${userId}`);
  
  // Get OAuth tokens
  const token = await getTokensFromFirestore(userId);
  if (!token) {
    process.exit(1);
  }
  console.log('✓ Retrieved OAuth tokens\n');
  
  // Get first assignment from seed data
  const testAssignment = seedData.assignments[0];
  const sectionCode = testAssignment.course_school_code;
  
  console.log('📝 Test Assignment:');
  console.log(`   Section: ${sectionCode}`);
  console.log(`   Title: "${testAssignment.title}"`);
  console.log(`   Due: ${testAssignment.due}`);
  console.log(`   Points: ${testAssignment.points}\n`);
  
  // Create assignment
  const assignmentData = {
    title: testAssignment.title,
    description: testAssignment.category || 'Test assignment',
    due: testAssignment.due || new Date().toISOString(),
    grading_scale: testAssignment.points || 100,
    grading_type: 1, // 1 = numeric
    max_points: testAssignment.points || 100,
  };
  
  try {
    console.log(`🚀 Creating assignment in section ${sectionCode}...`);
    const result = await schoologyRequest(
      'POST',
      `/sections/${sectionCode}/assignments`,
      assignmentData,
      token
    );
    
    console.log('\n✅ SUCCESS! Assignment created:');
    console.log(`   Assignment ID: ${result.id}`);
    console.log(`   Title: ${result.title}`);
    console.log(`   Max Points: ${result.max_points}`);
    console.log(`\n🎉 API test passed! Ready for bulk import.`);
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ FAILED:', error.message);
    console.error('\n🔍 Troubleshooting:');
    console.error('   - Is super_teacher enrolled as ADMIN in this section?');
    console.error('   - Does the section exist in Schoology?');
    console.error('   - Are the OAuth tokens valid?');
    process.exit(1);
  }
}

// Run test
if (require.main === module) {
  testSingleAssignment().catch(error => {
    console.error('\n💥 Fatal error:', error);
    process.exit(1);
  });
}

module.exports = { testSingleAssignment };


