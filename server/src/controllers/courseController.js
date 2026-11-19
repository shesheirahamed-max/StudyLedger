const db = require('../config/db');
const jwt = require('jsonwebtoken');

const getAuthenticatedUserId = (req) => {
    if (req.user && req.user.id) {
        return Number(req.user.id);
    }

    const authHeader = req.headers['authorization'];
    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_key');
            if (decoded && decoded.id) return Number(decoded.id);
        } catch (err) {
            return null;
        }
    }

    return null;
};

// ইউজারের নিজস্ব কোর্সগুলো পাওয়ার জন্য
const getCourses = (req, res) => {
    const userId = getAuthenticatedUserId(req);

    if (!userId) {
        return res.status(200).json({ courses: [] });
    }

    const query = "SELECT * FROM courses WHERE user_id = ? ORDER BY id DESC";

    db.query(query, [userId], (err, results) => {
        if (err) {
            console.error('Error fetching courses:', err.message);
            return res.status(500).json({ message: 'Database error while fetching courses' });
        }
        return res.status(200).json({ courses: results || [] });
    });
};

// নতুন কোর্স শুধু লগইন করা ইউজারের নামে যোগ করার জন্য
const addCourse = (req, res) => {
    const userId = getAuthenticatedUserId(req);
    const { course_code, course_name, credit } = req.body;

    if (!userId) {
        return res.status(401).json({ message: 'Unauthorized: please login again' });
    }

    if (!course_code || !course_name) {
        return res.status(400).json({ message: 'Course code and course name are required' });
    }

    const parsedCredit = credit !== '' && credit !== undefined && credit !== null ? Number(credit) : 3.0;
    const safeCredit = Number.isNaN(parsedCredit) ? 3.0 : parsedCredit;

    const insertCourseNow = (semesterId) => {
        const query = `
            INSERT INTO courses
            (user_id, semester_id, course_code, course_name, credit, grade_letter, attendance_total, attendance_present)
            VALUES (?, ?, ?, ?, ?, NULL, 0, 0)
        `;
        const values = [
            userId,
            semesterId,
            String(course_code).trim(),
            String(course_name).trim(),
            safeCredit
        ];

        db.query(query, values, (dbErr, result) => {
            if (dbErr) {
                console.error('Error adding course:', dbErr.message);
                return res.status(500).json({ message: 'Database error while adding course: ' + dbErr.message });
            }
            return res.status(201).json({
                message: 'Course added successfully',
                courseId: result.insertId
            });
        });
    };

    db.query("SELECT id FROM semesters WHERE user_id = ? LIMIT 1", [userId], (err, semResults) => {
        if (!err && semResults && semResults.length > 0) {
            return insertCourseNow(semResults[0].id);
        }

        db.query("SELECT id FROM semesters LIMIT 1", (anyErr, anySem) => {
            if (!anyErr && anySem && anySem.length > 0) {
                return insertCourseNow(anySem[0].id);
            }

            db.query(
                "INSERT INTO semesters (user_id, name) VALUES (?, 'Default Semester')",
                [userId],
                (insErr, insRes) => {
                    const semId = !insErr && insRes ? insRes.insertId : 1;
                    return insertCourseNow(semId);
                }
            );
        });
    });
};

// নির্দিষ্ট কোর্স শুধু ওই ইউজারের হলে ডিলিট করার জন্য
const deleteCourse = (req, res) => {
    const userId = getAuthenticatedUserId(req);
    const courseId = Number(req.params.id);

    if (!userId) {
        return res.status(401).json({ message: 'Unauthorized: please login again' });
    }

    const query = "DELETE FROM courses WHERE id = ? AND user_id = ?";

    db.query(query, [courseId, userId], (err, result) => {
        if (err) {
            console.error('Error deleting course:', err.message);
            return res.status(500).json({ message: 'Database error while deleting course' });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Course not found or not owned by this user' });
        }

        return res.status(200).json({ message: 'Course deleted successfully' });
    });
};

module.exports = { getCourses, addCourse, deleteCourse };