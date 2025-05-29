"use client"

import { useAuth } from "./auth/auth-provider"
import { AuthPage } from "./auth/auth-page"
import { TeacherDashboard } from "./teacher-dashboard"
import { StudentDashboard } from "./student-dashboard"

export function AppRouter() {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <AuthPage />
  }

  if (user.role === "teacher") {
    return <TeacherDashboard />
  }

  if (user.role === "student") {
    return <StudentDashboard />
  }

  return <AuthPage />
}
