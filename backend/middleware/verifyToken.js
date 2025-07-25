// backend/middleware/verifyToken.js
const jwt = require('jsonwebtoken');
const JWT_SECRET = 'your_super_secret_key_here';

module.exports = (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const token = auth.split(' ')[1];
    const data = jwt.verify(token, JWT_SECRET);
    req.user = data;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
};
