#!/usr/bin/env node

/**
 * Seed Events and Announcements into Schoology
 * 
 * 1. Creates announcements as "updates" in a school-wide group
 * 2. Creates calendar events for each assigned user
 */

const fs = require('fs');
const path = require('path');
const OAuth = require('oauth-1.0a');
const crypto = require('crypto');

if (fs.existsSync('.env.local')) {
  require('dotenv').config({ path: '.env.local' });
}

const DATA_PATH = path.join(__dirname, '..', 'seed', 'sandbox', 'temp-events-announcements.json');
const eventsData = JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));

const SCHOOLOGY_BASE_URL = 'https://api.schoology.com/v1';
const ADMIN_KEY = process.env.SCHOOLOGY_ADMIN_KEY;
const ADMIN_SECRET = process.env.SCHOOLOGY_ADMIN_SECRET;

// User ID mapping
const USER_MAP = {
  'Carter Hickman': '140834636',
  'Tazio Passariello': '140834637',
  'Livio Passariello': '140834638',
  'Lily Chen': '140834639',
  'Christina (Parent)': '140834634',
};

if (!ADMIN_KEY || !ADMIN_SECRET) {
  console.error('❌ Missing SCHOOLOGY_ADMIN_KEY and SCHOOLOGY_ADMIN_SECRET');
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
  const text = await response.text();
  
  if (!response.ok) {
    throw new Error(`API error (${response.status}): ${text.substring(0, 200)}`);
  }

  if (!text || text.trim() === '') {
    return { success: true };
  }
  
  return JSON.parse(text);
}

async function createSchoolGroup() {
  console.log('📚 Step 1: Creating School-Wide Group\n');
  
  try {
    const groupData = {
      title: 'Palo Alto High School - All Students',
      description: 'School-wide announcements and updates',
      // Don't set category - let Schoology use default
    };
    
    // Create group (impersonate as Super Teacher or principal)
    const result = await schoologyRequest(
      'POST',
      '/groups',
      groupData,
      '140836120' // Super Teacher
    );
    
    console.log(`✅ Created group: ${result.id}`);
    console.log(`   Title: ${result.title}\n`);
    
    return result.id;
    
  } catch (error) {
    // Group might already exist - try to find it
    console.log('⚠️  Group creation failed (might already exist)');
    console.log(`   Error: ${error.message}\n`);
    console.log('   Attempting to find existing group...\n');
    
    try {
      const groupsData = await schoologyRequest('GET', '/groups?limit=100');
      const groups = Array.isArray(groupsData.group) ? groupsData.group : (groupsData.group ? [groupsData.group] : []);
      
      console.log(`   Found ${groups.length} total groups`);
      
      if (groups.length > 0) {
        console.log('   Available groups:');
        groups.slice(0, 5).forEach(g => {
          console.log(`     - ${g.title} (ID: ${g.id})`);
        });
      }
      
      const schoolGroup = groups.find(g => g.title && g.title.includes('Palo Alto High School'));
      
      if (schoolGroup) {
        console.log(`\n✅ Using existing group: ${schoolGroup.id}`);
        console.log(`   Title: ${schoolGroup.title}\n`);
        return schoolGroup.id;
      }
      
      // Just use the first group if available
      if (groups.length > 0) {
        console.log(`\n⚠️  Using first available group: ${groups[0].id}`);
        console.log(`   Title: ${groups[0].title}\n`);
        return groups[0].id;
      }
      
    } catch (findError) {
      console.error('❌ Could not find groups:', findError.message);
    }
    
    throw new Error('No groups available - please create a group in Schoology UI first');
  }
}

async function seedAnnouncements(groupId) {
  console.log(`📢 Step 2: Posting ${eventsData.updates.length} Announcements\n`);
  
  let created = 0;
  let failed = 0;
  
  for (const update of eventsData.updates) {
    try {
      await schoologyRequest(
        'POST',
        `/groups/${groupId}/updates`,
        { body: update.body },
        '140836120' // Post as Super Teacher
      );
      
      const preview = update.body.replace(/<[^>]+>/g, '').substring(0, 60);
      console.log(`   ✅ ${preview}...`);
      created++;
      
      await new Promise(resolve => setTimeout(resolve, 200)); // Rate limiting
      
    } catch (error) {
      console.log(`   ❌ Failed: ${error.message}`);
      failed++;
    }
  }
  
  console.log(`\n📊 Announcements: ✅ ${created} created, ❌ ${failed} failed\n`);
}

async function seedEvents() {
  console.log(`📅 Step 3: Creating ${eventsData.events.length} Calendar Events\n`);
  
  let created = 0;
  let failed = 0;
  
  for (const event of eventsData.events) {
    console.log(`\n📌 ${event.title}`);
    console.log(`   Assignees: ${event.assignees.length}`);
    
    for (const assignee of event.assignees) {
      const userId = USER_MAP[assignee];
      
      if (!userId) {
        console.log(`   ⚠️  Unknown assignee: ${assignee}`);
        continue;
      }
      
      try {
        const eventData = {
          title: event.title,
          start: event.start,
          end: event.end,
          all_day: event.all_day ? 1 : 0,
        };
        
        await schoologyRequest(
          'POST',
          '/events',
          eventData,
          userId // Impersonate the user to add to their calendar
        );
        
        created++;
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (error) {
        console.log(`   ❌ ${assignee}: ${error.message}`);
        failed++;
      }
    }
    
    console.log(`   ✅ Added to ${event.assignees.length} calendars`);
  }
  
  console.log(`\n📊 Events: ✅ ${created} created, ❌ ${failed} failed\n`);
}

async function main() {
  console.log('\n🌱 Seeding Events and Announcements\n');
  console.log('='.repeat(60) + '\n');
  
  try {
    // Step 1: Get or create school group
    const groupId = await createSchoolGroup();
    
    // Step 2: Post announcements
    await seedAnnouncements(groupId);
    
    // Step 3: Create events
    await seedEvents();
    
    console.log('='.repeat(60));
    console.log('🎉 Seeding Complete!\n');
    console.log('Check Schoology UI:');
    console.log('  - Home page: Recent updates');
    console.log('  - Calendar: Upcoming events');
    console.log('');
    
  } catch (error) {
    console.error('\n💥 Fatal error:', error);
    process.exit(1);
  }
}

main();
