#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const OAuth = require('oauth-1.0a');
const crypto = require('crypto');

if (fs.existsSync('.env.local')) {
  require('dotenv').config({ path: '.env.local' });
}

const SEED_DATA_PATH = path.join(__dirname, '..', 'seed', 'sandbox', 'seed-data-master.json');
const seedData = JSON.parse(fs.readFileSync(SEED_DATA_PATH, 'utf8'));

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

  // Handle empty responses (common for PUT/DELETE)
  const text = await response.text();
  if (!text || text.trim() === '') {
    return { success: true };
  }
  
  return JSON.parse(text);
}

async function updateCategoryWeights() {
  console.log('⚖️  Updating Grading Category Weights\n');
  console.log('=' .repeat(60) + '\n');
  
  let totalUpdated = 0;
  let totalFailed = 0;
  
  // Get Super Teacher's sections
  const sectionsData = await schoologyRequest('GET', `/users/${SUPER_TEACHER_ID}/sections`);
  const sections = Array.isArray(sectionsData.section) ? sectionsData.section : [sectionsData.section];
  
  // Build section mapping
  const sectionMap = new Map();
  sections.forEach(s => {
    sectionMap.set(s.section_school_code, s.id);
  });
  
  // Process each course from seed data
  for (const course of seedData.courses) {
    if (!course.grading_categories || Object.keys(course.grading_categories).length === 0) {
      continue;
    }
    
    const sectionId = sectionMap.get(course.section_school_code);
    if (!sectionId) {
      console.log(`⚠️  ${course.section_school_code}: Section not found in Schoology\n`);
      continue;
    }
    
    console.log(`📝 ${course.title} (${course.section_school_code})`);
    
    try {
      // Get existing categories
      const categoriesData = await schoologyRequest(
        'GET',
        `/sections/${sectionId}/grading_categories`,
        null,
        SUPER_TEACHER_ID
      );
      
      const existingCategories = categoriesData.grading_category || [];
      console.log(`   Found ${existingCategories.length} existing categories`);
      
      // Update each category's weight
      for (const [categoryName, targetWeight] of Object.entries(course.grading_categories)) {
        const existingCat = existingCategories.find(c => c.title === categoryName);
        
        if (!existingCat) {
          console.log(`   ⚠️  Category not found: ${categoryName}`);
          totalFailed++;
          continue;
        }
        
        // Update the weight
        try {
          const updateData = {
            title: existingCat.title,
            weight: targetWeight,
            calculation_type: existingCat.calculation_type || 2,
          };
          
          await schoologyRequest(
            'PUT',
            `/sections/${sectionId}/grading_categories/${existingCat.id}`,
            updateData,
            SUPER_TEACHER_ID
          );
          
          console.log(`   ✅ ${categoryName}: ${existingCat.weight}% → ${targetWeight}%`);
          totalUpdated++;
          
          await new Promise(resolve => setTimeout(resolve, 100));
          
        } catch (error) {
          console.log(`   ❌ ${categoryName}: ${error.message}`);
          totalFailed++;
        }
      }
      
      console.log();
      
    } catch (error) {
      console.log(`   ❌ Failed to process section: ${error.message}\n`);
      totalFailed++;
    }
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('📊 Update Complete\n');
  console.log(`   ✅ Updated: ${totalUpdated}`);
  console.log(`   ❌ Failed: ${totalFailed}`);
  console.log('='.repeat(60));
}

updateCategoryWeights();
