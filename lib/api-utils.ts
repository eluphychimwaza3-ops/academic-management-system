import { API_ENDPOINTS } from "./api-config"

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export const apiCall = async <T = any>(
  method: string,
  endpoint: string,
  data?: Record<string, any>,
): Promise<ApiResponse<T>> => {
  try {
    const options: RequestInit = {
      method,
      headers: {
        "Content-Type": "application/json",
      },
    }

    if (data && (method === "POST" || method === "PUT" || method === "DELETE")) {
      options.body = JSON.stringify(data)
    }

    const response = await fetch(endpoint, options)

    if (!response.ok) {
      try {
        const contentType = response.headers.get("content-type")
        if (contentType?.includes("application/json")) {
          const errorData = await response.json()
          return {
            success: false,
            error: errorData.error || `HTTP ${response.status} Error`,
          }
        } else {
          // Server returned HTML error page instead of JSON
          return {
            success: false,
            error: `Server error: ${response.statusText}. Please check your API endpoint or server logs.`,
          }
        }
      } catch {
        return {
          success: false,
          error: `Server error: ${response.statusText}`,
        }
      }
    }

    const result = await response.json()
    return {
      success: true,
      data: result,
      message: result.message,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "An error occurred",
    }
  }
}

// CRUD operations for courses
export const coursesApi = {
  getAll: () => apiCall("GET", API_ENDPOINTS.academic.courses),
  getOne: (id: number) => apiCall("GET", `${API_ENDPOINTS.academic.getResource}?type=course&id=${id}`),
  create: (data: Record<string, any>) => apiCall("POST", API_ENDPOINTS.academic.courses, data),
  update: (id: number, data: Record<string, any>) =>
    apiCall("PUT", API_ENDPOINTS.academic.courses, { course_id: id, ...data }),
  delete: (id: number) => apiCall("DELETE", API_ENDPOINTS.academic.courses, { course_id: id }),
}

// CRUD operations for users
export const usersApi = {
  getAll: () => apiCall("GET", API_ENDPOINTS.admin.users),
  getOne: (id: number) => apiCall("GET", `${API_ENDPOINTS.academic.getResource}?type=user&id=${id}`),
  create: (data: Record<string, any>) => apiCall("POST", API_ENDPOINTS.admin.users, data),
  update: (id: number, data: Record<string, any>) =>
    apiCall("PUT", API_ENDPOINTS.admin.users, { user_id: id, ...data }),
  delete: (id: number) => apiCall("DELETE", API_ENDPOINTS.admin.users, { user_id: id }),
}

// CRUD operations for lecturers
export const lecturersApi = {
  getAll: () => apiCall("GET", API_ENDPOINTS.admin.lecturers),
  getOne: (id: number) => apiCall("GET", `${API_ENDPOINTS.academic.getResource}?type=lecturer&id=${id}`),
  create: (data: Record<string, any>) => apiCall("POST", API_ENDPOINTS.admin.lecturers, data),
  update: (id: number, data: Record<string, any>) =>
    apiCall("PUT", API_ENDPOINTS.admin.lecturers, { lecturer_id: id, ...data }),
  delete: (id: number) => apiCall("DELETE", API_ENDPOINTS.admin.lecturers, { lecturer_id: id }),
}

// CRUD operations for assignments
export const assignmentsApi = {
  getAll: (lecturerId?: number, studentId?: number) => {
    const params = new URLSearchParams()
    if (lecturerId) params.append("lecturerId", lecturerId.toString())
    if (studentId) params.append("studentId", studentId.toString())
    return apiCall(
      "GET",
      `${API_ENDPOINTS.academic.assignments}${params.toString() ? "?" + params.toString() : ""}`,
    )
  },
  getOne: (id: number) => apiCall("GET", `${API_ENDPOINTS.academic.getResource}?type=assignment&id=${id}`),
  create: (data: Record<string, any>) => apiCall("POST", API_ENDPOINTS.academic.assignments, data),
  update: (id: number, data: Record<string, any>) =>
    apiCall("PUT", API_ENDPOINTS.academic.assignments, {
      assignment_id: id,
      ...data,
    }),
  delete: (id: number) =>
    apiCall("DELETE", API_ENDPOINTS.academic.assignments, {
      assignment_id: id,
    }),
}

