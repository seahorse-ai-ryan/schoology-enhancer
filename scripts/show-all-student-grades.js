#!/usr/bin/env node

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
    throw new Error(`API Error: ${response.status}`);
  }
  return response.json();
}

async function showGrades(studentName, targetUserId) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`📊 ${studentName} (ID: ${targetUserId})`);
  console.log('='.repeat(60) + '\n');
  
  const sectionsResponse = await makeSchoologyRequest(`${SCHOOLOGY_API_URL}/users/${targetUserId}/sections`, targetUserId);
  const sections = sectionsResponse.section || [];
  
  const grades = [];
  
  for (const section of sections) {
    try {
      const gradeData = await makeSchoologyRequest(`${SCHOOLOGY_API_URL}/sections/${section.id}/grades`, targetUserId);
      const finalGradeEntry = gradeData?.final_grade?.[0];
      const periodGrade = finalGradeEntry?.period?.[0]?.grade;

      grades.push({
        course: section.course_title,
        grade: periodGrade !== null && periodGrade !== undefined ? `${Math.round(periodGrade)}%` : 'No Grade',
      });
    } catch (error) {
      grades.push({
        course: section.course_title,
        grade: 'Error',
      });
    }
  }
  
  // Sort by grade (highest first), then by course name
  grades.sort((a, b) => {
    if (a.grade === 'No Grade') return 1;
    if (b.grade === 'No Grade') return -1;
    if (a.grade === 'Error') return 1;
    if (b.grade === 'Error') return -1;
    const aNum = parseInt(a.grade);
    const bNum = parseInt(b.grade);
    if (aNum !== bNum) return bNum - aNum;
    return a.course.localeCompare(b.course);
  });
  
  grades.forEach(g => {
    const gradeDisplay = g.grade.padStart(10);
    console.log(`  ${gradeDisplay}  ${g.course}`);
  });
}

async function main() {
  console.log('\n🎓 Student Grade Report\n');
  
  const students = [
    { name: 'Carter Mock (12th)', id: '140834636' },
    { name: 'Tazio Mock (11th)', id: '140834637' },
    { name: 'Livio Mock (8th)', id: '140834638' },
    { name: 'Lily Mock (8th)', id: '140834639' },
  ];
  
  for (const student of students) {
    await showGrades(student.name, student.id);
  }
  
  console.log('\n' + '='.repeat(60) + '\n');
}

main();
