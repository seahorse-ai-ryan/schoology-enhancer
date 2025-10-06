#!/usr/bin/env node

/**
 * Test script to fetch grades for a specific section
 * Find sections that carter_mock is enrolled in and fetch their grades
 */

const OAuth = require('oauth-1.0a');
const crypto = require('crypto');

// Load environment variables
if (require('fs').existsSync('.env.local')) {
  const dotenv = require('dotenv');
  dotenv.config({ path: '.env.local' });
}

const SCHOOLOGY_API_URL = 'https://api.schoology.com/v1';
const SUPER_TEACHER_ID = 140836120; // From previous seed runs - teacher who owns all sections

async function testSectionGrades() {
  console.log('\n' + '='.repeat(80));
  console.log('🧪 Testing Section Grades for Carter Mock');
  console.log('='.repeat(80) + '\n');

  try {
    // Setup OAuth with admin credentials
    const consumerKey = process.env.SCHOOLOGY_ADMIN_KEY || '';
    const consumerSecret = process.env.SCHOOLOGY_ADMIN_SECRET || '';

    if (!consumerKey || !consumerSecret) {
      throw new Error('SCHOOLOGY_ADMIN_KEY and SCHOOLOGY_ADMIN_SECRET must be set');
    }

    const oauth = new OAuth({
      consumer: { key: consumerKey, secret: consumerSecret },
      signature_method: 'HMAC-SHA1',
      hash_function(base_string, key) {
        return crypto.createHmac('sha1', key).update(base_string).digest('base64');
      },
    });

    // Helper to make authenticated requests
    const schoologyFetch = async (endpoint) => {
      const url = `${SCHOOLOGY_API_URL}${endpoint}`;
      const requestData = { url, method: 'GET' };
      const authHeader = oauth.toHeader(oauth.authorize(requestData));
      
      const headers = {
        ...authHeader,
        'Accept': 'application/json'
      };

      const response = await fetch(url, { headers });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API error ${response.status}: ${errorText}`);
      }
      return response.json();
    };

    // Step 1: Get sections from super teacher
    console.log('📚 Step 1: Fetching sections from super teacher...');
    const sectionsData = await schoologyFetch(`/users/${SUPER_TEACHER_ID}/sections`);
    const sections = Array.isArray(sectionsData.section) ? sectionsData.section : 
                     (sectionsData.section ? [sectionsData.section] : []);
    
    console.log(`   ✓ Found ${sections.length} sections\n`);

    // Step 2: For each section, fetch grades and look for carter_mock
    console.log('🔍 Step 2: Searching for carter_mock in section grades...\n');
    
    for (const section of sections.slice(0, 3)) { // Test first 3 sections
      const sectionId = String(section.id);
      const sectionTitle = section.course_title || section.section_title;
      
      console.log('─'.repeat(80));
      console.log(`📖 Section ${sectionId}: ${sectionTitle}`);
      console.log('─'.repeat(80));
      
      try {
        // Fetch all grades for this section
        const gradesData = await schoologyFetch(`/sections/${sectionId}/grades`);
        const allGrades = Array.isArray(gradesData.grade) ? gradesData.grade :
                         (gradesData.grade ? [gradesData.grade] : []);
        
        console.log(`   📊 Total grades in section: ${allGrades.length}`);
        
        if (allGrades.length > 0) {
          console.log(`   📋 Sample grade keys:`, Object.keys(allGrades[0]));
          console.log(`   📋 Sample grade:`, JSON.stringify(allGrades[0], null, 2));
        }
        
        // Try to find any grade that might belong to carter_mock
        const carterGrades = allGrades.filter(g => {
          const gStr = JSON.stringify(g).toLowerCase();
          return gStr.includes('carter') || gStr.includes('mock') || gStr.includes('100045678');
        });
        
        if (carterGrades.length > 0) {
          console.log(`\n   🎯 Found ${carterGrades.length} possible Carter grades:`);
          carterGrades.forEach((g, i) => {
            console.log(`      Grade ${i+1}:`, JSON.stringify(g, null, 2));
          });
        } else {
          console.log(`   ⚠️  No Carter grades found in this section`);
        }
        
        console.log();
        
      } catch (error) {
        console.error(`   ❌ Error: ${error.message}\n`);
      }
    }

    console.log('='.repeat(80));
    console.log('✅ Test complete\n');

  } catch (error) {
    console.error('\n❌ Script failed:', error);
    console.error(error.stack);
    process.exit(1);
  }
}

testSectionGrades();
