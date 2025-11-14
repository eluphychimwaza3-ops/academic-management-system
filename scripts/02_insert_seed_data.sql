-- College Management System (CMS) - Sample Data Seeds
-- Version: 1.0

USE college_management_system;

-- ============================================
-- INSERT SAMPLE ADMIN USERS
-- ============================================
INSERT INTO users (email, password, first_name, last_name, phone, role, status) VALUES
('admin@college.com', '$2y$10$8.UeNCJqNl1RTCBl5oXDH.K5l7Ov8TtVzWf3rJLZOQzI5Yk4gWmSO', 'John', 'Administrator', '1234567890', 'admin', 'active'),
('admin2@college.com', '$2y$10$8.UeNCJqNl1RTCBl5oXDH.K5l7Ov8TtVzWf3rJLZOQzI5Yk4gWmSO', 'Sarah', 'Manager', '1234567891', 'admin', 'active');

-- ============================================
-- INSERT SAMPLE LECTURER USERS
-- ============================================
INSERT INTO users (email, password, first_name, last_name, phone, role, status) VALUES
('lecturer1@college.com', '$2y$10$8.UeNCJqNl1RTCBl5oXDH.K5l7Ov8TtVzWf3rJLZOQzI5Yk4gWmSO', 'Michael', 'Smith', '2234567890', 'lecturer', 'active'),
('lecturer2@college.com', '$2y$10$8.UeNCJqNl1RTCBl5oXDH.K5l7Ov8TtVzWf3rJLZOQzI5Yk4gWmSO', 'Emily', 'Johnson', '2234567891', 'lecturer', 'active'),
('lecturer3@college.com', '$2y$10$8.UeNCJqNl1RTCBl5oXDH.K5l7Ov8TtVzWf3rJLZOQzI5Yk4gWmSO', 'David', 'Williams', '2234567892', 'lecturer', 'active');

-- ============================================
-- INSERT SAMPLE STUDENT USERS
-- ============================================
INSERT INTO users (email, password, first_name, last_name, phone, role, status) VALUES
('student1@college.com', '$2y$10$8.UeNCJqNl1RTCBl5oXDH.K5l7Ov8TtVzWf3rJLZOQzI5Yk4gWmSO', 'Alice', 'Brown', '3234567890', 'student', 'active'),
('student2@college.com', '$2y$10$8.UeNCJqNl1RTCBl5oXDH.K5l7Ov8TtVzWf3rJLZOQzI5Yk4gWmSO', 'Bob', 'Davis', '3234567891', 'student', 'active'),
('student3@college.com', '$2y$10$8.UeNCJqNl1RTCBl5oXDH.K5l7Ov8TtVzWf3rJLZOQzI5Yk4gWmSO', 'Carol', 'Miller', '3234567892', 'student', 'active'),
('student4@college.com', '$2y$10$8.UeNCJqNl1RTCBl5oXDH.K5l7Ov8TtVzWf3rJLZOQzI5Yk4gWmSO', 'Eve', 'Wilson', '3234567893', 'student', 'active');

-- ============================================
-- INSERT ADMIN DETAILS
-- ============================================
INSERT INTO admins (user_id, employee_id, department, hire_date) VALUES
(1, 'ADM001', 'Administration', '2023-01-15'),
(2, 'ADM002', 'Administration', '2023-06-01');

-- ============================================
-- INSERT LECTURER DETAILS
-- ============================================
INSERT INTO lecturers (user_id, employee_id, specialization, department, qualification, hire_date, office_location) VALUES
(3, 'LEC001', 'Software Engineering', 'IT', 'M.Tech CSE', '2022-08-20', 'Block A - 201'),
(4, 'LEC002', 'Web Development', 'IT', 'B.Tech IT', '2023-01-10', 'Block A - 202'),
(5, 'LEC003', 'Database Management', 'IT', 'M.Tech Database', '2022-11-05', 'Block A - 203');

