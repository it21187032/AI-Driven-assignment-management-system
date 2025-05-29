"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { useToast } from "@/hooks/use-toast"

export interface User {
  id: string
  email: string
  name: string
  role: "teacher" | "student"
  avatar?: string
  createdAt: string
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, name: string, role: "teacher" | "student") => Promise<void>
  logout: () => void
  updateProfile: (updates: Partial<User>) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Mock users database
const mockUsers: User[] = [
  {
    id: "1",
    email: "teacher@example.com",
    name: "Dr. Sarah Johnson",
    role: "teacher",
    createdAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "2",
    email: "student@example.com",
    name: "Alex Smith",
    role: "student",
    createdAt: "2024-01-01T00:00:00Z",
  },
]

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    // Check for stored user session
    const storedUser = localStorage.getItem("assignment-system-user")
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser))
      } catch (error) {
        localStorage.removeItem("assignment-system-user")
      }
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    setIsLoading(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Mock authentication - in real app, this would validate against backend
    const foundUser = mockUsers.find((u) => u.email === email)

    if (!foundUser) {
      throw new Error("Invalid email or password")
    }

    // In real app, password would be validated here
    if (password !== "password123") {
      throw new Error("Invalid email or password")
    }

    setUser(foundUser)
    localStorage.setItem("assignment-system-user", JSON.stringify(foundUser))

    toast({
      title: "Welcome back!",
      description: `Logged in as ${foundUser.name}`,
    })

    setIsLoading(false)
  }

  const register = async (email: string, password: string, name: string, role: "teacher" | "student") => {
    setIsLoading(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Check if user already exists
    const existingUser = mockUsers.find((u) => u.email === email)
    if (existingUser) {
      throw new Error("User with this email already exists")
    }

    // Create new user
    const newUser: User = {
      id: Date.now().toString(),
      email,
      name,
      role,
      createdAt: new Date().toISOString(),
    }

    mockUsers.push(newUser)
    setUser(newUser)
    localStorage.setItem("assignment-system-user", JSON.stringify(newUser))

    toast({
      title: "Account created!",
      description: `Welcome to the assignment system, ${newUser.name}`,
    })

    setIsLoading(false)
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("assignment-system-user")
    toast({
      title: "Logged out",
      description: "You have been successfully logged out",
    })
  }

  const updateProfile = async (updates: Partial<User>) => {
    if (!user) return

    setIsLoading(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500))

    const updatedUser = { ...user, ...updates }
    setUser(updatedUser)
    localStorage.setItem("assignment-system-user", JSON.stringify(updatedUser))

    toast({
      title: "Profile updated",
      description: "Your profile has been successfully updated",
    })

    setIsLoading(false)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        register,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
