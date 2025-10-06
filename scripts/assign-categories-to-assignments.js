#!/usr/bin/env node

/**
 * Assign grading categories to existing assignments
 * 
 * This script:
 * 1. Fetches all assignments for each section
 * 2. Matches them to seed data to find their intended category
 * 3. Updates each assignment with the correct grading_category_id
 */

const fs = require('fs');
const path = require('path');
const OAuth = require('oauth-1.0a');
const crypto = require('crypto');

if (fs.existsSync('.env.local')) {
  require('dotenv').config({ path: '.env.local' });
}

const SEED_DATA_PATH = path.join(__dirname, '..', 'seed', 'sandbox', 'seed-data-master.json');
const seedData = JSON.parse(fs.readFileSync(SEED_DATA_PATH, 'utf8'));

const ASSIGNMENTS_CSV_PATH = path.join(__dirname, '..', 'seed', 'sandbox', 'csv-exports', 'assignments.csv');
const assignmentsCSV = fs.readFileSync(ASSIGNMENTS_CSV_PATH, 'utf8');

const SCHOOLOGY_BASE_URL = 'https://api.schoology.com/v1';
const ADMIN_KEY = process.env.SCHOOLOGY_ADMIN_KEY;
const ADMIN_SECRET = process.env.SCHOOLOGY_ADMIN_SECRET;
const SUPER_TEACHER_ID = 140836120;

if (!ADMIN_KEY || !ADMIN_SECRET) {
  console.error('❌ Missing admin credentials');
  process.exit(1);
}

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
    throw new Error(`API error (${response.status}): ${errorText.substring(0, 200)}`);
  }

  const text = await response.text();
  if (!text || text.trim() === '') {
    return { success: true };
  }
  
  return JSON.parse(text);
}

// Parse CSV to get assignment → category mapping
function parseAssignmentsCSV() {
  const lines = assignmentsCSV.trim().split('\n');
  const headers = lines[0].split(',');
  const assignments = [];
  
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',');
    const assignment = {};
    headers.forEach((header, idx) => {
      assignment[header] = values[idx];
    });
    assignments.push(assignment);
  }
  
  return assignments;
}

async function assignCategoriesToAssignments() {
  console.log('🔗 Assigning Categories to Assignments\n');
  console.log('='.repeat(60) + '\n');
  
  let totalUpdated = 0;
  let totalFailed = 0;
  let totalSkipped = 0;
  
  // Get section mappings
  const sectionsData = await schoologyRequest('GET', `/users/${SUPER_TEACHER_ID}/sections`);
  const sections = Array.isArray(sectionsData.section) ? sectionsData.section : [sectionsData.section];
  
  const sectionMap = new Map();
  sections.forEach(s => {
    sectionMap.set(s.section_school_code, s.id);
  });
  
  // Parse CSV to get category assignments
  const csvAssignments = parseAssignmentsCSV();
  
  // Process each section
  for (const [sectionCode, sectionId] of sectionMap) {
    const sectionAssignments = csvAssignments.filter(a => a.section_school_code === sectionCode);
    if (sectionAssignments.length === 0) continue;
    
    console.log(`📝 ${sectionCode}`);
    
    try {
      // Get existing categories for this section
      const categoriesData = await schoologyRequest(
        'GET',
        `/sections/${sectionId}/grading_categories`,
        null,
        SUPER_TEACHER_ID
      );
      
      const categories = categoriesData.grading_category || [];
      const categoryMap = new Map();
      categories.forEach(cat => {
        categoryMap.set(cat.title, cat.id);
      });
      
      // Get existing assignments
      const assignmentsData = await schoologyRequest(
        'GET',
        `/sections/${sectionId}/assignments?limit=200`,
        null,
        SUPER_TEACHER_ID
      );
      
      const existingAssignments = assignmentsData.assignment || [];
      
      // Update each assignment with its category
      for (const csvAssignment of sectionAssignments) {
        const categoryName = csvAssignment.description; // CSV uses description field for category
        const categoryId = categoryMap.get(categoryName);
        
        if (!categoryId) {
          console.log(`   ⚠️  ${csvAssignment.title}: Category "${categoryName}" not found`);
          totalSkipped++;
          continue;
        }
        
        // Find the assignment in Schoology by title
        const schoologyAssignment = existingAssignments.find(a => a.title === csvAssignment.title);
        if (!schoologyAssignment) {
          console.log(`   ⚠️  ${csvAssignment.title}: Assignment not found in Schoology`);
          totalSkipped++;
          continue;
        }
        
        // Check if already assigned
        if (schoologyAssignment.grading_category_id == categoryId) {
          totalSkipped++;
          continue; // Already correct
        }
        
        // Update the assignment
        try {
          const updateData = {
            title: schoologyAssignment.title,
            grading_category_id: categoryId,
          };
          
          await schoologyRequest(
            'PUT',
            `/sections/${sectionId}/assignments/${schoologyAssignment.id}`,
            updateData,
            SUPER_TEACHER_ID
          );
          
          console.log(`   ✅ ${csvAssignment.title} → ${categoryName}`);
          totalUpdated++;
          
          await new Promise(resolve => setTimeout(resolve, 100));
          
        } catch (error) {
          console.log(`   ❌ ${csvAssignment.title}: ${error.message}`);
          totalFailed++;
        }
      }
      
      console.log();
      
    } catch (error) {
      console.log(`   ❌ Failed to process section: ${error.message}\n`);
      totalFailed += sectionAssignments.length;
    }
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('📊 Assignment Category Assignment Complete\n');
  console.log(`   ✅ Updated: ${totalUpdated}`);
  console.log(`   ⏭️  Skipped: ${totalSkipped}`);
  console.log(`   ❌ Failed: ${totalFailed}`);
  console.log('='.repeat(60));
}

assignCategoriesToAssignments();
