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
    console.error(`API Error: ${response.status}`, errorText.substring(0, 200));
    throw new Error(`API request failed: ${response.status}`);
  }
  return response.json();
}

async function checkAssignmentsAndGrades(targetUserId) {
  try {
    console.log(`\n=== Checking Assignments & Grades for User: ${targetUserId} ===\n`);
    
    const sectionsResponse = await makeSchoologyRequest(`${SCHOOLOGY_API_URL}/users/${targetUserId}/sections`, targetUserId);
    const sections = sectionsResponse.section || [];
    
    console.log(`Found ${sections.length} enrolled sections.\n`);

    for (const section of sections) {
      console.log(`\n--- ${section.course_title} (Section ID: ${section.id}) ---`);
      
      try {
        // Get assignments for this section
        const assignmentsResponse = await makeSchoologyRequest(
          `${SCHOOLOGY_API_URL}/sections/${section.id}/assignments?limit=200`,
          targetUserId
        );
        const assignments = assignmentsResponse.assignment || [];
        
        console.log(`  Total Assignments: ${assignments.length}`);
        
        // Get grades for this section
        const gradeData = await makeSchoologyRequest(
          `${SCHOOLOGY_API_URL}/sections/${section.id}/grades`,
          targetUserId
        );
        
        const individualGrades = gradeData?.grades?.grade || [];
        const finalGradeEntry = gradeData?.final_grade?.[0];
        const periodGrade = finalGradeEntry?.period?.[0]?.grade;
        
        console.log(`  Individual Assignment Grades: ${individualGrades.length}`);
        console.log(`  Final Course Grade: ${periodGrade !== null && periodGrade !== undefined ? Math.round(periodGrade) + '%' : 'No Grade'}`);
        
        if (individualGrades.length > 0) {
          console.log(`  Sample graded assignments:`);
          individualGrades.slice(0, 3).forEach(g => {
            console.log(`    - Assignment ${g.assignment_id}: ${g.grade}/${g.max_points}`);
          });
        }
        
      } catch (error) {
        console.error(`  Error fetching data: ${error.message}`);
      }
    }
    
    console.log('\n=== Check Complete ===\n');

  } catch (error) {
    console.error('\n[ERROR]', error.message);
  }
}

const targetUserId = process.argv[2] || '140834636'; // Default to carter_mock
checkAssignmentsAndGrades(targetUserId);

