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
  
  const text = await response.text();
  return text ? JSON.parse(text) : { success: true };
}

async function main() {
  const sectionId = 8067479367;
  const categoryId = 90423862; // "Full AP Labs"
  
  console.log('\n🧪 Testing category weight update...\n');
  console.log('Category: Full AP Labs');
  console.log('Target: calculation_type=1, weight=26.65\n');
  
  try {
    const result = await schoologyRequest(
      'PUT',
      `/sections/${sectionId}/grading_categories/${categoryId}`,
      {
        calculation_type: 1,  // Weighted
        weight: 26.65
      },
      SUPER_TEACHER_ID
    );
    
    console.log('✅ UPDATE successful\n');
    
    // Verify
    const cats = await schoologyRequest('GET', `/sections/${sectionId}/grading_categories`, null, SUPER_TEACHER_ID);
    const updated = cats.grading_category.find(c => c.id === categoryId);
    
    console.log('Verification:');
    console.log(`   calculation_type: ${updated.calculation_type}`);
    console.log(`   weight: ${updated.weight}`);
    
  } catch (error) {
    console.log('❌ Failed:', error.message);
  }
}

main().catch(console.error);
