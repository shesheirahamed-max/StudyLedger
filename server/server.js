const express = require('express');
const cors = require('cors');
require('dotenv').config(); // .env ফাইল লোড করার জন্য এটি সবার ওপরে থাকতে হবে

const chatRoutes = require('./src/routes/chatRoutes');
const courseRoutes = require('./src/routes/courseRoutes');

const app = express();
app.use(cors());
app.use(express.json());

// চ্যাট এবং কোর্স রুটগুলো কানেক্ট করা
app.use('/api/chat', chatRoutes);
app.use('/api/courses', courseRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});