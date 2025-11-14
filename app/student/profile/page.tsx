"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { User, Calendar, MapPin, Mail, Phone, BookOpen, FileText, AlertCircle } from "lucide-react"
import { API_ENDPOINTS } from "@/lib/api-config"

interface StudentProfile {
  student_id: number
  registration_number: string
  first_name: string
  last_name: string
  email: string
  phone: string
  date_of_birth: string
  gender: string
  address: string
  city: string
  postal_code: string
  country: string
  enrollment_date: string
  enrollment_status: string
}

interface Course {
  course_id: number
  course_code: string
  course_name: string
  description: string
  total_credits: number
  enrollment_status: string
  lecturer_first_name: string
  lecturer_last_name: string
  grades: any[]
}

interface ProfileData {
  profile: StudentProfile
  academics: {
    average_gpa: number
    total_courses_enrolled: number
    total_submissions: number
    graded_submissions: number
    pending_submissions: number
  }
  courses: Course[]
}

export default function StudentProfilePage() {
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true)
        const userStr = localStorage.getItem("user")
        if (!userStr) {
          router.push("/login")
          return
        }

        const user = JSON.parse(userStr)
        if (!user.student_id) {
          throw new Error("Student ID not found")
        }

        const response = await fetch(`${API_ENDPOINTS.user.studentProfile}?studentId=${user.student_id}`)
        if (!response.ok) throw new Error("Failed to fetch profile")
        
        const data = await response.json()
        setProfile(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred")
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [router])

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">My Profile</h1>
          <p className="text-muted-foreground">Loading your profile information...</p>
        </div>
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">My Profile</h1>
          <p className="text-muted-foreground">View your student profile and enrollment details</p>
        </div>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error || "Profile not found"}</AlertDescription>
        </Alert>
      </div>
    )
  }

  const { profile: studentProfile, academics, courses } = profile

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">My Profile</h1>
        <p className="text-muted-foreground">View your student profile and enrollment details</p>
      </div>

      {/* Personal Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Personal Information
          </CardTitle>
          <CardDescription>Your contact and enrollment details</CardDescription>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="text-sm text-muted-foreground">Full Name</label>
            <p className="text-lg font-medium">{studentProfile.first_name} {studentProfile.last_name}</p>
          </div>
          <div>
            <label className="text-sm text-muted-foreground">Registration Number</label>
            <p className="text-lg font-medium font-mono">{studentProfile.registration_number}</p>
          </div>
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-muted-foreground" />
            <div>
              <label className="text-sm text-muted-foreground">Email</label>
              <p className="text-sm">{studentProfile.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4 text-muted-foreground" />
            <div>
              <label className="text-sm text-muted-foreground">Phone</label>
              <p className="text-sm">{studentProfile.phone || "Not provided"}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <div>
              <label className="text-sm text-muted-foreground">Date of Birth</label>
              <p className="text-sm">{studentProfile.date_of_birth || "Not provided"}</p>
            </div>
          </div>
          <div>
            <label className="text-sm text-muted-foreground">Gender</label>
            <p className="text-sm capitalize">{studentProfile.gender || "Not provided"}</p>
          </div>
          <div className="md:col-span-2 flex items-start gap-2">
            <MapPin className="w-4 h-4 text-muted-foreground mt-1" />
            <div>
              <label className="text-sm text-muted-foreground">Address</label>
              <p className="text-sm">
                {studentProfile.address && `${studentProfile.address}, `}
                {studentProfile.city && `${studentProfile.city}, `}
                {studentProfile.postal_code && `${studentProfile.postal_code}, `}
                {studentProfile.country}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enrollment Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            Enrollment Information
          </CardTitle>
          <CardDescription>Your enrollment status and academic progress</CardDescription>
        </CardHeader>
        <CardContent className="grid md:grid-cols-4 gap-6">
          <div>
            <label className="text-sm text-muted-foreground">Enrollment Date</label>
            <p className="text-lg font-medium">{new Date(studentProfile.enrollment_date).toLocaleDateString()}</p>
          </div>
          <div>
            <label className="text-sm text-muted-foreground">Status</label>
            <Badge className="mt-1" variant={studentProfile.enrollment_status === 'active' ? 'default' : 'secondary'}>
              {studentProfile.enrollment_status.charAt(0).toUpperCase() + studentProfile.enrollment_status.slice(1)}
            </Badge>
          </div>
          <div>
            <label className="text-sm text-muted-foreground">Average GPA</label>
            <p className="text-lg font-medium text-primary">{academics.average_gpa.toFixed(2)}</p>
          </div>
          <div>
            <label className="text-sm text-muted-foreground">Courses Enrolled</label>
            <p className="text-lg font-medium">{academics.total_courses_enrolled}</p>
          </div>
        </CardContent>
      </Card>

      {/* Academic Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Academic Activity
          </CardTitle>
          <CardDescription>Your submissions and grading progress</CardDescription>
        </CardHeader>
        <CardContent className="grid md:grid-cols-3 gap-6">
          <div className="border-l-4 border-blue-500 pl-4">
            <label className="text-sm text-muted-foreground">Total Submissions</label>
            <p className="text-2xl font-bold">{academics.total_submissions}</p>
          </div>
          <div className="border-l-4 border-green-500 pl-4">
            <label className="text-sm text-muted-foreground">Graded</label>
            <p className="text-2xl font-bold">{academics.graded_submissions}</p>
          </div>
          <div className="border-l-4 border-yellow-500 pl-4">
            <label className="text-sm text-muted-foreground">Pending Grades</label>
            <p className="text-2xl font-bold">{academics.pending_submissions}</p>
          </div>
        </CardContent>
      </Card>

      {/* Enrolled Courses */}
      <Card>
        <CardHeader>
          <CardTitle>Enrolled Courses</CardTitle>
          <CardDescription>{courses.length} course(s) enrolled</CardDescription>
        </CardHeader>
        <CardContent>
          {courses.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No courses enrolled yet
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Course Code</TableHead>
                    <TableHead>Course Name</TableHead>
                    <TableHead>Credits</TableHead>
                    <TableHead>Lecturer</TableHead>
                    <TableHead>Latest Grade</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {courses.map((course) => (
                    <TableRow key={course.course_id}>
                      <TableCell className="font-mono text-sm">{course.course_code}</TableCell>
                      <TableCell className="font-medium">{course.course_name}</TableCell>
                      <TableCell>{course.total_credits}</TableCell>
                      <TableCell>
                        {course.lecturer_first_name && course.lecturer_last_name
                          ? `${course.lecturer_first_name} ${course.lecturer_last_name}`
                          : "TBA"}
                      </TableCell>
                      <TableCell>
                        {course.grades && course.grades.length > 0 ? (
                          <Badge variant="outline">{course.grades[0].letter_grade}</Badge>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={course.enrollment_status === 'active' ? 'default' : 'secondary'}>
                          {course.enrollment_status}
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
    </div>
  )
}