-- ============================================
-- INSERT STUDENT DETAILS
-- ============================================
INSERT INTO students (user_id, student_registration_number, date_of_birth, gender, address, city, postal_code, country, enrollment_date, enrollment_status) VALUES
(6, 'STU2024001', '2005-03-15', 'female', '123 Main St', 'New York', '10001', 'USA', '2024-01-15', 'active'),
(7, 'STU2024002', '2004-07-22', 'male', '456 Oak Ave', 'Boston', '02101', 'USA', '2024-01-15', 'active'),
(8, 'STU2024003', '2005-11-08', 'female', '789 Pine Rd', 'Chicago', '60601', 'USA', '2024-01-15', 'active'),
(9, 'STU2024004', '2004-05-30', 'male', '321 Elm St', 'Houston', '77001', 'USA', '2024-01-15', 'active');

-- ============================================
-- INSERT COURSES
-- ============================================
INSERT INTO courses (course_code, course_name, description, duration_years, total_credits, department, status) VALUES
('CS101', 'Bachelor of Technology in Computer Science', 'Comprehensive 4-year program covering software development, databases, and web technologies', 4, 120, 'IT', 'active'),
('IT101', 'Bachelor of Technology in Information Technology', 'IT program focused on enterprise solutions and network management', 4, 120, 'IT', 'active'),
('CS201', 'Bachelor of Science in Computer Science', '3-year specialized program in computer science fundamentals', 3, 90, 'IT', 'active');

-- ============================================
-- INSERT SUBJECTS
-- ============================================
INSERT INTO subjects (course_id, subject_code, subject_name, description, credits, semester, lecturer_id, status) VALUES
(1, 'CS101', 'Introduction to Programming', 'Learn the basics of programming with Python', 4, 1, 3, 'active'),
(1, 'CS102', 'Data Structures', 'Comprehensive course on data structures and algorithms', 4, 2, 3, 'active'),
(1, 'CS103', 'Web Development Basics', 'Introduction to HTML, CSS, and JavaScript', 4, 2, 4, 'active'),
(1, 'CS104', 'Database Management Systems', 'Learn relational databases and SQL', 4, 3, 5, 'active'),
(2, 'IT101', 'IT Fundamentals', 'Basics of information technology', 3, 1, 3, 'active'),
(2, 'IT102', 'Network Security', 'Introduction to cybersecurity and network protection', 3, 3, 4, 'active');

-- ============================================
-- INSERT STUDENT ENROLLMENTS
-- ============================================
INSERT INTO enrollments (student_id, course_id, enrollment_date, status) VALUES
(1, 1, '2024-01-15', 'active'),
(2, 1, '2024-01-15', 'active'),
(3, 2, '2024-01-15', 'active'),
(4, 3, '2024-01-15', 'active');

-- ============================================
-- INSERT ADMISSION APPLICATIONS
-- ============================================
INSERT INTO admissions (first_name, last_name, email, phone, date_of_birth, gender, address, city, country, previous_school, qualification, year_of_completion, selected_course_id, study_mode, application_status, admin_feedback, applied_date, reviewed_date, reviewed_by) VALUES
('John', 'Pending', 'john.pending@email.com', '5555555501', '2005-01-10', 'male', '100 Test St', 'Test City', 'USA', 'Central High School', 'High School Diploma', 2023, 1, 'full-time', 'pending', NULL, '2024-11-01 10:00:00', NULL, NULL),
('Jane', 'Approved', 'jane.approved@email.com', '5555555502', '2004-05-20', 'female', '200 Test Ave', 'Test City', 'USA', 'North High School', 'High School Diploma', 2023, 1, 'full-time', 'approved', 'Application meets all requirements. Welcome to our college!', '2024-11-02 14:30:00', '2024-11-05 09:15:00', 1),
('Mike', 'Rejected', 'mike.rejected@email.com', '5555555503', '2003-12-15', 'male', '300 Test Rd', 'Test City', 'USA', 'South High School', 'High School Diploma', 2022, 2, 'part-time', 'rejected', 'Unfortunately, your application does not meet our current requirements.', '2024-11-03 11:45:00', '2024-11-06 10:20:00', 1);

