CREATE DATABASE IF NOT EXISTS studyledger;
USE studyledger;

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  student_id VARCHAR(30),
  email VARCHAR(120) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  required_attendance TINYINT DEFAULT 70,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE transactions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  type ENUM('income','expense') NOT NULL,
  category VARCHAR(50) NOT NULL,
  amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
  txn_date DATE NOT NULL,
  note VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE budgets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  month CHAR(7) NOT NULL,              
  limit_amount DECIMAL(10,2) NOT NULL,
  UNIQUE KEY uq_user_month (user_id, month),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE semesters (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  name VARCHAR(50) NOT NULL,           
  sort_order INT DEFAULT 0,
  is_current TINYINT(1) DEFAULT 0,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE courses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  semester_id INT NOT NULL,
  course_code VARCHAR(20) NOT NULL,
  course_name VARCHAR(120) NOT NULL,
  credit DECIMAL(3,1) NOT NULL,
  grade_letter VARCHAR(3),             
  attendance_total INT DEFAULT 0,
  attendance_present INT DEFAULT 0,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (semester_id) REFERENCES semesters(id) ON DELETE CASCADE
);

CREATE TABLE marks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  course_id INT NOT NULL,
  type ENUM('quiz','mid','assignment','final','lab','other') NOT NULL,
  title VARCHAR(100),
  obtained DECIMAL(6,2) NOT NULL,
  total DECIMAL(6,2) NOT NULL,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

CREATE TABLE lessons (
  id INT AUTO_INCREMENT PRIMARY KEY,
  topic ENUM('cpp','java','mysql') NOT NULL,
  title VARCHAR(150) NOT NULL,
  summary VARCHAR(255),
  content TEXT NOT NULL,               
  code_example TEXT,
  common_mistakes TEXT,
  practice_tasks TEXT,
  sort_order INT DEFAULT 0
);

CREATE TABLE lesson_tips (
  id INT AUTO_INCREMENT PRIMARY KEY,
  topic ENUM('cpp','java','mysql','general') NOT NULL,
  tip VARCHAR(300) NOT NULL
);

CREATE TABLE lesson_progress (          
  user_id INT NOT NULL,
  lesson_id INT NOT NULL,
  completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, lesson_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE
);

CREATE TABLE chat_faq (
  id INT AUTO_INCREMENT PRIMARY KEY,
  category VARCHAR(50) NOT NULL,
  keywords VARCHAR(500) NOT NULL,      
  answer TEXT NOT NULL,
  next_steps VARCHAR(600),             
  link_label VARCHAR(60),
  link_path VARCHAR(100)               
);

CREATE TABLE chat_history (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  sender ENUM('user','bot') NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);