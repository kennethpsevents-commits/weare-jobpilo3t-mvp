"use client"

import type React from "react"
import { createContext, useContext, useState } from "react"

interface User {
  id: string
  email: string
  firstName?: string
  lastName?: string
  role: "user" | "recruiter" | "admin"
  created_at: string
}

const AuthContext = createContext<{
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, firstName: string, lastName: string) => Promise<void>
  signOut: () => Promise<void>
  refreshUser: () => Promise<void>
}>({
  user: null,
  loading: true,
  signIn: async () => {},
  signUp: async () => {},
  signOut: async () => {},
  refreshUser: async () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(false) // Set to false to avoid infinite loading

  const signIn = async (email: string, password: string) => {
    console.log("[v0] Demo mode: Sign in attempted with", email)
    // Create demo user
    setUser({
      id: "demo-user",
      email,
      firstName: "Demo",
      lastName: "User",
      role: "user",
      created_at: new Date().toISOString(),
    })
  }

  const signUp = async (email: string, password: string, firstName: string, lastName: string) => {
    console.log("[v0] Demo mode: Sign up attempted with", email)
    // Create demo user
    setUser({
      id: "demo-user",
      email,
      firstName,
      lastName,
      role: "user",
      created_at: new Date().toISOString(),
    })
  }

  const signOut = async () => {
    console.log("[v0] Demo mode: Sign out")
    setUser(null)
  }

  const refreshUser = async () => {
    console.log("[v0] Demo mode: Refresh user")
    // Keep current user state
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signIn,
        signUp,
        signOut,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
