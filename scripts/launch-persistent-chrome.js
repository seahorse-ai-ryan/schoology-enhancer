#!/usr/bin/env node

/**
 * Launch Chrome with persistent profile and anti-automation flags
 * 
 * This script:
 * 1. Launches Chrome with flags to avoid automation detection
 * 2. Uses a persistent profile directory to maintain authentication
 * 3. Exposes debugging port for potential Chrome DevTools MCP connection
 */

const { spawn } = require('child_process');
const path = require('path');
const os = require('os');
const fs = require('fs');

// Configuration
const CHROME_PROFILE_DIR = path.join(os.homedir(), '.chrome-profiles', 'schoology-testing');
const DEBUG_PORT = 9222;
const START_URL = process.argv[2] || 'https://modernteaching.ngrok.dev';

// Ensure profile directory exists
if (!fs.existsSync(CHROME_PROFILE_DIR)) {
  fs.mkdirSync(CHROME_PROFILE_DIR, { recursive: true });
  console.log(`✅ Created profile directory: ${CHROME_PROFILE_DIR}`);
}

// Determine Chrome path based on OS
function getChromePath() {
  const platform = os.platform();
  
  if (platform === 'darwin') {
    return '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
  } else if (platform === 'win32') {
    return 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  } else {
    return 'google-chrome';
  }
}

const chromePath = getChromePath();

// Chrome launch arguments
const chromeArgs = [
  // User profile for persistence
  `--user-data-dir=${CHROME_PROFILE_DIR}`,
  
  // Anti-automation detection flags
  '--disable-blink-features=AutomationControlled',
  '--disable-infobars',
  '--enable-automation=false',
  '--disable-dev-shm-usage',
  '--disable-web-security',
  '--disable-features=IsolateOrigins,site-per-process',
  
  // Remote debugging for Chrome DevTools Protocol
  `--remote-debugging-port=${DEBUG_PORT}`,
  
  // Window size
  '--window-size=1280,1024',
  
  // Additional useful flags
  '--no-first-run',
  '--no-default-browser-check',
  
  // Start URL
  START_URL
];

console.log('🚀 Launching Chrome with persistent profile...');
console.log(`   Profile: ${CHROME_PROFILE_DIR}`);
console.log(`   Debug Port: ${DEBUG_PORT}`);
console.log(`   URL: ${START_URL}`);
console.log('');

// Launch Chrome
const chrome = spawn(chromePath, chromeArgs, {
  stdio: 'inherit',
  detached: false
});

chrome.on('error', (error) => {
  console.error('❌ Failed to launch Chrome:', error.message);
  process.exit(1);
});

chrome.on('exit', (code) => {
  console.log(`\n👋 Chrome exited with code ${code}`);
  process.exit(code);
});

// Handle SIGINT (Ctrl+C)
process.on('SIGINT', () => {
  console.log('\n🛑 Stopping Chrome...');
  chrome.kill('SIGINT');
});

console.log('💡 Chrome is running. Close the browser window or press Ctrl+C to exit.');
console.log('💡 Profile data will be saved to:', CHROME_PROFILE_DIR);
console.log('💡 Debug endpoint available at: http://localhost:9222');
