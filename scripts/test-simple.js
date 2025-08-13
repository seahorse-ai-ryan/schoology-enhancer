#!/usr/bin/env node

const { execSync } = require('child_process');

console.log('🧪 Running Playwright tests...\n');

try {
  // Run tests with minimal output
  const result = execSync('npx playwright test --project=chromium --reporter=line', {
    stdio: 'inherit',
    cwd: process.cwd()
  });
  
  console.log('\n✅ All tests completed successfully!');
} catch (error) {
  console.error('\n❌ Tests failed with exit code:', error.status);
  process.exit(error.status || 1);
}
