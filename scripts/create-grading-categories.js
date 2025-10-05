#!/usr/bin/env node

/**
 * Create grading categories for courses in Schoology
 * Based on real data from temp-real-seed-grades.json
 */

const fs = require('fs');
const path = require('path');
const OAuth = require('oauth-1.0a');
const crypto = require('crypto');

// Load environment variables
if (require('fs').existsSync('.env.local')) {
  const dotenv = require('dotenv');
  dotenv.config({ path: '.env.local' });
}

// Load real grade data
const REAL_DATA_PATH = path.join(__dirname, '..', 'seed', 'sandbox', 'temp-real-seed-grades.json');
const realData = JSON.parse(fs.readFileSync(REAL_DATA_PATH, 'utf8'));

// Schoology API configuration
const SCHOOLOGY_BASE_URL = 'https://api.schoology.com/v1';
const ADMIN_KEY = process.env.SCHOOLOGY_ADMIN_KEY;
const ADMIN_SECRET = process.env.SCHOOLOGY_ADMIN_SECRET;
const SUPER_TEACHER_ID = 140836120;

if (!ADMIN_KEY || !ADMIN_SECRET) {
  console.error('❌ Error: SCHOOLOGY_ADMIN_KEY and SCHOOLOGY_ADMIN_SECRET must be set');
  process.exit(1);
}

// OAuth setup
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
    throw new Error(`Schoology API error (${response.status}): ${errorText}`);
  }

  return response.json();
}

// Map course names to section IDs
const SECTION_MAPPING = {
  'AP Biology-3120': 8067479367,
  'AP English Lit-1410': 8067479369,
  'AP Statistics-2460': 8067479371,
};

async function createCategoriesForSection(sectionId, sectionName, categories) {
  console.log(`\n📚 ${sectionName}`);
  console.log(`   Section ID: ${sectionId}\n`);
  
  const categoryMapping = {};
  let created = 0;
  let skipped = 0;
  
  for (const category of categories) {
    try {
      // Parse weight percentage
      const weight = category.weight ? parseFloat(category.weight.replace('%', '')) : 0;
      
      const categoryData = {
        title: category.category_name,
        percentage: weight,
        calculation_type: 1, // Weighted by points
      };
      
      console.log(`   Creating: ${category.category_name} (${weight}%)`);
      
      const result = await schoologyRequest(
        'POST',
        `/sections/${sectionId}/grading_categories`,
        categoryData,
        SUPER_TEACHER_ID
      );
      
      categoryMapping[category.category_name] = result.id;
      console.log(`   ✅ Created (ID: ${result.id})`);
      created++;
      
      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 200));
      
    } catch (error) {
      if (error.message.includes('409')) {
        console.log(`   ⚠️  Already exists: ${category.category_name}`);
        skipped++;
      } else {
        console.log(`   ❌ Failed: ${error.message}`);
      }
    }
  }
  
  console.log(`\n   Summary: ${created} created, ${skipped} skipped\n`);
  return categoryMapping;
}

async function main() {
  console.log('🎯 Creating Grading Categories from Real Data\n');
  
  // Extract categories by course
  const courseCategories = new Map();
  
  realData.forEach(student => {
    student.courses.forEach(course => {
      const courseName = course.course_name;
      
      // Extract course code (e.g., "AP Biology-3120")
      const match = courseName.match(/^(.*?):/);
      if (match) {
        const courseCode = match[1].trim();
        
        if (!courseCategories.has(courseCode)) {
          courseCategories.set(courseCode, course.categories);
        }
      }
    });
  });
  
  console.log(`Found ${courseCategories.size} courses with categories\n`);
  console.log('=' .repeat(60));
  
  // Create categories for mapped sections
  const allMappings = {};
  
  for (const [courseCode, sectionId] of Object.entries(SECTION_MAPPING)) {
    const categories = courseCategories.get(courseCode);
    
    if (!categories) {
      console.log(`\n⚠️  No categories found for ${courseCode}`);
      continue;
    }
    
    const mapping = await createCategoriesForSection(sectionId, courseCode, categories);
    allMappings[courseCode] = mapping;
  }
  
  // Save mappings to file
  const OUTPUT_PATH = path.join(__dirname, '..', 'seed', 'sandbox', 'category-mappings.json');
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(allMappings, null, 2));
  
  console.log('=' .repeat(60));
  console.log('\n✅ Category mappings saved to:', OUTPUT_PATH);
  console.log('\n🎉 Grading categories setup complete!\n');
}

if (require.main === module) {
  main().catch(error => {
    console.error('\n❌ Fatal error:', error.message);
    process.exit(1);
  });
}

module.exports = { createCategoriesForSection };

