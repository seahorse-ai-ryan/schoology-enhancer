const path = require('path');
const { config } = require('dotenv');
const OAuth = require('oauth-1.0a');
const crypto = require('crypto');

config({ path: path.resolve(__dirname, '..', '.env.local') });

const SCHOOLOGY_API_URL = 'https://api.schoology.com/v1';

async function makeSchoologyRequest(url, targetUserId) {
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
    'X-Schoology-Run-As': String(targetUserId),
  };

  const response = await fetch(url, { headers });
  if (!response.ok) throw new Error(`API Error: ${response.status}`);
  return response.json();
}

async function checkAssignmentTypes(studentId) {
  console.log('\n🔍 Checking Assignment Types and Categories\n');
  
  const sectionsResponse = await makeSchoologyRequest(`${SCHOOLOGY_API_URL}/users/${studentId}/sections`, studentId);
  const sections = sectionsResponse.section || [];
  
  const allTypes = new Set();
  const allAssignmentTypes = new Set();
  const allCategoryNames = new Set();
  let totalAssignments = 0;
  
  for (const section of sections.slice(0, 3)) { // Check first 3 sections
    const assignmentsResponse = await makeSchoologyRequest(
      `${SCHOOLOGY_API_URL}/sections/${section.id}/assignments?limit=50`,
      studentId
    );
    const assignments = assignmentsResponse.assignment || [];
    
    const categoriesResponse = await makeSchoologyRequest(
      `${SCHOOLOGY_API_URL}/sections/${section.id}/grading_categories`,
      studentId
    ).catch(() => ({ grading_category: [] }));
    
    const categories = categoriesResponse.grading_category || [];
    const categoryMap = new Map();
    categories.forEach(c => categoryMap.set(c.id, c.title));
    
    console.log(`\n📚 ${section.course_title} (${assignments.length} assignments)`);
    
    assignments.forEach(a => {
      if (a.type) allTypes.add(a.type);
      if (a.assignment_type) allAssignmentTypes.add(a.assignment_type);
      
      const catId = a.grading_category || a.grading_category_id;
      if (catId && categoryMap.has(parseInt(catId))) {
        allCategoryNames.add(categoryMap.get(parseInt(catId)));
      }
      
      totalAssignments++;
    });
    
    // Show sample
    if (assignments.length > 0) {
      const sample = assignments[0];
      console.log(`  Sample assignment:`);
      console.log(`    Title: ${sample.title}`);
      console.log(`    Type: ${sample.type}`);
      console.log(`    Assignment Type: ${sample.assignment_type}`);
      console.log(`    Category ID: ${sample.grading_category || sample.grading_category_id || 'none'}`);
      if (sample.grading_category) {
        const catName = categoryMap.get(parseInt(sample.grading_category));
        console.log(`    Category Name: ${catName || 'unknown'}`);
      }
    }
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('📊 Summary:\n');
  console.log(`Total assignments checked: ${totalAssignments}`);
  console.log(`\nUnique 'type' values: ${allTypes.size}`);
  [...allTypes].forEach(t => console.log(`  - ${t}`));
  console.log(`\nUnique 'assignment_type' values: ${allAssignmentTypes.size}`);
  [...allAssignmentTypes].forEach(t => console.log(`  - ${t}`));
  console.log(`\nUnique category names found: ${allCategoryNames.size}`);
  [...allCategoryNames].forEach(t => console.log(`  - ${t}`));
  console.log('='.repeat(60) + '\n');
}

checkAssignmentTypes('140834636'); // Carter

