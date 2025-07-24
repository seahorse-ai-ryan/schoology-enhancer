// src/functions/hello-world.ts
import { https } from 'firebase-functions';

export const helloWorld = https.onRequest((request, response) => {
  response.json({
    message: "Hello from a Firebase Function!",
  });
});
