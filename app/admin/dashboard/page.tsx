"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

interface DashboardStats {
  totalDonors: number
  totalHospitals: number
  totalDonations: number
  pendingRequests: number
  approvedRequests: number
  totalBloodUnits: number
}

export default function AdminDashboard() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [pageLoading, setPageLoading] = useState(true)

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/login")
      return
    }

    if (user && user.role !== "ADMIN") {
      router.push("/")
      return
    }

    const fetchStats = async () => {
      try {
        const response = await fetch("/api/admin/stats", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        })

        if (response.ok) {
          const data = await response.json()
          setStats(data)
        }
      } catch (error) {
        console.error("Error fetching stats:", error)
      } finally {
        setPageLoading(false)
      }
    }

    fetchStats()
  }, [user, loading, router])

  if (loading || pageLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50/50 dark:from-slate-950 dark:via-slate-900 dark:to-violet-950/10">
        <div className="text-center">
          <div className="w-12 h-12 border-3 border-violet-200 dark:border-violet-800 border-t-violet-400 dark:border-t-violet-500 rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-xl font-semibold text-violet-700 dark:text-violet-300 mb-2">Loading...</div>
          <p className="text-violet-500/70 dark:text-violet-400/70 text-sm">Please wait while we load the dashboard</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-violet-950/5">
      <nav className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm border-b border-violet-100/50 dark:border-violet-900/30 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold text-violet-800 dark:text-violet-200">Admin Dashboard</h1>
            <p className="text-violet-600/60 dark:text-violet-400/60 text-sm mt-1">System overview and management</p>
          </div>
          <div className="flex gap-2 items-center">
            <span className="text-violet-700 dark:text-violet-300 text-sm">{user?.name}</span>
            <Button
              onClick={() => {
                localStorage.removeItem("token")
                localStorage.removeItem("user")
                router.push("/auth/login")
              }}
              variant="outline"
              className="border-violet-200 dark:border-violet-800 text-violet-700 dark:text-violet-300 hover:bg-violet-50/50 dark:hover:bg-violet-950/20 hover:border-violet-300 dark:hover:border-violet-700"
            >
              Logout
            </Button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-6">
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-violet-900 dark:text-violet-100 mb-2">System Overview</h2>
          <p className="text-violet-600/60 dark:text-violet-400/60">Complete statistics and management tools</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border border-violet-100/50 dark:border-violet-800/30 hover:border-violet-200 dark:hover:border-violet-700 transition-all duration-200 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-violet-700 dark:text-violet-300 text-sm font-medium">Total Donors</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-violet-900 dark:text-violet-100">{stats?.totalDonors || 0}</p>
              <p className="text-violet-600/60 dark:text-violet-400/60 text-sm mt-1">Active blood donors</p>
            </CardContent>
          </Card>

          <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border border-violet-100/50 dark:border-violet-800/30 hover:border-violet-200 dark:hover:border-violet-700 transition-all duration-200 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-violet-700 dark:text-violet-300 text-sm font-medium">Total Hospitals</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-violet-900 dark:text-violet-100">{stats?.totalHospitals || 0}</p>
              <p className="text-violet-600/60 dark:text-violet-400/60 text-sm mt-1">Registered hospitals</p>
            </CardContent>
          </Card>

          <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border border-violet-100/50 dark:border-violet-800/30 hover:border-violet-200 dark:hover:border-violet-700 transition-all duration-200 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-violet-700 dark:text-violet-300 text-sm font-medium">Total Donations</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-violet-900 dark:text-violet-100">{stats?.totalDonations || 0}</p>
              <p className="text-violet-600/60 dark:text-violet-400/60 text-sm mt-1">Blood units collected</p>
            </CardContent>
          </Card>

          <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border border-amber-100/50 dark:border-amber-800/30 hover:border-amber-200 dark:hover:border-amber-700 transition-all duration-200 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-amber-700 dark:text-amber-300 text-sm font-medium">Pending Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-amber-900 dark:text-amber-100">{stats?.pendingRequests || 0}</p>
              <p className="text-amber-600/60 dark:text-amber-400/60 text-sm mt-1">Awaiting approval</p>
            </CardContent>
          </Card>

          <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border border-emerald-100/50 dark:border-emerald-800/30 hover:border-emerald-200 dark:hover:border-emerald-700 transition-all duration-200 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-emerald-700 dark:text-emerald-300 text-sm font-medium">Approved Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-emerald-900 dark:text-emerald-100">{stats?.approvedRequests || 0}</p>
              <p className="text-emerald-600/60 dark:text-emerald-400/60 text-sm mt-1">Fulfilled requests</p>
            </CardContent>
          </Card>

          <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border border-violet-100/50 dark:border-violet-800/30 hover:border-violet-200 dark:hover:border-violet-700 transition-all duration-200 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-violet-700 dark:text-violet-300 text-sm font-medium">Blood Units in Stock</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-violet-900 dark:text-violet-100">{stats?.totalBloodUnits || 0}</p>
              <p className="text-violet-600/60 dark:text-violet-400/60 text-sm mt-1">Total inventory</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border border-violet-100/50 dark:border-violet-800/30 shadow-sm">
            <CardHeader>
              <CardTitle className="text-violet-900 dark:text-violet-100 text-lg">Management</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link href="/admin/requests" className="block">
                <Button className="w-full bg-violet-500/90 hover:bg-violet-600 text-white shadow-sm hover:shadow transition-all duration-200 border border-violet-400/30">
                  Manage Requests
                </Button>
              </Link>
              <Link href="/admin/inventory" className="block">
                <Button
                  variant="outline"
                  className="w-full border-violet-200 dark:border-violet-800 text-violet-700 dark:text-violet-300 hover:bg-violet-50/50 dark:hover:bg-violet-950/20 hover:border-violet-300 dark:hover:border-violet-700"
                >
                  View Inventory
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border border-violet-100/50 dark:border-violet-800/30 shadow-sm">
            <CardHeader>
              <CardTitle className="text-violet-900 dark:text-violet-100 text-lg">User Management</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link href="/admin/donors" className="block">
                <Button
                  variant="outline"
                  className="w-full border-violet-200 dark:border-violet-800 text-violet-700 dark:text-violet-300 hover:bg-violet-50/50 dark:hover:bg-violet-950/20 hover:border-violet-300 dark:hover:border-violet-700"
                >
                  View All Donors
                </Button>
              </Link>
              <Link href="/admin/hospitals" className="block">
                <Button
                  variant="outline"
                  className="w-full border-violet-200 dark:border-violet-800 text-violet-700 dark:text-violet-300 hover:bg-violet-50/50 dark:hover:bg-violet-950/20 hover:border-violet-300 dark:hover:border-violet-700"
                >
                  View All Hospitals
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
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