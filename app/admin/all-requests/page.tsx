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

export default function AllRequestsPage() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [requests, setRequests] = useState<BloodRequest[]>([])
  const [pageLoading, setPageLoading] = useState(true)
  const [filter, setFilter] = useState<string>("ALL")

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
        const response = await fetch("/api/admin/requests", {
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

    if (user && user.role === "ADMIN") {
      fetchRequests()
    }
  }, [user, loading, router])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return { 
          bg: "bg-amber-50/80 dark:bg-amber-900/10", 
          text: "text-amber-700 dark:text-amber-300", 
          border: "border-amber-200 dark:border-amber-800",
          accent: "bg-amber-400"
        }
      case "APPROVED":
        return { 
          bg: "bg-emerald-50/80 dark:bg-emerald-900/10", 
          text: "text-emerald-700 dark:text-emerald-300", 
          border: "border-emerald-200 dark:border-emerald-800",
          accent: "bg-emerald-400"
        }
      case "REJECTED":
        return { 
          bg: "bg-rose-50/80 dark:bg-rose-900/10", 
          text: "text-rose-700 dark:text-rose-300", 
          border: "border-rose-200 dark:border-rose-800",
          accent: "bg-rose-400"
        }
      case "COMPLETED":
        return { 
          bg: "bg-blue-50/80 dark:bg-blue-900/10", 
          text: "text-blue-700 dark:text-blue-300", 
          border: "border-blue-200 dark:border-blue-800",
          accent: "bg-blue-400"
        }
      default:
        return { 
          bg: "bg-slate-50/80 dark:bg-slate-900/10", 
          text: "text-slate-700 dark:text-slate-300", 
          border: "border-slate-200 dark:border-slate-800",
          accent: "bg-slate-400"
        }
    }
  }

  const filteredRequests = filter === "ALL" 
    ? requests 
    : requests.filter(r => r.status === filter)

  const statusCounts = {
    ALL: requests.length,
    PENDING: requests.filter(r => r.status === "PENDING").length,
    APPROVED: requests.filter(r => r.status === "APPROVED").length,
    REJECTED: requests.filter(r => r.status === "REJECTED").length,
    COMPLETED: requests.filter(r => r.status === "COMPLETED").length,
  }

  if (loading || pageLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50/50 dark:from-slate-950 dark:via-slate-900 dark:to-violet-950/10">
        <div className="text-center">
          <div className="w-12 h-12 border-3 border-violet-200 dark:border-violet-800 border-t-violet-400 dark:border-t-violet-500 rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-xl font-semibold text-violet-700 dark:text-violet-300 mb-2">Loading...</div>
          <p className="text-violet-500/70 dark:text-violet-400/70 text-sm">Please wait while we load the requests</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-violet-950/5">
      <nav className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm border-b border-violet-100/50 dark:border-violet-900/30 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold text-violet-800 dark:text-violet-200">
              Blood Requests Management
            </h1>
            <p className="text-violet-600/60 dark:text-violet-400/60 text-sm mt-1">
              Monitor and manage all blood donation requests
            </p>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={() => router.push("/admin/requests")}
              className="bg-violet-500/90 hover:bg-violet-600 text-white shadow-sm hover:shadow transition-all duration-200 border border-violet-400/30"
            >
              Manage Pending
            </Button>
            <Button 
              onClick={() => router.push("/admin/dashboard")} 
              variant="outline" 
              className="border-violet-200 dark:border-violet-800 text-violet-700 dark:text-violet-300 hover:bg-violet-50/50 dark:hover:bg-violet-950/20 hover:border-violet-300 dark:hover:border-violet-700"
            >
              Dashboard
            </Button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-6">
        {/* Filter Buttons */}
        <div className="flex flex-wrap gap-2 mb-6">
          {Object.entries(statusCounts).map(([status, count]) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 border min-w-[100px] ${
                filter === status
                  ? "bg-violet-500/10 border-violet-400 text-violet-700 dark:text-violet-300 shadow-sm scale-105"
                  : "bg-white/50 dark:bg-slate-800/50 text-violet-600/70 dark:text-violet-400/70 border-violet-100 dark:border-violet-800 hover:border-violet-300 dark:hover:border-violet-700 hover:bg-violet-50/30 dark:hover:bg-violet-950/10"
              }`}
            >
              <div className="flex flex-col items-center">
                <span className="text-sm">{status}</span>
                <span className={`text-xs ${filter === status ? "text-violet-600/80 dark:text-violet-400/80" : "text-violet-500/60 dark:text-violet-500/60"}`}>
                  ({count})
                </span>
              </div>
            </button>
          ))}
        </div>

        {filteredRequests.length === 0 ? (
          <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border border-violet-100/50 dark:border-violet-800/30 shadow-sm max-w-2xl mx-auto">
            <CardContent className="pt-12 pb-12 text-center">
              <div className="w-16 h-16 bg-violet-100/50 dark:bg-violet-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <div className="text-2xl text-violet-500/70">💜</div>
              </div>
              <h3 className="text-lg font-semibold text-violet-800 dark:text-violet-200 mb-2">
                No Requests Found
              </h3>
              <p className="text-violet-600/60 dark:text-violet-400/60 text-sm max-w-md mx-auto">
                {filter === "ALL" 
                  ? "No blood requests have been made yet. They will appear here once submitted."
                  : `No ${filter.toLowerCase()} requests found. Check other status filters.`
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredRequests.map((request) => {
              const statusColors = getStatusColor(request.status)
              return (
                <Card 
                  key={request.id} 
                  className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border border-violet-100/50 dark:border-violet-800/30 hover:border-violet-200 dark:hover:border-violet-700 transition-all duration-200 shadow-sm hover:shadow-md overflow-hidden group"
                >
                  <div className={`${statusColors.bg} p-0.5`}>
                    <div className="bg-white/95 dark:bg-slate-800/95">
                      <CardContent className="p-4">
                        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4">
                          <div className="flex-1">
                            <div className="flex items-start gap-3 mb-3">
                              <div className="w-10 h-10 rounded-lg bg-violet-100/70 dark:bg-violet-900/30 flex items-center justify-center text-violet-600 dark:text-violet-400 font-semibold text-sm shadow-sm">
                                {request.hospital.name.charAt(0)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-violet-900 dark:text-violet-100 mb-1 truncate">
                                  {request.hospital.name}
                                </h3>
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
                              <div className="flex items-center gap-1.5">
                                <div className={`w-2 h-2 rounded-full ${statusColors.accent}`}></div>
                                <span className={`px-2 py-1 rounded-md text-xs font-medium ${statusColors.bg} ${statusColors.text} ${statusColors.border} border shadow-xs`}>
                                  {request.status}
                                </span>
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
                      </CardContent>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        )}
      </main>

      {/* Footer */}
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