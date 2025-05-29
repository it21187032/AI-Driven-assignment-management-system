"use client"

import { useState, useEffect } from "react"
import { StudentSidebar } from "./student-sidebar"
import { ViewQuestionsPage } from "./student/view-questions-page"
import { AnswerSubmissionPage } from "./student/answer-submission-page"
import { MySubmissionsPage } from "./student/my-submissions-page"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { UserProfile } from "./user-profile"

type StudentDashboardProps = {}

export function StudentDashboard({}: StudentDashboardProps) {
  const [currentPage, setCurrentPage] = useState<"questions" | "answer" | "submissions">("questions")
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const studentId = "123" // This should come from your auth context

  useEffect(() => {
    const handleRefresh = () => setRefreshKey((k) => k + 1)
    window.addEventListener("submission-completed", handleRefresh)
    return () => {
      window.removeEventListener("submission-completed", handleRefresh)
    }
  }, [])

  const handleAnswerQuestion = (questionId: string) => {
    setSelectedQuestionId(questionId)
    setCurrentPage("answer")
  }

  const renderPage = () => {
    switch (currentPage) {
      case "questions":
        return <ViewQuestionsPage onAnswerQuestion={handleAnswerQuestion} refreshKey={refreshKey} />
      case "answer":
        return selectedQuestionId
          ? <AnswerSubmissionPage 
              questionId={selectedQuestionId} 
              onBack={() => setCurrentPage("questions")} 
              studentId={studentId} 
            />
          : null
      case "submissions":
        return <MySubmissionsPage refreshKey={refreshKey} />
      default:
        return <ViewQuestionsPage onAnswerQuestion={handleAnswerQuestion} refreshKey={refreshKey} />
    }
  }

  return (
    <SidebarProvider>
      <StudentSidebar currentPage={currentPage} onPageChange={setCurrentPage} />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <div className="flex-1">
            <h1 className="text-lg font-semibold">Student Dashboard</h1>
          </div>
          <UserProfile />
        </header>
        <div className="flex-1 p-6">{renderPage()}</div>
      </SidebarInset>
    </SidebarProvider>
  )
}
