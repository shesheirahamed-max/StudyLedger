import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Courses = () => {
    const [courses, setCourses] = useState([]);
    const [formData, setFormData] = useState({
        course_code: '',
        course_name: '',
        credit: ''
    });

    // ব্যাকএন্ড থেকে কোর্সগুলো ফেচ করা
    const fetchCourses = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/courses');
            setCourses(response.data.courses);
        } catch (error) {
            console.error('Error fetching courses:', error);
        }
    };

    useEffect(() => {
        fetchCourses();
    }, []);

    // ইনপুট ফিল্ড হ্যান্ডেল করা
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // নতুন কোর্স অ্যাড করার সাবমিট হ্যান্ডলার
    const handleAddCourse = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:5000/api/courses/add', formData);
            setFormData({ course_code: '', course_name: '', credit: '' });
            fetchCourses(); // লিস্ট রিফ্রেশ করা
        } catch (error) {
            console.error('Error adding course:', error);
        }
    };

    // কোর্স ডিলিট বা ড্রপ করার হ্যান্ডলার
    const handleDeleteCourse = async (id) => {
        try {
            await axios.delete(`http://localhost:5000/api/courses/delete/${id}`);
            fetchCourses(); // লিস্ট রিফ্রেশ করা
        } catch (error) {
            console.error('Error deleting course:', error);
        }
    };

    return (
        <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
            <h2>StudyLedger - Course Management</h2>

            {/* কোর্স অ্যাড করার ফর্ম */}
            <form onSubmit={handleAddCourse} style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
                <input
                    type="text"
                    name="course_code"
                    placeholder="Course Code (e.g., CSE-311)"
                    value={formData.course_code}
                    onChange={handleChange}
                    required
                    style={{ padding: '8px' }}
                />
                <input
                    type="text"
                    name="course_name"
                    placeholder="Course Name"
                    value={formData.course_name}
                    onChange={handleChange}
                    required
                    style={{ padding: '8px', flex: 1 }}
                />
                <input
                    type="number"
                    step="0.5"
                    name="credit"
                    placeholder="Credit"
                    value={formData.credit}
                    onChange={handleChange}
                    style={{ padding: '8px', width: '80px' }}
                />
                <button type="submit" style={{ padding: '8px 15px', background: '#007bff', color: '#fff', border: 'none', cursor: 'pointer' }}>
                    Add Course
                </button>
            </form>

            {/* কোর্স লিস্ট টেবিল */}
            <table border="1" cellPadding="10" style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                    <tr style={{ background: '#f4f4f4' }}>
                        <th>Course Code</th>
                        <th>Course Name</th>
                        <th>Credit</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {courses.length > 0 ? (
                        courses.map((course) => (
                            <tr key={course.id}>
                                <td>{course.course_code}</td>
                                <td>{course.course_name}</td>
                                <td>{course.credit}</td>
                                <td>
                                    <button 
                                        onClick={() => handleDeleteCourse(course.id)}
                                        style={{ background: '#dc3545', color: '#fff', border: 'none', padding: '5px 10px', cursor: 'pointer' }}
                                    >
                                        Drop / Delete
                                    </button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="4" style={{ textAlign: 'center' }}>No courses found. Add your courses above!</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default Courses;