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
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API Error (${response.status}): ${errorText.substring(0, 100)}`);
  }
  return response.json();
}

async function checkCategories(targetUserId) {
  try {
    const sectionsResponse = await makeSchoologyRequest(`${SCHOOLOGY_API_URL}/users/${targetUserId}/sections`, targetUserId);
    const sections = sectionsResponse.section || [];
    
    console.log(`\n=== Checking Grading Categories for User ${targetUserId} ===\n`);

    for (const section of sections) {
      console.log(`\n--- ${section.course_title} (Section ID: ${section.id}) ---`);
      
      try {
        const categoriesResponse = await makeSchoologyRequest(
          `${SCHOOLOGY_API_URL}/sections/${section.id}/grading_categories`,
          targetUserId
        );
        
        const categories = categoriesResponse.grading_category || [];
        console.log(`  Categories: ${categories.length}`);
        
        if (categories.length > 0) {
          categories.forEach(cat => {
            console.log(`    - ${cat.title || cat.category_title}: ${cat.weight}% (ID: ${cat.id})`);
          });
        }
        
      } catch (error) {
        console.log(`  Error: ${error.message}`);
      }
    }

  } catch (error) {
    console.error('\n[ERROR]', error.message);
  }
}

const targetUserId = process.argv[2] || '140834636';
checkCategories(targetUserId);

