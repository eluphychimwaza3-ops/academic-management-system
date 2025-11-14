"use client"
import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Edit, Trash2, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { assignmentsApi, subjectsApi } from "@/lib/api-utils"

interface Assignment {
  assignment_id: number
  title: string
  subject_id: number
  subject_name: string
  due_date: string
  total_marks: number
  assignment_type: string
  description?: string
  submission_status: string
}

interface Subject {
  subject_id: number
  subject_name: string
}

export default function AssignmentsPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    subject_id: "",
    description: "",
    assignment_type: "homework",
    total_marks: 100,
    due_date: "",
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const user = JSON.parse(localStorage.getItem("user") || "{}")

      const [assignmentsRes, subjectsRes] = await Promise.all([
        assignmentsApi.getAll(user.lecturer_id),
        subjectsApi.getAll(user.lecturer_id),
      ])

      if (assignmentsRes.success && Array.isArray(assignmentsRes.data)) {
        setAssignments(assignmentsRes.data as Assignment[])
      }
      if (subjectsRes.success && Array.isArray(subjectsRes.data)) {
        setSubjects(subjectsRes.data as Subject[])
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  const handleCreateNew = () => {
    setEditingAssignment(null)
    setFormData({
      title: "",
      subject_id: "",
      description: "",
      assignment_type: "homework",
      total_marks: 100,
      due_date: "",
    })
    setIsDialogOpen(true)
  }

  const handleEdit = (assignment: Assignment) => {
    setEditingAssignment(assignment)
    setFormData({
      title: assignment.title,
      subject_id: assignment.subject_id.toString(),
      description: assignment.description || "",
      assignment_type: assignment.assignment_type,
      total_marks: assignment.total_marks,
      due_date: assignment.due_date,
    })
    setIsDialogOpen(true)
  }

  const handleSave = async () => {
    try {
      setIsSubmitting(true)
      setError(null)
      const user = JSON.parse(localStorage.getItem("user") || "{}")

      if (!formData.title || !formData.subject_id || !formData.due_date) {
        setError("Title, subject, and due date are required")
        return
      }

      const payload = {
        ...formData,
        subject_id: Number.parseInt(formData.subject_id),
        lecturer_id: user.lecturer_id,
      }

      let response
      if (editingAssignment) {
        response = await assignmentsApi.update(editingAssignment.assignment_id, payload)
      } else {
        response = await assignmentsApi.create(payload)
      }

      if (response.success) {
        setIsDialogOpen(false)
        await fetchData()
      } else {
        setError(response.error || "Failed to save assignment")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (assignmentId: number) => {
    if (!confirm("Are you sure you want to delete this assignment?")) return

    try {
      setError(null)
      const response = await assignmentsApi.delete(assignmentId)

      if (response.success) {
        await fetchData()
      } else {
        setError(response.error || "Failed to delete assignment")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  if (error && assignments.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Assignment Management</h1>
            <p className="text-muted-foreground">Create and manage assignments for your subjects</p>
          </div>
          <Button className="gap-2" onClick={handleCreateNew}>
            <Plus className="w-4 h-4" />
            Create Assignment
          </Button>
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Assignment Management</h1>
          <p className="text-muted-foreground">Create and manage assignments for your subjects</p>
        </div>
        <Button className="gap-2" onClick={handleCreateNew}>
          <Plus className="w-4 h-4" />
          Create Assignment
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card className="border border-border">
        <CardHeader>
          <CardTitle>All Assignments</CardTitle>
          <CardDescription>{loading ? "Loading..." : `Total: ${assignments.length} assignments`}</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : assignments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No assignments found. Create one to get started.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Marks</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assignments.map((assignment) => (
                    <TableRow key={assignment.assignment_id}>
                      <TableCell className="font-medium">{assignment.title}</TableCell>
                      <TableCell>{assignment.subject_name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{assignment.assignment_type}</Badge>
                      </TableCell>
                      <TableCell>{formatDate(assignment.due_date)}</TableCell>
                      <TableCell>{assignment.total_marks}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(assignment)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(assignment.assignment_id)}>
                          <Trash2 className="w-4 h-4 text-red-500" />
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

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingAssignment ? "Edit Assignment" : "Create New Assignment"}</DialogTitle>
            <DialogDescription>
              {editingAssignment ? "Update assignment details" : "Create a new assignment for your subject"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Assignment Title *</label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Chapter 5 Exercises"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Subject *</label>
              <select
                value={formData.subject_id}
                onChange={(e) => setFormData({ ...formData, subject_id: e.target.value })}
                className="w-full px-3 py-2 border border-input rounded-md text-sm"
              >
                <option value="">Select a subject</option>
                {subjects.map((subject) => (
                  <option key={subject.subject_id} value={subject.subject_id}>
                    {subject.subject_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium">Description</label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Assignment description and instructions"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Type</label>
                <select
                  value={formData.assignment_type}
                  onChange={(e) => setFormData({ ...formData, assignment_type: e.target.value })}
                  className="w-full px-3 py-2 border border-input rounded-md text-sm"
                >
                  <option value="homework">Homework</option>
                  <option value="project">Project</option>
                  <option value="lab">Lab</option>
                  <option value="assessment">Assessment</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Total Marks</label>
                <Input
                  type="number"
                  value={formData.total_marks}
                  onChange={(e) => setFormData({ ...formData, total_marks: Number.parseInt(e.target.value) })}
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Due Date *</label>
              <Input
                type="datetime-local"
                value={formData.due_date}
                onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
              />
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save Assignment"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
