"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface Donation {
  id: string
  quantity: number
  bloodType: string
  status: string
  createdAt: string
}

export default function DonationHistoryPage() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [donations, setDonations] = useState<Donation[]>([])
  const [pageLoading, setPageLoading] = useState(true)

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/login")
      return
    }

    const fetchDonations = async () => {
      try {
        const response = await fetch("/api/donor/donations", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        })

        if (response.ok) {
          const data = await response.json()
          setDonations(data)
        }
      } catch (error) {
        console.error("Error fetching donations:", error)
      } finally {
        setPageLoading(false)
      }
    }

    fetchDonations()
  }, [user, loading, router])

  if (loading || pageLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-background">
      <nav className="bg-slate-900 border-b border-border p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-primary">Donation History</h1>
          <Button onClick={() => router.push("/donor/dashboard")} variant="outline">
            Back to Dashboard
          </Button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-6">
        {donations.length === 0 ? (
          <Card className="bg-slate-900 border-border">
            <CardContent className="pt-6">
              <p className="text-center text-muted">No donations yet</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {donations.map((donation) => (
              <Card key={donation.id} className="bg-slate-900 border-border">
                <CardContent className="pt-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-semibold text-foreground">
                        {donation.quantity} ml - {donation.bloodType}
                      </p>
                      <p className="text-sm text-muted">{new Date(donation.createdAt).toLocaleDateString()}</p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        donation.status === "COMPLETED" ? "bg-success/20 text-success" : "bg-warning/20 text-warning"
                      }`}
                    >
                      {donation.status}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
