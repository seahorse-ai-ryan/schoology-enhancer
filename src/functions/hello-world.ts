// src/functions/hello-world.ts
import { https } from 'firebase-functions';

exports.helloWorld = https.onRequest((request, response) => {
  response.json({
    message: "Hello from a Firebase Function!",
  });
});
