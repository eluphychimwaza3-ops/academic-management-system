// API Configuration - Update this based on your hosting environment
// For XAMPP/Local: http://localhost/api
// For Bluehost: https://yourdomain.com/api
export const API_BASE_URL = "https://www.student.plu.ac.mw/api" || process.env.NEXT_PUBLIC_API_BASE_URL

// API Endpoints
export const API_ENDPOINTS = {
  // Auth
  auth: {
    login: `${API_BASE_URL}/auth/login.php`,
    signup: `${API_BASE_URL}/auth/signup.php`,
  },
  // Admin
  admin: {
    dashboard: `${API_BASE_URL}/admin/dashboard.php`,
    users: `${API_BASE_URL}/admin/users.php`,
    reports: `${API_BASE_URL}/admin/reports.php`,
    lecturers: `${API_BASE_URL}/admin/lecturers.php`,
  },
  // Academic
  academic: {
    admissions: `${API_BASE_URL}/academic/admissions.php`,
    documents: `${API_BASE_URL}/academic/documents.php`,
    gradeManagement: `${API_BASE_URL}/academic/grade-management.php`,
    enrollments: `${API_BASE_URL}/academic/enrollments.php`,
    getResource: `${API_BASE_URL}/academic/get-resource.php`,
    submissions: `${API_BASE_URL}/academic/submissions.php`,
    courses: `${API_BASE_URL}/academic/courses.php`,
    assignments: `${API_BASE_URL}/academic/assignments.php`,
    subjectGrading: `${API_BASE_URL}/academic/subject-grading.php`,
  },
  // User
  user: {
    submissions: `${API_BASE_URL}/user/submissions.php`,
    grades: `${API_BASE_URL}/user/grades.php`,
    studentDashboard: `${API_BASE_URL}/user/student-dashboard.php`,
    studentProfile: `${API_BASE_URL}/user/student-profile.php`,
    lecturerDashboard: `${API_BASE_URL}/user/lecturer-dashboard.php`,
    students: `${API_BASE_URL}/user/students.php`,
    subjects: `${API_BASE_URL}/user/subjects.php`,
    subjectStudents: `${API_BASE_URL}/user/subject-students.php`,
  },
}
