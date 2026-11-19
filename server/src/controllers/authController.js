const db = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Register Function
const register = async (req, res) => {
    try {
        let { name, email, password, student_id } = req.body;

        name = typeof name === 'string' ? name.trim() : '';
        email = typeof email === 'string' ? email.trim().toLowerCase() : '';
        student_id = typeof student_id === 'string' && student_id.trim() !== '' ? student_id.trim() : null;

        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Name, email, and password are required' });
        }

        db.query("SELECT id FROM users WHERE email = ?", [email], async (err, results) => {
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
                    "INSERT INTO users (name, student_id, email, password_hash) VALUES (?, ?, ?, ?)",
                    [name, student_id, email, password_hash],
                    (insertErr, insertResult) => {
                        if (insertErr) {
                            console.error('Insert Error:', insertErr);
                            return res.status(500).json({ message: 'Error saving user' });
                        }
                        return res.status(201).json({
                            message: 'User registered successfully',
                            user: {
                                id: insertResult.insertId,
                                name,
                                student_id,
                                email
                            }
                        });
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
        let { email, password } = req.body;
        email = typeof email === 'string' ? email.trim().toLowerCase() : '';

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

            const isMatch = await bcrypt.compare(password, user.password_hash);
            if (!isMatch) {
                return res.status(400).json({ message: 'Invalid email or password' });
            }

            const token = jwt.sign(
                { id: user.id, email: user.email },
                process.env.JWT_SECRET || 'secret_key',
                { expiresIn: '1d' }
            );

            return res.status(200).json({
                message: 'Login successful',
                token,
                user: {
                    id: user.id,
                    name: user.name,
                    student_id: user.student_id,
                    email: user.email
                }
            });
        });
    } catch (error) {
        console.error('Login Server Error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports = { register, login };