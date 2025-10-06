const { spawn } = require('child_process');
const path = require('path');

function startEmulators() {
  // Hardcoded path to the standard Homebrew installation for OpenJDK 17.
  // This is the explicit path required by firebase-tools on this system.
  const javaHome = '/opt/homebrew/opt/openjdk@17/bin';
  
  const newPath = `${javaHome}${path.delimiter}${process.env.PATH}`;

  console.log('🚀 Starting Firebase Emulators with explicit Java PATH...');
  console.log(`   Using PATH: ${newPath}`);

  const emuProcess = spawn(
    'dotenv',
    [
      '-e',
      '.env.local',
      '--',
      'firebase',
      'emulators:start',
      '--import=./.firebase/emulator-data',
      '--export-on-exit=./.firebase/emulator-data',
    ],
    {
      env: {
        ...process.env,
        PATH: newPath,
      },
      stdio: 'inherit', // Pipe output directly to the parent terminal
    }
  );

  emuProcess.on('error', (error) => {
    console.error('❌ Failed to start Firebase emulators:', error);
  });

  emuProcess.on('exit', (code) => {
    if (code !== 0) {
      console.error(`\n❌ Firebase emulators exited with error code ${code}.`);
      console.error('   Hint: This is often due to a Java configuration issue.');
      console.error('   Please verify your Java installation using the guide:');
      console.error('   ➡️  docs/guides/DEVELOPER-ONBOARDING-SETUP.md\n');
    } else {
      console.log(`Firebase emulators process exited with code ${code}`);
    }
  });
}

startEmulators();
