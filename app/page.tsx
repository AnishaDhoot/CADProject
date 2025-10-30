import Link from "next/link"
import { Button } from "../components/ui/button"

export default function Home() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="text-center max-w-2xl">
        <h1 className="text-5xl font-bold text-primary mb-4">Blood Bank Management System</h1>
        <p className="text-xl text-foreground mb-8">
          Efficiently manage blood donations, inventory, and requests in one centralized platform.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/auth/login">
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 text-lg">Login</Button>
          </Link>
          <Link href="/auth/register">
            <Button variant="outline" className="px-8 py-6 text-lg border-border hover:bg-secondary/10 bg-transparent">
              Register
            </Button>
          </Link>
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-card p-6 rounded-lg border border-border hover:border-accent/50 transition-colors">
            <h3 className="text-lg font-semibold text-accent mb-2">For Donors</h3>
            <p className="text-muted-foreground">Register, track donations, and help save lives</p>
          </div>
          <div className="bg-card p-6 rounded-lg border border-border hover:border-accent/50 transition-colors">
            <h3 className="text-lg font-semibold text-accent mb-2">For Hospitals</h3>
            <p className="text-muted-foreground">Request blood, manage inventory, and track requests</p>
          </div>
          <div className="bg-card p-6 rounded-lg border border-border hover:border-accent/50 transition-colors">
            <h3 className="text-lg font-semibold text-accent mb-2">For Admins</h3>
            <p className="text-muted-foreground">Manage system, approve requests, and monitor inventory</p>
          </div>
        </div>
      </div>
    </div>
  )
}
