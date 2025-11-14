"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, Plus, Users, FileText, LogOut } from "lucide-react"
import { API_ENDPOINTS } from "@/lib/api-config"

interface User {
  id: number
  first_name: string
  last_name: string
  email: string
  role: string
}

interface LecturerStats {
  stats: {
    totalStudents: number
    activeCourses: number
    pendingAssignments: number
    pendingSubmissions: number
  }
}

export default function LecturerDashboard() {
  const [user, setUser] = useState<User | null>(null)
  const [stats, setStats] = useState<LecturerStats | null>(null)
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
        const lecturerId = currentUser.lecturer_id || currentUser.id
        const response = await fetch(`${API_ENDPOINTS.user.lecturerDashboard}?lecturerId=${lecturerId}`)
        let data = null
        try {
          data = await response.json()
        } catch (e) {
          // invalid JSON
          data = null
        }

        if (!response.ok) {
          const msg = data && data.error ? data.error : 'Failed to fetch stats'
          console.error('Lecturer dashboard API error:', msg, data)
          // set empty stats so UI still renders
          setStats({ stats: { totalStudents: 0, activeCourses: 0, pendingAssignments: 0, pendingSubmissions: 0 } })
          setIsLoading(false)
          return
        }

        setStats(data)
      } catch (err) {
        console.error("Error fetching lecturer stats:", err)
        setStats({ stats: { totalStudents: 0, activeCourses: 0, pendingAssignments: 0, pendingSubmissions: 0 } })
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
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">Lecturer Dashboard</h1>
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
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-2">
            Welcome, Dr. {user.first_name} {user.last_name}!
          </h2>
          <p className="text-muted-foreground">Manage your courses, assignments, and student evaluations</p>
        </div>

        {/* Stats Cards */}
        {isLoading ? (
          <div className="text-muted-foreground">Loading statistics...</div>
        ) : (
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <Card className="border border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Teaching Courses</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary">{stats?.stats.activeCourses || 0}</div>
                <p className="text-xs text-muted-foreground mt-2">This semester</p>
              </CardContent>
            </Card>

            <Card className="border border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Students</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-secondary">{stats?.stats.totalStudents || 0}</div>
                <p className="text-xs text-muted-foreground mt-2">Across all courses</p>
              </CardContent>
            </Card>

            <Card className="border border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Pending Assignments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-accent">{stats?.stats.pendingAssignments || 0}</div>
                <p className="text-xs text-muted-foreground mt-2">Created by you</p>
              </CardContent>
            </Card>

            <Card className="border border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Pending Submissions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-chart-2">{stats?.stats.pendingSubmissions || 0}</div>
                <p className="text-xs text-muted-foreground mt-2">Awaiting grading</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Show API errors if any */}
        {stats && (stats as any).errors && (stats as any).errors.length > 0 && (
          <div className="mb-6">
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-3 rounded">
              <strong className="block mb-1">Notice:</strong>
              <ul className="list-disc pl-5 text-sm">
                {((stats as any).errors as string[]).map((e, idx) => (
                  <li key={idx}>{e}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Action Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="border border-border hover:border-primary/50 transition-colors cursor-pointer">
            <CardHeader>
              <Plus className="w-8 h-8 text-primary mb-2" />
              <CardTitle>Create Assignment</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>Create a new assignment for your course</CardDescription>
            </CardContent>
          </Card>

          <Card className="border border-border hover:border-secondary/50 transition-colors cursor-pointer">
            <CardHeader>
              <Users className="w-8 h-8 text-secondary mb-2" />
              <CardTitle>View Students</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>Manage enrolled students and track progress</CardDescription>
            </CardContent>
          </Card>

          <Card className="border border-border hover:border-accent/50 transition-colors cursor-pointer">
            <CardHeader>
              <FileText className="w-8 h-8 text-accent mb-2" />
              <CardTitle>Grade Submissions</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>Review and grade submitted assignments</CardDescription>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
