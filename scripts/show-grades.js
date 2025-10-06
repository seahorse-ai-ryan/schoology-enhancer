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
    throw new Error(`Schoology API Error for ${url}: ${response.status} ${errorText}`);
  }
  return response.json();
}

async function showGradesForUser(targetUserId) {
  try {
    console.log(`[show-grades] Fetching final grades for user: ${targetUserId}`);
    const sectionsResponse = await makeSchoologyRequest(`${SCHOOLOGY_API_URL}/users/${targetUserId}/sections`, targetUserId);
    const sections = sectionsResponse.section || [];
    const gradesMap = {};

    for (const section of sections) {
      try {
        const gradeData = await makeSchoologyRequest(`${SCHOOLOGY_API_URL}/sections/${section.id}/grades`, targetUserId);
        const finalGradeEntry = gradeData?.final_grade?.[0];
        const periodGrade = finalGradeEntry?.period?.[0]?.grade;

        if (periodGrade !== null && periodGrade !== undefined) {
          gradesMap[section.course_title] = `${Math.round(periodGrade)}%`;
        } else {
          gradesMap[section.course_title] = 'No Grade';
        }
      } catch (error) {
        gradesMap[section.course_title] = 'Error Fetching';
      }
    }

    console.log('\n--- Final Course Grades for carter_mock ---');
    console.log(JSON.stringify(gradesMap, null, 2));
    console.log('-------------------------------------------\n');
  } catch (error) {
    console.error('\n[ERROR] Failed to fetch grades:', error.message);
  }
}

showGradesForUser('140834636');
