const path = require('path');
const { config } = require('dotenv');
const OAuth = require('oauth-1.0a');
const crypto = require('crypto');

config({ path: path.resolve(__dirname, '..', '.env.local') });

const SCHOOLOGY_API_URL = 'https://api.schoology.com/v1';

async function makeSchoologyRequest(url, targetUserId) {
  const consumerKey = process.env.SCHOOLOGY_ADMIN_KEY || '';
  const consumerSecret = process.env.SCHOOLOGY_ADMIN_SECRET || '';
  if (!consumerKey || !consumerSecret) throw new Error('Admin credentials not configured.');

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
    'X-Schoology-Run-As': String(targetUserId),
  };

  const response = await fetch(url, { headers });
  if (!response.ok) throw new Error(`API Error: ${response.status}`);
  return response.json();
}

async function checkUserCourses(userId) {
  console.log(`\n🔍 Checking courses for user: ${userId}\n`);
  
  const sectionsResponse = await makeSchoologyRequest(`${SCHOOLOGY_API_URL}/users/${userId}/sections`, userId);
  const sections = sectionsResponse.section || [];
  
  console.log(`Found ${sections.length} sections\n`);
  
  if (sections.length > 0) {
    sections.forEach(s => {
      console.log(`  - ${s.course_title} (${s.section_school_code})`);
    });
  } else {
    console.log('  No courses found.');
  }
}

// Check both Ryan Mock and Christina Mock
async function main() {
  await checkUserCourses('140834635'); // Ryan Mock
  await checkUserCourses('140834634'); // Christina Mock
}

main();
