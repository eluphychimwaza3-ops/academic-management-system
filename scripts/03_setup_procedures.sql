-- College Management System (CMS) - Database Procedures and Functions
-- Version: 1.0

USE college_management_system;

-- ============================================
-- PROCEDURE: Calculate Student GPA
-- ============================================
DELIMITER $$

CREATE PROCEDURE CalculateStudentGPA(
    IN p_student_id INT,
    OUT p_gpa DECIMAL(3,2)
)
BEGIN
    SELECT AVG(
        CASE 
            WHEN grade_letter = 'A+' THEN 4.0
            WHEN grade_letter = 'A' THEN 4.0
            WHEN grade_letter = 'B+' THEN 3.5
            WHEN grade_letter = 'B' THEN 3.0
            WHEN grade_letter = 'C+' THEN 2.5
            WHEN grade_letter = 'C' THEN 2.0
            WHEN grade_letter = 'D+' THEN 1.5
            WHEN grade_letter = 'D' THEN 1.0
            ELSE 0.0
        END
    ) INTO p_gpa
    FROM course_grades
    WHERE student_id = p_student_id AND status = 'finalized';
    
    IF p_gpa IS NULL THEN
        SET p_gpa = 0.0;
    END IF;
END$$

DELIMITER ;

-- ============================================
-- PROCEDURE: Update Assignment Status
-- ============================================
DELIMITER $$

CREATE PROCEDURE UpdateAssignmentStatus(
    IN p_assignment_id INT,
    IN p_new_status VARCHAR(50)
)
BEGIN
    UPDATE assignments
    SET submission_status = p_new_status,
        updated_at = CURRENT_TIMESTAMP
    WHERE assignment_id = p_assignment_id;
END$$

DELIMITER ;

-- ============================================
-- PROCEDURE: Get Student Dashboard Statistics
-- ============================================
DELIMITER $$

CREATE PROCEDURE GetStudentDashboardStats(
    IN p_student_id INT
)
BEGIN
    SELECT 
        (SELECT COUNT(*) FROM enrollments WHERE student_id = p_student_id AND status = 'active') as active_courses,
        (SELECT COUNT(*) FROM submissions WHERE student_id = p_student_id AND status = 'submitted') as pending_submissions,
        (SELECT COUNT(*) FROM grades WHERE submission_id IN (SELECT submission_id FROM submissions WHERE student_id = p_student_id)) as graded_assignments,
        (SELECT AVG(CASE WHEN grade_letter = 'A+' THEN 4.0 WHEN grade_letter = 'A' THEN 4.0 WHEN grade_letter = 'B+' THEN 3.5 WHEN grade_letter = 'B' THEN 3.0 WHEN grade_letter = 'C+' THEN 2.5 WHEN grade_letter = 'C' THEN 2.0 WHEN grade_letter = 'D+' THEN 1.5 WHEN grade_letter = 'D' THEN 1.0 ELSE 0.0 END) FROM course_grades WHERE student_id = p_student_id AND status = 'finalized') as gpa;
END$$

DELIMITER ;

-- ============================================
-- FUNCTION: Get Letter Grade from Percentage
-- ============================================
DELIMITER $$

CREATE FUNCTION GetLetterGrade(percentage DECIMAL(5,2))
RETURNS ENUM('A+', 'A', 'B+', 'B', 'C+', 'C', 'D+', 'D', 'F')
DETERMINISTIC
BEGIN
    DECLARE grade ENUM('A+', 'A', 'B+', 'B', 'C+', 'C', 'D+', 'D', 'F');
    
    IF percentage >= 95 THEN
        SET grade = 'A+';
    ELSEIF percentage >= 90 THEN
        SET grade = 'A';
    ELSEIF percentage >= 85 THEN
        SET grade = 'B+';
    ELSEIF percentage >= 80 THEN
        SET grade = 'B';
    ELSEIF percentage >= 75 THEN
        SET grade = 'C+';
    ELSEIF percentage >= 70 THEN
        SET grade = 'C';
    ELSEIF percentage >= 65 THEN
        SET grade = 'D+';
    ELSEIF percentage >= 60 THEN
        SET grade = 'D';
    ELSE
        SET grade = 'F';
    END IF;
    
    RETURN grade;
END$$

DELIMITER ;

-- ============================================
-- FUNCTION: Check If Submission Is Late
-- ============================================
DELIMITER $$

CREATE FUNCTION IsSubmissionLate(
    submission_date DATETIME,
    assignment_due_date DATETIME
)
RETURNS BOOLEAN
DETERMINISTIC
BEGIN
    RETURN submission_date > assignment_due_date;
END$$

DELIMITER ;

COMMIT;
