"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface Donor {
  id: string
  user: { name: string; email: string }
  bloodType: string
  age: number
  weight: number
  totalDonations: number
  isEligible: boolean
}

export default function DonorsPage() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [donors, setDonors] = useState<Donor[]>([])
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

    const fetchDonors = async () => {
      try {
        const response = await fetch("/api/admin/donors", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        })

        if (response.ok) {
          const data = await response.json()
          setDonors(data)
        }
      } catch (error) {
        console.error("Error fetching donors:", error)
      } finally {
        setPageLoading(false)
      }
    }

    fetchDonors()
  }, [user, loading, router])

  if (loading || pageLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50/50 dark:from-slate-950 dark:via-slate-900 dark:to-violet-950/10">
        <div className="text-center">
          <div className="w-12 h-12 border-3 border-violet-200 dark:border-violet-800 border-t-violet-400 dark:border-t-violet-500 rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-xl font-semibold text-violet-700 dark:text-violet-300 mb-2">Loading...</div>
          <p className="text-violet-500/70 dark:text-violet-400/70 text-sm">Please wait while we load donors</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-violet-950/5">
      <nav className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm border-b border-violet-100/50 dark:border-violet-900/30 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold text-violet-800 dark:text-violet-200">All Donors</h1>
            <p className="text-violet-600/60 dark:text-violet-400/60 text-sm mt-1">Manage registered blood donors</p>
          </div>
          <Button 
            onClick={() => router.push("/admin/dashboard")} 
            variant="outline"
            className="border-violet-200 dark:border-violet-800 text-violet-700 dark:text-violet-300 hover:bg-violet-50/50 dark:hover:bg-violet-950/20 hover:border-violet-300 dark:hover:border-violet-700"
          >
            Back to Dashboard
          </Button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-6">
        {donors.length === 0 ? (
          <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border border-violet-100/50 dark:border-violet-800/30 shadow-sm max-w-2xl mx-auto">
            <CardContent className="pt-12 pb-12 text-center">
              <div className="w-16 h-16 bg-violet-100/50 dark:bg-violet-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <div className="text-2xl text-violet-500/70">💜</div>
              </div>
              <h3 className="text-lg font-semibold text-violet-800 dark:text-violet-200 mb-2">
                No Donors Found
              </h3>
              <p className="text-violet-600/60 dark:text-violet-400/60 text-sm">
                No donors are currently registered in the system.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-violet-100/50 dark:border-violet-800/30">
                  <th className="text-left p-4 text-violet-700 dark:text-violet-300 font-medium text-sm">Name</th>
                  <th className="text-left p-4 text-violet-700 dark:text-violet-300 font-medium text-sm">Email</th>
                  <th className="text-left p-4 text-violet-700 dark:text-violet-300 font-medium text-sm">Blood Type</th>
                  <th className="text-left p-4 text-violet-700 dark:text-violet-300 font-medium text-sm">Age</th>
                  <th className="text-left p-4 text-violet-700 dark:text-violet-300 font-medium text-sm">Donations</th>
                  <th className="text-left p-4 text-violet-700 dark:text-violet-300 font-medium text-sm">Status</th>
                </tr>
              </thead>
              <tbody>
                {donors.map((donor) => (
                  <tr key={donor.id} className="border-b border-violet-100/30 dark:border-violet-800/20 hover:bg-violet-50/30 dark:hover:bg-violet-950/10 transition-colors">
                    <td className="p-4 text-violet-900 dark:text-violet-100 text-sm">{donor.user.name}</td>
                    <td className="p-4 text-violet-600/70 dark:text-violet-400/70 text-sm">{donor.user.email}</td>
                    <td className="p-4 text-violet-700 dark:text-violet-300 font-semibold text-sm">{donor.bloodType}</td>
                    <td className="p-4 text-violet-900 dark:text-violet-100 text-sm">{donor.age}</td>
                    <td className="p-4 text-violet-900 dark:text-violet-100 text-sm">{donor.totalDonations}</td>
                    <td className="p-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          donor.isEligible 
                            ? "bg-emerald-50/80 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800" 
                            : "bg-rose-50/80 text-rose-700 dark:bg-rose-900/20 dark:text-rose-300 border border-rose-200 dark:border-rose-800"
                        }`}
                      >
                        {donor.isEligible ? "Eligible" : "Ineligible"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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