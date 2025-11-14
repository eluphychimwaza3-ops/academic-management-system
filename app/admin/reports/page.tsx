"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, BarChart3, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { API_ENDPOINTS } from "@/lib/api-config"

interface ReportData {
  [key: string]: any
}

type ReportType = "enrollment" | "grades" | "assignments" | "admissions"

export default function ReportsPage() {
  const [reportType, setReportType] = useState<ReportType>("enrollment")
  const [reportData, setReportData] = useState<ReportData[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const reports = [
    { id: "enrollment", name: "Student Enrollment Report", description: "Course-wise enrollment statistics" },
    { id: "grades", name: "Academic Performance Report", description: "Student grades and GPA analysis" },
    {
      id: "assignments",
      name: "Assignment Submission Report",
      description: "Assignment submission rates and completion",
    },
    { id: "admissions", name: "Admissions Report", description: "Application status and admission statistics" },
  ]

  useEffect(() => {
    const fetchReport = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await fetch(`${API_ENDPOINTS.admin.reports}?type=${reportType}`)
        if (!response.ok) throw new Error("Failed to fetch report")
        const data = await response.json()
        setReportData(Array.isArray(data.data) ? data.data : [])
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred")
        setReportData([])
      } finally {
        setLoading(false)
      }
    }

    fetchReport()
  }, [reportType])

  const getTableColumns = () => {
    if (reportData.length === 0) return []
    return Object.keys(reportData[0]).filter((key) => key !== "id")
  }

  const renderCellValue = (value: any) => {
    if (value === null || value === undefined) return "—"
    if (typeof value === "number") return value.toFixed(2)
    return String(value)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Reports & Analytics</h1>
        <p className="text-muted-foreground">Generate and view system reports</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {reports.map((report) => (
          <Card
            key={report.id}
            className={`border cursor-pointer transition-all ${
              reportType === report.id ? "border-primary bg-primary/5" : "border-border"
            }`}
            onClick={() => setReportType(report.id as ReportType)}
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-primary" />
                    {report.name}
                  </CardTitle>
                  <CardDescription>{report.description}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button
                className="gap-2"
                onClick={() => {
                  const csv = generateCSV()
                  downloadCSV(csv, `${report.id}_report.csv`)
                }}
                disabled={reportData.length === 0}
              >
                <Download className="w-4 h-4" />
                Download Report
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card className="border border-border">
        <CardHeader>
          <CardTitle>Report Data</CardTitle>
          <CardDescription>{loading ? "Loading..." : `${reportData.length} records`}</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : reportData.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No data available for this report.</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    {getTableColumns().map((column) => (
                      <TableHead key={column}>{column.replace(/_/g, " ")}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reportData.map((row, idx) => (
                    <TableRow key={idx}>
                      {getTableColumns().map((column) => (
                        <TableCell key={`${idx}-${column}`}>{renderCellValue(row[column])}</TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )

  function generateCSV(): string {
    if (reportData.length === 0) return ""
    const headers = getTableColumns()
    const csvContent = [
      headers.map((h) => `"${h}"`).join(","),
      ...reportData.map((row) => headers.map((header) => `"${renderCellValue(row[header])}"`).join(",")),
    ].join("\n")
    return csvContent
  }

  function downloadCSV(csv: string, filename: string) {
    const blob = new Blob([csv], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = filename
    link.click()
  }
}
