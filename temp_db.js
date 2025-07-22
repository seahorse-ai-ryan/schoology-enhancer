import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

let db;

export async function initializeDatabase() {
  if (db) return db;

  try {
    db = await open({
      filename: './schoology.db',
      driver: sqlite3.Database
    });

    console.log('Connected to the SQLite database.');

    // Create tables if they don't exist
    await db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT
      );
    `);

    await db.exec(`
      CREATE TABLE IF NOT EXISTS oauth_tokens (
        user_id TEXT PRIMARY KEY,
        token_key TEXT NOT NULL,
        token_secret TEXT NOT NULL,
        is_access_token BOOLEAN NOT NULL DEFAULT 0,
        FOREIGN KEY (user_id) REFERENCES users(id)
      );
    `);

    return db;
  } catch (err) {
    console.error('Could not connect to the database.', err);
    process.exit(1);
  }
}

export const getDb = () => db; 