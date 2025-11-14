"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Download, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { API_ENDPOINTS } from "@/lib/api-config"

interface Grade {
  grade_id: number
  student_id: number
  course_id: number
  subject_name: string
  subject_code: string
  letter_grade: string
  percentage_grade: number
  points?: number | null
  grade_date?: string | null
  lecturer_first_name: string
  lecturer_last_name: string
}

const getGradeBadge = (grade: string) => {
  const colors: Record<string, string> = {
    "A+": "bg-green-100 text-green-800",
    A: "bg-green-100 text-green-800",
    "B+": "bg-blue-100 text-blue-800",
    B: "bg-blue-100 text-blue-800",
    "C+": "bg-yellow-100 text-yellow-800",
    C: "bg-yellow-100 text-yellow-800",
    D: "bg-orange-100 text-orange-800",
    F: "bg-red-100 text-red-800",
  }
  return colors[grade] || "bg-gray-100 text-gray-800"
}

export default function GradesPage() {
  const [grades, setGrades] = useState<Grade[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchGrades = async () => {
      try {
        setLoading(true)
        const user = JSON.parse(localStorage.getItem("user") || "{}")
        if (!user.student_id) {
          throw new Error("Student ID not found")
        }
        const response = await fetch(`${API_ENDPOINTS.user.grades}?studentId=${user.student_id}`)
        if (!response.ok) throw new Error("Failed to fetch grades")
        const data = await response.json()
        setGrades(Array.isArray(data) ? data : [])
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred")
        setGrades([])
      } finally {
        setLoading(false)
      }
    }

    fetchGrades()
  }, [])

  const calculateStats = () => {
    if (grades.length === 0) {
      return { avgGpa: 0, totalCredits: 0, progress: 0 }
    }
    const totalPoints = grades.reduce((sum, g) => sum + (Number(g.points) || 0), 0)
    const avgGpa = grades.length > 0 ? (totalPoints / grades.length).toFixed(2) : "0.00"
    return { avgGpa, totalCredits: grades.length * 4, progress: Math.round((grades.length / 30) * 100) }
  }

  const stats = calculateStats()

  if (error && grades.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">My Grades</h1>
          <p className="text-muted-foreground">View your academic performance and transcripts</p>
        </div>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">My Grades</h1>
        <p className="text-muted-foreground">View your academic performance and transcripts</p>
      </div>

      {/* GPA Summary */}
      <div className="grid md:grid-cols-3 gap-6 mb-6">
        <Card className="border border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Current GPA</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-accent">{loading ? "—" : stats.avgGpa}</div>
            <p className="text-xs text-muted-foreground mt-1">Out of 4.0</p>
          </CardContent>
        </Card>

        <Card className="border border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Credits Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-primary">{loading ? "—" : stats.totalCredits}</div>
            <p className="text-xs text-muted-foreground mt-1">Of 120 total</p>
          </CardContent>
        </Card>

        <Card className="border border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-secondary">{loading ? "—" : `${stats.progress}%`}</div>
            <p className="text-xs text-muted-foreground mt-1">Program completion</p>
          </CardContent>
        </Card>
      </div>

  {/* Subject Grades */}
      <Card className="border border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Subject Grades</CardTitle>
              <CardDescription>{loading ? "Loading..." : `${grades.length} subjects`}</CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="gap-2 bg-transparent"
              disabled={grades.length === 0}
              onClick={() => downloadTranscript()}
            >
              <Download className="w-4 h-4" />
              Download Transcript
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : grades.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No grades available yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Subject</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead>Grade</TableHead>
                    <TableHead>Percentage</TableHead>
                    <TableHead>Points</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {grades.map((grade) => (
                    <TableRow key={grade.grade_id}>
                      <TableCell className="font-medium">{grade.subject_name}</TableCell>
                        <TableCell>{grade.subject_code}</TableCell>
                      <TableCell>
                                {(() => {
                                  const letter = (grade as any).grade_letter || (grade as any).letter_grade || ''
                                  return (
                                    <Badge className={getGradeBadge(letter)} variant="outline">
                                      {letter || '-'}
                                    </Badge>
                                  )
                                })()}
                      </TableCell>
                      <TableCell className="font-medium">{grade.percentage_grade}%</TableCell>
                      <TableCell>
                        {typeof grade.points === "number" && !isNaN(grade.points) ? grade.points.toFixed(2) : "-"}
                      </TableCell>
                      <TableCell>
                        {grade.grade_date ? (() => {
                          try {
                            return new Date(grade.grade_date).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })
                          } catch (e) {
                            return "-"
                          }
                        })() : "-"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Grade Scale Reference */}
      <Card className="border border-border">
        <CardHeader>
          <CardTitle>Grade Scale Reference</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-foreground mb-3">Letter Grades</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>A+</span>
                  <span className="text-muted-foreground">95-100%</span>
                </div>
                <div className="flex justify-between">
                  <span>A</span>
                  <span className="text-muted-foreground">90-94%</span>
                </div>
                <div className="flex justify-between">
                  <span>B+</span>
                  <span className="text-muted-foreground">85-89%</span>
                </div>
                <div className="flex justify-between">
                  <span>B</span>
                  <span className="text-muted-foreground">80-84%</span>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-medium text-foreground mb-3">GPA Scale</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>A (4.0)</span>
                  <span className="text-muted-foreground">Excellent</span>
                </div>
                <div className="flex justify-between">
                  <span>B (3.0)</span>
                  <span className="text-muted-foreground">Good</span>
                </div>
                <div className="flex justify-between">
                  <span>C (2.0)</span>
                  <span className="text-muted-foreground">Fair</span>
                </div>
                <div className="flex justify-between">
                  <span>D (1.0)</span>
                  <span className="text-muted-foreground">Pass</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  function downloadTranscript() {
    const csv = [
  ["Subject Name", "Subject Code", "Letter Grade", "Percentage", "Points", "Date"],
      ...grades.map((g) => [
                        g.subject_name,
        g.subject_code,
        // prefer grade_letter (from API) then letter_grade
        (g as any).grade_letter || (g as any).letter_grade || '',
        g.percentage_grade,
        (typeof g.points === 'number' && !isNaN(g.points)) ? g.points.toFixed(2) : '',
        g.grade_date ? new Date(g.grade_date).toLocaleDateString() : '',
      ]),
    ]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n")

    const blob = new Blob([csv], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = "transcript.csv"
    link.click()
  }
}
