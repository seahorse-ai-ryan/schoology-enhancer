#!/usr/bin/env node

/**
 * Aligns seed-data-master.json with existing Schoology data
 * - Adds _20250930 suffix to teacher UIDs to match existing
 * - Keeps ryan_hickman parent UID as-is (already exists)
 * - Updates all references throughout the document
 */

const fs = require('fs');
const path = require('path');

const seedFilePath = path.join(__dirname, '../seed/sandbox/seed-data-master.json');
const seedData = JSON.parse(fs.readFileSync(seedFilePath, 'utf8'));

// Date suffix to match existing Schoology data
const DATE_SUFFIX = '_20250930';

console.log('🔄 Aligning seed data with existing Schoology UIDs...\n');

// Step 1: Create a mapping of old teacher UIDs to new UIDs with suffix
const teacherUidMap = {};
seedData.users.teachers.forEach(teacher => {
  const oldUid = teacher.school_uid;
  const newUid = oldUid + DATE_SUFFIX;
  teacherUidMap[oldUid] = newUid;
  teacher.school_uid = newUid;
  console.log(`✓ Teacher: ${oldUid} → ${newUid}`);
});

console.log(`\n📊 Updated ${Object.keys(teacherUidMap).length} teacher UIDs\n`);

// Step 2: Update all teacher_uid references in courses
let coursesUpdated = 0;
seedData.courses.forEach(course => {
  if (course.teacher_uid && teacherUidMap[course.teacher_uid]) {
    course.teacher_uid = teacherUidMap[course.teacher_uid];
    coursesUpdated++;
  }
});

console.log(`📚 Updated teacher references in ${coursesUpdated} courses\n`);

// Step 3: Update metadata
seedData.metadata.last_updated = new Date().toISOString();
seedData.metadata.version = '2.1';
seedData.metadata.changes = 'Added _20250930 suffix to teacher UIDs to match existing Schoology data';

// Step 4: Backup old file
const backupPath = seedFilePath + '.backup-' + Date.now();
fs.writeFileSync(backupPath, fs.readFileSync(seedFilePath, 'utf8'));
console.log(`💾 Backup created: ${path.basename(backupPath)}\n`);

// Step 5: Write updated seed data
fs.writeFileSync(seedFilePath, JSON.stringify(seedData, null, 2));
console.log(`✅ Updated ${seedFilePath}\n`);

// Step 6: Summary
console.log('📋 Summary of Changes:');
console.log(`   - ${Object.keys(teacherUidMap).length} teacher UIDs updated with ${DATE_SUFFIX} suffix`);
console.log(`   - ${coursesUpdated} course teacher references updated`);
console.log('   - Parent UIDs unchanged (ryan_hickman, christina_mock)');
console.log('   - Student UIDs unchanged (carter_mock, tazio_mock, livio_mock, lily_mock)');
console.log('\n✨ Seed data is now aligned with existing Schoology data!');
console.log('\n👉 Next step: Run `node scripts/generate-seed-csvs.js` to regenerate CSV files');

