// src/functions/index.ts
/**
 * Export all functions from a single entrypoint
 */

import { requestToken, callback } from './schoology-auth';
import { helloWorld } from './hello-world';
import { ssrschoologytesting } from "./next-ssr";
import { simpletest } from './simple-test';


// Re-exporting with CommonJS module.exports
// This is the format the Firebase Functions runtime expects
exports.requestToken = requestToken;
exports.callback = callback;
exports.helloWorld = helloWorld;
exports.ssrschoologytesting = ssrschoologytesting;
exports.simpletest = simpletest;
