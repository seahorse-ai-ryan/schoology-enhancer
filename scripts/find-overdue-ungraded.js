const path = require('path');
const { config } = require('dotenv');
const OAuth = require('oauth-1.0a');
const crypto = require('crypto');

config({ path: path.resolve(__dirname, '..', '.env.local') });

const SCHOOLOGY_API_URL = 'https://api.schoology.com/v1';
const STUDENTS = {
  'Carter': '140834636',
  'Tazio': '140834637',
  'Livio': '140834638',
  'Lily': '140834639',
};

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

async function findOverdueUngraded(studentName, studentId) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`🔍 ${studentName} - Overdue & Ungraded Assignments`);
  console.log('='.repeat(60) + '\n');
  
  const sectionsResponse = await makeSchoologyRequest(
    `${SCHOOLOGY_API_URL}/users/${studentId}/sections`,
    studentId
  );
  const sections = sectionsResponse.section || [];
  
  const now = new Date();
  const overdueUngraded = [];
  
  for (const section of sections) {
    const [assignmentsRes, gradesRes] = await Promise.all([
      makeSchoologyRequest(`${SCHOOLOGY_API_URL}/sections/${section.id}/assignments?limit=100`, studentId),
      makeSchoologyRequest(`${SCHOOLOGY_API_URL}/sections/${section.id}/grades`, studentId)
    ]);
    
    const assignments = assignmentsRes.assignment || [];
    const grades = gradesRes?.grades?.grade || [];
    
    const gradeMap = new Map();
    grades.forEach(g => gradeMap.set(g.assignment_id, g));
    
    assignments.forEach(a => {
      const dueDate = new Date(a.due);
      const hasGrade = gradeMap.has(a.id);
      
      if (dueDate < now && !hasGrade) {
        const daysOverdue = Math.floor((now - dueDate) / (1000 * 60 * 60 * 24));
        overdueUngraded.push({
          course: section.course_title,
          title: a.title,
          due: a.due,
          daysOverdue,
          assignmentId: a.id,
          sectionId: section.id,
        });
      }
    });
  }
  
  overdueUngraded.sort((a, b) => b.daysOverdue - a.daysOverdue);
  
  console.log(`Found ${overdueUngraded.length} overdue & ungraded assignments:\n`);
  
  overdueUngraded.forEach(a => {
    console.log(`  📌 ${a.course}: ${a.title}`);
    console.log(`     Due: ${a.due} (${a.daysOverdue} days overdue)`);
    console.log(`     Assignment ID: ${a.assignmentId}, Section ID: ${a.sectionId}`);
    console.log();
  });
}

async function main() {
  for (const [name, id] of Object.entries(STUDENTS)) {
    await findOverdueUngraded(name, id);
  }
}

main();
