-- College Management System (CMS) - MySQL Database Setup
-- Version: 1.0
-- Database: college_management_system

-- Create Database
DROP DATABASE IF EXISTS college_management_system;
CREATE DATABASE college_management_system CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE college_management_system;

-- ============================================
-- TABLE: Users (Base user table for all roles)
-- ============================================
CREATE TABLE users (
  user_id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  role ENUM('admin', 'lecturer', 'student') NOT NULL,
  status ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_role (role),
  INDEX idx_status (status)
) ENGINE=InnoDB;

-- ============================================
-- TABLE: Students (Student-specific information)
-- ============================================
CREATE TABLE students (
  student_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  student_registration_number VARCHAR(50) UNIQUE,
  date_of_birth DATE,
  gender ENUM('male', 'female', 'other'),
  address VARCHAR(255),
  city VARCHAR(100),
  postal_code VARCHAR(20),
  country VARCHAR(100),
  enrollment_date DATE,
  enrollment_status ENUM('active', 'inactive', 'graduated', 'suspended') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_enrollment_status (enrollment_status)
) ENGINE=InnoDB;

-- ============================================
-- TABLE: Lecturers (Lecturer-specific information)
-- ============================================
CREATE TABLE lecturers (
  lecturer_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  employee_id VARCHAR(50) UNIQUE,
  specialization VARCHAR(255),
  department VARCHAR(100),
  qualification VARCHAR(255),
  hire_date DATE,
  office_location VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id)
) ENGINE=InnoDB;

-- ============================================
-- TABLE: Admins (Admin-specific information)
-- ============================================
CREATE TABLE admins (
  admin_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  employee_id VARCHAR(50) UNIQUE,
  department VARCHAR(100),
  hire_date DATE,
  permissions JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id)
) ENGINE=InnoDB;

-- ============================================
-- TABLE: Courses (Academic Courses/Programs)
-- ============================================
CREATE TABLE courses (
  course_id INT AUTO_INCREMENT PRIMARY KEY,
  course_code VARCHAR(50) UNIQUE NOT NULL,
  course_name VARCHAR(255) NOT NULL,
  description TEXT,
  duration_years INT,
  total_credits INT,
  department VARCHAR(100),
  status ENUM('active', 'inactive') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_course_code (course_code),
  INDEX idx_status (status)
) ENGINE=InnoDB;

-- ============================================
-- TABLE: Subjects (Subjects within courses)
-- ============================================
CREATE TABLE subjects (
  subject_id INT AUTO_INCREMENT PRIMARY KEY,
  course_id INT NOT NULL,
  subject_code VARCHAR(50) UNIQUE NOT NULL,
  subject_name VARCHAR(255) NOT NULL,
  description TEXT,
  credits INT,
  semester INT,
  lecturer_id INT,
  status ENUM('active', 'inactive') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (course_id) REFERENCES courses(course_id) ON DELETE CASCADE,
  FOREIGN KEY (lecturer_id) REFERENCES lecturers(lecturer_id) ON DELETE SET NULL,
  INDEX idx_course_id (course_id),
  INDEX idx_subject_code (subject_code),
  INDEX idx_lecturer_id (lecturer_id)
) ENGINE=InnoDB;

-- ============================================
-- TABLE: Enrollments (Student course enrollments)
-- ============================================
CREATE TABLE enrollments (
  enrollment_id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  course_id INT NOT NULL,
  enrollment_date DATE NOT NULL,
  status ENUM('active', 'completed', 'dropped') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE,
  FOREIGN KEY (course_id) REFERENCES courses(course_id) ON DELETE CASCADE,
  INDEX idx_student_id (student_id),
  INDEX idx_course_id (course_id),
  UNIQUE KEY unique_enrollment (student_id, course_id)
) ENGINE=InnoDB;

-- ============================================
-- TABLE: Admissions (Student admission applications)
-- ============================================
CREATE TABLE admissions (
  admission_id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  date_of_birth DATE,
  gender ENUM('male', 'female', 'other'),
  address VARCHAR(255),
  city VARCHAR(100),
  country VARCHAR(100),
  previous_school VARCHAR(255),
  qualification VARCHAR(255),
  year_of_completion INT,
  selected_course_id INT,
  study_mode ENUM('full-time', 'part-time') DEFAULT 'full-time',
  application_status ENUM('pending', 'under_review', 'approved', 'rejected', 'completed') DEFAULT 'pending',
  admin_feedback TEXT,
  applied_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  reviewed_date DATETIME,
  reviewed_by INT,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (selected_course_id) REFERENCES courses(course_id) ON DELETE SET NULL,
  FOREIGN KEY (reviewed_by) REFERENCES admins(admin_id) ON DELETE SET NULL,
  INDEX idx_status (application_status),
  INDEX idx_applied_date (applied_date),
  INDEX idx_email (email)
) ENGINE=InnoDB;

