// This script will insert a default user for testing
// Run this only ONCE to avoid duplicate errors

const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const db = new sqlite3.Database('./db/school.db');

const username = 'admin';
const password = 'password123'; // Change this to something secure

bcrypt.hash(password, 10, (err, hashedPassword) => {
  if (err) return console.error("Hashing failed:", err);

  const sql = `INSERT INTO users (username, password) VALUES (?, ?)`;
  db.run(sql, [username, hashedPassword], function (err) {
    if (err) return console.error("Insert failed:", err.message);
    console.log(`✅ Default user created: ${username}`);
    db.close();
  });
});
