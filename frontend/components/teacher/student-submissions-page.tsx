"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Eye, Download } from "lucide-react"
import { Progress } from "@/components/ui/progress"

export function StudentSubmissionsPage() {
  const [submissions, setSubmissions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/get_results/0/teacher`)
        const data = await response.json()
        const formatted = data.map((sub: any) => ({
          id: sub.id,
          studentName: sub.student_id, // Replace with actual student name if available
          questionId: sub.question_id,
          submissionType: sub.file_path ? "File" : "Text",
          similarityScore: sub.score,
          submittedAt: sub.timestamp,
          status: "Graded", // Or use sub.status if available
        }))
        setSubmissions(formatted)
      } catch (err) {
        setSubmissions([])
      } finally {
        setLoading(false)
      }
    }
    fetchSubmissions()
  }, [])

  const getSimilarityColor = (score: number) => {
    if (score >= 80) return "text-green-600"
    if (score >= 60) return "text-yellow-600"
    return "text-red-600"
  }

  const getSimilarityVariant = (score: number) => {
    if (score >= 80) return "default"
    if (score >= 60) return "secondary"
    return "destructive"
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Student Submissions</h1>
        <p className="text-muted-foreground">Review and grade student submissions</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Submissions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{submissions.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{submissions.filter((s) => s.status === "Pending").length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Similarity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {submissions.length > 0 ? Math.round(submissions.reduce((acc, s) => acc + (s.similarityScore || 0), 0) / submissions.length) : 0}%
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Graded</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{submissions.filter((s) => s.status === "Graded").length}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Submissions</CardTitle>
          <CardDescription>Review student submissions and similarity scores</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student Name</TableHead>
                <TableHead>Question ID</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Similarity Score</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {submissions.map((submission) => (
                <TableRow key={submission.id}>
                  <TableCell className="font-medium">{submission.studentName}</TableCell>
                  <TableCell>{submission.questionId}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{submission.submissionType}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className={`font-medium ${getSimilarityColor(submission.similarityScore)}`}>
                        {submission.similarityScore}%
                      </span>
                      <Progress value={submission.similarityScore} className="w-16 h-2" />
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={submission.status === "Graded" ? "default" : "secondary"}>
                      {submission.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{submission.submittedAt}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      {submission.submissionType === "PDF" && (
                        <Button variant="ghost" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
