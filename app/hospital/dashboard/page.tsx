"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
// import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

interface HospitalProfile {
  id: string
  name: string
  address: string
  phone: string
}

interface RequestStats {
  pending: number
  approved: number
  completed: number
}

interface BloodInventory {
  bloodType: string
  quantity: number
}

export default function HospitalDashboard() {
  const router = useRouter()
  // const { user, loading } = useAuth()
  const [hospital, setHospital] = useState<HospitalProfile | null>(null)
  const [stats, setStats] = useState<RequestStats>({ pending: 0, approved: 0, completed: 0 })
  const [inventory, setInventory] = useState<BloodInventory[]>([])
  const [pageLoading, setPageLoading] = useState(true)
  const [hasCheckedProfile, setHasCheckedProfile] = useState(false)

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/login")
      return
    }

    if (user && user.role !== "HOSPITAL") {
      router.push("/")
      return
    }

    const fetchData = async () => {
      try {
        const [hospitalRes, statsRes, inventoryRes] = await Promise.all([
          fetch("/api/hospital/profile", {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          }),
          fetch("/api/hospital/stats", {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          }),
          fetch("/api/admin/inventory", {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          }),
        ])

        if (hospitalRes.ok) {
          const data = await hospitalRes.json()
          setHospital(data)
        } else if (hospitalRes.status === 404) {
          // Hospital profile not found, will redirect to profile page
          setHospital(null)
        }

        if (statsRes.ok) {
          const data = await statsRes.json()
          setStats(data)
        }

        if (inventoryRes.ok) {
          const data = await inventoryRes.json()
          setInventory(data)
        }
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setPageLoading(false)
        setHasCheckedProfile(true)
      }
    }

    if (user && user.role === "HOSPITAL") {
      fetchData()
    }
  }, [user, loading, router])

  // Redirect to profile page if hospital profile is not set up
  useEffect(() => {
    if (hasCheckedProfile && !loading && !pageLoading && user && user.role === "HOSPITAL" && !hospital) {
      console.log("Redirecting to hospital profile setup")
      router.push("/hospital/profile")
    }
  }, [hasCheckedProfile, hospital, loading, pageLoading, user, router])

  // Show loading state
  if (loading || pageLoading || !hasCheckedProfile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-2xl font-bold text-primary mb-2">Loading...</div>
          <p className="text-muted-foreground">Please wait</p>
        </div>
      </div>
    )
  }

  // Return null while redirecting to profile
  if (hasCheckedProfile && user && user.role === "HOSPITAL" && !hospital) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-2xl font-bold text-primary mb-2">Redirecting...</div>
          <p className="text-muted-foreground">Setting up your profile</p>
        </div>
      </div>
    )
  }

  const getStockStatus = (quantity: number) => {
    if (quantity < 500) return { color: "text-error", bgColor: "bg-error/10", label: "Critical - Request Needed" }
    if (quantity < 1000) return { color: "text-warning", bgColor: "bg-warning/10", label: "Low Stock" }
    return { color: "text-success", bgColor: "bg-success/10", label: "Available" }
  }

  return (
    <div className="min-h-screen bg-background">
      <nav className="bg-card border-b border-border p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-primary">Blood Bank System</h1>
          <div className="flex gap-4">
            <span className="text-foreground">{user?.name}</span>
            <Button
              onClick={() => {
                localStorage.removeItem("token")
                localStorage.removeItem("user")
                router.push("/auth/login")
              }}
              variant="outline"
            >
              Logout
            </Button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-6">
        {hospital && (
          <Card className="bg-card border-border mb-8">
            <CardHeader>
              <CardTitle className="text-primary">{hospital.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p>
                <span className="text-muted">Address:</span> {hospital.address}
              </p>
              <p>
                <span className="text-muted">Phone:</span> {hospital.phone}
              </p>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-primary">Pending Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-accent">{stats.pending}</p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-primary">Approved Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-accent">{stats.approved}</p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-primary">Completed Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-accent">{stats.completed}</p>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-card border-border mb-8">
          <CardHeader>
            <CardTitle className="text-primary">Available Blood Inventory</CardTitle>
            <CardDescription>Current stock levels across all blood types</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {inventory.map((item) => {
                const status = getStockStatus(item.quantity)
                return (
                  <div key={item.bloodType} className={`p-4 rounded-lg border ${status.bgColor}`}>
                    <h3 className="text-2xl font-bold text-foreground mb-2">{item.bloodType}</h3>
                    <p className="text-xl font-semibold text-foreground mb-2">{item.quantity} ml</p>
                    <p className={`text-sm font-medium ${status.color}`}>{status.label}</p>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>Request Blood</CardTitle>
              <CardDescription>Submit a new blood request</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/hospital/request">
                <Button className="w-full bg-primary hover:bg-primary-dark text-white">New Request</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>View Requests</CardTitle>
              <CardDescription>Check status of your requests</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/hospital/requests">
                <Button variant="outline" className="w-full bg-transparent">
                  View All Requests
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
