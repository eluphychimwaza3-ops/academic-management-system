"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, CheckCircle, AlertCircle, Upload, File, Trash2 } from "lucide-react"
import Link from "next/link"
import { admissionsApi } from "@/lib/api-utils"

export default function ApplicationForm() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submissionId, setSubmissionId] = useState<number | null>(null)
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    date_of_birth: "",
    gender: "",
    address: "",
    city: "",
    country: "",
    previous_school: "",
    qualification: "",
    year_of_completion: "",
    selected_course_id: "",
    study_mode: "",
  })
  const [uploadedDocuments, setUploadedDocuments] = useState<Array<{ name: string; type: string; size: number }>>([])
  const [uploading, setUploading] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, documentType: string) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    const file = files[0]
    setUploading(true)

    try {
      // Store temporarily (would use API if admission exists)
      setUploadedDocuments((prev) => [
        ...prev,
        {
          name: file.name,
          type: documentType,
          size: file.size,
        },
      ])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed")
    } finally {
      setUploading(false)
    }
  }

  const validateStep1 = () => {
    if (
      !formData.first_name ||
      !formData.last_name ||
      !formData.email ||
      !formData.phone ||
      !formData.date_of_birth ||
      !formData.gender ||
      !formData.address ||
      !formData.city ||
      !formData.country
    ) {
      setError("Please fill in all fields on this step")
      return false
    }
    if (!formData.email.includes("@")) {
      setError("Please enter a valid email address")
      return false
    }
    return true
  }

  const validateStep2 = () => {
    if (
      !formData.previous_school ||
      !formData.qualification ||
      !formData.year_of_completion ||
      !formData.selected_course_id ||
      !formData.study_mode
    ) {
      setError("Please fill in all fields on this step")
      return false
    }
    const year = Number.parseInt(formData.year_of_completion)
    if (year < 1990 || year > new Date().getFullYear()) {
      setError("Please enter a valid year of completion")
      return false
    }
    return true
  }

  const validateStep3 = () => {
    if (uploadedDocuments.length === 0) {
      setError("Please upload all required documents")
      return false
    }
    return true
  }

  const handleSubmit = async () => {
    setError(null)

    if (step === 1) {
      if (validateStep1()) {
        setStep(2)
      }
    } else if (step === 2) {
      if (validateStep2()) {
        setStep(3)
      }
    } else {
      if (validateStep3()) {
        await submitApplication()
      }
    }
  }

  const submitApplication = async () => {
    try {
      setLoading(true)

      const response = await admissionsApi.submit(formData)

      if (response.success) {
        setSubmissionId(response.data?.admission_id)
        setSubmitted(true)
        setTimeout(() => {
          router.push("/admission/track")
        }, 3000)
      } else {
        setError(response.error || "Failed to submit application")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred while submitting")
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="border border-border w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </div>
            <CardTitle className="text-2xl">Application Submitted!</CardTitle>
            <CardDescription>Your application has been successfully submitted</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              We have received your admission application. An email confirmation has been sent to {formData.email}.
            </p>
            {submissionId && (
              <p className="text-sm font-mono font-medium text-foreground">
                Application ID: <span className="text-primary">{submissionId}</span>
              </p>
            )}
            <p className="text-sm text-muted-foreground">
              Please check your email for further instructions and track your application status.
            </p>
            <p className="text-sm font-medium text-foreground">Processing time: 5-7 business days</p>
          </CardContent>
        </Card>
      </div>
    )
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
          <div className="text-right">
            <p className="text-sm font-medium text-foreground">Step {step} of 3</p>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${step >= 1 ? "bg-primary text-white" : "bg-border text-muted-foreground"}`}
            >
              1
            </div>
            <div className={`flex-1 h-1 ${step >= 2 ? "bg-primary" : "bg-border"}`} />
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${step >= 2 ? "bg-primary text-white" : "bg-border text-muted-foreground"}`}
            >
              2
            </div>
            <div className={`flex-1 h-1 ${step >= 3 ? "bg-primary" : "bg-border"}`} />
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${step >= 3 ? "bg-primary text-white" : "bg-border text-muted-foreground"}`}
            >
              3
            </div>
          </div>
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Personal Information</span>
            <span>Academic Background</span>
            <span>Document Upload</span>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Form Card */}
        <Card className="border border-border">
          <CardHeader>
            <CardTitle>
              {step === 1
                ? "Personal Information"
                : step === 2
                  ? "Academic Background & Course Selection"
                  : "Document Upload"}
            </CardTitle>
            <CardDescription>
              {step === 1
                ? "Please provide your basic information"
                : step === 2
                  ? "Tell us about your academic background"
                  : "Upload your required documents"}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {step === 1 ? (
              <>
                {/* Personal Information Section */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="first_name">First Name *</Label>
                    <Input
                      id="first_name"
                      name="first_name"
                      value={formData.first_name}
                      onChange={handleInputChange}
                      placeholder="Enter your first name"
                      required
                      disabled={loading}
                    />
                  </div>
                  <div>
                    <Label htmlFor="last_name">Last Name *</Label>
                    <Input
                      id="last_name"
                      name="last_name"
                      value={formData.last_name}
                      onChange={handleInputChange}
                      placeholder="Enter your last name"
                      required
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="your@email.com"
                      required
                      disabled={loading}
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="+1 (555) 000-0000"
                      required
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="date_of_birth">Date of Birth *</Label>
                    <Input
                      id="date_of_birth"
                      name="date_of_birth"
                      type="date"
                      value={formData.date_of_birth}
                      onChange={handleInputChange}
                      required
                      disabled={loading}
                    />
                  </div>
                  <div>
                    <Label htmlFor="gender">Gender *</Label>
                    <Select
                      value={formData.gender}
                      onValueChange={(value) => handleSelectChange("gender", value)}
                      disabled={loading}
                    >
                      <SelectTrigger id="gender">
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="address">Address *</Label>
                  <Input
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="Street address"
                    required
                    disabled={loading}
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      placeholder="City"
                      required
                      disabled={loading}
                    />
                  </div>
                  <div>
                    <Label htmlFor="country">Country *</Label>
                    <Input
                      id="country"
                      name="country"
                      value={formData.country}
                      onChange={handleInputChange}
                      placeholder="Country"
                      required
                      disabled={loading}
                    />
                  </div>
                </div>
              </>
            ) : step === 2 ? (
              <>
                {/* Academic Background Section */}
                <div>
                  <Label htmlFor="previous_school">Previous School/College *</Label>
                  <Input
                    id="previous_school"
                    name="previous_school"
                    value={formData.previous_school}
                    onChange={handleInputChange}
                    placeholder="Name of your previous school"
                    required
                    disabled={loading}
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="qualification">Qualification *</Label>
                    <Select
                      value={formData.qualification}
                      onValueChange={(value) => handleSelectChange("qualification", value)}
                      disabled={loading}
                    >
                      <SelectTrigger id="qualification">
                        <SelectValue placeholder="Select qualification" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="high-school">High School Diploma</SelectItem>
                        <SelectItem value="associate">Associate Degree</SelectItem>
                        <SelectItem value="bachelor">Bachelor's Degree</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="year_of_completion">Year of Completion *</Label>
                    <Input
                      id="year_of_completion"
                      name="year_of_completion"
                      type="number"
                      value={formData.year_of_completion}
                      onChange={handleInputChange}
                      placeholder="2023"
                      required
                      disabled={loading}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="selected_course_id">Preferred Course *</Label>
                  <Select
                    value={formData.selected_course_id}
                    onValueChange={(value) => handleSelectChange("selected_course_id", value)}
                    disabled={loading}
                  >
                    <SelectTrigger id="selected_course_id">
                      <SelectValue placeholder="Select a course" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Bachelor of Technology in Computer Science</SelectItem>
                      <SelectItem value="2">Bachelor of Technology in Information Technology</SelectItem>
                      <SelectItem value="3">Bachelor of Science in Computer Science</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="study_mode">Study Mode *</Label>
                  <Select
                    value={formData.study_mode}
                    onValueChange={(value) => handleSelectChange("study_mode", value)}
                    disabled={loading}
                  >
                    <SelectTrigger id="study_mode">
                      <SelectValue placeholder="Select study mode" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="full-time">Full-time</SelectItem>
                      <SelectItem value="part-time">Part-time</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Alert>
                  <AlertDescription>
                    After submitting your application, you can track its status using the tracking page.
                  </AlertDescription>
                </Alert>
              </>
            ) : (
              <>
                {/* Document Upload Section */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="transcript">Transcript *</Label>
                    <Button variant="outline" disabled={uploading}>
                      Upload <Upload className="ml-2 h-4 w-4" />
                    </Button>
                    <Input
                      id="transcript"
                      name="transcript"
                      type="file"
                      className="hidden"
                      onChange={(e) => handleFileUpload(e, "transcript")}
                      disabled={uploading}
                    />
                  </div>
                  {uploadedDocuments.map((doc) => (
                    <div key={doc.name} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <File className="h-4 w-4" />
                        <span>{doc.name}</span>
                      </div>
                      <Button
                        variant="outline"
                        onClick={() => setUploadedDocuments((prev) => prev.filter((d) => d.name !== doc.name))}
                        disabled={uploading}
                      >
                        Remove <Trash2 className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8">
          {step === 2 && (
            <Button variant="outline" onClick={() => setStep(1)} disabled={loading}>
              Previous
            </Button>
          )}
          {step === 3 && (
            <Button variant="outline" onClick={() => setStep(2)} disabled={loading}>
              Previous
            </Button>
          )}
          <div className="flex-1" />
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Processing..." : step === 1 ? "Continue" : step === 2 ? "Next" : "Submit Application"}
          </Button>
        </div>
      </main>
    </div>
  )
}
