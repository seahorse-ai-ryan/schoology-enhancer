// src/functions/next-ssr.ts
import { https } from 'firebase-functions';
import next from 'next';

// This is a workaround for a known issue with Next.js 15 and hosting providers
// that don't have a specific integration. This ensures that the server can
// correctly locate the build output directory.
const isRunningInFirebase = !!process.env.FUNCTIONS_EMULATOR;

const nextJsApp = next({
  dev: false,
  // This is the critical part that tells Next.js where to find the
  // compiled .next directory when running inside a function.
  // The function's CWD is src/functions, so we go up one level.
  conf: { distDir: '../.next' },
});

const requestHandler = nextJsApp.getRequestHandler();

/**
 * The ssrschoologytesting function is the main entry point for all web traffic.
 * It uses a "catch-all" rewrite rule in `firebase.json` to intercept
 * requests, then uses the Next.js request handler to render the appropriate
 * page and return it to the user.
 */
export const ssrschoologytesting = https.onRequest(async (req, res) => {
  // We need to prepare the Next.js app on the first request.
  if (!isRunningInFirebase) {
    await nextJsApp.prepare();
  }
  return requestHandler(req, res);
});
