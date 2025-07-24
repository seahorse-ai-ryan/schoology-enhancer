"use strict";
// src/functions/index.ts
/**
 * Export all functions from a single entrypoint
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.simpletest = exports.ssrschoologytesting = exports.helloWorld = exports.callback = exports.requestToken = void 0;
var schoology_auth_1 = require("./schoology-auth");
Object.defineProperty(exports, "requestToken", { enumerable: true, get: function () { return schoology_auth_1.requestToken; } });
Object.defineProperty(exports, "callback", { enumerable: true, get: function () { return schoology_auth_1.callback; } });
var hello_world_1 = require("./hello-world");
Object.defineProperty(exports, "helloWorld", { enumerable: true, get: function () { return hello_world_1.helloWorld; } });
var next_ssr_1 = require("./next-ssr");
Object.defineProperty(exports, "ssrschoologytesting", { enumerable: true, get: function () { return next_ssr_1.ssrschoologytesting; } });
var simple_test_1 = require("./simple-test");
Object.defineProperty(exports, "simpletest", { enumerable: true, get: function () { return simple_test_1.simpletest; } });
//# sourceMappingURL=index.js.map