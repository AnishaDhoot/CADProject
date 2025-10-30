"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function DonatePage() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [formData, setFormData] = useState({
    quantity: "",
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/login")
    }
  }, [user, loading, router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    setSubmitting(true)

    try {
      const response = await fetch("/api/donor/donate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          quantity: Number.parseInt(formData.quantity),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Failed to record donation")
        return
      }

      setSuccess("Donation recorded successfully!")
      setFormData({ quantity: "" })
      setTimeout(() => router.push("/donor/dashboard"), 2000)
    } catch (err) {
      setError("An error occurred")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <nav className="bg-card border-b border-border p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-primary">Schedule Donation</h1>
          <Button onClick={() => router.push("/donor/dashboard")} variant="outline">
            Back
          </Button>
        </div>
      </nav>

      <main className="max-w-2xl mx-auto p-6">
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-primary">Record Your Donation</CardTitle>
            <CardDescription>Enter the amount of blood you're donating</CardDescription>
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
                <label className="block text-sm font-medium mb-1">Quantity (ml)</label>
                <Input
                  type="number"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleChange}
                  placeholder="450"
                  min="100"
                  max="500"
                  required
                  className="bg-secondary/20 border-border"
                />
                <p className="text-xs text-muted mt-1">Standard donation is 450ml</p>
              </div>

              <div className="bg-secondary/20 p-4 rounded-md border border-border">
                <h3 className="font-semibold text-foreground mb-2">Donation Guidelines</h3>
                <ul className="text-sm text-muted space-y-1">
                  <li>• Must be 18-65 years old</li>
                  <li>• Minimum weight: 50 kg</li>
                  <li>• Wait at least 56 days between donations</li>
                  <li>• Be in good health</li>
                </ul>
              </div>

              <Button
                type="submit"
                disabled={submitting}
                className="w-full bg-primary hover:bg-primary-dark text-white"
              >
                {submitting ? "Recording..." : "Record Donation"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
