#!/usr/bin/env node

/**
 * Enroll Super Teacher in all sections as co-teacher via Schoology API
 * Required because CSV import doesn't support co-teacher enrollment
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

// Load seed data to get section codes
const SEED_DATA_PATH = path.join(__dirname, '..', 'seed', 'sandbox', 'seed-data-master.json');
const seedData = JSON.parse(fs.readFileSync(SEED_DATA_PATH, 'utf8'));

const SCHOOLOGY_BASE_URL = 'https://api.schoology.com/v1';
const API_KEY = process.env.SCHOOLOGY_CONSUMER_KEY;
const API_SECRET = process.env.SCHOOLOGY_CONSUMER_SECRET;
const SUPER_TEACHER_UID = 'super_teacher_20250930';

const oauth = new OAuth({
  consumer: { key: API_KEY, secret: API_SECRET },
  signature_method: 'HMAC-SHA1',
  hash_function(base_string, key) {
    return crypto.createHmac('sha1', key).update(base_string).digest('base64');
  },
});

async function getTokensFromFirestore(userId) {
  const { getFirestore } = await import('firebase-admin/firestore');
  const { initializeApp, getApps } = await import('firebase-admin/app');
  
  if (!getApps().length) {
    initializeApp({ projectId: 'demo-project' });
  }
  
  const db = getFirestore();
  const userDoc = await db.collection('users').doc(userId).get();
  const userData = userDoc.data();
  
  return {
    key: userData.accessToken,
    secret: userData.accessSecret,
  };
}

async function schoologyRequest(method, endpoint, data = null, token) {
  const url = `${SCHOOLOGY_BASE_URL}${endpoint}`;
  const request_data = { url, method };
  const authHeader = oauth.toHeader(oauth.authorize(request_data, token));

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
    throw new Error(`${response.status}: ${errorText}`);
  }

  return response.json();
}

async function main() {
  console.log('🚀 Enrolling Super Teacher as Co-Teacher via API\n');
  
  // Use admin credentials to enroll super_teacher
  // Note: This requires admin API keys, not super_teacher's tokens
  const token = {
    key: process.env.SCHOOLOGY_ADMIN_KEY || API_KEY,
    secret: process.env.SCHOOLOGY_ADMIN_SECRET || API_SECRET,
  };
  
  console.log('Using admin credentials for enrollment...\n');
  
  // Get all unique section codes
  const sectionCodes = [...new Set(seedData.enrollments.map(e => e.course_school_code))];
  console.log(`Found ${sectionCodes.length} sections to enroll\n`);
  
  // First, get all sections to map codes to IDs
  console.log('📚 Step 1: Fetching section IDs from Schoology...');
  
  let enrolled = 0;
  let failed = 0;
  const errors = [];
  
  for (const sectionCode of sectionCodes.slice(0, 3)) { // Test with first 3
    try {
      // Search for section by school code
      const searchUrl = `/schools/${process.env.SCHOOLOGY_SCHOOL_ID || '7742428476'}/sections`;
      const sections = await schoologyRequest('GET', searchUrl, null, token);
      
      const section = sections.section.find(s => s.section_school_code === sectionCode);
      
      if (!section) {
        console.log(`  ⚠️  Section ${sectionCode} not found in Schoology`);
        failed++;
        continue;
      }
      
      console.log(`  Enrolling in: ${section.course_title} (${section.id})...`);
      
      // Enroll super_teacher in this section
      const enrollment = {
        uid: SUPER_TEACHER_UID,
        admin: 1, // 1 = admin/teacher role
      };
      
      await schoologyRequest('POST', `/sections/${section.id}/enrollments`, enrollment, token);
      
      console.log(`    ✅ Enrolled`);
      enrolled++;
      
      // Rate limit: wait 100ms between requests
      await new Promise(resolve => setTimeout(resolve, 100));
      
    } catch (error) {
      console.log(`    ❌ Failed: ${error.message}`);
      errors.push({ section: sectionCode, error: error.message });
      failed++;
    }
  }
  
  console.log(`\n${'='.repeat(60)}`);
  console.log(`\n📊 Results:`);
  console.log(`   ✅ Enrolled: ${enrolled}`);
  console.log(`   ❌ Failed: ${failed}`);
  
  if (errors.length > 0) {
    console.log(`\n❌ Errors:`);
    errors.forEach(e => console.log(`   ${e.section}: ${e.error}`));
  }
  
  console.log(`\n${'='.repeat(60)}`);
}

main().catch(err => {
  console.error('\n💥 Fatal error:', err.message);
  process.exit(1);
});


