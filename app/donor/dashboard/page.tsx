"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

interface DonorProfile {
  id: string
  bloodType: string
  age: number
  weight: number
  lastDonationDate: string | null
  totalDonations: number
  isEligible: boolean
}

export default function DonorDashboard() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [donor, setDonor] = useState<DonorProfile | null>(null)
  const [pageLoading, setPageLoading] = useState(true)
  const [hasCheckedProfile, setHasCheckedProfile] = useState(false)

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/login")
      return
    }

    if (user && user.role !== "DONOR") {
      router.push("/")
      return
    }

    const fetchDonorProfile = async () => {
      try {
        const response = await fetch("/api/donor/profile", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        })

        if (response.ok) {
          const data = await response.json()
          setDonor(data)
        } else if (response.status === 404) {
          // Donor profile not found, will redirect to profile page
          setDonor(null)
        }
      } catch (error) {
        console.error("Error fetching donor profile:", error)
      } finally {
        setPageLoading(false)
        setHasCheckedProfile(true)
      }
    }

    if (user && user.role === "DONOR") {
      fetchDonorProfile()
    }
  }, [user, loading, router])

  // Redirect to profile page if donor profile is not set up
  useEffect(() => {
    if (hasCheckedProfile && !loading && !pageLoading && user && user.role === "DONOR" && !donor) {
      console.log("Redirecting to donor profile setup")
      router.push("/donor/profile")
    }
  }, [hasCheckedProfile, donor, loading, pageLoading, user, router])

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

  // Return redirecting message while redirecting to profile
  if (hasCheckedProfile && user && user.role === "DONOR" && !donor) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-2xl font-bold text-primary mb-2">Redirecting...</div>
          <p className="text-muted-foreground">Setting up your profile</p>
        </div>
      </div>
    )
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-primary">Blood Type</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-accent">{donor?.bloodType || "Not Set"}</p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-primary">Total Donations</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-accent">{donor?.totalDonations || 0}</p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-primary">Eligibility Status</CardTitle>
            </CardHeader>
            <CardContent>
              <p className={`text-lg font-semibold ${donor?.isEligible ? "text-success" : "text-error"}`}>
                {donor?.isEligible ? "Eligible" : "Not Eligible"}
              </p>
            </CardContent>
          </Card>
        </div>

        {!donor ? (
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>Complete Your Profile</CardTitle>
              <CardDescription>Set up your donor profile to start donating</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/donor/profile">
                <Button className="bg-primary hover:bg-primary-dark text-white">Complete Profile</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p>
                  <span className="text-muted">Age:</span> {donor.age} years
                </p>
                <p>
                  <span className="text-muted">Weight:</span> {donor.weight} kg
                </p>
                <p>
                  <span className="text-muted">Last Donation:</span>{" "}
                  {donor.lastDonationDate ? new Date(donor.lastDonationDate).toLocaleDateString() : "Never"}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link href="/donor/donate" className="block">
                  <Button className="w-full bg-primary hover:bg-primary-dark text-white">Schedule Donation</Button>
                </Link>
                <Link href="/donor/history" className="block">
                  <Button variant="outline" className="w-full bg-transparent">
                    View Donation History
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  )
}
