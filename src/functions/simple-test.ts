// src/functions/simple-test.ts
import {https} from "firebase-functions";
import {logger} from "firebase-functions/v1";

export const simpletest = https.onRequest((request, response) => {
  logger.info("Executing simpletest function!", {structuredData: true});
  response.send("Hello from simple-test!");
});
