"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, Search } from "lucide-react"

interface Application {
  admission_id: number
  user_id: number
  first_name: string
  last_name: string
  email: string
  selected_course_id: number
  course_name: string
  application_status: string
  applied_date: string
  reviewed_date: string | null
  gpa: number
  test_score: number
}

export default function TrackApplication() {
  const [searchId, setSearchId] = useState("")
  const [selectedApp, setSelectedApp] = useState<Application | null>(null)

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: "bg-yellow-100 text-yellow-800",
      under_review: "bg-blue-100 text-blue-800",
      approved: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800",
      completed: "bg-purple-100 text-purple-800",
    }
    return colors[status] || "bg-gray-100 text-gray-800"
  }

  const getStatusDescription = (status: string) => {
    const descriptions: Record<string, string> = {
      pending: "Your application is in the queue. We will review it soon.",
      under_review: "Your application is being reviewed by our admissions team.",
      approved: "Congratulations! Your application has been approved.",
      rejected: "Unfortunately, your application was not approved at this time.",
      completed: "Your application process is complete. Welcome to our college!",
    }
    return descriptions[status] || "Your application is being processed."
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/admission" className="flex items-center gap-2 text-foreground hover:text-primary">
            <ArrowLeft className="w-5 h-5" />
            Back to Admission
          </Link>
          <h1 className="text-xl font-bold text-foreground">Track Application</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-2">Track Your Application Status</h2>
          <p className="text-muted-foreground">Enter your application ID or email to check the status</p>
        </div>

        {/* Search Box */}
        <Card className="border border-border mb-8">
          <CardHeader>
            <CardTitle className="text-lg">Search Application</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Enter Application ID or Email"
                  className="pl-10"
                  value={searchId}
                  onChange={(e) => setSearchId(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Applications List or Detail */}
        {selectedApp ? (
          <Card className="border border-border">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle>{selectedApp.first_name} {selectedApp.last_name}</CardTitle>
                  <CardDescription>Application ID: {selectedApp.admission_id}</CardDescription>
                </div>
                <Button variant="outline" onClick={() => setSelectedApp(null)}>
                  Back
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Email</p>
                  <p className="text-foreground">{selectedApp.email}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Applied Course</p>
                  <p className="text-foreground">{selectedApp.course_name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Application Date</p>
                  <p className="text-foreground">
                    {new Date(selectedApp.applied_date).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Status</p>
                  <Badge className={getStatusColor(selectedApp.application_status)}>
                    {selectedApp.application_status}
                  </Badge>
                </div>
              </div>

              <Alert>
                <AlertDescription>{getStatusDescription(selectedApp.application_status)}</AlertDescription>
              </Alert>

              <div>
                <p className="text-sm font-medium text-muted-foreground mb-3">Processing Progress</p>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Overall Progress</span>
                    <span className="font-medium">
                      {selectedApp.application_status === "approved" ? 100 : selectedApp.application_status === "pending" ? 33 : 66}%
                    </span>
                  </div>
                  <div className="w-full bg-border rounded-full h-3 overflow-hidden">
                    <div
                      className="bg-primary h-full transition-all"
                      style={{
                        width: `${selectedApp.application_status === "approved" ? 100 : selectedApp.application_status === "pending" ? 33 : 66}%`,
                      }}
                    />
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-foreground mb-3">Processing Timeline</h4>
                <div className="space-y-3">
                  {[
                    { step: "Application Received", date: new Date(selectedApp.applied_date).toLocaleDateString(), done: true },
                    {
                      step: "Document Verification",
                      date: "In Progress",
                      done: selectedApp.application_status !== "pending",
                    },
                    { step: "Final Review", date: "Pending", done: selectedApp.application_status === "approved" },
                    { step: "Final Decision", date: "Pending", done: selectedApp.application_status === "approved" },
                  ].map((timeline, i) => (
                    <div key={i} className="flex gap-4">
                      <div
                        className={`w-4 h-4 rounded-full border-2 mt-1 flex-shrink-0 ${timeline.done ? "bg-green-500 border-green-500" : "border-border"}`}
                      />
                      <div className="flex-1">
                        <p className="font-medium text-foreground">{timeline.step}</p>
                        <p className="text-sm text-muted-foreground">{timeline.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Alert>
            <AlertDescription>
              {searchId
                ? "No applications found matching your search. Try searching by Application ID or Email."
                : "Enter your Application ID or Email to track your status."}
            </AlertDescription>
          </Alert>
        )}
      </main>
    </div>
  )
}
