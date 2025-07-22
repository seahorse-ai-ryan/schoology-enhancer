import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });

import express from 'express';
import cors from 'cors';
import { initializeDatabase } from './db.js';
import authRoutes from './auth.js';

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Mount the authentication routes
app.use('/auth', authRoutes);

app.get('/', (req, res) => {
  res.send('Schoology Enhancer API server is running!');
});

initializeDatabase().then(() => {
  app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
  });
}); 