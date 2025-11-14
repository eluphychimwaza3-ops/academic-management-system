"use client"
import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Upload, Eye, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { assignmentsApi } from "@/lib/api-utils"

interface Assignment {
  assignment_id: number
  title: string
  subject_name: string
  due_date: string
  submission_count: number
  total_students: number
  submission_rate: number
  description: string
  total_marks: number
  assignment_type: string
}

export default function AssignmentsPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        setLoading(true)
        const user = JSON.parse(localStorage.getItem("user") || "{}")
        
        if (!user.student_id) {
          setError("Student information not found")
          return
        }
        
        const response = await assignmentsApi.getAll(undefined, user.student_id)
        
        if (response.success && Array.isArray(response.data)) {
          setAssignments(response.data as Assignment[])
        } else {
          setError(response.error || "Failed to fetch assignments")
          setAssignments([])
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred")
        setAssignments([])
      } finally {
        setLoading(false)
      }
    }

    fetchAssignments()
  }, [])

  const getStatusBadge = (dueDate: string) => {
    const today = new Date()
    const due = new Date(dueDate)
    if (due < today) return "bg-red-100 text-red-800"
    const daysLeft = Math.floor((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    if (daysLeft <= 3) return "bg-yellow-100 text-yellow-800"
    return "bg-blue-100 text-blue-800"
  }

  const getStatus = (dueDate: string) => {
    const today = new Date()
    const due = new Date(dueDate)
    if (due < today) return "overdue"
    const daysLeft = Math.floor((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    if (daysLeft <= 3) return "urgent"
    return "pending"
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">My Assignments</h1>
          <p className="text-muted-foreground">View, submit, and track your assignments</p>
        </div>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  const stats = {
    total: assignments.length,
    pending: assignments.filter((a) => new Date(a.due_date) >= new Date()).length,
    overdue: assignments.filter((a) => new Date(a.due_date) < new Date()).length,
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">My Assignments</h1>
        <p className="text-muted-foreground">View, submit, and track your assignments</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-6">
        <Card className="border border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Assignments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{loading ? "—" : stats.total}</div>
          </CardContent>
        </Card>
        <Card className="border border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-500">{loading ? "—" : stats.pending}</div>
          </CardContent>
        </Card>
        <Card className="border border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Overdue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-500">{loading ? "—" : stats.overdue}</div>
          </CardContent>
        </Card>
      </div>

      <Card className="border border-border">
        <CardHeader>
          <CardTitle>All Assignments</CardTitle>
          <CardDescription>{loading ? "Loading..." : `Track ${assignments.length} assignments`}</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : assignments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No assignments available at this time.</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Assignment</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Total Marks</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assignments.map((assignment) => (
                    <TableRow key={assignment.assignment_id}>
                      <TableCell className="font-medium">{assignment.title}</TableCell>
                      <TableCell>{assignment.subject_name}</TableCell>
                      <TableCell>{formatDate(assignment.due_date)}</TableCell>
                      <TableCell>
                        <Badge className={getStatusBadge(assignment.due_date)}>{getStatus(assignment.due_date)}</Badge>
                      </TableCell>
                      <TableCell>{assignment.total_marks}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Upload className="w-4 h-4" />
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
    </div>
  )
}
