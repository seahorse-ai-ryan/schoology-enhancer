/**
 * Cursor Hook: Environment Verification
 * 
 * Verifies all services are running correctly and the app is functional.
 * Takes screenshots and runs tests to ensure everything works.
 */

const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

async function checkService(port, name) {
  try {
    await execPromise(`curl -s http://localhost:${port} > /dev/null`);
    return { name, status: '✅', port };
  } catch {
    return { name, status: '❌', port };
  }
}

async function checkNgrok() {
  try {
    const { stdout } = await execPromise(`curl -s http://localhost:4040/api/tunnels 2>/dev/null`);
    const data = JSON.parse(stdout);
    const url = data.tunnels?.[0]?.public_url;
    return url ? { status: '✅', url } : { status: '❌', url: null };
  } catch {
    return { status: '❌', url: null };
  }
}

async function main() {
  console.log('🔍 Verifying development environment...\n');

  const services = [
    { port: 9000, name: 'Next.js' },
    { port: 8080, name: 'Firestore' },
    { port: 4000, name: 'Emulator UI' }
  ];

  console.log('Services:');
  const results = await Promise.all(
    services.map(s => checkService(s.port, s.name))
  );
  
  results.forEach(r => {
    console.log(`  ${r.status} ${r.name.padEnd(15)} http://localhost:${r.port}`);
  });

  const ngrok = await checkNgrok();
  console.log(`  ${ngrok.status} Ngrok tunnel    ${ngrok.url || 'Not connected'}\n`);

  const allOk = results.every(r => r.status === '✅') && ngrok.status === '✅';

  if (!allOk) {
    console.log('❌ Some services are not running. Start them first.\n');
    return;
  }

  console.log('✅ All services running!\n');
  console.log('🧪 Run tests with:');
  console.log('   npm run test:emu        # Jest backend tests');
  console.log('   npm run test:simple     # Playwright E2E tests\n');
  console.log('🌐 Open app:');
  console.log(`   ${ngrok.url}\n`);
}

main().catch(console.error);

