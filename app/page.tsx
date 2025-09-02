"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { JobSearch } from "@/components/job-search"
import { JobCard } from "@/components/job-card"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Brain, Users, Zap, TrendingUp, ArrowRight } from "lucide-react"
import type { Job } from "@/lib/types"

export default function HomePage() {
  const [featuredJobs, setFeaturedJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchFeaturedJobs = async () => {
      try {
        const response = await fetch("/api/jobs?limit=6")
        const data = await response.json()
        if (data.success) {
          setFeaturedJobs(data.data)
        }
      } catch (error) {
        console.error("Failed to fetch featured jobs:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchFeaturedJobs()
  }, [])

  const handleSearch = (filters: { search: string; location: string; type: string }) => {
    const params = new URLSearchParams()
    if (filters.search) params.set("search", filters.search)
    if (filters.location) params.set("location", filters.location)
    if (filters.type) params.set("type", filters.type)

    window.location.href = `/vacatures?${params.toString()}`
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="relative py-20 px-4 bg-gradient-to-br from-primary/5 to-secondary/5">
        <div className="container mx-auto text-center">
          <div className="max-w-3xl mx-auto space-y-6">
            <h1 className="text-4xl md:text-6xl font-bold text-balance">
              Find Your Perfect Job with AI-Powered Matching
            </h1>
            <p className="text-xl text-muted-foreground text-balance">
              Europe's most advanced job aggregator that understands your skills and matches you with the right
              opportunities
            </p>
            <div className="flex flex-wrap justify-center gap-2 pt-4">
              <Badge variant="secondary" className="text-sm">
                <Brain className="h-4 w-4 mr-1" />
                AI Matching
              </Badge>
              <Badge variant="secondary" className="text-sm">
                <TrendingUp className="h-4 w-4 mr-1" />
                50,000+ Jobs
              </Badge>
              <Badge variant="secondary" className="text-sm">
                <Users className="h-4 w-4 mr-1" />
                1,000+ Companies
              </Badge>
            </div>
          </div>

          <div className="mt-12">
            <JobSearch onSearch={handleSearch} />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose JobPilot?</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Our AI technology revolutionizes job searching by understanding your unique profile and career goals
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Brain className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>AI-Powered Matching</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Our advanced AI analyzes your skills, experience, and preferences to find jobs that truly fit
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center mb-4">
                  <Zap className="h-6 w-6 text-secondary" />
                </div>
                <CardTitle>Real-Time Updates</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Get notified instantly when new jobs matching your profile are posted across Europe
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-accent" />
                </div>
                <CardTitle>Personal Career Coach</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Get personalized career advice and application tips from our AI career coach
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Featured Jobs Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Featured Jobs</h2>
              <p className="text-xl text-muted-foreground">Discover opportunities from top European companies</p>
            </div>
            <Button variant="outline" asChild>
              <a href="/vacatures">
                View All Jobs
                <ArrowRight className="h-4 w-4 ml-2" />
              </a>
            </Button>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="h-3 bg-muted rounded"></div>
                      <div className="h-3 bg-muted rounded w-2/3"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredJobs.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-primary text-primary-foreground">
        <div className="container mx-auto text-center">
          <div className="max-w-2xl mx-auto space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold">Ready to Find Your Dream Job?</h2>
            <p className="text-xl opacity-90">
              Join thousands of professionals who found their perfect match with JobPilot
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
              <Button size="lg" variant="secondary">
                Create Free Account
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary"
              >
                Try AI Matching
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
