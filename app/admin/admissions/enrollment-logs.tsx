"use client"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { AlertCircle, CheckCircle, Clock } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface EnrollmentLog {
  admission_id: number
  applicant_name: string
  email: string
  application_status: string
  enrollment_status: string
  student_id: number | null
  user_id: number | null
  enrollment_id: number | null
  course_name: string | null
}

export function EnrollmentLogs() {
  const [logs, setLogs] = useState<EnrollmentLog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchLogs()
  }, [])

  const fetchLogs = async () => {
    try {
      setLoading(true)
      const response = await fetch("http://localhost/api/academic/auto-enrollment-log.php")

      if (!response.ok) {
        throw new Error("Failed to fetch enrollment logs")
      }

      const data = await response.json()
      setLogs(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Enrolled":
        return "bg-green-100 text-green-800"
      case "Pending Enrollment":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Enrolled":
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case "Pending Enrollment":
        return <Clock className="w-4 h-4 text-yellow-600" />
      default:
        return <AlertCircle className="w-4 h-4 text-gray-600" />
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Auto-Enrollment Status</CardTitle>
        <CardDescription>Track automatic student account creation and enrollment</CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Applicant Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>Application Status</TableHead>
                  <TableHead>Enrollment Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => (
                  <TableRow key={log.admission_id}>
                    <TableCell className="font-medium">{log.applicant_name}</TableCell>
                    <TableCell>{log.email}</TableCell>
                    <TableCell>{log.course_name || "N/A"}</TableCell>
                    <TableCell>
                      <Badge className="bg-green-100 text-green-800">{log.application_status}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(log.enrollment_status)}
                        <Badge className={getStatusBadge(log.enrollment_status)}>{log.enrollment_status}</Badge>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
