const express = require('express');
const cors = require('cors');
require('dotenv').config(); // .env ফাইল লোড করার জন্য এটি সবার ওপরে থাকতে হবে

const authRoutes = require('./src/routes/authRoutes');
const chatRoutes = require('./src/routes/chatRoutes');
const courseRoutes = require('./src/routes/courseRoutes');
const financeRoutes = require('./src/routes/financeRoutes');

const app = express();
app.use(cors());
app.use(express.json());

// Auth, চ্যাট, কোর্স এবং ফাইন্যান্স/CGPA রুটগুলো কানেক্ট করা
app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/finance', financeRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});