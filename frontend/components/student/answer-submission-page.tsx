"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Upload, FileText, X, Clock } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"

interface AnswerSubmissionPageProps {
  questionId: string
  onBack: () => void
  studentId: string
}

export function AnswerSubmissionPage({ questionId, onBack, studentId }: AnswerSubmissionPageProps) {
  const [answerText, setAnswerText] = useState("")
  const [loading, setLoading] = useState(false)
  const [ocrLoading, setOcrLoading] = useState(false)
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null)
  const { toast } = useToast()

  // Mock question data
  const question = {
    id: questionId,
    text: "Explain the concept of object-oriented programming and its main principles.",
    dueDate: "2024-01-20",
    difficulty: "Medium",
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadedFileName(file.name)
    setOcrLoading(true)
    const formData = new FormData()
    formData.append("file", file)

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/extract_text_from_file`, {
        method: "POST",
        body: formData,
      })
      const data = await res.json()
      if (data.extracted_text) {
        setAnswerText(data.extracted_text)
        toast({
          title: "Text Extracted",
          description: "Text was successfully extracted from your file.",
        })
      } else {
        toast({
          title: "Text Extraction Error",
          description: "Failed to extract text: " + (data.error || "Unknown error"),
          variant: "destructive",
        })
      }
    } catch (err) {
      toast({
        title: "File Upload Error",
        description: "Error uploading file: " + err,
        variant: "destructive",
      })
    } finally {
      setOcrLoading(false)
      e.target.value = ""
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!answerText.trim()) {
      toast({
        title: "Validation Error",
        description: "Please provide an answer before submitting.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    const formData = new FormData()
    formData.append("student_id", studentId)
    formData.append("question_id", questionId)
    formData.append("text_answer", answerText)

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/upload_assignment`, {
        method: "POST",
        body: formData,
      })
      const result = await res.json()
      if (result.error) {
        toast({
          title: "Submission Error",
          description: "Submission failed: " + result.error,
          variant: "destructive",
        })
      } else {
        // Update completed submissions in localStorage
        const completedSubmissions = JSON.parse(localStorage.getItem("completed-submissions") || "[]")
        if (!completedSubmissions.includes(questionId)) {
          completedSubmissions.push(questionId)
          localStorage.setItem("completed-submissions", JSON.stringify(completedSubmissions))
          
          // Dispatch event to notify other components
          window.dispatchEvent(new Event("submission-completed"))
        }

        toast({
          title: "Submission Successful",
          description: "Your answer has been successfully submitted for review.",
        })
        onBack()
      }
    } catch (err) {
      toast({
        title: "Submission Error",
        description: "Submission error: " + err,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const isOverdue = new Date(question.dueDate) < new Date()

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Questions
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <CardTitle className="text-2xl">{question.id}</CardTitle>
                <Badge variant="outline">{question.difficulty}</Badge>
              </div>
              <CardDescription className="text-lg">{question.text}</CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            Due: {question.dueDate}
            {isOverdue && <Badge variant="destructive">Overdue</Badge>}
          </div>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Submit Your Answer</CardTitle>
          <CardDescription>Provide your answer either as text or upload a PDF/image file</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="text-answer">Text Answer</Label>
              <Textarea
                id="text-answer"
                placeholder="Write your answer here..."
                value={answerText}
                onChange={(e) => setAnswerText(e.target.value)}
                className="min-h-[200px]"
              />
              <p className="text-xs text-muted-foreground">{answerText.length} characters</p>
            </div>

            <div className="space-y-2">
              <Label>Or Upload PDF/Image Answer</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                <div className="text-center">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="mt-4">
                    <Label htmlFor="file-upload" className="cursor-pointer">
                      <span className="mt-2 block text-sm font-medium text-gray-900">Upload your answer as PDF or image</span>
                      <span className="mt-1 block text-xs text-gray-500">PDF or image up to 10MB</span>
                    </Label>
                    <Input
                      id="file-upload"
                      type="file"
                      accept=".pdf, image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </div>
                  {ocrLoading && <p className="mt-2 text-blue-600">Extracting text from file...</p>}
                  {uploadedFileName && !ocrLoading && (
                    <div className="mt-2 text-green-700">Uploaded: {uploadedFileName}</div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <Button type="submit" disabled={loading || ocrLoading || !answerText.trim()}>
                {loading ? "Submitting..." : "Submit Answer"}
              </Button>
              <Button type="button" variant="outline" onClick={onBack}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
