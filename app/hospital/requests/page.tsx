"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface BloodRequest {
  id: string
  bloodType: string
  quantity: number
  status: string
  reason: string
  createdAt: string
}

export default function RequestsPage() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [requests, setRequests] = useState<BloodRequest[]>([])
  const [pageLoading, setPageLoading] = useState(true)

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/login")
      return
    }

    const fetchRequests = async () => {
      try {
        const response = await fetch("/api/hospital/requests", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        })

        if (response.ok) {
          const data = await response.json()
          setRequests(data)
        }
      } catch (error) {
        console.error("Error fetching requests:", error)
      } finally {
        setPageLoading(false)
      }
    }

    fetchRequests()
  }, [user, loading, router])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-warning/20 text-warning"
      case "APPROVED":
        return "bg-success/20 text-success"
      case "REJECTED":
        return "bg-error/20 text-error"
      case "COMPLETED":
        return "bg-success/20 text-success"
      default:
        return "bg-muted/20 text-muted"
    }
  }

  if (loading || pageLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-background">
      <nav className="bg-slate-900 border-b border-border p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-primary">Blood Requests</h1>
          <Button onClick={() => router.push("/hospital/dashboard")} variant="outline">
            Back to Dashboard
          </Button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-6">
        {requests.length === 0 ? (
          <Card className="bg-slate-900 border-border">
            <CardContent className="pt-6">
              <p className="text-center text-muted">No requests yet</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {requests.map((request) => (
              <Card key={request.id} className="bg-slate-900 border-border">
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="font-semibold text-foreground">
                        {request.quantity} ml - {request.bloodType}
                      </p>
                      <p className="text-sm text-muted">{new Date(request.createdAt).toLocaleDateString()}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(request.status)}`}>
                      {request.status}
                    </span>
                  </div>
                  {request.reason && (
                    <p className="text-sm text-muted">
                      <span className="font-medium">Reason:</span> {request.reason}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
