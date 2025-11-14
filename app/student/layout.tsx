"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import ExploitsLogo from "../Exploits.jpg"
import { Button } from "@/components/ui/button"
import { LayoutDashboard, BookOpen, FileText, Trophy, LogOut, Menu, X } from "lucide-react"

interface User {
  first_name: string
  last_name: string
  email: string
  role: string
  id: number
}

const navItems = [
  { href: "/student", label: "Dashboard", icon: LayoutDashboard },
  { href: "/student/courses", label: "Courses", icon: BookOpen },
  { href: "/student/assignments", label: "Assignments", icon: FileText },
  { href: "/student/grades", label: "Grades", icon: Trophy },
]

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [user, setUser] = useState<User | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const userStr = localStorage.getItem("user")
    if (!userStr) {
      router.push("/login")
      return
    }
    const userData = JSON.parse(userStr)
    if (userData.role !== "student") {
      router.push("/login")
      return
    }
    setUser(userData)
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem("user")
    router.push("/login")
  }

  if (!user) return <div className="flex items-center justify-center min-h-screen">Loading...</div>

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? "w-64" : "w-20"
        } border-r border-border bg-card transition-all duration-300 overflow-hidden flex flex-col`}
      >
        {/* Logo */}
        <div className="p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <Image src={ExploitsLogo} alt="Exploits University" width={40} height={40} className="rounded-lg object-cover" /> Student
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <Link key={item.href} href={item.href}>
                <Button variant="ghost" className="w-full justify-start gap-3" title={item.label}>
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {sidebarOpen && <span>{item.label}</span>}
                </Button>
              </Link>
            )
          })}
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-border">
          {sidebarOpen && (
            <div className="mb-3 text-xs">
              <p className="font-medium text-foreground truncate">{user.first_name} {user.last_name}</p>
              <p className="text-muted-foreground truncate">{user.email}</p>
            </div>
          )}
          <Button variant="outline" size="sm" onClick={handleLogout} className="w-full gap-2 bg-transparent">
            <LogOut className="w-4 h-4" />
            {sidebarOpen && "Logout"}
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="border-b border-border bg-card px-6 py-4 flex items-center justify-between">
          <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
          <div className="text-right">
            <p className="text-sm font-medium text-foreground">Welcome, {user.first_name} {user.last_name}</p>
            <p className="text-xs text-muted-foreground">Student</p>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-auto">
          <div className="p-8">{children}</div>
        </main>
      </div>
    </div>
  )
}
