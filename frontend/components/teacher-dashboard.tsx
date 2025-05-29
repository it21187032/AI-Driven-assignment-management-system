"use client"

import { useState } from "react"
import { TeacherSidebar } from "./teacher-sidebar"
import { QuestionsPage } from "./teacher/questions-page"
import { AddQuestionPage } from "./teacher/add-question-page"
import { StudentSubmissionsPage } from "./teacher/student-submissions-page"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { UserProfile } from "./user-profile"

type TeacherDashboardProps = {}

export function TeacherDashboard({}: TeacherDashboardProps) {
  const [currentPage, setCurrentPage] = useState<"questions" | "add-question" | "submissions">("questions")

  const renderPage = () => {
    switch (currentPage) {
      case "questions":
        return <QuestionsPage />
      case "add-question":
        return <AddQuestionPage />
      case "submissions":
        return <StudentSubmissionsPage />
      default:
        return <QuestionsPage />
    }
  }

  return (
    <SidebarProvider>
      <TeacherSidebar currentPage={currentPage} onPageChange={setCurrentPage} />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <div className="flex-1">
            <h1 className="text-lg font-semibold">Teacher Dashboard</h1>
          </div>
          <UserProfile />
        </header>
        <div className="flex-1 p-6">{renderPage()}</div>
      </SidebarInset>
    </SidebarProvider>
  )
}
