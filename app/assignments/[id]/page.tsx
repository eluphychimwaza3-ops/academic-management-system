"use client"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, Download, FileText, AlertCircle } from "lucide-react"

const assignmentDetails = {
  1: {
    title: "Python Basics - Hello World",
    subject: "Introduction to Programming",
    lecturer: "Michael Smith",
    description: "Create a simple Python program that prints a greeting message",
    dueDate: "2024-12-15",
    totalMarks: 10,
    type: "homework",
    instructions: `
Create a Python program that:
1. Prints a greeting message
2. Includes your name and date
3. Uses proper formatting
4. Is well-commented

Requirements:
- Use Python 3.9 or above
- File should be named hello_world.py
- Include at least 3 comments
- Test your program before submission
    `,
    submissions: 35,
    totalStudents: 45,
    resources: [
      { title: "Python Tutorial", url: "#" },
      { title: "Style Guide", url: "#" },
      { title: "Example Code", url: "#" },
    ],
  },
}

export default function AssignmentDetailPage() {
  const params = useParams()
  const router = useRouter()
  const assignmentId = params.id as string
  const assignment = assignmentDetails[assignmentId as keyof typeof assignmentDetails]

  if (!assignment) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="border border-border w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground">Assignment not found</p>
            <Link href="/assignments">
              <Button className="mt-4">Back to Assignments</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  const calculateProgress = (submissions: number, total: number) => {
    return Math.round((submissions / total) * 100)
  }

  const isOverdue = new Date(assignment.dueDate) < new Date()

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/assignments" className="flex items-center gap-2 text-foreground hover:text-primary">
            <ArrowLeft className="w-5 h-5" />
            Back to Assignments
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Assignment Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Badge
                  className={`${assignment.type === "homework" ? "bg-blue-100 text-blue-800" : "bg-purple-100 text-purple-800"}`}
                >
                  {assignment.type}
                </Badge>
                <Badge variant="outline">{assignment.totalMarks} marks</Badge>
                {isOverdue && <Badge className="bg-red-100 text-red-800">Overdue</Badge>}
              </div>
              <h1 className="text-3xl font-bold text-foreground mb-2">{assignment.title}</h1>
              <p className="text-muted-foreground">
                {assignment.subject} • Lecturer: {assignment.lecturer}
              </p>
            </div>
          </div>

          {isOverdue && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>This assignment is overdue. Late submissions may be penalized.</AlertDescription>
            </Alert>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card className="border border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Due Date</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-bold text-foreground">{assignment.dueDate}</p>
            </CardContent>
          </Card>
          <Card className="border border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Marks</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-bold text-foreground">{assignment.totalMarks}</p>
            </CardContent>
          </Card>
          <Card className="border border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Submissions</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-bold text-foreground">
                {assignment.submissions}/{assignment.totalStudents}
              </p>
            </CardContent>
          </Card>
          <Card className="border border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Completion</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-bold text-foreground">
                {calculateProgress(assignment.submissions, assignment.totalStudents)}%
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="instructions">Instructions</TabsTrigger>
            <TabsTrigger value="resources">Resources</TabsTrigger>
            <TabsTrigger value="submissions">Submissions</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <Card className="border border-border">
              <CardHeader>
                <CardTitle>Assignment Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium text-foreground mb-2">Description</h4>
                  <p className="text-muted-foreground">{assignment.description}</p>
                </div>

                <div>
                  <h4 className="font-medium text-foreground mb-3">Submission Progress</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Submitted</span>
                      <span className="font-medium">
                        {assignment.submissions} of {assignment.totalStudents}
                      </span>
                    </div>
                    <div className="w-full bg-border rounded-full h-3 overflow-hidden">
                      <div
                        className="bg-primary h-full transition-all"
                        style={{ width: `${calculateProgress(assignment.submissions, assignment.totalStudents)}%` }}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="instructions" className="space-y-6">
            <Card className="border border-border">
              <CardHeader>
                <CardTitle>Assignment Instructions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none dark:prose-invert">
                  <pre className="bg-secondary/10 p-4 rounded-lg overflow-auto text-sm text-foreground whitespace-pre-wrap">
                    {assignment.instructions}
                  </pre>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="resources" className="space-y-6">
            <Card className="border border-border">
              <CardHeader>
                <CardTitle>Learning Resources</CardTitle>
                <CardDescription>Materials to help you complete this assignment</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {assignment.resources.map((resource, i) => (
                    <div key={i} className="flex items-center justify-between p-3 border border-border rounded-lg">
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-muted-foreground" />
                        <span className="font-medium text-foreground">{resource.title}</span>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="submissions" className="space-y-6">
            <Card className="border border-border">
              <CardHeader>
                <CardTitle>Submission Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="font-medium text-foreground mb-2">Submission Status</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Submitted</span>
                      <span className="font-medium text-green-600">{assignment.submissions} students</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Pending</span>
                      <span className="font-medium text-yellow-600">
                        {assignment.totalStudents - assignment.submissions} students
                      </span>
                    </div>
                  </div>
                </div>

                <Alert>
                  <AlertDescription>
                    Students can still submit assignments after the due date, but may face penalties.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Action Buttons */}
        <div className="mt-8 flex gap-4">
          <Link href="/login">
            <Button>Login to Submit</Button>
          </Link>
          <Link href="/assignments">
            <Button variant="outline">View All Assignments</Button>
          </Link>
        </div>
      </main>
    </div>
  )
}
