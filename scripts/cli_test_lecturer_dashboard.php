<?php
require_once __DIR__ . '/../api/config/db.php';

$lecturerId = $argv[1] ?? 4;
try {
    // total students
    $totalStudentsSql = "SELECT COUNT(DISTINCT e.student_id) as count FROM enrollments e JOIN subjects s ON e.course_id = s.course_id WHERE s.lecturer_id = ?";
    $res = executeQuery($totalStudentsSql, [$lecturerId]);
    var_dump($res);

    // active courses
    $activeCourseSql = "SELECT COUNT(DISTINCT s.course_id) as count FROM subjects s WHERE s.lecturer_id = ? AND s.status = 'active'";
    $res2 = executeQuery($activeCourseSql, [$lecturerId]);
    var_dump($res2);

    // pending assignments
    $pendingAssignmentsSql = "SELECT COUNT(*) as count FROM assignments WHERE lecturer_id = ?";
    $res3 = executeQuery($pendingAssignmentsSql, [$lecturerId]);
    var_dump($res3);

    // pending submissions
    $pendingSubmissionsSql = "SELECT COUNT(*) as count FROM submissions s JOIN assignments a ON s.assignment_id = a.assignment_id WHERE a.lecturer_id = ? AND s.status != 'graded'";
    $res4 = executeQuery($pendingSubmissionsSql, [$lecturerId]);
    var_dump($res4);

} catch (Exception $e) {
    echo 'Exception: ' . $e->getMessage() . PHP_EOL;
}
