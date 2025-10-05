#!/usr/bin/env node

/**
 * Get sections that Super Teacher is enrolled in
 * To find the correct section IDs for assignment creation
 */

// Set emulator host FIRST
if (!process.env.FIRESTORE_EMULATOR_HOST) {
  process.env.FIRESTORE_EMULATOR_HOST = '127.0.0.1:8080';
}

const OAuth = require('oauth-1.0a');
const crypto = require('crypto');

// Load environment variables
if (require('fs').existsSync('.env.local')) {
  const dotenv = require('dotenv');
  dotenv.config({ path: '.env.local' });
}

const SCHOOLOGY_BASE_URL = 'https://api.schoology.com/v1';
const API_KEY = process.env.SCHOOLOGY_CONSUMER_KEY;
const API_SECRET = process.env.SCHOOLOGY_CONSUMER_SECRET;

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

async function schoologyRequest(endpoint, token) {
  const url = `${SCHOOLOGY_BASE_URL}${endpoint}`;
  const request_data = { url, method: 'GET' };
  const authHeader = oauth.toHeader(oauth.authorize(request_data, token));

  const response = await fetch(url, { headers: authHeader });
  
  if (!response.ok) {
    throw new Error(`API error (${response.status}): ${await response.text()}`);
  }

  return response.json();
}

async function main() {
  const userId = '140836120';
  const token = await getTokensFromFirestore(userId);
  
  console.log('🔍 Fetching sections for Super Teacher...\n');
  
  const data = await schoologyRequest('/users/me/sections', token);
  
  console.log(`✓ Found ${data.section.length} sections\n`);
  console.log('Section ID → Section School Code:');
  
  data.section.slice(0, 10).forEach(section => {
    console.log(`  ${section.id} → ${section.section_school_code} (${section.course_title})`);
  });
  
  console.log(`\n✅ Use these numeric IDs for assignment creation!`);
}

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});


