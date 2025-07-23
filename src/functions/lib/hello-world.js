"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.helloWorld = void 0;
// src/functions/hello-world.ts
const firebase_functions_1 = require("firebase-functions");
exports.helloWorld = firebase_functions_1.https.onRequest((request, response) => {
    response.json({
        message: "Hello from a Firebase Function!",
    });
});
//# sourceMappingURL=hello-world.js.map