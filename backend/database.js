// backend/database.js

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.resolve(__dirname, '../db/school.db');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Could not connect to database', err);
  } else {
    console.log('✅ Connected to SQLite database');

    // Create students table
    db.run(`
      CREATE TABLE IF NOT EXISTS students (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        class TEXT NOT NULL,
        age INTEGER,
        gender TEXT,
        parent_name TEXT,
        parent_phone TEXT,
        parent_email TEXT
      )
    `);

    // Create results table
    db.run(`
      CREATE TABLE IF NOT EXISTS results (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_id INTEGER,
        subject TEXT,
        ca1 INTEGER,
        ca2 INTEGER,
        exam INTEGER,
        total INTEGER,
        grade TEXT,
        remark TEXT,
        term TEXT,
        session TEXT,
        FOREIGN KEY(student_id) REFERENCES students(id)
      )
    `);

    // ✅ Wrap users table creation inside db.run()
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL
      )
    `);
  }
});

module.exports = db;
