"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.simpletest = void 0;
// src/functions/simple-test.ts
const firebase_functions_1 = require("firebase-functions");
const v1_1 = require("firebase-functions/v1");
exports.simpletest = firebase_functions_1.https.onRequest((request, response) => {
    v1_1.logger.info("Executing simpletest function!", { structuredData: true });
    response.send("Hello from simple-test!");
});
//# sourceMappingURL=simple-test.js.map