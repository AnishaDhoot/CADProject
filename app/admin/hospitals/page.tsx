"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface Hospital {
  id: string
  user: { name: string; email: string }
  name: string
  address: string
  phone: string
}

export default function HospitalsPage() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [hospitals, setHospitals] = useState<Hospital[]>([])
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

    const fetchHospitals = async () => {
      try {
        const response = await fetch("/api/admin/hospitals", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        })

        if (response.ok) {
          const data = await response.json()
          setHospitals(data)
        }
      } catch (error) {
        console.error("Error fetching hospitals:", error)
      } finally {
        setPageLoading(false)
      }
    }

    fetchHospitals()
  }, [user, loading, router])

  if (loading || pageLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50/50 dark:from-slate-950 dark:via-slate-900 dark:to-violet-950/10">
        <div className="text-center">
          <div className="w-12 h-12 border-3 border-violet-200 dark:border-violet-800 border-t-violet-400 dark:border-t-violet-500 rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-xl font-semibold text-violet-700 dark:text-violet-300 mb-2">Loading...</div>
          <p className="text-violet-500/70 dark:text-violet-400/70 text-sm">Please wait while we load hospitals</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-violet-950/5">
      <nav className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm border-b border-violet-100/50 dark:border-violet-900/30 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold text-violet-800 dark:text-violet-200">All Hospitals</h1>
            <p className="text-violet-600/60 dark:text-violet-400/60 text-sm mt-1">Manage registered hospitals</p>
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
        {hospitals.length === 0 ? (
          <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border border-violet-100/50 dark:border-violet-800/30 shadow-sm max-w-2xl mx-auto">
            <CardContent className="pt-12 pb-12 text-center">
              <div className="w-16 h-16 bg-violet-100/50 dark:bg-violet-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <div className="text-2xl text-violet-500/70">🏥</div>
              </div>
              <h3 className="text-lg font-semibold text-violet-800 dark:text-violet-200 mb-2">
                No Hospitals Found
              </h3>
              <p className="text-violet-600/60 dark:text-violet-400/60 text-sm">
                No hospitals are currently registered in the system.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {hospitals.map((hospital) => (
              <Card key={hospital.id} className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border border-violet-100/50 dark:border-violet-800/30 hover:border-violet-200 dark:hover:border-violet-700 transition-all duration-200 shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-violet-100/70 dark:bg-violet-900/30 flex items-center justify-center text-violet-600 dark:text-violet-400 font-semibold text-sm shadow-sm">
                      {hospital.name.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-violet-900 dark:text-violet-100 text-sm mb-1">{hospital.name}</h3>
                      <p className="text-violet-600/50 dark:text-violet-400/50 text-xs mb-2">
                        Contact: {hospital.user.email}
                      </p>
                      <p className="text-violet-600/70 dark:text-violet-400/70 text-xs mb-1">
                        <span className="font-medium">Phone:</span> {hospital.phone}
                      </p>
                      <p className="text-violet-600/70 dark:text-violet-400/70 text-xs">
                        <span className="font-medium">Address:</span> {hospital.address}
                      </p>
                    </div>
                  </div>
                </CardContent>
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