"use client"

import type React from "react"

import { createContext, useContext, useState, useEffect } from "react"

interface User {
  id: string
  email: string
  name: string
  role: "DONOR" | "HOSPITAL" | "ADMIN"
}

interface AuthContextType {
  user: User | null
  token: string | null
  loading: boolean
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const storedToken = localStorage.getItem("token")
    const storedUser = localStorage.getItem("user")

    if (storedToken && storedUser) {
      setToken(storedToken)
      setUser(JSON.parse(storedUser))
    }
    setLoading(false)
  }, [])

  const logout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    setUser(null)
    setToken(null)
  }

  return <AuthContext.Provider value={{ user, token, loading, logout }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider")
  }
  return context
}
