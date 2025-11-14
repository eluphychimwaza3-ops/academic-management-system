"use client"

import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, ClipboardList, CheckCircle } from "lucide-react"

export default function AdmissionHome() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-white font-bold">
              CMS
            </div>
            <h1 className="text-2xl font-bold text-foreground">College Admissions</h1>
          </div>
          <Link href="/login">
            <Button variant="outline">Back to Login</Button>
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Welcome Section */}
        <div className="mb-12 text-center">
          <h2 className="text-4xl font-bold text-foreground mb-4">Start Your Journey With Us</h2>
          <p className="text-xl text-muted-foreground">Apply for admission to our college programs</p>
        </div>

        {/* Process Steps */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card className="border border-border text-center">
            <CardHeader>
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center">
                  <ClipboardList className="w-8 h-8 text-primary" />
                </div>
              </div>
              <CardTitle>Step 1: Fill Application</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Complete the online application form with your personal and academic information
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="border border-border text-center">
            <CardHeader>
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-secondary/10 rounded-lg flex items-center justify-center">
                  <FileText className="w-8 h-8 text-secondary" />
                </div>
              </div>
              <CardTitle>Step 2: Upload Documents</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Upload required documents including ID, certificates, and proof of payment
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="border border-border text-center">
            <CardHeader>
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-accent/10 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-accent" />
                </div>
              </div>
              <CardTitle>Step 3: Track Status</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>Monitor your application status and receive updates via email</CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* Admission Button */}
        <div className="text-center mb-12">
          <Link href="/admission/apply">
            <Button size="lg" className="gap-2">
              <ClipboardList className="w-5 h-5" />
              Apply Now
            </Button>
          </Link>
        </div>

        {/* Requirements Card */}
        <Card className="border border-border max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Admission Requirements</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium text-foreground mb-2">Required Documents:</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>✓ Valid Government ID or Passport</li>
                <li>✓ High School/Secondary School Certificate</li>
                <li>✓ Official Transcripts</li>
                <li>✓ Passport-size Photograph</li>
                <li>✓ Proof of Payment (Application Fee)</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-foreground mb-2">Important Notes:</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• All documents must be in PDF, JPG, or PNG format</li>
                <li>• Maximum file size per document: 10MB</li>
                <li>• Application processing takes 5-7 business days</li>
                <li>• You will receive status updates via email</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
