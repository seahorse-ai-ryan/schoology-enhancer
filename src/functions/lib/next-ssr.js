"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ssrschoologytesting = void 0;
// src/functions/next-ssr.ts
const firebase_functions_1 = require("firebase-functions");
const next_1 = __importDefault(require("next"));
// This is a workaround for a known issue with Next.js 15 and hosting providers
// that don't have a specific integration. This ensures that the server can
// correctly locate the build output directory.
const isRunningInFirebase = !!process.env.FUNCTIONS_EMULATOR;
const nextJsApp = (0, next_1.default)({
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
exports.ssrschoologytesting = firebase_functions_1.https.onRequest(async (req, res) => {
    // We need to prepare the Next.js app on the first request.
    if (!isRunningInFirebase) {
        await nextJsApp.prepare();
    }
    return requestHandler(req, res);
});
//# sourceMappingURL=next-ssr.js.map