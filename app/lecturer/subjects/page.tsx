"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Edit, Trash2, AlertCircle, Users } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { API_ENDPOINTS } from "@/lib/api-config"

interface Subject {
  subject_id: number
  course_id: number
  subject_code: string
  subject_name: string
  course_name: string
  description: string
  credits: number
  semester: number
  status: string
}

interface SubjectStudent {
  student_id: number
  first_name: string
  last_name: string
  email: string
  phone: string
  student_registration_number: string
  enrollment_date: string
  enrollment_status: string
  grade_letter: string | null
  final_percentage: number | string | null
  grade_status: string | null
}

export default function SubjectsPage() {
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null)
  const [subjectStudents, setSubjectStudents] = useState<SubjectStudent[]>([])
  const [loading, setLoading] = useState(true)
  const [studentLoading, setStudentLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        setLoading(true)
        const user = JSON.parse(localStorage.getItem("user") || "{}")
        if (!user.lecturer_id) {
          throw new Error("Lecturer ID not found")
        }
        const response = await fetch(`${API_ENDPOINTS.user.subjects}?lecturerId=${user.lecturer_id}`)
        if (!response.ok) throw new Error("Failed to fetch subjects")
        const data = await response.json()
        setSubjects(Array.isArray(data) ? data : [])
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred")
        setSubjects([])
      } finally {
        setLoading(false)
      }
    }

    fetchSubjects()
  }, [])

  const handleViewStudents = async (subject: Subject) => {
    try {
      setSelectedSubject(subject)
      setStudentLoading(true)
      const response = await fetch(`${API_ENDPOINTS.user.subjectStudents}?subjectId=${subject.subject_id}`)
      if (!response.ok) throw new Error("Failed to fetch students")
      const data = await response.json()
      setSubjectStudents(data.students || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch students")
      setSubjectStudents([])
    } finally {
      setStudentLoading(false)
    }
  }

  if (error && subjects.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">My Subjects</h1>
          <p className="text-muted-foreground">Manage your teaching subjects and classes</p>
        </div>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">My Subjects</h1>
          <p className="text-muted-foreground">Manage your teaching subjects and classes</p>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">My Subjects</h1>
        <p className="text-muted-foreground">Manage your teaching subjects and classes</p>
      </div>

      {subjects.length > 0 && (
        <div className="grid md:grid-cols-3 gap-6 mb-6">
          {subjects.map((subject) => (
            <Card key={subject.subject_id} className="border border-border hover:border-primary/50 transition-colors">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{subject.subject_code}</CardTitle>
                    <CardDescription className="mt-1">{subject.subject_name}</CardDescription>
                  </div>
                  {subject.status === 'active' && (
                    <Badge variant="default">Active</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Credits:</span>
                    <span className="font-medium">{subject.credits}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Semester:</span>
                    <span className="font-medium">{subject.semester}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Course:</span>
                    <span className="font-medium text-xs">{subject.course_name}</span>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  onClick={() => handleViewStudents(subject)}
                >
                  <Users className="w-4 h-4 mr-2" />
                  View Students
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Tabs defaultValue="subjects" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="subjects">Subject Details</TabsTrigger>
          <TabsTrigger value="students" disabled={!selectedSubject}>
            {selectedSubject ? `Students (${selectedSubject.subject_name})` : "Students"}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="subjects" className="space-y-4">
          <Card className="border border-border">
            <CardHeader>
              <CardTitle>All Subjects</CardTitle>
              <CardDescription>{loading ? "Loading..." : `Detailed view of ${subjects.length} subject(s)`}</CardDescription>
            </CardHeader>
            <CardContent>
              {subjects.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No subjects assigned yet.</div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Code</TableHead>
                        <TableHead>Subject Name</TableHead>
                        <TableHead>Course</TableHead>
                        <TableHead>Credits</TableHead>
                        <TableHead>Semester</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {subjects.map((subject) => (
                        <TableRow key={subject.subject_id} className="cursor-pointer hover:bg-muted/50">
                          <TableCell className="font-medium">{subject.subject_code}</TableCell>
                          <TableCell>{subject.subject_name}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">{subject.course_name}</TableCell>
                          <TableCell>{subject.credits}</TableCell>
                          <TableCell>{subject.semester}</TableCell>
                          <TableCell>
                            <Badge variant={subject.status === 'active' ? 'default' : 'secondary'}>
                              {subject.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right space-x-2">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleViewStudents(subject)}
                            >
                              <Users className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
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

        <TabsContent value="students" className="space-y-4">
          {selectedSubject && (
            <Card className="border border-border">
              <CardHeader>
                <CardTitle>Students Enrolled in {selectedSubject.subject_name}</CardTitle>
                <CardDescription>
                  Subject Code: {selectedSubject.subject_code} | Course: {selectedSubject.course_name}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {studentLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : subjectStudents.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No students enrolled in this subject yet.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Registration #</TableHead>
                          <TableHead>Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Phone</TableHead>
                          <TableHead>Enrollment Date</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Grade</TableHead>
                          <TableHead>Score %</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {subjectStudents.map((student) => (
                          <TableRow key={student.student_id}>
                            <TableCell className="font-medium">{student.student_registration_number}</TableCell>
                            <TableCell>{student.first_name} {student.last_name}</TableCell>
                            <TableCell className="text-sm text-muted-foreground">{student.email}</TableCell>
                            <TableCell className="text-sm">{student.phone || "N/A"}</TableCell>
                            <TableCell className="text-sm">
                              {new Date(student.enrollment_date).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              <Badge variant={student.enrollment_status === 'active' ? 'default' : 'secondary'}>
                                {student.enrollment_status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {student.grade_letter ? (
                                <Badge variant="outline">{student.grade_letter}</Badge>
                              ) : (
                                <span className="text-muted-foreground">-</span>
                              )}
                            </TableCell>
                            <TableCell>
                              {(() => {
                                const raw = student.final_percentage
                                const num = typeof raw === 'string' ? parseFloat(raw) : (raw ?? NaN)
                                return !isNaN(num) ? (
                                  <span className="font-medium">{num.toFixed(2)}%</span>
                                ) : (
                                  <span className="text-muted-foreground">-</span>
                                )
                              })()}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
