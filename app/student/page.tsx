"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, FileText, BarChart3, LogOut, ClipboardList } from "lucide-react"
import { API_ENDPOINTS } from "@/lib/api-config"

interface User {
  id: number
  first_name: string
  last_name: string
  email: string
  role: string
}

interface StudentStats {
  stats: {
    enrolledCourses: number
    pendingAssignments: number
    submittedAssignments: number
    averageGPA: number
  }
}

export default function StudentDashboard() {
  const [user, setUser] = useState<User | null>(null)
  const [stats, setStats] = useState<StudentStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const userStr = localStorage.getItem("user")
    if (!userStr) {
      router.push("/login")
      return
    }

    const currentUser = JSON.parse(userStr)
    setUser(currentUser)

    const fetchStats = async () => {
      try {
        // Use student_id if available, otherwise use id
        const studentId = currentUser.student_id || currentUser.id
        if (!studentId) {
          throw new Error("No student ID found in user data")
        }
        
        const response = await fetch(`${API_ENDPOINTS.user.studentDashboard}?studentId=${studentId}`)
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.error || `Failed to fetch stats (HTTP ${response.status})`)
        }
        const data = await response.json()
        setStats(data)
      } catch (err) {
        console.error("Error fetching student stats:", err)
        // Don't block the page from loading, just show empty stats
        setStats({
          stats: {
            enrolledCourses: 0,
            pendingAssignments: 0,
            submittedAssignments: 0,
            averageGPA: 0
          }
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem("user")
    router.push("/login")
  }

  if (!user)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    )

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">Student Dashboard</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium text-foreground">
                {user.first_name} {user.last_name}
              </p>
              <p className="text-xs text-muted-foreground">{user.email}</p>
            </div>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-foreground mb-2">
              Welcome, {user.first_name} {user.last_name}!
            </h2>
            <p className="text-muted-foreground">Track your courses, assignments, and academic progress</p>
          </div>
          <Link href="/admission/apply">
            <Button className="gap-2">
              <ClipboardList className="w-4 h-4" />
              Apply for Admission
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="text-muted-foreground">Loading statistics...</div>
        ) : (
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <Card className="border border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Average GPA</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary">{stats?.stats.averageGPA || 0}</div>
                <p className="text-xs text-muted-foreground mt-2">Cumulative</p>
              </CardContent>
            </Card>

            <Card className="border border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Enrolled Courses</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-secondary">{stats?.stats.enrolledCourses || 0}</div>
                <p className="text-xs text-muted-foreground mt-2">Active</p>
              </CardContent>
            </Card>

            <Card className="border border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Assignments Due</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-accent">{stats?.stats.pendingAssignments || 0}</div>
                <p className="text-xs text-muted-foreground mt-2">Pending</p>
              </CardContent>
            </Card>

            <Card className="border border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Submissions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-chart-2">{stats?.stats.submittedAssignments || 0}</div>
                <p className="text-xs text-muted-foreground mt-2">Completed</p>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link href="/admission/track">
            <Card className="border border-border hover:border-primary/50 transition-colors cursor-pointer h-full">
              <CardHeader>
                <ClipboardList className="w-8 h-8 text-primary mb-2" />
                <CardTitle>My Applications</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>Track your admission applications and status</CardDescription>
              </CardContent>
            </Card>
          </Link>

          <Link href="/student/assignments">
            <Card className="border border-border hover:border-secondary/50 transition-colors cursor-pointer h-full">
              <CardHeader>
                <FileText className="w-8 h-8 text-secondary mb-2" />
                <CardTitle>Assignments</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>View and submit your coursework</CardDescription>
              </CardContent>
            </Card>
          </Link>

          <Link href="/student/grades">
            <Card className="border border-border hover:border-accent/50 transition-colors cursor-pointer h-full">
              <CardHeader>
                <BarChart3 className="w-8 h-8 text-accent mb-2" />
                <CardTitle>Grades & Reports</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>Check your performance and grades</CardDescription>
              </CardContent>
            </Card>
          </Link>
        </div>
      </main>
    </div>
  )
}
