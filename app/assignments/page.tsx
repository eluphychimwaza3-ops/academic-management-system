"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FileText, Calendar, Users, Search } from "lucide-react"
import { Input } from "@/components/ui/input"

interface Assignment {
  assignment_id: number
  title: string
  subject_name: string
  lecturer_name: string
  description: string
  due_date: string
  total_marks: number
  assignment_type: string
  submission_count: number
  total_students: number
}

export default function AssignmentsPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [filteredAssignments, setFilteredAssignments] = useState<Assignment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        setLoading(true)
        const response = await fetch("/api/assignments")
        if (!response.ok) throw new Error("Failed to fetch assignments")
        const data = await response.json()
        setAssignments(data)
        setFilteredAssignments(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error loading assignments")
        console.error("Fetch error:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchAssignments()
  }, [])

  useEffect(() => {
    const filtered = assignments.filter(
      (assignment) =>
        assignment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        assignment.subject_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        assignment.lecturer_name.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    setFilteredAssignments(filtered)
  }, [searchTerm, assignments])

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      homework: "bg-blue-100 text-blue-800",
      project: "bg-purple-100 text-purple-800",
      lab: "bg-green-100 text-green-800",
      assessment: "bg-orange-100 text-orange-800",
    }
    return colors[type] || "bg-gray-100 text-gray-800"
  }

  const calculateProgress = (submissions: number, total: number) => {
    return total === 0 ? 0 : Math.round((submissions / total) * 100)
  }

  const getDueStatus = (dueDate: string) => {
    const due = new Date(dueDate)
    const now = new Date()
    const daysLeft = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

    if (daysLeft < 0) return { text: "Overdue", color: "text-red-600" }
    if (daysLeft === 0) return { text: "Due Today", color: "text-orange-600" }
    if (daysLeft <= 3) return { text: `${daysLeft} days left`, color: "text-orange-500" }
    return { text: `${daysLeft} days left`, color: "text-green-600" }
  }

  if (loading)
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Loading assignments...</div>
      </div>
    )

  if (error)
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-red-600">Error: {error}</div>
      </div>
    )

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/">
            <h1 className="text-2xl font-bold text-foreground hover:text-primary">CMS</h1>
          </Link>
          <nav className="flex items-center gap-6">
            <Link href="/login" className="text-foreground hover:text-primary">
              Login
            </Link>
            <Link href="/admission">
              <Button>Apply Now</Button>
            </Link>
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Page Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">Current Assignments</h1>
          <p className="text-xl text-muted-foreground">Browse all active assignments across subjects</p>
        </div>

        {/* Search Bar */}
        <div className="mb-8 relative">
          <Search className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Search by title, subject, or lecturer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Assignments Grid */}
        {filteredAssignments.length === 0 ? (
          <Card className="border border-border">
            <CardContent className="pt-12 pb-12 text-center">
              <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {searchTerm ? "No assignments match your search" : "No assignments available at the moment"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {filteredAssignments.map((assignment) => {
              const progress = calculateProgress(assignment.submission_count, assignment.total_students)
              const dueStatus = getDueStatus(assignment.due_date)

              return (
                <Card
                  key={assignment.assignment_id}
                  className="border border-border hover:border-primary/50 transition-colors"
                >
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      {/* Title and Meta */}
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge className={getTypeColor(assignment.assignment_type)}>
                              {assignment.assignment_type}
                            </Badge>
                            <Badge variant="outline">{assignment.total_marks} marks</Badge>
                          </div>
                          <h2 className="text-xl font-bold text-foreground">{assignment.title}</h2>
                          <p className="text-sm text-muted-foreground mt-1">
                            {assignment.subject_name} • Lecturer: {assignment.lecturer_name}
                          </p>
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-muted-foreground">{assignment.description}</p>

                      {/* Stats */}
                      <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          <div>
                            <p className="text-xs text-muted-foreground">Due Date</p>
                            <p className={`text-sm font-medium ${dueStatus.color}`}>
                              {new Date(assignment.due_date).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-muted-foreground" />
                          <div>
                            <p className="text-xs text-muted-foreground">Submissions</p>
                            <p className="text-sm font-medium text-foreground">
                              {assignment.submission_count}/{assignment.total_students}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-muted-foreground" />
                          <div>
                            <p className="text-xs text-muted-foreground">Progress</p>
                            <p className="text-sm font-medium text-foreground">{progress}%</p>
                          </div>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div>
                        <div className="w-full bg-border rounded-full h-2 overflow-hidden">
                          <div className="bg-primary h-full transition-all" style={{ width: `${progress}%` }} />
                        </div>
                      </div>

                      {/* Action Button */}
                      <div className="flex items-center justify-between pt-2">
                        <p className="text-xs text-muted-foreground">
                          {assignment.total_students - assignment.submission_count} students pending submission
                        </p>
                        <Link href={`/assignments/${assignment.assignment_id}`}>
                          <Button variant="outline" size="sm">
                            View Details
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card mt-16 py-8">
        <div className="max-w-7xl mx-auto px-6 text-center text-muted-foreground">
          <p>College Management System • All assignments must be submitted by the due date</p>
        </div>
      </footer>
    </div>
  )
}
