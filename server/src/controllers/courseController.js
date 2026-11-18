const db = require('../config/db');

// ইউজারের সব কোর্স পাওয়ার জন্য
const getCourses = (req, res) => {
    let query = "SELECT * FROM courses";
    
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching courses:', err.message);
            return res.status(500).json({ message: 'Database error while fetching courses' });
        }
        return res.status(200).json({ courses: results });
    });
};

// নতুন কোর্স যোগ করার জন্য
const addCourse = (req, res) => {
    const { course_code, course_name, credit } = req.body;

    if (!course_code || !course_name) {
        return res.status(400).json({ message: 'Course code and course name are required' });
    }

    // প্রথমে চেক করা বা নিশ্চিত করা যে semesters টেবিলে একটি ডিফল্ট সেমিস্টার আছে কি না
    const checkSemesterQuery = "SELECT id FROM semesters LIMIT 1";

    db.query(checkSemesterQuery, (err, semResults) => {
        let semesterId = 1;

        if (semResults && semResults.length > 0) {
            semesterId = semResults[0].id;
        } else {
            // যদি কোনো সেমিস্টার না থাকে, তবে কোড দিয়েই একটি ডিফল্ট সেমিস্টার বানিয়ে নেওয়া হবে
            db.query("INSERT INTO semesters (user_id, name) VALUES (1, 'Default Semester')", (insErr, insRes) => {
                if (!insErr) {
                    semesterId = insRes.insertId;
                }
            });
        }

        // এরপর কোর্স ইনসার্ট করা
        const query = `INSERT INTO courses (user_id, semester_id, course_code, course_name, credit) VALUES (?, ?, ?, ?, ?)`;
        
        const values = [
            1,                    // default user_id
            semesterId,           // valid semester_id from database
            course_code, 
            course_name, 
            credit || 3.0
        ];

        db.query(query, values, (dbErr, result) => {
            if (dbErr) {
                console.error('Error adding course:', dbErr.message);
                return res.status(500).json({ message: 'Database error while adding course: ' + dbErr.message });
            }
            return res.status(201).json({ message: 'Course added successfully', courseId: result.insertId });
        });
    });
};

// নির্দিষ্ট কোর্স ডিলিট বা ড্রপ করার জন্য
const deleteCourse = (req, res) => {
    const courseId = req.params.id;
    const query = "DELETE FROM courses WHERE id = ?";

    db.query(query, [courseId], (err, result) => {
        if (err) {
            console.error('Error deleting course:', err.message);
            return res.status(500).json({ message: 'Database error while deleting course' });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Course not found' });
        }

        return res.status(200).json({ message: 'Course deleted successfully' });
    });
};

module.exports = { getCourses, addCourse, deleteCourse };