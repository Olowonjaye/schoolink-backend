// backend/routes/auth.js
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../database');
const router = express.Router();

const JWT_SECRET = 'your_super_secret_key_here'; // replace with .env in production

// ✅ Register Route
router.post('/register', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Username and password required' });

  try {
    const hash = await bcrypt.hash(password, 10);
    db.run('INSERT INTO users (username, password) VALUES (?, ?)', [username, hash], function(err) {
      if (err) return res.status(400).json({ error: 'Username already taken' });
      res.json({ message: 'Registration successful', userId: this.lastID });
    });
  } catch (err) {
    res.status(500).json({ error: 'Internal error' });
  }
});

// ✅ Login Route
router.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Username and password required' });

  db.get('SELECT * FROM users WHERE username = ?', [username], async (err, user) => {
    if (err || !user) return res.status(401).json({ error: 'Invalid credentials' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: user.id, username }, JWT_SECRET, { expiresIn: '8h' });
    res.json({ message: 'Login successful', token });
  });
});

// ✅ Me Route - verify token and return user info
router.get('/me', (req, res) => {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) return res.status(401).json({ error: 'Unauthorized' });

  const token = auth.split(' ')[1];
  try {
    const data = jwt.verify(token, JWT_SECRET);
    res.json({ userId: data.id, username: data.username });
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
});

module.exports = router;
