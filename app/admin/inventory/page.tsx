"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface BloodInventory {
  id: string
  bloodType: string
  quantity: number
}

export default function InventoryPage() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [inventory, setInventory] = useState<BloodInventory[]>([])
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

    const fetchInventory = async () => {
      try {
        const response = await fetch("/api/admin/inventory", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        })

        if (response.ok) {
          const data = await response.json()
          setInventory(data)
        }
      } catch (error) {
        console.error("Error fetching inventory:", error)
      } finally {
        setPageLoading(false)
      }
    }

    fetchInventory()
  }, [user, loading, router])

  if (loading || pageLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50/50 dark:from-slate-950 dark:via-slate-900 dark:to-violet-950/10">
        <div className="text-center">
          <div className="w-12 h-12 border-3 border-violet-200 dark:border-violet-800 border-t-violet-400 dark:border-t-violet-500 rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-xl font-semibold text-violet-700 dark:text-violet-300 mb-2">Loading...</div>
          <p className="text-violet-500/70 dark:text-violet-400/70 text-sm">Please wait while we load inventory</p>
        </div>
      </div>
    )
  }

  const getStockStatus = (quantity: number) => {
    if (quantity < 500) return { color: "text-rose-600 dark:text-rose-400", label: "Low Stock", bg: "bg-rose-50/80 dark:bg-rose-900/20" }
    if (quantity < 1000) return { color: "text-amber-600 dark:text-amber-400", label: "Medium Stock", bg: "bg-amber-50/80 dark:bg-amber-900/20" }
    return { color: "text-emerald-600 dark:text-emerald-400", label: "Good Stock", bg: "bg-emerald-50/80 dark:bg-emerald-900/20" }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-violet-950/5">
      <nav className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm border-b border-violet-100/50 dark:border-violet-900/30 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold text-violet-800 dark:text-violet-200">Blood Inventory</h1>
            <p className="text-violet-600/60 dark:text-violet-400/60 text-sm mt-1">Current blood stock levels</p>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {inventory.map((item) => {
            const status = getStockStatus(item.quantity)
            return (
              <Card key={item.id} className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border border-violet-100/50 dark:border-violet-800/30 hover:border-violet-200 dark:hover:border-violet-700 transition-all duration-200 shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-xl text-violet-700 dark:text-violet-300">{item.bloodType}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-violet-900 dark:text-violet-100 mb-2">{item.quantity} ml</p>
                  <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${status.bg} ${status.color} border border-current/20`}>
                    <div className="w-1.5 h-1.5 rounded-full bg-current"></div>
                    {status.label}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {inventory.length === 0 && (
          <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border border-violet-100/50 dark:border-violet-800/30 shadow-sm max-w-2xl mx-auto">
            <CardContent className="pt-12 pb-12 text-center">
              <div className="w-16 h-16 bg-violet-100/50 dark:bg-violet-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <div className="text-2xl text-violet-500/70">💉</div>
              </div>
              <h3 className="text-lg font-semibold text-violet-800 dark:text-violet-200 mb-2">
                No Inventory Data
              </h3>
              <p className="text-violet-600/60 dark:text-violet-400/60 text-sm">
                No blood inventory data is currently available.
              </p>
            </CardContent>
          </Card>
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