"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function HospitalProfilePage() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    phone: "",
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/login")
    }
  }, [user, loading, router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    setSubmitting(true)

    try {
      const response = await fetch("/api/hospital/profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const data = await response.json()
        setError(data.error || "Failed to save profile")
        return
      }

      setSuccess("Profile saved successfully!")
      setTimeout(() => router.push("/hospital/dashboard"), 1500)
    } catch (err) {
      setError("An error occurred")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-border">
        <CardHeader className="space-y-1">
          <CardTitle className="text-3xl font-bold text-primary">Complete Your Hospital Profile</CardTitle>
          <CardDescription className="text-muted-foreground">
            Provide your hospital information to start requesting blood
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-destructive/10 border border-destructive/50 text-destructive rounded-md text-sm">
                {error}
              </div>
            )}
            {success && (
              <div className="p-3 bg-success/10 border border-success/50 text-success rounded-md text-sm">
                {success}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Hospital Name</label>
              <Input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="City General Hospital"
                required
                className="bg-secondary/20 border-border text-foreground placeholder:text-muted-foreground"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Address</label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="123 Main St, City, State, ZIP Code"
                rows={3}
                required
                className="w-full px-3 py-2 bg-secondary/20 border border-border rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Contact Phone</label>
              <Input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+1 234 567 8900"
                required
                className="bg-secondary/20 border-border text-foreground placeholder:text-muted-foreground"
              />
            </div>

            <Button
              type="submit"
              disabled={submitting}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {submitting ? "Saving..." : "Save Profile"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

