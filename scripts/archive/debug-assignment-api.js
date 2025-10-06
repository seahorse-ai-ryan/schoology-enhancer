const path = require('path');
const { config } = require('dotenv');
const OAuth = require('oauth-1.0a');
const crypto = require('crypto');

config({ path: path.resolve(__dirname, '..', '.env.local') });

const SCHOOLOGY_API_URL = 'https://api.schoology.com/v1';
const SUPER_TEACHER_ID = 140836120;

async function makeSchoologyRequest(url) {
  const consumerKey = process.env.SCHOOLOGY_ADMIN_KEY || '';
  const consumerSecret = process.env.SCHOOLOGY_ADMIN_SECRET || '';

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
    'X-Schoology-Run-As': String(SUPER_TEACHER_ID),
  };

  const response = await fetch(url, { headers });
  const text = await response.text();
  
  if (!response.ok) throw new Error(`API Error: ${response.status} - ${text}`);
  return JSON.parse(text);
}

async function debugAssignmentAPI() {
  console.log('\n🔍 Debugging Assignment API Calls\n');
  
  // Test Academic Planning course (shows categories in your screenshot)
  const sectionId = '8067479389'; // ACAD-PLAN-8308
  
  console.log(`Testing section: ${sectionId} (Academic Planning)\n`);
  
  // 1. Get assignments
  console.log('1️⃣ Fetching assignments...');
  const assignmentsData = await makeSchoologyRequest(`${SCHOOLOGY_API_URL}/sections/${sectionId}/assignments`);
  const assignments = assignmentsData.assignment || [];
  console.log(`   Found ${assignments.length} assignments\n`);
  
  // Show first assignment in detail
  if (assignments.length > 0) {
    console.log('📝 First Assignment (Full Object):');
    console.log(JSON.stringify(assignments[0], null, 2));
    console.log('\n');
  }
  
  // 2. Get categories
  console.log('2️⃣ Fetching grading categories...');
  const categoriesData = await makeSchoologyRequest(`${SCHOOLOGY_API_URL}/sections/${sectionId}/grading_categories`);
  const categories = categoriesData.grading_category || [];
  console.log(`   Found ${categories.length} categories\n`);
  
  categories.forEach(cat => {
    console.log(`   ${cat.title} (ID: ${cat.id}, Weight: ${cat.weight}%)`);
  });
  
  console.log('\n');
  
  // 3. Check which assignments have category IDs
  console.log('3️⃣ Assignment Category Status:\n');
  assignments.forEach(a => {
    const hasCategory = a.grading_category_id && a.grading_category_id !== '0' && a.grading_category_id !== 0;
    const categoryName = hasCategory ? (categories.find(c => c.id == a.grading_category_id)?.title || 'Unknown') : 'NOT SET';
    console.log(`   ${hasCategory ? '✅' : '❌'} ${a.title}`);
    console.log(`      Category ID: ${a.grading_category_id || 'null'}`);
    console.log(`      Category Name: ${categoryName}`);
    console.log();
  });
}

debugAssignmentAPI();
