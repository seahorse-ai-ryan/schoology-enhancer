const OAuth = require('oauth-1.0a');
const crypto = require('crypto');
const { getFirestore } = require('firebase-admin/firestore');
const { initializeApp, getApps } = require('firebase-admin/app');

// --- CONFIGURATION ---
const SCHOOLOGY_API_URL = 'https://api.schoology.com/v1';
// Use the REAL Firebase project ID to satisfy SDK initialization checks
const FIREBASE_PROJECT_ID = 'gradewise-xbpp6'; 
// The parent user who is currently logged in (from our auth state)
const PARENT_USER_ID = '211933965'; 

async function debugGradesApi() {
  console.log('--- Starting Grade API Debug Script ---');

  try {
    // --- 1. Initialize Firebase ---
    if (!getApps().length) {
      initializeApp({ projectId: FIREBASE_PROJECT_ID });
    }
    const db = getFirestore();
    console.log(`Firebase initialized for project: ${FIREBASE_PROJECT_ID}`);

    // --- 2. Get the Active Child ID from the Emulator ---
    const parentDoc = await db.collection('parents').doc(PARENT_USER_ID).get();
    if (!parentDoc.exists) {
      throw new Error(`Parent with ID ${PARENT_USER_ID} not found in Firestore.`);
    }
    const activeChildId = parentDoc.data().activeChildId;
    if (!activeChildId) {
      throw new Error('No active child is set for this parent.');
    }
    console.log(`Found active child ID: ${activeChildId}`);

    // --- 3. Get Parent's OAuth Tokens from the Emulator ---
    const userDoc = await db.collection('users').doc(PARENT_USER_ID).get();
    if (!userDoc.exists) {
      throw new Error(`User with ID ${PARENT_USER_ID} not found in Firestore.`);
    }
    const { accessToken, accessSecret } = userDoc.data();
    if (!accessToken || !accessSecret) {
      throw new Error('Parent user does not have valid OAuth tokens.');
    }
    console.log('Found parent OAuth tokens.');

    // --- 4. Prepare and Sign the Schoology API Request ---
    const consumerKey = process.env.SCHOOLOGY_CONSUMER_KEY;
    const consumerSecret = process.env.SCHOOLOGY_CONSUMER_SECRET;
    const token = { key: accessToken, secret: accessSecret };

    const oauth = new OAuth({
      consumer: { key: consumerKey, secret: consumerSecret },
      signature_method: 'HMAC-SHA1',
      hash_function(base_string, key) {
        return crypto.createHmac('sha1', key).update(base_string).digest('base64');
      },
    });

    const gradesUrl = `${SCHOOLOGY_API_URL}/users/${activeChildId}/grades`;
    const requestData = { url: gradesUrl, method: 'GET' };
    const authHeader = oauth.toHeader(oauth.authorize(requestData, token));

    const headers = new Headers();
    for (const key in authHeader) {
      headers.append(key, authHeader[key]);
    }
    headers.append('Accept', 'application/json');
    console.log(`Requesting URL: ${gradesUrl}`);

    // --- 5. Make the API Call and Print the Raw Response ---
    const response = await fetch(gradesUrl, { headers });

    console.log(`\n--- Schoology API Response ---`);
    console.log(`Status: ${response.status} ${response.statusText}`);
    
    const responseBody = await response.text();
    
    if (!response.ok) {
        console.error('API request failed!');
        console.error('Response Body:', responseBody);
        return;
    }

    console.log('Raw JSON Response Body:');
    try {
        console.log(JSON.stringify(JSON.parse(responseBody), null, 2));
    } catch (e) {
        console.log(responseBody);
    }
    
    console.log('\n--- Debug Script Finished ---');

  } catch (error) {
    console.error('\n--- SCRIPT FAILED ---');
    console.error(error);
    process.exit(1);
  }
}

debugGradesApi();
