"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Eye, AlertCircle, Users } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { API_ENDPOINTS } from "@/lib/api-config"

interface Student {
  student_id: number
  student_registration_number: string
  first_name: string
  last_name: string
  email: string
  enrollment_date: string
  enrollment_status: string
  average_score: number | string | null
  courses_enrolled: number | string
}

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([])
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true)
        const userStr = localStorage.getItem("user")
        if (!userStr) {
          router.push("/login")
          return
        }

        const user = JSON.parse(userStr)
        if (user.role !== 'lecturer' || !user.lecturer_id) {
          router.push("/login")
          return
        }

        const response = await fetch(`${API_ENDPOINTS.user.students}?lecturerId=${user.lecturer_id}`)
        if (!response.ok) throw new Error("Failed to fetch students")
        const data = await response.json()
        setStudents(Array.isArray(data) ? data : [])
        setFilteredStudents(Array.isArray(data) ? data : [])
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred")
        setStudents([])
        setFilteredStudents([])
      } finally {
        setLoading(false)
      }
    }

    fetchStudents()
  }, [router])

  useEffect(() => {
    const filtered = students.filter(
      (student) =>
        `${student.first_name} ${student.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.student_registration_number.includes(searchTerm)
    )
    setFilteredStudents(filtered)
  }, [searchTerm, students])

  if (error && students.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">My Students</h1>
          <p className="text-muted-foreground">View and manage your enrolled students</p>
        </div>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  const getPerformanceBadge = (score: number | string | null | undefined) => {
    const numScore = typeof score === 'string' ? parseFloat(score) : (score ?? 0)
    if (numScore >= 85) return <Badge variant="default" className="bg-green-600">Excellent</Badge>
    if (numScore >= 75) return <Badge variant="default" className="bg-blue-600">Good</Badge>
    if (numScore >= 60) return <Badge variant="default" className="bg-yellow-600">Average</Badge>
    return <Badge variant="destructive">Below Average</Badge>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">My Students</h1>
        <p className="text-muted-foreground">View and manage your enrolled students</p>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Students</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{students.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Enrollments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {students.filter(s => s.enrollment_status === 'active').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Average Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {students.length > 0
                ? (students.reduce((sum, s) => {
                    const score = typeof s.average_score === 'string' ? parseFloat(s.average_score) : (s.average_score ?? 0)
                    return sum + score
                  }, 0) / students.length).toFixed(1)
                : 0}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Students List
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, or registration number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Students Table */}
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {students.length === 0 ? "No students enrolled" : "No matching students found"}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Registration #</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Enrollment Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Avg. Score</TableHead>
                    <TableHead>Courses</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStudents.map((student) => (
                    <TableRow key={student.student_id}>
                      <TableCell className="font-mono text-sm">{student.student_registration_number}</TableCell>
                      <TableCell className="font-medium">
                        {student.first_name} {student.last_name}
                      </TableCell>
                      <TableCell className="text-sm">{student.email}</TableCell>
                      <TableCell className="text-sm">
                        {new Date(student.enrollment_date).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Badge variant={student.enrollment_status === 'active' ? 'default' : 'secondary'}>
                          {student.enrollment_status.charAt(0).toUpperCase() + student.enrollment_status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">
                            {typeof student.average_score === 'string' 
                              ? parseFloat(student.average_score).toFixed(1)
                              : (student.average_score ?? 0).toFixed(1)}%
                          </span>
                          {getPerformanceBadge(student.average_score)}
                        </div>
                      </TableCell>
                      <TableCell>{student.courses_enrolled}</TableCell>
                      <TableCell>
                        <Link href={`/lecturer/students/${student.student_id}`}>
                          <Button variant="outline" size="sm" className="gap-2">
                            <Eye className="w-4 h-4" />
                            View
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
