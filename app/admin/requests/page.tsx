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
  reason: string | null
  createdAt: string
  hospital: { name: string }
}

export default function ManageRequestsPage() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [requests, setRequests] = useState<BloodRequest[]>([])
  const [pageLoading, setPageLoading] = useState(true)
  const [processing, setProcessing] = useState<string | null>(null)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/login")
      return
    }

    if (user && user.role !== "ADMIN") {
      router.push("/")
      return
    }

    const fetchRequests = async () => {
      try {
        setError("")
        const response = await fetch("/api/admin/requests", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        })

        if (response.ok) {
          const data = await response.json()
          // Filter to only show pending requests
          setRequests(data.filter((r: BloodRequest) => r.status === "PENDING"))
        } else {
          setError("Failed to load requests")
        }
      } catch (error) {
        console.error("Error fetching requests:", error)
        setError("Failed to load requests")
      } finally {
        setPageLoading(false)
      }
    }

    if (user && user.role === "ADMIN") {
      fetchRequests()
    }
  }, [user, loading, router])

  const handleApprove = async (requestId: string) => {
    try {
      setProcessing(requestId)
      setError("")
      const response = await fetch(`/api/admin/requests/${requestId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ status: "APPROVED" }),
      })

      const data = await response.json()

      if (response.ok) {
        setRequests((prev) => prev.filter((r) => r.id !== requestId))
      } else {
        setError(data.error || "Failed to approve request")
      }
    } catch (error) {
      console.error("Error approving request:", error)
      setError("Failed to approve request. Please try again.")
    } finally {
      setProcessing(null)
    }
  }

  const handleReject = async (requestId: string) => {
    try {
      setProcessing(requestId)
      setError("")
      const response = await fetch(`/api/admin/requests/${requestId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ status: "REJECTED" }),
      })

      const data = await response.json()

      if (response.ok) {
        setRequests((prev) => prev.filter((r) => r.id !== requestId))
      } else {
        setError(data.error || "Failed to reject request")
      }
    } catch (error) {
      console.error("Error rejecting request:", error)
      setError("Failed to reject request. Please try again.")
    } finally {
      setProcessing(null)
    }
  }

  if (loading || pageLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50/50 dark:from-slate-950 dark:via-slate-900 dark:to-violet-950/10">
        <div className="text-center">
          <div className="w-12 h-12 border-3 border-violet-200 dark:border-violet-800 border-t-violet-400 dark:border-t-violet-500 rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-xl font-semibold text-violet-700 dark:text-violet-300 mb-2">Loading...</div>
          <p className="text-violet-500/70 dark:text-violet-400/70 text-sm">Please wait while we load requests</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-violet-950/5">
      <nav className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm border-b border-violet-100/50 dark:border-violet-900/30 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold text-violet-800 dark:text-violet-200">Pending Blood Requests</h1>
            <p className="text-violet-600/60 dark:text-violet-400/60 text-sm mt-1">Approve or reject blood requests</p>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={() => router.push("/admin/all-requests")}
              className="bg-violet-500/90 hover:bg-violet-600 text-white shadow-sm hover:shadow transition-all duration-200 border border-violet-400/30"
            >
              View All Requests
            </Button>
            <Button 
              onClick={() => router.push("/admin/dashboard")} 
              variant="outline"
              className="border-violet-200 dark:border-violet-800 text-violet-700 dark:text-violet-300 hover:bg-violet-50/50 dark:hover:bg-violet-950/20 hover:border-violet-300 dark:hover:border-violet-700"
            >
              Back to Dashboard
            </Button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-6">
        {error && (
          <div className="mb-4 p-3 bg-rose-50/80 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 rounded-lg shadow-sm text-sm">
            {error}
          </div>
        )}

        {requests.length === 0 ? (
          <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border border-violet-100/50 dark:border-violet-800/30 shadow-sm">
            <CardContent className="pt-12 pb-12 text-center">
              <div className="w-16 h-16 bg-violet-100/50 dark:bg-violet-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <div className="text-2xl text-violet-500/70">🎉</div>
              </div>
              <h3 className="text-lg font-semibold text-violet-800 dark:text-violet-200 mb-2">All Clear!</h3>
              <p className="text-violet-600/60 dark:text-violet-400/60 text-sm">
                No pending blood requests at the moment. All requests have been processed.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            <div className="bg-violet-50/50 dark:bg-violet-950/10 p-3 rounded-lg border border-violet-100/50 dark:border-violet-800/30">
              <p className="text-center text-violet-700 dark:text-violet-300 font-medium text-sm">
                <span className="text-xl font-bold text-violet-800 dark:text-violet-200">{requests.length}</span> request{requests.length !== 1 ? 's' : ''} waiting for approval
              </p>
            </div>

            {requests.map((request) => (
              <Card 
                key={request.id} 
                className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border border-violet-100/50 dark:border-violet-800/30 hover:border-violet-200 dark:hover:border-violet-700 transition-all duration-200 shadow-sm hover:shadow-md overflow-hidden"
              >
                <div className="bg-amber-50/80 dark:bg-amber-900/10 p-0.5">
                  <div className="bg-white/95 dark:bg-slate-800/95">
                    <CardContent className="p-4">
                      <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-4">
                        <div className="flex-1">
                          <div className="flex items-start gap-3 mb-3">
                            <div className="w-10 h-10 rounded-lg bg-violet-100/70 dark:bg-violet-900/30 flex items-center justify-center text-violet-600 dark:text-violet-400 font-semibold text-sm shadow-sm">
                              {request.hospital.name.charAt(0)}
                            </div>
                            <div>
                              <h3 className="font-semibold text-violet-900 dark:text-violet-100 text-sm mb-1">{request.hospital.name}</h3>
                              <p className="text-violet-600/50 dark:text-violet-400/50 text-xs">
                                {new Date(request.createdAt).toLocaleDateString('en-US', { 
                                  weekday: 'short', 
                                  year: 'numeric', 
                                  month: 'short', 
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </p>
                            </div>
                          </div>
                          
                          <div className="bg-violet-50/30 dark:bg-violet-950/10 p-3 rounded-lg mb-3 border border-violet-100/50 dark:border-violet-800/30">
                            <div className="flex items-baseline gap-2">
                              <span className="text-2xl font-semibold text-violet-700 dark:text-violet-300">{request.quantity}</span>
                              <span className="text-sm text-violet-600/60 dark:text-violet-400/60">ml</span>
                              <div className="w-px h-6 bg-violet-200 dark:bg-violet-700 mx-2"></div>
                              <div className="flex items-center gap-1.5">
                                <div className="w-2 h-2 bg-violet-400 rounded-full"></div>
                                <span className="text-lg font-semibold text-violet-700 dark:text-violet-300">{request.bloodType}</span>
                              </div>
                            </div>
                          </div>

                          {request.reason && (
                            <div className="bg-violet-50/20 dark:bg-violet-950/5 p-2 rounded-lg border border-violet-100/30 dark:border-violet-800/20">
                              <p className="text-xs text-violet-700/80 dark:text-violet-300/80">
                                <span className="font-medium text-violet-600/70 dark:text-violet-400/70">Reason:</span> {request.reason}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-2 pt-4 border-t border-violet-100/30 dark:border-violet-800/20">
                        <Button
                          onClick={() => handleApprove(request.id)}
                          disabled={processing === request.id}
                          className="flex-1 bg-violet-500/90 hover:bg-violet-600 text-white shadow-sm hover:shadow transition-all duration-200 border border-violet-400/30 text-sm h-10"
                        >
                          {processing === request.id ? (
                            <span className="flex items-center gap-1.5">
                              <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                              Processing...
                            </span>
                          ) : (
                            <span className="flex items-center gap-1.5">
                              ✓ Approve
                            </span>
                          )}
                        </Button>
                        <Button
                          onClick={() => handleReject(request.id)}
                          disabled={processing === request.id}
                          className="flex-1 bg-rose-500/90 hover:bg-rose-600 text-white shadow-sm hover:shadow transition-all duration-200 border border-rose-400/30 text-sm h-10"
                        >
                          {processing === request.id ? (
                            <span className="flex items-center gap-1.5">
                              <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                              Processing...
                            </span>
                          ) : (
                            <span className="flex items-center gap-1.5">
                              ✕ Reject
                            </span>
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>

      <footer className="mt-8 py-4 border-t border-violet-100/30 dark:border-violet-900/20">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-violet-600/50 dark:text-violet-400/50 text-xs">
            Blood Management System • Providing reliable healthcare solutions
          </p>
        </div>
      </footer>
    </div>
  )
}