-- ============================================
-- TABLE: Documents (Admission application documents)
-- ============================================
CREATE TABLE documents (
  document_id INT AUTO_INCREMENT PRIMARY KEY,
  admission_id INT NOT NULL,
  document_type VARCHAR(50) NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  file_size INT,
  file_type VARCHAR(50),
  upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (admission_id) REFERENCES admissions(admission_id) ON DELETE CASCADE,
  INDEX idx_admission_id (admission_id),
  INDEX idx_document_type (document_type)
) ENGINE=InnoDB;

-- ============================================
-- TABLE: Assignments (Assignment management)
-- ============================================
CREATE TABLE assignments (
  assignment_id INT AUTO_INCREMENT PRIMARY KEY,
  subject_id INT NOT NULL,
  lecturer_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  assignment_type ENUM('homework', 'project', 'lab', 'assessment') DEFAULT 'homework',
  total_marks INT DEFAULT 100,
  instructions TEXT,
  created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  due_date DATETIME NOT NULL,
  submission_status ENUM('open', 'closed', 'under_review') DEFAULT 'open',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (subject_id) REFERENCES subjects(subject_id) ON DELETE CASCADE,
  FOREIGN KEY (lecturer_id) REFERENCES lecturers(lecturer_id) ON DELETE CASCADE,
  INDEX idx_subject_id (subject_id),
  INDEX idx_lecturer_id (lecturer_id),
  INDEX idx_due_date (due_date),
  INDEX idx_submission_status (submission_status)
) ENGINE=InnoDB;

-- ============================================
-- TABLE: Submissions (Student assignment submissions)
-- ============================================
CREATE TABLE submissions (
  submission_id INT AUTO_INCREMENT PRIMARY KEY,
  assignment_id INT NOT NULL,
  student_id INT NOT NULL,
  submission_date DATETIME NOT NULL,
  submitted_file_name VARCHAR(255),
  submitted_file_path VARCHAR(500),
  submission_text TEXT,
  status ENUM('submitted', 'late', 'graded') DEFAULT 'submitted',
  is_late BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (assignment_id) REFERENCES assignments(assignment_id) ON DELETE CASCADE,
  FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE,
  INDEX idx_assignment_id (assignment_id),
  INDEX idx_student_id (student_id),
  INDEX idx_status (status),
  UNIQUE KEY unique_submission (assignment_id, student_id)
) ENGINE=InnoDB;

-- ============================================
-- TABLE: Grades (Assignment grades)
-- ============================================
CREATE TABLE grades (
  grade_id INT AUTO_INCREMENT PRIMARY KEY,
  submission_id INT NOT NULL,
  marks_obtained INT,
  total_marks INT,
  percentage DECIMAL(5,2),
  grade_letter ENUM('A', 'B', 'C', 'D', 'F') DEFAULT 'F',
  feedback TEXT,
  graded_by INT NOT NULL,
  graded_date DATETIME,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (submission_id) REFERENCES submissions(submission_id) ON DELETE CASCADE,
  FOREIGN KEY (graded_by) REFERENCES lecturers(lecturer_id) ON DELETE CASCADE,
  INDEX idx_submission_id (submission_id),
  INDEX idx_graded_by (graded_by),
  UNIQUE KEY unique_grade (submission_id)
) ENGINE=InnoDB;

-- ============================================
-- TABLE: Course Grades (Final course grades)
-- ============================================
CREATE TABLE course_grades (
  course_grade_id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  subject_id INT NOT NULL,
  assignment_grade_percentage DECIMAL(5,2),
  exam_marks INT,
  exam_percentage DECIMAL(5,2),
  final_marks DECIMAL(5,2),
  final_percentage DECIMAL(5,2),
  grade_letter ENUM('A+', 'A', 'B+', 'B', 'C+', 'C', 'D+', 'D', 'F') DEFAULT 'F',
  status ENUM('pending', 'finalized') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE,
  FOREIGN KEY (subject_id) REFERENCES subjects(subject_id) ON DELETE CASCADE,
  INDEX idx_student_id (student_id),
  INDEX idx_subject_id (subject_id),
  UNIQUE KEY unique_course_grade (student_id, subject_id)
) ENGINE=InnoDB;

-- ============================================
-- TABLE: Audit Logs (Activity tracking)
-- ============================================
CREATE TABLE audit_logs (
  log_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  action VARCHAR(255) NOT NULL,
  entity_type VARCHAR(100),
  entity_id INT,
  old_value JSON,
  new_value JSON,
  ip_address VARCHAR(45),
  user_agent VARCHAR(500),
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_timestamp (timestamp),
  INDEX idx_action (action)
) ENGINE=InnoDB;

-- ============================================
-- TABLE: Notifications (System notifications)
-- ============================================
CREATE TABLE notifications (
  notification_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  notification_type VARCHAR(50),
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  read_at DATETIME,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_is_read (is_read)
) ENGINE=InnoDB;

-- ============================================
-- Create Indexes for Performance
-- ============================================
CREATE INDEX idx_students_user_id ON students(user_id);
CREATE INDEX idx_lecturers_user_id ON lecturers(user_id);
CREATE INDEX idx_admins_user_id ON admins(user_id);
CREATE INDEX idx_subjects_course_id ON subjects(course_id);
CREATE INDEX idx_submissions_assignment_id ON submissions(assignment_id);

COMMIT;
