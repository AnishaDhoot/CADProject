"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const BLOOD_TYPES = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]

export default function DonorProfilePage() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [formData, setFormData] = useState({
    bloodType: "",
    age: "",
    weight: "",
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/login")
    }
  }, [user, loading, router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    setSubmitting(true)

    try {
      const response = await fetch("/api/donor/profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          bloodType: formData.bloodType,
          age: Number.parseInt(formData.age),
          weight: Number.parseInt(formData.weight),
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        setError(data.error || "Failed to save profile")
        return
      }

      setSuccess("Profile saved successfully!")
      setTimeout(() => router.push("/donor/dashboard"), 1500)
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
          <CardTitle className="text-3xl font-bold text-primary">Complete Your Donor Profile</CardTitle>
          <CardDescription className="text-muted-foreground">Provide your health information to start donating</CardDescription>
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
              <label className="text-sm font-medium text-foreground">Blood Type</label>
              <select
                name="bloodType"
                value={formData.bloodType}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 bg-secondary/20 border border-border rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Select blood type</option>
                {BLOOD_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Age</label>
              <Input
                type="number"
                name="age"
                value={formData.age}
                onChange={handleChange}
                placeholder="25"
                min="18"
                max="65"
                required
                className="bg-secondary/20 border-border text-foreground placeholder:text-muted-foreground"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Weight (kg)</label>
              <Input
                type="number"
                name="weight"
                value={formData.weight}
                onChange={handleChange}
                placeholder="70"
                min="50"
                required
                className="bg-secondary/20 border-border text-foreground placeholder:text-muted-foreground"
              />
              <p className="text-xs text-muted-foreground">Minimum weight required: 50 kg</p>
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
