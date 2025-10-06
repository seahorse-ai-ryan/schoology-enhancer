#!/usr/bin/env node

/**
 * Test script to fetch and calculate grades for carter_mock
 * This mimics what /api/schoology/grades does but runs directly
 */

const OAuth = require('oauth-1.0a');
const crypto = require('crypto');
const { getFirestore } = require('firebase-admin/firestore');
const { initializeApp, getApps } = require('firebase-admin/app');

// Load environment variables
if (require('fs').existsSync('.env.local')) {
  const dotenv = require('dotenv');
  dotenv.config({ path: '.env.local' });
}

const SCHOOLOGY_API_URL = 'https://api.schoology.com/v1';
const PARENT_USER_ID = '211933965'; // Ryan Mock (parent)
const CARTER_USER_ID = '100045678'; // carter_mock

async function testCarterGrades() {
  console.log('\n' + '='.repeat(80));
  console.log('🧪 Testing Carter Mock Grade Calculation');
  console.log('='.repeat(80) + '\n');

  try {
    // Initialize Firebase
    if (!getApps().length) {
      initializeApp({ projectId: process.env.FIREBASE_PROJECT_ID || 'demo-project' });
    }
    const db = getFirestore();

    // Get parent doc to check active child
    const parentDoc = await db.collection('parents').doc(PARENT_USER_ID).get();
    const activeChildId = parentDoc.exists ? parentDoc.data()?.activeChildId : null;
    
    console.log('📋 Parent User ID:', PARENT_USER_ID);
    console.log('👶 Active Child ID:', activeChildId || 'none');
    console.log('🎯 Target User ID:', CARTER_USER_ID);
    console.log('');

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
        'Accept': 'application/json',
        'X-Schoology-Run-As': String(CARTER_USER_ID)
      };

      const response = await fetch(url, { headers });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API error ${response.status}: ${errorText}`);
      }
      return response.json();
    };

    // Step 1: Fetch Carter's enrolled sections
    console.log('📚 Step 1: Fetching enrolled sections...');
    const sectionsData = await schoologyFetch(`/users/${CARTER_USER_ID}/sections`);
    const sections = Array.isArray(sectionsData.section) ? sectionsData.section : 
                     (sectionsData.section ? [sectionsData.section] : []);
    
    console.log(`   ✓ Found ${sections.length} enrolled sections\n`);

    const gradesMap = {};

    // Step 2: For each section, fetch and calculate grades
    for (const section of sections) {
      const sectionId = String(section.id);
      const sectionTitle = section.course_title || section.section_title;
      
      console.log('─'.repeat(80));
      console.log(`📖 Section ${sectionId}: ${sectionTitle}`);
      console.log('─'.repeat(80));
      
      try {
        // Fetch assignment grades
        const gradesData = await schoologyFetch(`/sections/${sectionId}/grades`);
        const allGrades = Array.isArray(gradesData.grade) ? gradesData.grade :
                         (gradesData.grade ? [gradesData.grade] : []);
        
        console.log(`   📊 Total grades in section: ${allGrades.length}`);
        
        if (allGrades.length > 0) {
          console.log(`   📋 Sample grade object:`, JSON.stringify(allGrades[0], null, 2));
        }
        
        // Filter grades for Carter
        const studentGrades = allGrades.filter((g) => {
          const enrollmentMatch = g.enrollment_id && String(g.enrollment_id).includes(String(CARTER_USER_ID));
          const uidMatch = g.uid && String(g.uid) === String(CARTER_USER_ID);
          return enrollmentMatch || uidMatch;
        });
        
        console.log(`   🎯 Filtered to ${studentGrades.length} grades for Carter`);
        
        if (studentGrades.length === 0) {
          console.log(`   ⚠️  No grades found for Carter in this section\n`);
          continue;
        }

        // Fetch grading categories
        let categoriesData = null;
        try {
          categoriesData = await schoologyFetch(`/sections/${sectionId}/grading_categories`);
        } catch (e) {
          console.log(`   ℹ️  No grading categories found`);
        }
        
        const categories = categoriesData && categoriesData.grading_category ? 
                          (Array.isArray(categoriesData.grading_category) ? categoriesData.grading_category : [categoriesData.grading_category]) :
                          [];

        console.log(`   📂 Found ${categories.length} grading categories`);

        // Calculate grade
        let finalGrade = null;

        if (categories.length > 0) {
          // Calculate weighted average by category
          const categoryGrades = new Map();
          
          // Initialize categories
          for (const cat of categories) {
            categoryGrades.set(String(cat.id), {
              name: cat.title || 'Untitled',
              earned: 0,
              possible: 0,
              weight: parseFloat(cat.weight || '0')
            });
          }

          // Sum up grades by category
          for (const grade of studentGrades) {
            const categoryId = String(grade.category_id || '0');
            if (categoryGrades.has(categoryId)) {
              const cat = categoryGrades.get(categoryId);
              cat.earned += parseFloat(grade.grade || '0');
              cat.possible += parseFloat(grade.max_points || '0');
            }
          }

          // Calculate weighted average
          let totalWeightedScore = 0;
          let totalWeight = 0;

          console.log('\n   📊 Category Breakdown:');
          for (const [catId, data] of categoryGrades) {
            if (data.possible > 0 && data.weight > 0) {
              const categoryAverage = (data.earned / data.possible) * 100;
              totalWeightedScore += categoryAverage * data.weight;
              totalWeight += data.weight;
              console.log(`      • ${data.name}: ${categoryAverage.toFixed(2)}% (weight: ${data.weight}%)`);
            }
          }

          if (totalWeight > 0) {
            finalGrade = totalWeightedScore / totalWeight;
          }
        } else {
          // No categories - simple average
          let totalEarned = 0;
          let totalPossible = 0;

          for (const grade of studentGrades) {
            totalEarned += parseFloat(grade.grade || '0');
            totalPossible += parseFloat(grade.max_points || '0');
          }

          if (totalPossible > 0) {
            finalGrade = (totalEarned / totalPossible) * 100;
            console.log(`   📊 Simple average: ${totalEarned}/${totalPossible} points`);
          }
        }

        if (finalGrade !== null) {
          gradesMap[sectionId] = {
            section: sectionTitle,
            grade: Math.round(finalGrade),
            calculated: true
          };
          console.log(`\n   ✅ FINAL GRADE: ${Math.round(finalGrade)}%\n`);
        } else {
          console.log(`   ❌ Could not calculate grade\n`);
        }

      } catch (error) {
        console.error(`   ❌ Error processing section: ${error.message}\n`);
      }
    }

    // Summary
    console.log('='.repeat(80));
    console.log('📊 GRADE SUMMARY FOR CARTER MOCK');
    console.log('='.repeat(80));
    
    if (Object.keys(gradesMap).length === 0) {
      console.log('\n❌ No grades calculated!\n');
    } else {
      console.log('');
      for (const [sectionId, data] of Object.entries(gradesMap)) {
        console.log(`   ${data.section.padEnd(40)} ${String(data.grade + '%').padStart(5)}`);
      }
      console.log('');
      console.log(`✅ Successfully calculated grades for ${Object.keys(gradesMap).length} sections\n`);
    }

  } catch (error) {
    console.error('\n❌ Script failed:', error);
    console.error(error.stack);
    process.exit(1);
  }
}

testCarterGrades();
