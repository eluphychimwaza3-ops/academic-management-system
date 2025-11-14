'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AlertCircle, Save, BookOpen, Upload, Download } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { API_ENDPOINTS } from '@/lib/api-config'

interface Subject {
  subject_id: number
  subject_code: string
  subject_name: string
  course_name: string
  credits: number
  semester: number
  status: string
}

interface StudentGrade {
  student_id: number
  first_name: string
  last_name: string
  email: string
  student_registration_number: string
  enrollment_date: string
  enrollment_status: string
  course_grade_id: number | null
  assignment_grade_percentage: number | null
  exam_marks: number | null
  exam_percentage: number | null
  final_percentage: number | null
  grade_letter: string | null
  grade_status: string | null
  submissions: Submission[]
}

interface Submission {
  submission_id: number
  assignment_id: number
  title: string
  total_marks: number
  submission_date: string
  submission_status: string
  is_late: boolean
  grade_id: number | null
  marks_obtained: number | null
  assignment_percentage: number | null
  assignment_grade_letter: string | null
  feedback: string | null
}

interface Assignment {
  assignment_id: number
  title: string
  assignment_type: string
  total_marks: number
  due_date: string
  submission_status: string
}

export default function GradingPage() {
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null)
  const [students, setStudents] = useState<StudentGrade[]>([])
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isGradingDialogOpen, setIsGradingDialogOpen] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState<StudentGrade | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [serverPreview, setServerPreview] = useState<{loading:boolean, final_percentage:number|null, grade_letter:string|null}>({loading:false, final_percentage:null, grade_letter:null})
  const [bulkUploadData, setBulkUploadData] = useState<Array<{student_id:number, assignment_grade_percentage:number, exam_percentage:number}>>([])
  const [bulkUploadMode, setBulkUploadMode] = useState<'csv' | 'table'>('csv')
  const [bulkUploadProgress, setBulkUploadProgress] = useState<{current:number, total:number, completed:number}>({current:0, total:0, completed:0})
  const [isBulkUploading, setIsBulkUploading] = useState(false)
  const router = useRouter()

  const [gradeFormData, setGradeFormData] = useState({
    assignment_grade_percentage: 0,
    exam_marks: 0,
    exam_percentage: 0,
    grade_letter: 'F',
  })

  useEffect(() => {
    fetchSubjects()
  }, [])

  const fetchSubjects = async () => {
    try {
      setLoading(true)
      setError(null)
      const userStr = localStorage.getItem('user')
      if (!userStr) {
        router.push('/login')
        return
      }

      const user = JSON.parse(userStr)
      if (user.role !== 'lecturer' || !user.lecturer_id) {
        router.push('/login')
        return
      }

  const url = API_ENDPOINTS.user.subjects + '?lecturerId=' + user.lecturer_id
  const response = await fetch(url)
  if (!response.ok) throw new Error('Failed to fetch subjects')
  const data = await response.json()
  setSubjects(Array.isArray(data) ? data : [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      setSubjects([])
    } finally {
      setLoading(false)
    }
  }

  const handleSelectSubject = async (subject: Subject) => {
    try {
      setSelectedSubject(subject)
      setLoading(true)
      setError(null)

      const userStr = localStorage.getItem('user')
      const user = JSON.parse(userStr || '{}')

      const url = API_ENDPOINTS.academic.subjectGrading + '?subjectId=' + subject.subject_id + '&lecturerId=' + user.lecturer_id
      const response = await fetch(url)
      if (!response.ok) throw new Error('Failed to fetch grading data')

      const data = await response.json()
      setStudents(data.students || [])
      setAssignments(data.assignments || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch grading data')
      setStudents([])
      setAssignments([])
    } finally {
      setLoading(false)
    }
  }

  const handleOpenGradingDialog = (student: StudentGrade) => {
    setSelectedStudent(student)
    setGradeFormData({
      assignment_grade_percentage: student.assignment_grade_percentage || 0,
      exam_marks: student.exam_marks || 0,
      exam_percentage: student.exam_percentage || 0,
      grade_letter: student.grade_letter || 'F',
    })
    setIsGradingDialogOpen(true)
  }

  const handleSaveGrade = async () => {
    if (!selectedStudent || !selectedSubject) return

    try {
      setIsSubmitting(true)
      setError(null)

      const response = await fetch(API_ENDPOINTS.academic.subjectGrading, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_id: selectedStudent.student_id,
          subject_id: selectedSubject.subject_id,
          assignment_grade_percentage: gradeFormData.assignment_grade_percentage,
          exam_marks: gradeFormData.exam_marks,
          exam_percentage: gradeFormData.exam_percentage,
          grade_letter: gradeFormData.grade_letter,
        }),
      })

      if (!response.ok) throw new Error('Failed to save grade')

  const msg = 'Grade saved for ' + selectedStudent.first_name + ' ' + selectedStudent.last_name
  setSuccessMessage(msg)
  setIsGradingDialogOpen(false)
      await handleSelectSubject(selectedSubject)
      setTimeout(() => setSuccessMessage(null), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save grade')
    } finally {
      setIsSubmitting(false)
    }
  }

  const getLetterGrade = (percentage: number): string => {
    if (percentage >= 90) return 'A+'
    if (percentage >= 85) return 'A'
    if (percentage >= 80) return 'B+'
    if (percentage >= 75) return 'B'
    if (percentage >= 70) return 'C+'
    if (percentage >= 65) return 'C'
    if (percentage >= 60) return 'D+'
    if (percentage >= 55) return 'D'
    return 'F'
  }

  if (loading && subjects.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-foreground">Grading Management</h1>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Grading Management</h1>
        <p className="text-muted-foreground">Grade your students by subject and manage course grades</p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {successMessage && (
        <Alert className="bg-green-50 border-green-200">
          <AlertCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">{successMessage}</AlertDescription>
        </Alert>
      )}

      {/* Subject Selection Cards */}
      {subjects.length > 0 && !selectedSubject && (
        <div className="grid md:grid-cols-3 gap-6">
          {subjects.map((subject) => (
            <Card
              key={subject.subject_id}
              className="border border-border hover:border-primary/50 transition-colors cursor-pointer"
              onClick={() => handleSelectSubject(subject)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{subject.subject_code}</CardTitle>
                    <CardDescription className="mt-1">{subject.subject_name}</CardDescription>
                  </div>
                  <BookOpen className="w-5 h-5 text-primary" />
                </div>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Course:</span>
                  <span className="font-medium">{subject.course_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Credits:</span>
                  <span className="font-medium">{subject.credits}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Grading Interface */}
      {selectedSubject && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">{selectedSubject.subject_name}</h2>
              <p className="text-muted-foreground">{selectedSubject.course_name}</p>
            </div>
            <Button variant="outline" onClick={() => setSelectedSubject(null)}>
              Back to Subjects
            </Button>
          </div>

          <Tabs defaultValue="students" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="students">Students & Grades</TabsTrigger>
              <TabsTrigger value="assignments">Assignments</TabsTrigger>
              <TabsTrigger value="bulk-upload">Bulk Upload</TabsTrigger>
            </TabsList>

            <TabsContent value="students" className="space-y-4">
              <Card className="border border-border">
                <CardHeader>
                  <CardTitle>Student Grading</CardTitle>
                  <CardDescription>
                    Total: {students.length} student(s) | Graded: {students.filter((s) => s.grade_status === 'finalized').length}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  ) : students.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">No students enrolled in this subject.</div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Registration #</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Assignment %</TableHead>
                            <TableHead>Exam %</TableHead>
                            <TableHead>Final %</TableHead>
                            <TableHead>Grade</TableHead>
                            <TableHead className="text-right">Action</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {students.map((student) => {
                            const finalPct = student.final_percentage
                            const finalGrade = student.grade_letter || 'F'
                            return (
                              <TableRow key={student.student_id} className={student.grade_status === 'finalized' ? 'bg-green-50' : ''}>
                                <TableCell className="font-mono text-sm">{student.student_registration_number}</TableCell>
                                <TableCell className="font-medium">
                                  {student.first_name} {student.last_name}
                                </TableCell>
                                <TableCell className="text-sm">{student.email}</TableCell>
                                <TableCell>
                                  <Badge
                                    variant={student.enrollment_status === 'active' ? 'default' : 'secondary'}
                                  >
                                    {student.enrollment_status}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-sm">
                                  {student.assignment_grade_percentage ? `${Number(student.assignment_grade_percentage).toFixed(1)}%` : '-'}
                                </TableCell>
                                <TableCell className="text-sm">
                                  {student.exam_percentage ? `${Number(student.exam_percentage).toFixed(1)}%` : '-'}
                                </TableCell>
                                <TableCell className="font-medium">
                                  {finalPct ? `${Number(finalPct).toFixed(1)}%` : '-'}
                                </TableCell>
                                <TableCell>
                                  <Badge
                                    variant={
                                      student.grade_status === 'finalized'
                                        ? finalGrade === 'F'
                                          ? 'destructive'
                                          : 'default'
                                        : 'secondary'
                                    }
                                  >
                                    {finalGrade}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleOpenGradingDialog(student)}
                                  >
                                    {student.grade_status === 'finalized' ? 'Edit' : 'Grade'}
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
            </TabsContent>

            <TabsContent value="assignments" className="space-y-4">
              <Card className="border border-border">
                <CardHeader>
                  <CardTitle>Subject Assignments</CardTitle>
                  <CardDescription>Total: {assignments.length} assignment(s)</CardDescription>
                </CardHeader>
                <CardContent>
                  {assignments.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">No assignments created for this subject yet.</div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Title</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Total Marks</TableHead>
                            <TableHead>Due Date</TableHead>
                            <TableHead>Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {assignments.map((assignment) => (
                            <TableRow key={assignment.assignment_id}>
                              <TableCell className="font-medium">{assignment.title}</TableCell>
                              <TableCell className="text-sm capitalize">{assignment.assignment_type}</TableCell>
                              <TableCell>{assignment.total_marks}</TableCell>
                              <TableCell className="text-sm">
                                {new Date(assignment.due_date).toLocaleDateString()}
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant={assignment.submission_status === 'open' ? 'default' : 'secondary'}
                                >
                                  {assignment.submission_status}
                                </Badge>
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

            <TabsContent value="bulk-upload" className="space-y-4">
              <Card className="border border-border">
                <CardHeader>
                  <CardTitle>Bulk Grade Upload</CardTitle>
                  <CardDescription>
                    Upload grades for multiple students at once using CSV or inline editor
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Mode Toggle */}
                  <div className="flex gap-2 border-b pb-4">
                    <Button
                      variant={bulkUploadMode === 'csv' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setBulkUploadMode('csv')}
                    >
                      CSV Upload
                    </Button>
                    <Button
                      variant={bulkUploadMode === 'table' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setBulkUploadMode('table')}
                    >
                      Inline Editor
                    </Button>
                  </div>

                  {/* CSV Upload Mode */}
                  {bulkUploadMode === 'csv' && (
                    <div className="space-y-4">
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <p className="text-sm font-medium text-blue-900 mb-2">CSV Format Instructions:</p>
                        <p className="text-xs text-blue-800 font-mono bg-blue-100 p-2 rounded mb-2">
                          subject_id,student_registration_number,assignment_percentage,exam_percentage
                        </p>
                        <p className="text-xs text-blue-700 mt-2 font-medium">⚠️ Note: Subject ID must match the current subject. Mismatched files will be rejected.</p>
                      </div>

                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                        <input
                          type="file"
                          accept=".csv"
                          id="csv-upload"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (file) {
                              const reader = new FileReader()
                              reader.onload = async (evt) => {
                                try {
                                  const csv = evt.target?.result as string
                                  const lines = csv.split('\n').filter(l => l.trim())
                                  const parsed: typeof bulkUploadData = []

                                  for (let i = 1; i < lines.length; i++) {
                                    const parts = lines[i].split(',').map(p => p.trim())
                                    if (parts.length < 4) continue

                                    const subjectId = parseInt(parts[0])
                                    const regNum = parts[1]
                                    const assignmentPct = parseFloat(parts[2])
                                    const examPct = parseFloat(parts[3])

                                    // Validate subject_id matches current subject
                                    if (subjectId !== selectedSubject?.subject_id) {
                                      setError(`Subject ID mismatch at row ${i + 1}. Expected ${selectedSubject?.subject_id}, got ${subjectId}. This CSV file cannot be used for the selected subject.`)
                                      return
                                    }

                                    if (isNaN(assignmentPct) || isNaN(examPct)) {
                                      setError(`Invalid numbers in row ${i + 1}`)
                                      return
                                    }

                                    // Find student by registration number
                                    const student = students.find(
                                      s => s.student_registration_number === regNum
                                    )
                                    if (!student) {
                                      setError(`Student ${regNum} not found in this subject`)
                                      return
                                    }

                                    parsed.push({
                                      student_id: student.student_id,
                                      assignment_grade_percentage: assignmentPct,
                                      exam_percentage: examPct,
                                    })
                                  }

                                  setBulkUploadData(parsed)
                                  setError(null)
                                } catch (err) {
                                  setError(err instanceof Error ? err.message : 'Failed to parse CSV')
                                }
                              }
                              reader.readAsText(file)
                            }
                          }}
                        />
                        <label htmlFor="csv-upload" className="cursor-pointer">
                          <div className="flex flex-col items-center gap-2">
                            <Upload className="w-8 h-8 text-gray-400" />
                            <p className="text-sm font-medium text-gray-700">Click to upload CSV or drag and drop</p>
                            <p className="text-xs text-gray-500">CSV file required</p>
                          </div>
                        </label>
                      </div>

                      {bulkUploadData.length > 0 && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                          <p className="text-sm font-medium text-green-900">
                            {bulkUploadData.length} student(s) ready to upload
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Table Editor Mode */}
                  {bulkUploadMode === 'table' && (
                    <div className="space-y-4">
                      <div className="overflow-x-auto">
                        <Table className="border">
                          <TableHeader>
                            <TableRow>
                              <TableHead>Registration #</TableHead>
                              <TableHead>Name</TableHead>
                              <TableHead>Assignment %</TableHead>
                              <TableHead>Exam %</TableHead>
                              <TableHead>Action</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {students.map((student) => {
                              const bulkRecord = bulkUploadData.find(b => b.student_id === student.student_id)
                              return (
                                <TableRow key={student.student_id} className={bulkRecord ? 'bg-yellow-50' : ''}>
                                  <TableCell className="font-mono text-sm">{student.student_registration_number}</TableCell>
                                  <TableCell>{student.first_name} {student.last_name}</TableCell>
                                  <TableCell>
                                    <Input
                                      type="number"
                                      min="0"
                                      max="100"
                                      step="0.5"
                                      defaultValue={bulkRecord?.assignment_grade_percentage ?? ''}
                                      placeholder="0"
                                      onChange={(e) => {
                                        const val = parseFloat(e.target.value) || 0
                                        setBulkUploadData(prev => {
                                          const existing = prev.find(b => b.student_id === student.student_id)
                                          if (existing) {
                                            return prev.map(b =>
                                              b.student_id === student.student_id
                                                ? { ...b, assignment_grade_percentage: val }
                                                : b
                                            )
                                          } else {
                                            return [...prev, { student_id: student.student_id, assignment_grade_percentage: val, exam_percentage: 0 }]
                                          }
                                        })
                                      }}
                                      className="w-20"
                                    />
                                  </TableCell>
                                  <TableCell>
                                    <Input
                                      type="number"
                                      min="0"
                                      max="100"
                                      step="0.5"
                                      defaultValue={bulkRecord?.exam_percentage ?? ''}
                                      placeholder="0"
                                      onChange={(e) => {
                                        const val = parseFloat(e.target.value) || 0
                                        setBulkUploadData(prev => {
                                          const existing = prev.find(b => b.student_id === student.student_id)
                                          if (existing) {
                                            return prev.map(b =>
                                              b.student_id === student.student_id
                                                ? { ...b, exam_percentage: val }
                                                : b
                                            )
                                          } else {
                                            return [...prev, { student_id: student.student_id, assignment_grade_percentage: 0, exam_percentage: val }]
                                          }
                                        })
                                      }}
                                      className="w-20"
                                    />
                                  </TableCell>
                                  <TableCell>
                                    {bulkRecord && (
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                          setBulkUploadData(prev =>
                                            prev.filter(b => b.student_id !== student.student_id)
                                          )
                                        }}
                                      >
                                        Remove
                                      </Button>
                                    )}
                                  </TableCell>
                                </TableRow>
                              )
                            })}
                          </TableBody>
                        </Table>
                      </div>
                      {bulkUploadData.length > 0 && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                          <p className="text-sm font-medium text-green-900">
                            {bulkUploadData.length} student(s) ready to upload
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Upload Progress */}
                  {isBulkUploading && bulkUploadProgress.total > 0 && (
                    <Card className="bg-blue-50 border-blue-200">
                      <CardContent className="pt-4">
                        <p className="text-sm font-medium mb-2">
                          Uploading: {bulkUploadProgress.completed} / {bulkUploadProgress.total}
                        </p>
                        <div className="w-full bg-blue-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all"
                            style={{
                              width: `${(bulkUploadProgress.completed / bulkUploadProgress.total) * 100}%`,
                            }}
                          ></div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Download Template Button */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const csvContent = [
                        'subject_id,student_registration_number,assignment_percentage,exam_percentage',
                        ...students.map(
                          s =>
                            `${selectedSubject?.subject_id},${s.student_registration_number},${s.assignment_grade_percentage || 0},${
                              s.exam_percentage || 0
                            }`
                        ),
                      ].join('\n')

                      const blob = new Blob([csvContent], { type: 'text/csv' })
                      const url = window.URL.createObjectURL(blob)
                      const a = document.createElement('a')
                      a.href = url
                      a.download = `grades_${selectedSubject?.subject_code}_${selectedSubject?.subject_id}_template.csv`
                      a.click()
                      window.URL.revokeObjectURL(url)
                    }}
                    className="gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Download CSV Template
                  </Button>

                  {/* Upload Button */}
                  <div className="flex gap-2 pt-4 border-t">
                    <Button
                      onClick={() => {
                        setBulkUploadData([])
                        setError(null)
                      }}
                      variant="outline"
                    >
                      Clear
                    </Button>
                    <Button
                      onClick={async () => {
                        if (!selectedSubject || bulkUploadData.length === 0) return

                        try {
                          setIsBulkUploading(true)
                          setBulkUploadProgress({ current: 0, total: bulkUploadData.length, completed: 0 })
                          setError(null)

                          let completed = 0
                          for (const record of bulkUploadData) {
                            try {
                              const response = await fetch(API_ENDPOINTS.academic.subjectGrading, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                  student_id: record.student_id,
                                  subject_id: selectedSubject.subject_id,
                                  assignment_grade_percentage: record.assignment_grade_percentage,
                                  exam_marks: 0,
                                  exam_percentage: record.exam_percentage,
                                  grade_letter: '', // Let server compute from DB function
                                }),
                              })

                              if (response.ok) {
                                completed++
                              } else {
                                setError(`Failed to upload grade for student ${record.student_id}`)
                              }
                            } catch (e) {
                              setError(
                                `Error uploading grade for student ${record.student_id}: ${e instanceof Error ? e.message : 'Unknown error'
                                }`
                              )
                            }
                            setBulkUploadProgress(p => ({ ...p, completed }))
                          }

                          setSuccessMessage(`Successfully uploaded ${completed} grade(s)`)
                          setBulkUploadData([])
                          await handleSelectSubject(selectedSubject)
                          setTimeout(() => setSuccessMessage(null), 5000)
                        } catch (err) {
                          setError(err instanceof Error ? err.message : 'Failed to upload grades')
                        } finally {
                          setIsBulkUploading(false)
                          setBulkUploadProgress({ current: 0, total: 0, completed: 0 })
                        }
                      }}
                      disabled={isBulkUploading || bulkUploadData.length === 0}
                      className="gap-2 flex-1"
                    >
                      <Upload className="w-4 h-4" />
                      {isBulkUploading ? 'Uploading...' : `Upload ${bulkUploadData.length} Grade(s)`}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      )}

      {/* Grading Dialog */}
      <Dialog open={isGradingDialogOpen} onOpenChange={setIsGradingDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Grade Student</DialogTitle>
            <DialogDescription>
              {selectedStudent && selectedStudent.first_name + ' ' + selectedStudent.last_name + ' (' + selectedStudent.student_registration_number + ')'}
            </DialogDescription>
          </DialogHeader>

          {selectedStudent && (
            <div className="space-y-4">
              {/* Student Submissions Summary */}
              {selectedStudent.submissions.length > 0 && (
                <Card className="bg-muted/50">
                  <CardHeader>
                    <CardTitle className="text-sm">Submissions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      {selectedStudent.submissions.map((sub) => (
                        <div key={sub.submission_id} className="flex items-center justify-between border-b pb-2">
                          <div>
                            <p className="font-medium">{sub.title}</p>
                            <p className="text-xs text-muted-foreground">
                              Submitted: {new Date(sub.submission_date).toLocaleDateString()}
                              {sub.is_late && <Badge className="ml-2 bg-red-100 text-red-800">Late</Badge>}
                            </p>
                          </div>
                          <div className="text-right">
                            {sub.marks_obtained !== null ? (
                              <p className="font-medium">
                                {sub.marks_obtained}/{sub.total_marks} ({Number(sub.assignment_percentage).toFixed(1)}%)
                              </p>
                            ) : (
                              <p className="text-muted-foreground">Not graded</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Grading Form */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Assignment Grade %</label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      step="0.5"
                      value={gradeFormData.assignment_grade_percentage}
                      onChange={(e) =>
                        setGradeFormData({
                          ...gradeFormData,
                          assignment_grade_percentage: Number(e.target.value),
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Exam Marks</label>
                    <Input
                      type="number"
                      min="0"
                      value={gradeFormData.exam_marks}
                      onChange={(e) =>
                        setGradeFormData({
                          ...gradeFormData,
                          exam_marks: Number(e.target.value),
                        })
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Exam Grade %</label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      step="0.5"
                      value={gradeFormData.exam_percentage}
                      onChange={(e) =>
                        setGradeFormData({
                          ...gradeFormData,
                          exam_percentage: Number(e.target.value),
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Letter Grade</label>
                    <select
                      value={gradeFormData.grade_letter}
                      onChange={(e) =>
                        setGradeFormData({
                          ...gradeFormData,
                          grade_letter: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-input rounded-md text-sm"
                    >
                      <option value="A+">A+ (90-100%)</option>
                      <option value="A">A (85-89%)</option>
                      <option value="B+">B+ (80-84%)</option>
                      <option value="B">B (75-79%)</option>
                      <option value="C+">C+ (70-74%)</option>
                      <option value="C">C (65-69%)</option>
                      <option value="D+">D+ (60-64%)</option>
                      <option value="D">D (55-59%)</option>
                      <option value="F">F (Below 55%)</option>
                    </select>
                  </div>
                </div>

                {/* Calculated Final Grade Preview */}
                {gradeFormData.assignment_grade_percentage > 0 && gradeFormData.exam_percentage > 0 && (
                  <Card className="bg-blue-50 border-blue-200">
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground mb-2">Final Grade Preview (40% assignment + 60% exam)</p>
                          <p className="text-2xl font-bold text-blue-600">
                            {((gradeFormData.assignment_grade_percentage * 0.4 + gradeFormData.exam_percentage * 0.6)).toFixed(1)}%
                          </p>
                          <p className="text-sm text-muted-foreground mt-1">
                            Letter Grade: {serverPreview.grade_letter ?? getLetterGrade(
                              gradeFormData.assignment_grade_percentage * 0.4 + gradeFormData.exam_percentage * 0.6
                            )}
                          </p>
                        </div>
                        <div className="pl-4">
                          <Button size="sm" variant="outline" onClick={async () => {
                            // compute server-side letter using dryRun
                            if (!selectedSubject || !selectedStudent) return
                            try {
                              setServerPreview(s => ({...s, loading: true}))
                              const resp = await fetch(API_ENDPOINTS.academic.subjectGrading, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                  student_id: selectedStudent.student_id,
                                  subject_id: selectedSubject.subject_id,
                                  assignment_grade_percentage: gradeFormData.assignment_grade_percentage,
                                  exam_marks: gradeFormData.exam_marks,
                                  exam_percentage: gradeFormData.exam_percentage,
                                  grade_letter: gradeFormData.grade_letter,
                                  dryRun: true
                                }),
                              })
                              if (!resp.ok) throw new Error('Failed to compute server letter')
                              const j = await resp.json()
                              setServerPreview({loading:false, final_percentage: j.final_percentage ?? null, grade_letter: j.grade_letter ?? null})
                            } catch (e) {
                              setServerPreview({loading:false, final_percentage:null, grade_letter:null})
                              setError(e instanceof Error ? e.message : 'Failed to compute server letter')
                            }
                          }}>
                            {serverPreview.loading ? 'Checking...' : 'Compute DB Letter'}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsGradingDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveGrade} disabled={isSubmitting} className="gap-2">
              <Save className="w-4 h-4" />
              {isSubmitting ? 'Saving...' : 'Save Grade'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
