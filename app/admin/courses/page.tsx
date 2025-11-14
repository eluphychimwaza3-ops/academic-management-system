"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Edit, Trash2, AlertCircle, BookOpen, Unlink } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { coursesApi, subjectsApi, lecturersApi } from "@/lib/api-utils"

interface Course {
  course_id: number
  course_code: string
  course_name: string
  description: string
  duration_years: number
  total_credits: number
  department: string
  status: string
  created_at: string
}

interface Subject {
  subject_id: number
  course_id: number
  subject_code: string
  subject_name: string
  description: string
  credits: number
  semester: number
  lecturer_id: number | null
  lecturer_name?: string | null
  status: string
}

interface Lecturer {
  lecturer_id: number
  user_id: number
  first_name: string
  last_name: string
  employee_id: string
  specialization?: string
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [lecturers, setLecturers] = useState<Lecturer[]>([])
  const [loading, setLoading] = useState(true)
  const [lecturersLoading, setLecturersLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isSubjectDialogOpen, setIsSubjectDialogOpen] = useState(false)
  const [editingCourse, setEditingCourse] = useState<Course | null>(null)
  const [selectedCourseForSubjects, setSelectedCourseForSubjects] = useState<Course | null>(null)
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [subjectsLoading, setSubjectsLoading] = useState(false)
  const [formData, setFormData] = useState({
    course_code: "",
    course_name: "",
    description: "",
    duration_years: 1,
    total_credits: 30,
    department: "",
    status: "active",
  })
  const [subjectFormData, setSubjectFormData] = useState({
    subject_code: "",
    subject_name: "",
    description: "",
    credits: 3,
    semester: 1,
    status: "active",
    lecturer_id: null as number | null,
  })

  useEffect(() => {
    fetchCourses()
    fetchLecturers()
  }, [])

  useEffect(() => {
    console.log("Lecturers state updated:", lecturers, "Loading:", lecturersLoading)
  }, [lecturers, lecturersLoading])

  const fetchCourses = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await coursesApi.getAll()
      if (response.success && response.data) {
        setCourses(Array.isArray(response.data) ? response.data : [])
      } else {
        setError(response.error || "Failed to fetch courses")
        setCourses([])
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
      setCourses([])
    } finally {
      setLoading(false)
    }
  }

  const fetchLecturers = async () => {
    try {
      setLecturersLoading(true)
      console.log("Starting fetchLecturers...")
      
      const response = await lecturersApi.getAll()
      console.log("Lecturers fetch response:", response)
      
      if (response.success && response.data) {
        const lecturersData = Array.isArray(response.data) ? response.data : response.data.data || []
        console.log("Fetched lecturers data:", lecturersData)
        console.log("Array length:", lecturersData.length)
        
        if (lecturersData.length > 0) {
          console.log("✓ Lecturers loaded, count:", lecturersData.length)
          console.log("First lecturer:", lecturersData[0])
          setLecturers(lecturersData)
        } else {
          console.warn("✗ No lecturers found in response")
          setLecturers([])
        }
      } else {
        console.error("✗ Failed to fetch lecturers:", response.error)
        setLecturers([])
      }
    } catch (err) {
      console.error("✗ Failed to fetch lecturers:", err)
      setLecturers([])
    } finally {
      setLecturersLoading(false)
    }
  }
