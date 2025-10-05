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
  
  console.log('\n📊 Grading Categories - Full Details\n');
  
  const cats = await schoologyRequest('GET', `/sections/${sectionId}/grading_categories`, null, SUPER_TEACHER_ID);
  
  if (cats.grading_category) {
    const categories = Array.isArray(cats.grading_category) ? cats.grading_category : [cats.grading_category];
    
    for (const cat of categories) {
      console.log(`${cat.title}`);
      console.log(`   ID: ${cat.id}`);
      console.log(`   Weight: ${cat.weight}`);
      console.log(`   Calculation Type: ${cat.calculation_type}`);
      console.log();
    }
  }
  
  console.log('Full JSON:');
  console.log(JSON.stringify(cats, null, 2));
}

main().catch(console.error);
