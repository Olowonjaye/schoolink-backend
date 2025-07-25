// backend/server.js

const express = require('express');
const cors = require('cors');
const app = express();
const db = require('./database');

app.use(cors());
app.use(express.json());

// Routes
app.use('/api', require('./routes/students'));
app.use('/api/results', require('./routes/results'));

// ✅ Mail setup
const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
  host: 'smtp.yourmail.com',
  port: 587,
  auth: {
    user: 'you@example.com',
    pass: 'password'
  }
});

// ✅ POST: send broadsheet via email
app.post('/api/send-broadsheet', async (req, res) => {
  const { email, htmlContent } = req.body;

  const mailOptions = {
    from: 'School <no-reply@school.com>',
    to: email,
    subject: 'Your Child’s Broadsheet',
    html: htmlContent
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent:', info.messageId);
    res.json({ success: true, messageId: info.messageId });
  } catch (err) {
    console.error('❌ Email error:', err);
    res.status(500).json({ error: 'Failed to send email.' });
  }
});

app.listen(3000, () => {
  console.log('🚀 Server running on port 3000');
});

// in backend/server.js
app.use('/api/auth', require('./routes/auth'));

// Protect sensitive routes
const verifyToken = require('./middleware/verifyToken');
app.use('/api/results', verifyToken, require('./routes/results'));
