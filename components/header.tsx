"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Menu, X, User, LogOut } from "lucide-react"
import { useState } from "react"
import { useAuth } from "@/components/auth-provider"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { user, signOut, loading } = useAuth()

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error("[v0] Sign out error:", error)
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold">
            JP
          </div>
          <span className="text-xl font-bold text-foreground">JobPilot</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          <Link href="/" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
            Home
          </Link>
          <Link href="/vacatures" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
            Vacatures
          </Link>
          <Link
            href="/ai-matching"
            className="text-sm font-medium text-foreground hover:text-primary transition-colors"
          >
            AI Matching
          </Link>
          <Link href="/werkgevers" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
            Voor Werkgevers
          </Link>
          <Link href="/over-ons" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
            Over Ons
          </Link>
        </nav>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center space-x-4">
          {loading ? (
            <div className="w-20 h-9 bg-muted animate-pulse rounded" />
          ) : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="flex items-center space-x-2 bg-transparent">
                  <User className="h-4 w-4" />
                  <span>{user.firstName || user.email}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href="/dashboard">Dashboard</Link>
                </DropdownMenuItem>
                {user.role === "recruiter" && (
                  <DropdownMenuItem asChild>
                    <Link href="/recruiter">Recruiter Portal</Link>
                  </DropdownMenuItem>
                )}
                {user.role === "admin" && (
                  <DropdownMenuItem asChild>
                    <Link href="/admin">Admin Panel</Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                  <LogOut className="h-4 w-4 mr-2" />
                  Uitloggen
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button variant="outline" size="sm" asChild>
                <Link href="/login">Inloggen</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/recruiter">Vacature Plaatsen</Link>
              </Button>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <Button variant="ghost" size="sm" className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden border-t bg-background">
          <nav className="container mx-auto px-4 py-4 space-y-4">
            <Link href="/" className="block text-sm font-medium text-foreground hover:text-primary">
              Home
            </Link>
            <Link href="/vacatures" className="block text-sm font-medium text-foreground hover:text-primary">
              Vacatures
            </Link>
            <Link href="/ai-matching" className="block text-sm font-medium text-foreground hover:text-primary">
              AI Matching
            </Link>
            <Link href="/werkgevers" className="block text-sm font-medium text-foreground hover:text-primary">
              Voor Werkgevers
            </Link>
            <Link href="/over-ons" className="block text-sm font-medium text-foreground hover:text-primary">
              Over Ons
            </Link>
            <div className="pt-4 space-y-2">
              {user ? (
                <>
                  <Button variant="outline" size="sm" className="w-full bg-transparent" asChild>
                    <Link href="/dashboard">Dashboard</Link>
                  </Button>
                  <Button variant="outline" size="sm" className="w-full bg-transparent" onClick={handleSignOut}>
                    Uitloggen
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="outline" size="sm" className="w-full bg-transparent" asChild>
                    <Link href="/login">Inloggen</Link>
                  </Button>
                  <Button size="sm" className="w-full" asChild>
                    <Link href="/recruiter">Vacature Plaatsen</Link>
                  </Button>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