///
  const handleCreateNew = () => {
    setEditingCourse(null)
    setFormData({
      course_code: "",
      course_name: "",
      description: "",
      duration_years: 1,
      total_credits: 30,
      department: "",
      status: "active",
    })
    setIsDialogOpen(true)
  }

  const handleEdit = (course: Course) => {
    setEditingCourse(course)
    setFormData({
      course_code: course.course_code,
      course_name: course.course_name,
      description: course.description,
      duration_years: course.duration_years,
      total_credits: course.total_credits,
      department: course.department,
      status: course.status,
    })
    setIsDialogOpen(true)
  }

  const handleSave = async () => {
    try {
      setIsSubmitting(true)
      setError(null)

      if (!formData.course_code || !formData.course_name) {
        setError("Course code and name are required")
        return
      }

      let response
      if (editingCourse) {
        response = await coursesApi.update(editingCourse.course_id, formData)
      } else {
        response = await coursesApi.create(formData)
      }

      if (response.success) {
        setIsDialogOpen(false)
        await fetchCourses()
      } else {
        setError(response.error || "Failed to save course")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (courseId: number) => {
    if (!confirm("Are you sure you want to delete this course?")) return

    try {
      setError(null)
      const response = await coursesApi.delete(courseId)

      if (response.success) {
        await fetchCourses()
      } else {
        setError(response.error || "Failed to delete course")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    }
  }

  const handleViewSubjects = async (course: Course) => {
    try {
      setSelectedCourseForSubjects(course)
      setSubjectsLoading(true)
      setError(null)
      const response = await subjectsApi.getAll()
      if (response.success && Array.isArray(response.data)) {
        const courseSubjects = response.data.filter((s: Subject) => s.course_id === course.course_id)
        setSubjects(courseSubjects)
        // Refresh lecturers to ensure we have latest assignments
        await fetchLecturers()
      } else {
        setSubjects([])
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch subjects")
      setSubjects([])
    } finally {
      setSubjectsLoading(false)
    }
  }

  const handleAddSubject = async (course: Course) => {
    setSelectedCourseForSubjects(course)
    setEditingSubject(null)
    setSubjectFormData({
      subject_code: "",
      subject_name: "",
      description: "",
      credits: 3,
      semester: 1,
      status: "active",
      lecturer_id: null,
    })
    // Ensure lecturers are fetched before opening dialog
    if (lecturers.length === 0) {
      await fetchLecturers()
    }
    setIsSubjectDialogOpen(true)
  }

  const handleEditSubject = async (subject: Subject) => {
    setEditingSubject(subject)
    setSubjectFormData({
      subject_code: subject.subject_code,
      subject_name: subject.subject_name,
      description: subject.description,
      credits: subject.credits,
      semester: subject.semester,
      status: subject.status,
      lecturer_id: subject.lecturer_id,
    })
    // Ensure lecturers are fetched before opening dialog
    if (lecturers.length === 0) {
      await fetchLecturers()
    }
    setIsSubjectDialogOpen(true)
  }

  const handleSaveSubject = async () => {
    try {
      setIsSubmitting(true)
      setError(null)

      if (!subjectFormData.subject_code || !subjectFormData.subject_name || !selectedCourseForSubjects) {
        setError("Subject code and name are required")
        return
      }

      let response
      if (editingSubject) {
        response = await subjectsApi.update(editingSubject.subject_id, {
          ...subjectFormData,
        })
      } else {
        response = await subjectsApi.create({
          course_id: selectedCourseForSubjects.course_id,
          ...subjectFormData,
        })
      }

      if (response.success) {
        setIsSubjectDialogOpen(false)
        await handleViewSubjects(selectedCourseForSubjects)
      } else {
        setError(response.error || "Failed to save subject")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteSubject = async (subject: Subject) => {
    if (!confirm("Are you sure you want to delete this subject?")) return

    try {
      setError(null)
      const response = await subjectsApi.delete(subject.subject_id)

      if (response.success && selectedCourseForSubjects) {
        await handleViewSubjects(selectedCourseForSubjects)
      } else {
        setError(response.error || "Failed to delete subject")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    }
  }

  const handleUnassignLecturer = async (subject: Subject) => {
    if (!confirm(`Unassign ${subject.subject_name} from its lecturer?`)) return

    try {
      setError(null)
      const response = await subjectsApi.update(subject.subject_id, {
        lecturer_id: null,
      })

      if (response.success && selectedCourseForSubjects) {
        await handleViewSubjects(selectedCourseForSubjects)
      } else {
        setError(response.error || "Failed to unassign lecturer")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    }
  }

  const getAvailableLecturers = () => {
    // Return all lecturers from the database
    // The API should handle validation for lecturer assignments
    return lecturers
  }

  const getStatusColor = (status: string) => {
    const statusMap: Record<string, string> = {
      active: "bg-green-100 text-green-800",
      inactive: "bg-gray-100 text-gray-800",
      draft: "bg-yellow-100 text-yellow-800",
    }
    return statusMap[status] || "bg-gray-100 text-gray-800"
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Course Management</h1>
          <p className="text-muted-foreground">Create and manage academic courses and subjects</p>
        </div>
        <Button className="gap-2" onClick={handleCreateNew}>
          <Plus className="w-4 h-4" />
          Add Course
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="courses" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="courses">Courses</TabsTrigger>
          <TabsTrigger value="subjects" disabled={!selectedCourseForSubjects}>
            {selectedCourseForSubjects ? `Subjects (${selectedCourseForSubjects.course_code})` : "Subjects"}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="courses" className="space-y-4">
          <Card className="border border-border">
            <CardHeader>
              <CardTitle>All Courses</CardTitle>
              <CardDescription>{loading ? "Loading..." : `Total: ${courses.length} courses`}</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : courses.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No courses found. Create one to get started.</div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Code</TableHead>
                        <TableHead>Course Name</TableHead>
                        <TableHead>Department</TableHead>
                        <TableHead>Credits</TableHead>
                        <TableHead>Duration</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {courses.map((course) => (
                        <TableRow key={course.course_id}>
                          <TableCell className="font-medium">{course.course_code}</TableCell>
                          <TableCell>{course.course_name}</TableCell>
                          <TableCell>{course.department}</TableCell>
                          <TableCell>{course.total_credits}</TableCell>
                          <TableCell>{course.duration_years} years</TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(course.status)}>{course.status}</Badge>
                          </TableCell>
                          <TableCell className="text-right space-x-2">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleViewSubjects(course)}
                              title="View/Manage Subjects"
                            >
                              <BookOpen className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleEdit(course)}>
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleDelete(course.course_id)}>
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="subjects" className="space-y-4">
          {selectedCourseForSubjects && (
            <Card className="border border-border">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Subjects for {selectedCourseForSubjects.course_name}</CardTitle>
                  <CardDescription>Code: {selectedCourseForSubjects.course_code}</CardDescription>
                </div>
                <Button className="gap-2" onClick={() => handleAddSubject(selectedCourseForSubjects)}>
                  <Plus className="w-4 h-4" />
                  Add Subject
                </Button>
              </CardHeader>
              <CardContent>
                {subjectsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : subjects.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No subjects created yet. Click "Add Subject" to create one.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Code</TableHead>
                          <TableHead>Subject Name</TableHead>
                          <TableHead>Lecturer</TableHead>
                          <TableHead>Semester</TableHead>
                          <TableHead>Credits</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {subjects.map((subject) => {
                          const lecturer = lecturers.find(l => l.lecturer_id === subject.lecturer_id)
                          return (
                            <TableRow key={subject.subject_id}>
                              <TableCell className="font-medium">{subject.subject_code}</TableCell>
                              <TableCell>{subject.subject_name}</TableCell>
                              <TableCell>
                                {subject.lecturer_name ? (
                                  <span className="text-sm">
                                    {subject.lecturer_name}
                                  </span>
                                ) : (
                                  <span className="text-sm text-muted-foreground">Unassigned</span>
                                )}
                              </TableCell>
                              <TableCell>{subject.semester}</TableCell>
                              <TableCell>{subject.credits}</TableCell>
                              <TableCell>
                                <Badge className={getStatusColor(subject.status)}>{subject.status}</Badge>
                              </TableCell>
                              <TableCell className="text-right space-x-2">
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  onClick={() => handleEditSubject(subject)}
                                  title="Edit subject"
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                {subject.lecturer_id && (
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    onClick={() => handleUnassignLecturer(subject)}
                                    title="Unassign lecturer from this subject"
                                  >
                                    <Unlink className="w-4 h-4 text-orange-500" />
                                  </Button>
                                )}
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  onClick={() => handleDeleteSubject(subject)}
                                  title="Delete subject"
                                >
                                  <Trash2 className="w-4 h-4 text-red-500" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          )
                        })}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingCourse ? "Edit Course" : "Create New Course"}</DialogTitle>
            <DialogDescription>
              {editingCourse ? "Update the course details below" : "Fill in the details to create a new course"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Course Code *</label>
              <Input
                value={formData.course_code}
                onChange={(e) => setFormData({ ...formData, course_code: e.target.value })}
                placeholder="e.g., CS101"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Course Name *</label>
              <Input
                value={formData.course_name}
                onChange={(e) => setFormData({ ...formData, course_name: e.target.value })}
                placeholder="e.g., Introduction to Computer Science"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Description</label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Course description"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Duration (years)</label>
                <Input
                  type="number"
                  value={formData.duration_years}
                  onChange={(e) => setFormData({ ...formData, duration_years: Number.parseInt(e.target.value) })}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Total Credits</label>
                <Input
                  type="number"
                  value={formData.total_credits}
                  onChange={(e) => setFormData({ ...formData, total_credits: Number.parseInt(e.target.value) })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Department</label>
                <Input
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  placeholder="e.g., Computer Science"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-3 py-2 border border-input rounded-md text-sm"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save Course"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isSubjectDialogOpen} onOpenChange={setIsSubjectDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingSubject ? "Edit Subject" : "Create New Subject"}</DialogTitle>
            <DialogDescription>
              {selectedCourseForSubjects && 
                `Course: ${selectedCourseForSubjects.course_name} (${selectedCourseForSubjects.course_code})`}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Subject Code *</label>
              <Input
                value={subjectFormData.subject_code}
                onChange={(e) => setSubjectFormData({ ...subjectFormData, subject_code: e.target.value })}
                placeholder="e.g., CS101"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Subject Name *</label>
              <Input
                value={subjectFormData.subject_name}
                onChange={(e) => setSubjectFormData({ ...subjectFormData, subject_name: e.target.value })}
                placeholder="e.g., Introduction to Programming"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Description</label>
              <Textarea
                value={subjectFormData.description}
                onChange={(e) => setSubjectFormData({ ...subjectFormData, description: e.target.value })}
                placeholder="Subject description"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Semester</label>
                <Input
                  type="number"
                  min="1"
                  value={subjectFormData.semester}
                  onChange={(e) => setSubjectFormData({ ...subjectFormData, semester: Number.parseInt(e.target.value) })}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Credits</label>
                <Input
                  type="number"
                  min="1"
                  value={subjectFormData.credits}
                  onChange={(e) => setSubjectFormData({ ...subjectFormData, credits: Number.parseInt(e.target.value) })}
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Status</label>
              <select
                value={subjectFormData.status}
                onChange={(e) => setSubjectFormData({ ...subjectFormData, status: e.target.value })}
                className="w-full px-3 py-2 border border-input rounded-md text-sm"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium">Assign Lecturer</label>
              {lecturersLoading ? (
                <div className="text-sm text-muted-foreground py-2">Loading lecturers...</div>
              ) : lecturers.length === 0 ? (
                <div className="text-sm text-red-500 py-2">
                  No lecturers found. Please create lecturers first.
                </div>
              ) : (
                <select
                  value={subjectFormData.lecturer_id ?? ""}
                  onChange={(e) => setSubjectFormData({ 
                    ...subjectFormData, 
                    lecturer_id: e.target.value ? Number.parseInt(e.target.value) : null 
                  })}
                  className="w-full px-3 py-2 border border-input rounded-md text-sm"
                >
                  <option value="">Unassigned</option>
                  {getAvailableLecturers().map((lecturer) => (
                    <option key={lecturer.lecturer_id} value={lecturer.lecturer_id}>
                      {lecturer.first_name} {lecturer.last_name} ({lecturer.employee_id || "N/A"})
                    </option>
                  ))}
                </select>
              )}
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setIsSubjectDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveSubject} disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save Subject"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
