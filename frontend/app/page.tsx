"use client"

import { AuthProvider } from "../components/auth/auth-provider"
import { AppRouter } from "../components/app-router"

export default function HomePage() {
  return (
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  )
}
