"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.callback = exports.requestToken = void 0;
// src/functions/schoology-auth.ts
const https_1 = require("firebase-functions/v2/https");
const logger = __importStar(require("firebase-functions/logger"));
const firestore_1 = require("firebase-admin/firestore");
const app_1 = require("firebase-admin/app");
const schoology_auth_logic_1 = require("./schoology-auth.logic");
if ((0, app_1.getApps)().length === 0) {
    (0, app_1.initializeApp)();
}
const db = (0, firestore_1.getFirestore)();
exports.requestToken = (0, https_1.onRequest)({ secrets: ["SCHOOLOGY_CONSUMER_KEY", "SCHOOLOGY_CONSUMER_SECRET"] }, async (request, response) => {
    try {
        const redirectUrl = await (0, schoology_auth_logic_1.requestTokenLogic)(db, process.env.SCHOOLOGY_CONSUMER_KEY, process.env.SCHOOLOGY_CONSUMER_SECRET);
        response.redirect(redirectUrl);
    }
    catch (error) {
        logger.error('Error in requestToken:', error);
        response.status(500).send('Authentication failed.');
    }
});
exports.callback = (0, https_1.onRequest)({ secrets: ["SCHOOLOGY_CONSUMER_KEY", "SCHOOLOGY_CONSUMER_SECRET"] }, async (request, response) => {
    try {
        const oauth_token = request.query.oauth_token;
        if (!oauth_token) {
            response.status(400).send('Missing oauth_token');
            return;
        }
        const { userId } = await (0, schoology_auth_logic_1.callbackLogic)(db, process.env.SCHOOLOGY_CONSUMER_KEY, process.env.SCHOOLOGY_CONSUMER_SECRET, oauth_token);
        response.cookie('schoology_user_id', userId, { secure: true, httpOnly: true, maxAge: 2592000000 });
        response.redirect('/');
    }
    catch (error) {
        logger.error('Error in callback:', error);
        response.status(500).send('Authentication failed.');
    }
});
//# sourceMappingURL=schoology-auth.js.map