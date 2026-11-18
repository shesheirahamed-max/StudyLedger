const db = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Register Function
const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Name, email, and password are required' });
        }

        db.query("SELECT * FROM users WHERE email = ?", [email], async (err, results) => {
            if (err) {
                console.error('DB Error:', err);
                return res.status(500).json({ message: 'Database error' });
            }

            if (results.length > 0) {
                return res.status(400).json({ message: 'Email already exists' });
            }

            try {
                const password_hash = await bcrypt.hash(password, 10);

                db.query(
                    "INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)",
                    [name, email, password_hash],
                    (insertErr) => {
                        if (insertErr) {
                            console.error('Insert Error:', insertErr);
                            return res.status(500).json({ message: 'Error saving user' });
                        }
                        return res.status(201).json({ message: 'User registered successfully' });
                    }
                );
            } catch (hashErr) {
                console.error('Hash Error:', hashErr);
                return res.status(500).json({ message: 'Server error' });
            }
        });
    } catch (error) {
        console.error('Server Error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

// Login Function
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        db.query("SELECT * FROM users WHERE email = ?", [email], async (err, results) => {
            if (err) {
                console.error('DB Error:', err);
                return res.status(500).json({ message: 'Database error' });
            }

            if (results.length === 0) {
                return res.status(400).json({ message: 'Invalid email or password' });
            }

            const user = results[0];

            // পাসওয়ার্ড ম্যাচ করা
            const isMatch = await bcrypt.compare(password, user.password_hash);
            if (!isMatch) {
                return res.status(400).json({ message: 'Invalid email or password' });
            }

            // JWT টোকেন তৈরি (যদি ব্যবহার করেন)
            const token = jwt.sign(
                { id: user.id, email: user.email },
                process.env.JWT_SECRET || 'secret_key',
                { expiresIn: '1h' }
            );

            return res.status(200).json({
                message: 'Login successful',
                token,
                user: { id: user.id, name: user.name, email: user.email }
            });
        });
    } catch (error) {
        console.error('Login Server Error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports = { register, login };