"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { BookOpen, Users, Clock, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { API_ENDPOINTS } from "@/lib/api-config"

interface Course {
  course_id: number
  course_code: string
  course_name: string
  description: string
  total_credits: number
  duration_years: number
  department: string
  status: string
  enrolled_students: number
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchEnrolledCourses = async () => {
      try {
        setLoading(true)
        const userStr = localStorage.getItem("user")
        let studentId = null

        if (userStr) {
          try {
            const user = JSON.parse(userStr)
            studentId = user.student_id
          } catch (e) {
            console.error("Failed to parse user from localStorage:", e)
          }
        }

        if (!studentId) {
          setError("Student ID not found. Please log in again.")
          setCourses([])
          setLoading(false)
          return
        }

        const response = await fetch(`${API_ENDPOINTS.academic.enrollments}?studentId=${studentId}`)

        if (!response.ok) {
          throw new Error("Failed to fetch enrolled courses")
        }

        const enrollmentData = await response.json()

        // Extract course data from enrollment records
        const courseList = Array.isArray(enrollmentData)
          ? enrollmentData.map((enrollment: any) => ({
              course_id: enrollment.course_id,
              course_code: enrollment.course_code,
              course_name: enrollment.course_name,
              description: enrollment.description,
              total_credits: enrollment.total_credits,
              duration_years: enrollment.duration_years,
              department: enrollment.department,
              status: enrollment.status,
              enrolled_students: enrollment.enrolled_students || 0,
            }))
          : []

        setCourses(courseList)
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred")
        setCourses([])
      } finally {
        setLoading(false)
      }
    }

    fetchEnrolledCourses()
  }, [])

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">My Courses</h1>
          <p className="text-muted-foreground">View and manage your enrolled courses</p>
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
          <h1 className="text-3xl font-bold text-foreground mb-2">My Courses</h1>
          <p className="text-muted-foreground">View and manage your enrolled courses</p>
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
        <h1 className="text-3xl font-bold text-foreground mb-2">My Courses</h1>
        <p className="text-muted-foreground">View and manage your enrolled courses</p>
      </div>

      {courses.length === 0 ? (
        <Card className="border border-border">
          <CardContent className="pt-6">
            <div className="text-center py-12 text-muted-foreground">No courses enrolled yet.</div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {courses.map((course) => (
            <Card key={course.course_id} className="border border-border">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge>{course.course_code}</Badge>
                      <Badge variant="outline">{course.duration_years} years</Badge>
                      <Badge variant="outline">{course.department}</Badge>
                    </div>
                    <CardTitle className="text-xl">{course.course_name}</CardTitle>
                    <CardDescription className="mt-2">{course.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-primary" />
                    <div>
                      <p className="text-muted-foreground">Credits</p>
                      <p className="font-medium text-foreground">{course.total_credits}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-secondary" />
                    <div>
                      <p className="text-muted-foreground">Enrolled</p>
                      <p className="font-medium text-foreground">{course.enrolled_students}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-accent" />
                    <div>
                      <p className="text-muted-foreground">Status</p>
                      <p className="font-medium text-foreground capitalize">{course.status}</p>
                    </div>
                  </div>
                </div>

                <Button className="w-full">View Course Details</Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
