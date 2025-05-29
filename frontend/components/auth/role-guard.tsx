"use client"

import type React from "react"

import { useAuth } from "./auth-provider"

interface RoleGuardProps {
  children: React.ReactNode
  allowedRoles: ("teacher" | "student")[]
  fallback?: React.ReactNode
}

export function RoleGuard({ children, allowedRoles, fallback = null }: RoleGuardProps) {
  const { user } = useAuth()

  if (!user || !allowedRoles.includes(user.role)) {
    return <>{fallback}</>
  }

  return <>{children}</>
}
