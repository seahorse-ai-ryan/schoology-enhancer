// src/functions/schoology-auth.ts
import { onRequest } from 'firebase-functions/v2/https';
import * as logger from 'firebase-functions/logger';
import { getFirestore } from 'firebase-admin/firestore';
import { initializeApp, getApps } from 'firebase-admin/app';
import { requestTokenLogic, callbackLogic } from './schoology-auth.logic';

if (getApps().length === 0) {
  initializeApp();
}
const db = getFirestore();

exports.requestToken = onRequest({ secrets: ["SCHOOLOGY_CONSUMER_KEY", "SCHOOLOGY_CONSUMER_SECRET"] }, async (request, response) => {
  try {
    const redirectUrl = await requestTokenLogic(db, process.env.SCHOOLOGY_CONSUMER_KEY, process.env.SCHOOLOGY_CONSUMER_SECRET);
    response.redirect(redirectUrl);
  } catch (error) {
    logger.error('Error in requestToken:', error);
    response.status(500).send('Authentication failed.');
  }
});

exports.callback = onRequest({ secrets: ["SCHOOLOGY_CONSUMER_KEY", "SCHOOLOGY_CONSUMER_SECRET"] }, async (request, response) => {
    try {
        const oauth_token = request.query.oauth_token as string;
        if (!oauth_token) {
            response.status(400).send('Missing oauth_token');
            return;
        }
        const { userId } = await callbackLogic(db, process.env.SCHOOLOGY_CONSUMER_KEY, process.env.SCHOOLOGY_CONSUMER_SECRET, oauth_token);
        response.cookie('schoology_user_id', userId, { secure: true, httpOnly: true, maxAge: 2592000000 });
        response.redirect('/');
    } catch (error) {
        logger.error('Error in callback:', error);
        response.status(500).send('Authentication failed.');
    }
});