// CRUD operations for subjects
export const subjectsApi = {
  getAll: (lecturerId?: number) =>
    apiCall(
      "GET",
      lecturerId ? `${API_ENDPOINTS.user.subjects}?lecturerId=${lecturerId}` : API_ENDPOINTS.user.subjects,
    ),
  getOne: (id: number) => apiCall("GET", `${API_ENDPOINTS.academic.getResource}?type=subject&id=${id}`),
  create: (data: Record<string, any>) => apiCall("POST", API_ENDPOINTS.user.subjects, data),
  update: (id: number, data: Record<string, any>) =>
    apiCall("PUT", API_ENDPOINTS.user.subjects, { subject_id: id, ...data }),
  delete: (id: number) => apiCall("DELETE", API_ENDPOINTS.user.subjects, { subject_id: id }),
}

// Operations for admissions workflow
export const admissionsApi = {
  getAll: (status?: string) =>
    apiCall(
      "GET",
      status ? `${API_ENDPOINTS.academic.admissions}?status=${status}` : API_ENDPOINTS.academic.admissions,
    ),
  getOne: (id: number) => apiCall("GET", `${API_ENDPOINTS.academic.admissions}?id=${id}`),
  submit: (data: Record<string, any>) => apiCall("POST", API_ENDPOINTS.academic.admissions, data),
  approve: (id: number, reviewedBy: number, feedback?: string) =>
    apiCall("PUT", API_ENDPOINTS.academic.admissions, {
      admission_id: id,
      application_status: "approved",
      reviewed_by: reviewedBy,
      admin_feedback: feedback || "",
    }),
  reject: (id: number, reviewedBy: number, feedback?: string) =>
    apiCall("PUT", API_ENDPOINTS.academic.admissions, {
      admission_id: id,
      application_status: "rejected",
      reviewed_by: reviewedBy,
      admin_feedback: feedback || "",
    }),
  underReview: (id: number) =>
    apiCall("PUT", API_ENDPOINTS.academic.admissions, {
      admission_id: id,
      application_status: "under_review",
    }),
}

// Operations for grades
export const gradesApi = {
  get: (submissionId?: number, studentId?: number) => {
    const params = new URLSearchParams()
    if (submissionId) params.append("submissionId", submissionId.toString())
    if (studentId) params.append("studentId", studentId.toString())
    return apiCall("GET", `${API_ENDPOINTS.academic.gradeManagement}?${params.toString()}`)
  },
  submit: (data: Record<string, any>) => apiCall("POST", API_ENDPOINTS.academic.gradeManagement, data),
}

// Operations for submissions
export const submissionsApi = {
  getAll: (assignmentId?: number, studentId?: number, lecturerId?: number) => {
    const params = new URLSearchParams()
    if (assignmentId) params.append("assignmentId", assignmentId.toString())
    if (studentId) params.append("studentId", studentId.toString())
    if (lecturerId) params.append("lecturerId", lecturerId.toString())
    return apiCall("GET", `${API_ENDPOINTS.academic.submissions}?${params.toString()}`)
  },
  create: (data: Record<string, any>) => apiCall("POST", API_ENDPOINTS.academic.submissions, data),
  update: (id: number, data: Record<string, any>) =>
    apiCall("PUT", API_ENDPOINTS.academic.submissions, {
      submission_id: id,
      ...data,
    }),
}

// Operations for enrollments
export const enrollmentsApi = {
  getAll: (studentId?: number, courseId?: number) => {
    const params = new URLSearchParams()
    if (studentId) params.append("studentId", studentId.toString())
    if (courseId) params.append("courseId", courseId.toString())
    return apiCall("GET", `${API_ENDPOINTS.academic.enrollments}?${params.toString()}`)
  },
  create: (data: Record<string, any>) => apiCall("POST", API_ENDPOINTS.academic.enrollments, data),
  update: (id: number, data: Record<string, any>) =>
    apiCall("PUT", API_ENDPOINTS.academic.enrollments, {
      enrollment_id: id,
      ...data,
    }),
  delete: (id: number) => apiCall("DELETE", API_ENDPOINTS.academic.enrollments, { enrollment_id: id }),
}

// Operations for document management
export const documentsApi = {
  getAll: (admissionId: number) => apiCall("GET", `${API_ENDPOINTS.academic.documents}?admission_id=${admissionId}`),
  upload: async (admissionId: number, documentType: string, file: File) => {
    const formData = new FormData()
    formData.append("admission_id", admissionId.toString())
    formData.append("document_type", documentType)
    formData.append("file", file)

    try {
      const response = await fetch(API_ENDPOINTS.academic.documents, {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        return {
          success: false,
          error: data.error || "Upload failed",
        }
      }

      const data = await response.json()
      return {
        success: true,
        data,
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      }
    }
  },
  delete: (documentId: number) => apiCall("DELETE", API_ENDPOINTS.academic.documents, { document_id: documentId }),
}
