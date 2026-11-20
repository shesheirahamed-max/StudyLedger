const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const express = require('express');
const cors = require('cors');

const authRoutes = require('./src/routes/authRoutes');
const chatRoutes = require('./src/routes/chatRoutes');
const courseRoutes = require('./src/routes/courseRoutes');
const financeRoutes = require('./src/routes/financeRoutes');
const messRoutes = require('./src/routes/messRoutes');
const quizRoutes = require('./src/routes/quizRoutes');

const app = express();

app.use(cors());
app.use(express.json({ limit: '1mb' }));

app.get('/api/health', (req, res) => {
  res.json({
    ok: true,
    geminiKeyLoaded: Boolean((process.env.GEMINI_API_KEY || '').trim()),
    nodeVersion: process.version
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/finance', financeRoutes);
app.use('/api/mess', messRoutes);
app.use('/api/quiz', quizRoutes);

app.use((req, res) => {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.originalUrl}` });
});

app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err.message);
  res.status(err.status || 500).json({ error: err.message || 'সার্ভারে সমস্যা হয়েছে।' });
});

if (typeof fetch !== 'function') {
  console.error('Node.js 18 বা তার উপরের ভার্সন ব্যবহার করুন (fetch নেই)।');
}

if (!(process.env.GEMINI_API_KEY || '').trim()) {
  console.warn('GEMINI_API_KEY লোড হয়নি। .env ফাইল ও পাথ চেক করুন।');
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});