"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const BLOOD_TYPES = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]

export default function RequestBloodPage() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [formData, setFormData] = useState({
    bloodType: "",
    quantity: "",
    reason: "",
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/login")
    }
  }, [user, loading, router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    setSubmitting(true)

    try {
      const response = await fetch("/api/hospital/request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          bloodType: formData.bloodType,
          quantity: Number.parseInt(formData.quantity),
          reason: formData.reason,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Failed to create request")
        return
      }

      setSuccess("Request submitted successfully!")
      setFormData({ bloodType: "", quantity: "", reason: "" })
      setTimeout(() => router.push("/hospital/requests"), 2000)
    } catch (err) {
      setError("An error occurred")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <nav className="bg-slate-900 border-b border-border p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-primary">Request Blood</h1>
          <Button onClick={() => router.push("/hospital/dashboard")} variant="outline">
            Back
          </Button>
        </div>
      </nav>

      <main className="max-w-2xl mx-auto p-6">
        <Card className="bg-slate-900 border-border">
          <CardHeader>
            <CardTitle className="text-primary">Submit Blood Request</CardTitle>
            <CardDescription>Fill in the details of your blood requirement</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 bg-error/10 border border-error text-error rounded-md text-sm">{error}</div>
              )}
              {success && (
                <div className="p-3 bg-success/10 border border-success text-success rounded-md text-sm">{success}</div>
              )}

              <div>
                <label className="block text-sm font-medium mb-1">Blood Type</label>
                <select
                  name="bloodType"
                  value={formData.bloodType}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 bg-slate-800 border border-border rounded-md text-foreground"
                >
                  <option value="">Select blood type</option>
                  {BLOOD_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Quantity (ml)</label>
                <Input
                  type="number"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleChange}
                  placeholder="450"
                  min="100"
                  required
                  className="bg-slate-800 border-border"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Reason for Request</label>
                <textarea
                  name="reason"
                  value={formData.reason}
                  onChange={handleChange}
                  placeholder="Emergency surgery, patient transfusion, etc."
                  className="w-full px-3 py-2 bg-slate-800 border border-border rounded-md text-foreground"
                  rows={4}
                />
              </div>

              <Button
                type="submit"
                disabled={submitting}
                className="w-full bg-primary hover:bg-primary-dark text-white"
              >
                {submitting ? "Submitting..." : "Submit Request"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
