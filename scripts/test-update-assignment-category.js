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
  console.log('\n🧪 Testing assignment category assignment\n');
  
  const sectionId = 8067479367;
  const assignmentId = 8067667927; // "Enzyme Activity Lab"
  const categoryId = 90423862; // "Full AP Labs"
  
  console.log('Assignment:', assignmentId);
  console.log('Category:', categoryId, '(Full AP Labs)');
  console.log();
  
  // Try updating the assignment with category
  console.log('📤 Attempting to update assignment with category...\n');
  
  try {
    const result = await schoologyRequest(
      'PUT',
      `/sections/${sectionId}/assignments/${assignmentId}`,
      {
        grading_category: categoryId  // Try without _id suffix
      },
      SUPER_TEACHER_ID
    );
    
    console.log('✅ SUCCESS with "grading_category":', categoryId);
    console.log(JSON.stringify(result, null, 2));
  } catch (error) {
    console.log('❌ Failed with "grading_category":', error.message);
    
    // Try alternate field name
    try {
      const result = await schoologyRequest(
        'PUT',
        `/sections/${sectionId}/assignments/${assignmentId}`,
        {
          category_id: categoryId  // Try category_id
        },
        SUPER_TEACHER_ID
      );
      
      console.log('\n✅ SUCCESS with "category_id":', categoryId);
      console.log(JSON.stringify(result, null, 2));
    } catch (error2) {
      console.log('❌ Failed with "category_id":', error2.message);
    }
  }
}

main().catch(console.error);
