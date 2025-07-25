// backend/routes/students.js

const express = require('express');
const router = express.Router();
const db = require('../database');

// CREATE student
router.post('/students', (req, res) => {
  const {
    name,
    class: studentClass,
    age,
    gender,
    parent_name,
    parent_phone,
    parent_email
  } = req.body;

  const sql = `
    INSERT INTO students (name, class, age, gender, parent_name, parent_phone, parent_email)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  db.run(sql, [name, studentClass, age, gender, parent_name, parent_phone, parent_email], function (err) {
    if (err) {
      console.error("DB error:", err.message);
      return res.status(500).json({ error: err.message });
    }

    console.log("✅ Student inserted with ID:", this.lastID);
    res.status(201).json({ id: this.lastID });
  });
});

// READ all students
router.get('/students', (req, res) => {
  const sql = 'SELECT * FROM students';

  db.all(sql, [], (err, rows) => {
    if (err) {
      console.error("Fetch error:", err.message);
      return res.status(500).json({ error: err.message });
    }

    res.json(rows);
  });
});

module.exports = router;