-- ============================================
-- INSERT ASSIGNMENTS
-- ============================================
INSERT INTO assignments (subject_id, lecturer_id, title, description, assignment_type, total_marks, instructions, due_date, submission_status) VALUES
(1, 3, 'Python Basics - Hello World', 'Create a simple Python program that prints a greeting message', 'homework', 10, 'Use Python 3.9 or above. Submit as .py file.', '2024-12-15 23:59:59', 'open'),
(1, 3, 'Programming Fundamentals Project', 'Build a calculator application using loops and functions', 'project', 50, 'Include documentation. Submit code and report.', '2024-12-25 23:59:59', 'open'),
(2, 3, 'Data Structures Assignment', 'Implement stack and queue data structures', 'assessment', 40, 'Code should be well-commented and tested.', '2024-12-20 23:59:59', 'open'),
(3, 4, 'HTML & CSS Website Project', 'Create a responsive personal portfolio website', 'project', 50, 'Must be responsive. Use CSS Grid or Flexbox.', '2024-12-30 23:59:59', 'open'),
(4, 5, 'SQL Queries Assignment', 'Write and optimize 10 SQL queries', 'homework', 25, 'Use the provided database. Submit queries and output.', '2024-12-18 23:59:59', 'open');

-- ============================================
-- INSERT SUBMISSIONS
-- ============================================
INSERT INTO submissions (assignment_id, student_id, submission_date, submitted_file_name, submission_text, status, is_late) VALUES
(1, 1, '2024-12-10 15:30:00', 'hello_world.py', 'Simple Python program', 'submitted', FALSE),
(1, 2, '2024-12-14 22:45:00', 'hello_program.py', 'Python greeting program', 'submitted', FALSE),
(2, 1, '2024-12-22 18:20:00', 'calculator_project.zip', 'Calculator application with documentation', 'submitted', FALSE),
(3, 2, '2024-12-19 14:15:00', 'data_structures.py', 'Stack and Queue implementation', 'submitted', FALSE),
(4, 3, '2024-12-28 10:30:00', 'portfolio.html', 'Personal portfolio website', 'submitted', FALSE);

-- ============================================
-- INSERT GRADES
-- ============================================
INSERT INTO grades (submission_id, marks_obtained, total_marks, percentage, grade_letter, feedback, graded_by, graded_date) VALUES
(1, 9, 10, 90.00, 'A', 'Excellent work! Clean code and good logic.', 3, '2024-12-11 10:00:00'),
(2, 7, 10, 70.00, 'C', 'Good effort. Could add more features.', 3, '2024-12-15 11:00:00'),
(3, 45, 50, 90.00, 'A', 'Outstanding project! Well-structured code.', 3, '2024-12-23 09:30:00'),
(4, 38, 40, 95.00, 'A', 'Perfect implementation! Great understanding.', 3, '2024-12-20 14:00:00');

-- ============================================
-- INSERT COURSE GRADES
-- ============================================
INSERT INTO course_grades (student_id, subject_id, assignment_grade_percentage, exam_marks, exam_percentage, final_marks, final_percentage, grade_letter, status) VALUES
(1, 1, 90.00, 85, 85.00, 87.50, 87.50, 'A', 'finalized'),
(2, 1, 70.00, 75, 75.00, 72.50, 72.50, 'B+', 'finalized'),
(2, 2, 95.00, 92, 92.00, 93.50, 93.50, 'A+', 'finalized'),
(3, 3, NULL, NULL, NULL, NULL, NULL, 'F', 'pending');

-- ============================================
-- INSERT AUDIT LOGS
-- ============================================
INSERT INTO audit_logs (user_id, action, entity_type, entity_id, timestamp) VALUES
(1, 'USER_LOGIN', 'User', 1, NOW()),
(3, 'ASSIGNMENT_CREATED', 'Assignment', 1, NOW()),
(6, 'SUBMISSION_CREATED', 'Submission', 1, NOW());

-- ============================================
-- INSERT NOTIFICATIONS
-- ============================================
INSERT INTO notifications (user_id, title, message, notification_type, is_read) VALUES
(6, 'Assignment Due Tomorrow', 'Your assignment for Python Basics is due tomorrow at 11:59 PM.', 'reminder', FALSE),
(7, 'Grade Posted', 'Your grade for Python Basics has been posted by your instructor.', 'grade', FALSE),
(3, 'New Submission', 'Alice Brown has submitted the Python Basics assignment.', 'submission', FALSE);

COMMIT;
