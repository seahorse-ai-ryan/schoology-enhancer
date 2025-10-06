#!/usr/bin/env node

const path = require('path');
const OAuth = require('oauth-1.0a');
const crypto = require('crypto');

if (require('fs').existsSync('.env.local')) {
  require('dotenv').config({ path: '.env.local' });
}

const SCHOOLOGY_BASE_URL = 'https://api.schoology.com/v1';
const ADMIN_KEY = process.env.SCHOOLOGY_ADMIN_KEY;
const ADMIN_SECRET = process.env.SCHOOLOGY_ADMIN_SECRET;
const SUPER_TEACHER_ID = 140836120;
const TEST_SECTION_ID = 8067479367; // AP Biology

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
  const text = await response.text();
  
  console.log(`\nResponse Status: ${response.status}`);
  console.log(`Response Body: ${text.substring(0, 500)}`);
  
  if (!response.ok) {
    throw new Error(`API error (${response.status})`);
  }

  return JSON.parse(text);
}

async function testCategoryCreation() {
  console.log('🧪 Testing Grading Category Creation\n');
  console.log(`Section: AP Biology (ID: ${TEST_SECTION_ID})`);
  console.log(`Impersonating: Super Teacher (ID: ${SUPER_TEACHER_ID})\n`);
  
  // First, check existing categories
  console.log('📋 Checking existing categories...');
  try {
    const existing = await schoologyRequest('GET', `/sections/${TEST_SECTION_ID}/grading_categories`, null, SUPER_TEACHER_ID);
    console.log(`Found ${existing.grading_category?.length || 0} existing categories`);
    if (existing.grading_category) {
      existing.grading_category.forEach(cat => {
        console.log(`   - ${cat.title}: ${cat.weight}%`);
      });
    }
  } catch (error) {
    console.log(`Error checking categories: ${error.message}`);
  }
  
  // Try to create a test category
  console.log('\n🚀 Attempting to create test category...');
  
  const testCategory = {
    title: 'Test Category',
    weight: 10,
    calculation_type: 2,
  };
  
  try {
    const result = await schoologyRequest(
      'POST',
      `/sections/${TEST_SECTION_ID}/grading_categories`,
      testCategory,
      SUPER_TEACHER_ID
    );
    console.log('\n✅ SUCCESS! Category created:', result);
  } catch (error) {
    console.log('\n❌ FAILED:', error.message);
  }
}

testCategoryCreation();