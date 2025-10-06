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
  if (!response.ok) throw new Error(`API Error: ${response.status}`);
  return response.json();
}

async function main() {
  console.log('\n🔍 Checking Assignment Categories\n');
  
  const sectionId = '8067479373'; // US Government
  const data = await makeSchoologyRequest(`${SCHOOLOGY_API_URL}/sections/${sectionId}/assignments?limit=10`);
  const assignments = data.assignment || [];
  
  console.log(`Found ${assignments.length} assignments:\n`);
  
  assignments.slice(0, 5).forEach(a => {
    console.log(`  ${a.title}`);
    console.log(`    ID: ${a.id}`);
    console.log(`    Category ID: ${a.grading_category_id || 'NOT SET'}`);
    console.log();
  });
}

main();
