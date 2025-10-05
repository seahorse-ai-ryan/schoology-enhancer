/**
 * Cursor Hook: Development Environment Startup
 * 
 * Automatically checks for port conflicts, manages service startup,
 * and ensures proper initialization order.
 * 
 * Usage: This hook runs automatically when Agent starts
 */

const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

async function checkPort(port) {
  try {
    const { stdout } = await execPromise(`lsof -ti:${port} 2>/dev/null`);
    return stdout.trim().split('\n').filter(Boolean);
  } catch {
    return [];
  }
}

async function getProcessInfo(pid) {
  try {
    const { stdout } = await execPromise(`ps -p ${pid} -o command | tail -n 1`);
    return stdout.trim();
  } catch {
    return 'unknown';
  }
}

async function main() {
  console.log('🚀 Cursor Hook: Checking development environment...\n');

  const ports = {
    9000: 'Next.js dev server',
    8080: 'Firestore emulator',
    5001: 'Firebase Functions',
    4000: 'Firebase Emulator UI',
    4040: 'Ngrok dashboard'
  };

  const conflicts = {};
  
  for (const [port, service] of Object.entries(ports)) {
    const pids = await checkPort(port);
    if (pids.length > 0) {
      const processes = await Promise.all(pids.map(getProcessInfo));
      conflicts[port] = { service, pids, processes };
    }
  }

  if (Object.keys(conflicts).length > 0) {
    console.log('⚠️  Port conflicts detected:\n');
    for (const [port, info] of Object.entries(conflicts)) {
      console.log(`   Port ${port} (${info.service}):`);
      info.pids.forEach((pid, i) => {
        console.log(`     PID ${pid}: ${info.processes[i]}`);
      });
    }
    console.log('\n💡 Kill these processes with:');
    const allPids = Object.values(conflicts).flatMap(c => c.pids);
    console.log(`   kill -9 ${allPids.join(' ')}\n`);
    console.log('Or run: pkill -9 -f "next dev|firebase emulators|ngrok"\n');
    return;
  }

  console.log('✅ All ports are available\n');
  console.log('📋 Ready to start services in this order:\n');
  console.log('   1. Terminal: "Cursor (ngrok http)"');
  console.log('      Command: ngrok http --url=modernteaching.ngrok.dev 9000 --log stdout\n');
  console.log('   2. Terminal: "Cursor (firebase emulators:start)"');
  console.log('      Command: export PATH="/opt/homebrew/opt/openjdk@17/bin:$PATH" && firebase emulators:start');
  console.log('      ⚠️  WAIT for "✔ All emulators ready!" before starting Next.js\n');
  console.log('   3. Terminal: "Cursor (npm run)"');
  console.log('      Command: export FIRESTORE_EMULATOR_HOST="localhost:8080" && npm run dev\n');
}

main().catch(console.error);

