"use client"
import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Eye, CheckCircle, XCircle, AlertCircle, Clock } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { admissionsApi } from "@/lib/api-utils"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface Admission {
  admission_id: number
  first_name: string
  last_name: string
  email: string
  phone?: string
  selected_course_id: number
  course_name: string
  application_status: string
  applied_date: string
  reviewed_date: string | null
  admin_feedback?: string
  date_of_birth?: string
  gender?: string
  address?: string
  city?: string
  country?: string
  previous_school?: string
  qualification?: string
  year_of_completion?: number
  study_mode?: string
}

export default function AdmissionsPage() {
  const [admissions, setAdmissions] = useState<Admission[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedAdmission, setSelectedAdmission] = useState<Admission | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [feedback, setFeedback] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [actionInProgress, setActionInProgress] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("all")

  useEffect(() => {
    fetchAdmissions()
  }, [])

  const fetchAdmissions = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await admissionsApi.getAll()
      if (response.success && response.data) {
        setAdmissions(Array.isArray(response.data) ? response.data : [])
      } else {
        setError(response.error || "Failed to fetch admissions")
        setAdmissions([])
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
      setAdmissions([])
    } finally {
      setLoading(false)
    }
  }

  const handleView = (admission: Admission) => {
    setSelectedAdmission(admission)
    setFeedback(admission.admin_feedback || "")
    setIsDialogOpen(true)
  }

  const handleUnderReview = async (admission: Admission) => {
    if (!admission) return
    try {
      setIsSubmitting(true)
      setActionInProgress("under_review")
      setError(null)

      const response = await admissionsApi.underReview(admission.admission_id)

      if (response.success) {
        await fetchAdmissions()
      } else {
        setError(response.error || "Failed to update status")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsSubmitting(false)
      setActionInProgress(null)
    }
  }

  const handleApprove = async () => {
    if (!selectedAdmission) return

    try {
      setIsSubmitting(true)
      setActionInProgress("approve")
      setError(null)

      let userId = 1
      try {
        const userStr = localStorage.getItem("user")
        if (userStr) {
          const user = JSON.parse(userStr)
          userId = user.user_id || user.admin_id || 1
        }
      } catch (e) {
        console.error("Failed to parse user from localStorage:", e)
      }

      const response = await admissionsApi.approve(selectedAdmission.admission_id, userId, feedback)

      if (response.success) {
        setIsDialogOpen(false)
        setFeedback("")
        setSelectedAdmission(null)
        await fetchAdmissions()
      } else {
        setError(response.error || "Failed to approve admission")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsSubmitting(false)
      setActionInProgress(null)
    }
  }

  const handleReject = async () => {
    if (!selectedAdmission) return

    try {
      setIsSubmitting(true)
      setActionInProgress("reject")
      setError(null)

      let userId = 1
      try {
        const userStr = localStorage.getItem("user")
        if (userStr) {
          const user = JSON.parse(userStr)
          userId = user.user_id || user.admin_id || 1
        }
      } catch (e) {
        console.error("Failed to parse user from localStorage:", e)
      }

      const response = await admissionsApi.reject(selectedAdmission.admission_id, userId, feedback)

      if (response.success) {
        setIsDialogOpen(false)
        setFeedback("")
        setSelectedAdmission(null)
        await fetchAdmissions()
      } else {
        setError(response.error || "Failed to reject admission")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsSubmitting(false)
      setActionInProgress(null)
    }
  }

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      pending: "bg-yellow-100 text-yellow-800",
      under_review: "bg-blue-100 text-blue-800",
      approved: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800",
      completed: "bg-purple-100 text-purple-800",
    }
    return colors[status] || "bg-gray-100 text-gray-800"
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <AlertCircle className="w-4 h-4" />
      case "under_review":
        return <Clock className="w-4 h-4" />
      case "approved":
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case "rejected":
        return <XCircle className="w-4 h-4 text-red-600" />
      case "completed":
        return <CheckCircle className="w-4 h-4 text-purple-600" />
      default:
        return null
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "—"
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const filteredAdmissions = admissions.filter((adm) => {
    if (activeTab === "all") return true
    return adm.application_status === activeTab
  })

  const statsCount = {
    total: admissions.length,
    pending: admissions.filter((a) => a.application_status === "pending").length,
    under_review: admissions.filter((a) => a.application_status === "under_review").length,
    approved: admissions.filter((a) => a.application_status === "approved").length,
    rejected: admissions.filter((a) => a.application_status === "rejected").length,
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Admission Management</h1>
        <p className="text-muted-foreground">Review and manage student admission applications</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Applications</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{statsCount.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-yellow-600">{statsCount.pending}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Under Review</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-blue-600">{statsCount.under_review}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Approved</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">{statsCount.approved}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Rejected</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-600">{statsCount.rejected}</p>
          </CardContent>
        </Card>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card className="border border-border">
        <CardHeader>
          <CardTitle>Admission Applications</CardTitle>
          <CardDescription>Total: {filteredAdmissions.length} applications</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Tabs for filtering */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full mb-6">
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="under_review">Under Review</TabsTrigger>
              <TabsTrigger value="approved">Approved</TabsTrigger>
              <TabsTrigger value="rejected">Rejected</TabsTrigger>
            </TabsList>
          </Tabs>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : filteredAdmissions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No admission applications found.</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Applicant Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Course</TableHead>
                    <TableHead>Applied Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAdmissions.map((admission) => (
                    <TableRow key={admission.admission_id}>
                      <TableCell className="font-medium">
                        {admission.first_name} {admission.last_name}
                      </TableCell>
                      <TableCell>{admission.email}</TableCell>
                      <TableCell>{admission.course_name || "N/A"}</TableCell>
                      <TableCell>{formatDate(admission.applied_date)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(admission.application_status)}
                          <Badge className={getStatusBadge(admission.application_status)}>
                            {admission.application_status.replace(/_/g, " ")}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="text-right space-x-1">
                        <Button variant="ghost" size="sm" onClick={() => handleView(admission)}>
                          <Eye className="w-4 h-4" />
                        </Button>
                        {admission.application_status === "pending" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleUnderReview(admission)}
                            disabled={isSubmitting}
                            title="Mark as under review"
                          >
                            <Clock className="w-4 h-4 text-blue-500" />
                          </Button>
                        )}
                        {(admission.application_status === "pending" ||
                          admission.application_status === "under_review") && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={handleApprove}
                              disabled={isSubmitting}
                              title="Approve"
                            >
                              <CheckCircle className="w-4 h-4 text-green-500" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={handleReject}
                              disabled={isSubmitting}
                              title="Reject"
                            >
                              <XCircle className="w-4 h-4 text-red-500" />
                            </Button>
                          </>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Details Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Admission Details</DialogTitle>
            <DialogDescription>
              Application from {selectedAdmission?.first_name} {selectedAdmission?.last_name}
            </DialogDescription>
          </DialogHeader>

          {selectedAdmission && (
            <div className="space-y-6">
              {/* Personal Information */}
              <div>
                <h3 className="font-semibold text-sm mb-3">Personal Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Name</label>
                    <p>
                      {selectedAdmission.first_name} {selectedAdmission.last_name}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Email</label>
                    <p>{selectedAdmission.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Phone</label>
                    <p>{selectedAdmission.phone || "N/A"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Date of Birth</label>
                    <p>{formatDate(selectedAdmission.date_of_birth)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Gender</label>
                    <p>{selectedAdmission.gender || "N/A"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Address</label>
                    <p>{selectedAdmission.address || "N/A"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">City</label>
                    <p>{selectedAdmission.city || "N/A"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Country</label>
                    <p>{selectedAdmission.country || "N/A"}</p>
                  </div>
                </div>
              </div>

              {/* Academic Information */}
              <div>
                <h3 className="font-semibold text-sm mb-3">Academic Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Previous School</label>
                    <p>{selectedAdmission.previous_school || "N/A"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Qualification</label>
                    <p>{selectedAdmission.qualification || "N/A"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Year of Completion</label>
                    <p>{selectedAdmission.year_of_completion || "N/A"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Study Mode</label>
                    <p>{selectedAdmission.study_mode || "N/A"}</p>
                  </div>
                </div>
              </div>

              {/* Application Status */}
              <div>
                <h3 className="font-semibold text-sm mb-3">Application Status</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Applied Date</label>
                    <p>{formatDate(selectedAdmission.applied_date)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Current Status</label>
                    <Badge className={getStatusBadge(selectedAdmission.application_status)}>
                      {selectedAdmission.application_status.replace(/_/g, " ")}
                    </Badge>
                  </div>
                  {selectedAdmission.reviewed_date && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Reviewed Date</label>
                      <p>{formatDate(selectedAdmission.reviewed_date)}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Feedback Section */}
              <div>
                <label className="text-sm font-medium">Admin Feedback</label>
                <Textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Add your feedback here..."
                  disabled={isSubmitting}
                  className="mt-2"
                />
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {selectedAdmission.application_status === "pending" ||
              selectedAdmission.application_status === "under_review" ? (
                <div className="flex justify-end gap-3 pt-4">
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isSubmitting}>
                    Close
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleReject}
                    disabled={isSubmitting || actionInProgress === "approve"}
                  >
                    {actionInProgress === "reject" && isSubmitting ? "Processing..." : "Reject"}
                  </Button>
                  <Button onClick={handleApprove} disabled={isSubmitting || actionInProgress === "reject"}>
                    {actionInProgress === "approve" && isSubmitting ? "Processing..." : "Approve & Admit"}
                  </Button>
                </div>
              ) : (
                <div className="flex justify-end pt-4">
                  <Button onClick={() => setIsDialogOpen(false)}>Close</Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
