"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, Users, FileText, BarChart3, Wrench, AlertCircle } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { API_ENDPOINTS } from "@/lib/api-config"

interface DashboardStats {
  stats: {
    totalUsers: number
    pendingAdmissions: number
    activeCourses: number
  }
  recentActivities: any[]
}

interface RepairResult {
  total_candidates: number
  processed: number
  users_created: number
  students_created: number
  enrollments_created: number
  errors: string[]
}

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [isRepairingAdmissions, setIsRepairingAdmissions] = useState(false)
  const [repairMessage, setRepairMessage] = useState<string | null>(null)
  const [repairResult, setRepairResult] = useState<RepairResult | null>(null)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await fetch(API_ENDPOINTS.admin.dashboard)
        if (!response.ok) throw new Error("Failed to fetch dashboard data")
        const dashboardData = await response.json()
        setData(dashboardData)
      } catch (err) {
        setError("Failed to load dashboard data")
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  const handleRepairAdmissions = async () => {
    try {
      setIsRepairingAdmissions(true)
      setRepairMessage("Running repair... Please wait.")
      setRepairResult(null)

      const response = await fetch(`${API_ENDPOINTS.admin.dashboard.replace('/dashboard.php', '/repair_approved_admissions.php')}`, {
        method: "POST",
      })

      if (!response.ok) throw new Error("Repair failed")

      const result = await response.json()
      setRepairResult(result)
      setRepairMessage(
        `Repair completed! Processed ${result.processed} admissions. Created ${result.users_created} users, ${result.students_created} students, and ${result.enrollments_created} enrollments.${
          result.errors.length > 0 ? ` (${result.errors.length} errors)` : ""
        }`
      )

      // Refresh dashboard
      const dashResponse = await fetch(API_ENDPOINTS.admin.dashboard)
      if (dashResponse.ok) {
        const dashboardData = await dashResponse.json()
        setData(dashboardData)
      }
    } catch (err) {
      setRepairMessage(err instanceof Error ? `Repair failed: ${err.message}` : "Repair failed")
    } finally {
      setIsRepairingAdmissions(false)
    }
  }

  if (isLoading)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-muted-foreground">Loading dashboard...</div>
      </div>
    )

  if (error && !data)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-destructive">{error}</div>
      </div>
    )

  const stats = [
    {
      label: "Total Users",
      value: data?.stats.totalUsers || 0,
      icon: Users,
      color: "text-primary",
      href: "/admin/users",
    },
    {
      label: "Pending Admissions",
      value: data?.stats.pendingAdmissions || 0,
      icon: FileText,
      color: "text-secondary",
      href: "/admin/admissions",
    },
    {
      label: "Active Courses",
      value: data?.stats.activeCourses || 0,
      icon: BookOpen,
      color: "text-accent",
      href: "/admin/courses",
    },
    { label: "System Reports", value: "", icon: BarChart3, color: "text-chart-1", href: "/admin/reports" },
  ]

  const recentActivities = data?.recentActivities || []

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-foreground mb-2">Admin Dashboard</h1>
        <p className="text-muted-foreground">System overview and management controls</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Link key={stat.href} href={stat.href}>
              <Card className="border border-border hover:border-primary/50 transition-colors cursor-pointer h-full">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-muted-foreground">{stat.label}</CardTitle>
                    <Icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-foreground">{stat.value}</div>
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>

      {repairMessage && (
        <Alert variant={repairResult?.errors.length ? "destructive" : "default"}>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {repairMessage}
            {repairResult?.errors.length ? (
              <div className="mt-2 text-sm">
                <p className="font-semibold">Errors:</p>
                <ul className="list-disc pl-5">
                  {repairResult.errors.slice(0, 3).map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                  {repairResult.errors.length > 3 && <li>... and {repairResult.errors.length - 3} more</li>}
                </ul>
              </div>
            ) : null}
          </AlertDescription>
        </Alert>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="border border-border">
          <CardHeader>
            <CardTitle className="text-lg">Quick Actions</CardTitle>
            <CardDescription>Common administrative tasks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/admin/users">
              <Button variant="outline" className="w-full justify-start bg-transparent">
                <Users className="w-4 h-4 mr-2" />
                Manage Users
              </Button>
            </Link>
            <Link href="/admin/admissions">
              <Button variant="outline" className="w-full justify-start bg-transparent">
                <FileText className="w-4 h-4 mr-2" />
                Review Admissions
              </Button>
            </Link>
            <Link href="/admin/courses">
              <Button variant="outline" className="w-full justify-start bg-transparent">
                <BookOpen className="w-4 h-4 mr-2" />
                Manage Courses
              </Button>
            </Link>
            <Link href="/admin/reports">
              <Button variant="outline" className="w-full justify-start bg-transparent">
                <BarChart3 className="w-4 h-4 mr-2" />
                View Reports
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="border border-border">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Wrench className="w-5 h-5" />
              System Maintenance
            </CardTitle>
            <CardDescription>Administrative tools and utilities</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              variant="outline"
              className="w-full justify-start bg-transparent"
              onClick={handleRepairAdmissions}
              disabled={isRepairingAdmissions}
            >
              {isRepairingAdmissions ? "Repairing..." : "Repair Approved Admissions"}
            </Button>
            <p className="text-xs text-muted-foreground">
              Finds approved admissions missing student records and creates them automatically.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="border border-border">
          <CardHeader>
            <CardTitle className="text-lg">Recent Activity</CardTitle>
            <CardDescription>Latest system events</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.length > 0 ? (
                recentActivities.map((activity: any, idx: number) => (
                  <div key={idx} className="flex items-start gap-3 pb-3 border-b border-border last:border-0">
                    <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{activity.action}</p>
                      <p className="text-xs text-muted-foreground">
                        {activity.created_at ? new Date(activity.created_at).toLocaleString() : "N/A"}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No recent activities</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border">
          <CardHeader>
            <CardTitle className="text-lg">System Health</CardTitle>
            <CardDescription>Database and server status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-1 gap-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-foreground">Database</span>
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Healthy</span>
                </div>
                <div className="w-full bg-border rounded-full h-2 overflow-hidden">
                  <div className="bg-green-500 h-full w-4/5" />
                </div>
                <p className="text-xs text-muted-foreground mt-1">80% capacity used</p>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-foreground">Server</span>
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Healthy</span>
                </div>
                <div className="w-full bg-border rounded-full h-2 overflow-hidden">
                  <div className="bg-green-500 h-full w-3/5" />
                </div>
                <p className="text-xs text-muted-foreground mt-1">60% CPU utilization</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
