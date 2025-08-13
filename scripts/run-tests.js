#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting Playwright Test Runner...\n');

// Run Playwright tests with specific project and output
const testProcess = spawn('npx', ['playwright', 'test', '--project=chromium', '--reporter=list'], {
  stdio: ['pipe', 'pipe', 'pipe'],
  shell: true,
  cwd: process.cwd()
});

// Handle test output
testProcess.stdout.on('data', (data) => {
  console.log(`[TEST] ${data.toString().trim()}`);
});

testProcess.stderr.on('data', (data) => {
  console.error(`[ERROR] ${data.toString().trim()}`);
});

// Handle test completion
testProcess.on('close', (code) => {
  console.log(`\n✅ Tests completed with exit code: ${code}`);
  if (code === 0) {
    console.log('🎉 All tests passed!');
  } else {
    console.log('❌ Some tests failed. Check the output above.');
  }
  process.exit(code);
});

// Handle process errors
testProcess.on('error', (error) => {
  console.error(`❌ Failed to start test process: ${error.message}`);
  process.exit(1);
});

// Handle process interruption
process.on('SIGINT', () => {
  console.log('\n🛑 Interrupting tests...');
  testProcess.kill('SIGINT');
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Terminating tests...');
  testProcess.kill('SIGTERM');
});
