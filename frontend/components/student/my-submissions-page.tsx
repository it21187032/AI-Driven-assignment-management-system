"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { FileText, Clock, CheckCircle, AlertCircle } from "lucide-react"

export function MySubmissionsPage({ refreshKey }: { refreshKey?: number } = {}) {
  const [submissions, setSubmissions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fetchSubmissions = async () => {
    try {
      const studentId = "123" // This should come from your auth context
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/get_results/${studentId}/student`)
      const data = await response.json()
      const formattedSubmissions = data.map((sub: any) => ({
        id: sub.id,
        questionId: sub.question_id,
        submissionType: sub.file_path ? "File" : "Text",
        similarityScore: sub.score,
        status: "Graded",
        submittedAt: sub.timestamp,
        feedback: sub.feedback
      }))
      setSubmissions(formattedSubmissions)
    } catch (error) {
      console.error("Error fetching submissions:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSubmissions()
    window.addEventListener("submission-completed", fetchSubmissions)
    return () => {
      window.removeEventListener("submission-completed", fetchSubmissions)
    }
  }, [refreshKey])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Graded":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "Under Review":
        return <Clock className="h-4 w-4 text-yellow-500" />
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "Graded":
        return "default"
      case "Under Review":
        return "secondary"
      default:
        return "outline"
    }
  }

  const getSimilarityColor = (score: number | null) => {
    if (score === null) return "text-gray-500"
    if (score >= 80) return "text-green-600"
    if (score >= 60) return "text-yellow-600"
    return "text-red-600"
  }

  // Calculate statistics
  const totalSubmissions = submissions.length
  const gradedSubmissions = submissions.filter((s) => s.status === "Graded").length
  const underReviewSubmissions = submissions.filter((s) => s.status === "Under Review").length
  const averageScore =
    submissions.length > 0
      ? Math.round(submissions.reduce((acc, s) => acc + (s.similarityScore || 0), 0) / submissions.length)
      : 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Submissions</h1>
        <p className="text-muted-foreground">Track your assignment submissions and scores</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Submissions</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSubmissions}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Graded</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{gradedSubmissions}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Under Review</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{underReviewSubmissions}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageScore}%</div>
          </CardContent>
        </Card>
      </div>

      {submissions.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Submission History</CardTitle>
            <CardDescription>View all your submitted assignments and their status</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Question ID</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Similarity Score</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Feedback</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {submissions.map((submission) => (
                  <TableRow key={submission.id}>
                    <TableCell className="font-medium">{submission.questionId}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{submission.submissionType}</Badge>
                    </TableCell>
                    <TableCell>
                      {submission.similarityScore !== null ? (
                        <div className="flex items-center gap-2">
                          <span className={`font-medium ${getSimilarityColor(submission.similarityScore)}`}>
                            {submission.similarityScore}%
                          </span>
                          <Progress value={submission.similarityScore} className="w-16 h-2" />
                        </div>
                      ) : (
                        <span className="text-muted-foreground">Pending</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(submission.status)}
                        <Badge variant={getStatusVariant(submission.status)}>{submission.status}</Badge>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{submission.submittedAt}</TableCell>
                    <TableCell className="max-w-xs">
                      {submission.feedback ? (
                        <p className="text-sm truncate" title={submission.feedback}>
                          {submission.feedback}
                        </p>
                      ) : (
                        <span className="text-muted-foreground text-sm">No feedback yet</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="text-center py-8">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No submissions yet</h3>
            <p className="text-muted-foreground">Start answering questions to see your submissions here.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
