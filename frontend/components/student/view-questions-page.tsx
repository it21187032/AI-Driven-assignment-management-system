"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { FileText, Clock, CheckCircle, TrendingUp, Target } from "lucide-react"
import { api, Question } from "@/lib/api"
import { useToast } from "@/components/ui/use-toast"

type StudentQuestion = Question & { status: "completed" | "pending"; dueDate: string }

interface ViewQuestionsPageProps {
  onAnswerQuestion: (questionId: string) => void
}

export function ViewQuestionsPage({ onAnswerQuestion, refreshKey }: ViewQuestionsPageProps & { refreshKey?: number }) {
  const [questions, setQuestions] = useState<StudentQuestion[]>([])
  const [submissions, setSubmissions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  // Function to fetch data
  const fetchData = async () => {
    try {
      const studentId = "123" // This should come from your auth context
      const questionsData = await api.getQuestions()
      const submissionsData = await api.getResults(parseInt(studentId), "student")
      const updatedQuestions = questionsData.map((q: Question) => ({
        ...q,
        status: submissionsData.some((s: any) => s.question_id === q.id) ? "completed" as const : "pending" as const,
        dueDate: q.dueDate || ""
      }))
      setQuestions(updatedQuestions)
      setSubmissions(submissionsData)
    } catch (error) {
      console.error("Error fetching data:", error)
      toast({
        title: "Error",
        description: "Failed to load questions and submissions",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    window.addEventListener("submission-completed", fetchData)
    return () => {
      window.removeEventListener("submission-completed", fetchData)
    }
  }, [toast, refreshKey])

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy":
        return "bg-green-100 text-green-800"
      case "Medium":
        return "bg-yellow-100 text-yellow-800"
      case "Hard":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const isOverdue = (dueDate: string) => {
    return dueDate ? new Date(dueDate) < new Date() : false
  }

  // Calculate statistics dynamically
  const totalQuestions = questions.length
  const completedQuestions = questions.filter((q) => q.status === "completed").length

  // Calculate average score from submissions
  const averageScore = submissions.length > 0
    ? Math.round(submissions.reduce((acc, s) => acc + (s.score || 0), 0) / submissions.length)
    : 0

  const progressPercentage = totalQuestions > 0 ? Math.round((completedQuestions / totalQuestions) * 100) : 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Available Questions</h1>
        <p className="text-muted-foreground">View and answer assignment questions</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Assigned Questions</CardTitle>
            <div className="h-8 w-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <FileText className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalQuestions}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Completed</CardTitle>
            <div className="h-8 w-8 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="h-4 w-4 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedQuestions}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Average Score</CardTitle>
            <div className="h-8 w-8 bg-purple-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="h-4 w-4 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {completedQuestions > 0 ? `${averageScore}%` : "0%"}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Progress</CardTitle>
            <div className="h-8 w-8 bg-orange-100 rounded-lg flex items-center justify-center">
              <Target className="h-4 w-4 text-orange-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{progressPercentage}%</div>
          </CardContent>
        </Card>
      </div>

      {/* Overall Progress Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-medium text-gray-700">Overall Progress</CardTitle>
            <span className="text-sm text-gray-500">
              {completedQuestions} of {totalQuestions} completed
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <Progress value={progressPercentage} className="h-3" />
        </CardContent>
      </Card>

      {/* Questions List */}
      <div className="grid gap-4">
        {questions.map((question) => (
          <Card key={question.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-lg">{question.id}</CardTitle>
                    <Badge className={getDifficultyColor(question.difficulty)}>{question.difficulty}</Badge>
                    {question.status === "completed" && (
                      <Badge variant="default">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Completed
                      </Badge>
                    )}
                  </div>
                  <CardDescription className="text-base">{question.text}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  Due: {question.dueDate || "N/A"}
                  {isOverdue(question.dueDate) && question.status === "pending" && (
                    <Badge variant="destructive" className="ml-2">
                      Overdue
                    </Badge>
                  )}
                </div>
                <Button
                  onClick={() => onAnswerQuestion(question.id)}
                  disabled={question.status === "completed"}
                  variant={question.status === "completed" ? "outline" : "default"}
                >
                  {question.status === "completed" ? "View Answer" : "Answer"}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}