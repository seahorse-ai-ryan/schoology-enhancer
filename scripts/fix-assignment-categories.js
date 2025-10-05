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
  
  // Handle empty responses
  const text = await response.text();
  return text ? JSON.parse(text) : { success: true };
}

async function main() {
  console.log('\n🔧 Fixing assignment category assignments...\n');
  
  const sectionId = 8067479367;
  
  // Assignment ID -> Category ID mapping
  const fixes = [
    { id: 8067667927, title: 'Enzyme Activity Lab', categoryId: 90423862, categoryName: 'Full AP Labs' },
    { id: 8067667929, title: 'DNA Structure Homework', categoryId: 90423863, categoryName: 'Homework Assignments' },
  ];
  
  for (const fix of fixes) {
    console.log(`📝 ${fix.title}`);
    console.log(`   Category: ${fix.categoryName} (ID: ${fix.categoryId})`);
    
    try {
      await schoologyRequest(
        'PUT',
        `/sections/${sectionId}/assignments/${fix.id}`,
        { grading_category: fix.categoryId },
        SUPER_TEACHER_ID
      );
      
      console.log(`   ✅ Updated\n`);
    } catch (error) {
      console.log(`   ❌ Failed: ${error.message}\n`);
    }
  }
  
  console.log('✅ All assignments updated!\n');
  console.log('📊 Please refresh Schoology grades page and check:\n');
  console.log('   1. "Enzyme Activity Lab" should show under "Full AP Labs"');
  console.log('   2. "DNA Structure Homework" should show under "Homework Assignments"');
  console.log('   3. Grades should be visible (95/100 and 48/50)\n');
}

main().catch(console.error);
