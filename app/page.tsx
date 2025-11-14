"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, Users, FileText, BarChart3 } from "lucide-react"

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image
              src="/Exploits.jpg"
              alt="Exploits University Logo"
              width={40}
              height={40}
              className="rounded-md"
            />
            <h1 className="text-2xl font-bold text-foreground">College Management System</h1>
          </div>
          <div className="flex gap-3">
            <Link href="/login">
              <Button variant="outline">Login</Button>
            </Link>
            <Link href="/signup">
              <Button>Sign Up</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-foreground mb-4">Welcome to CMS</h2>
          <p className="text-xl text-muted-foreground mb-8">
            A comprehensive platform for managing admissions, assignments, and grading
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/login">
              <Button size="lg">Get Started</Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline">
                Learn More
              </Button>
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-16">
          <Card className="border border-border hover:border-primary/50 transition-colors">
            <CardHeader>
              <Users className="w-8 h-8 text-primary mb-2" />
              <CardTitle className="text-lg">Admin Dashboard</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>Manage users, system settings, and oversee all operations</CardDescription>
            </CardContent>
          </Card>

          <Card className="border border-border hover:border-primary/50 transition-colors">
            <CardHeader>
              <FileText className="w-8 h-8 text-secondary mb-2" />
              <CardTitle className="text-lg">Admissions</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>Handle student applications and admission workflows</CardDescription>
            </CardContent>
          </Card>

          <Card className="border border-border hover:border-primary/50 transition-colors">
            <CardHeader>
              <BookOpen className="w-8 h-8 text-accent mb-2" />
              <CardTitle className="text-lg">Assignments</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>Create and manage assignments for courses</CardDescription>
            </CardContent>
          </Card>

          <Card className="border border-border hover:border-primary/50 transition-colors">
            <CardHeader>
              <BarChart3 className="w-8 h-8 text-chart-2 mb-2" />
              <CardTitle className="text-lg">Grading</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>Track and report student performance metrics</CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* Stats Section */}
        <div className="grid md:grid-cols-3 gap-6 mt-16">
          <Card className="border border-border">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">250+</div>
              <p className="text-xs text-muted-foreground mt-2">Active users in system</p>
            </CardContent>
          </Card>

          <Card className="border border-border">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">Active Courses</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-secondary">45</div>
              <p className="text-xs text-muted-foreground mt-2">Running this semester</p>
            </CardContent>
          </Card>

          <Card className="border border-border">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">Pending Admissions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-accent">12</div>
              <p className="text-xs text-muted-foreground mt-2">Applications under review</p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
