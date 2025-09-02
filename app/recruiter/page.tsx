"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  PlusCircle,
  Briefcase,
  Users,
  CreditCard,
  TrendingUp,
  MapPin,
  Building2,
  Euro,
  Calendar,
  Eye,
  Edit,
  Trash2,
} from "lucide-react"
import { PostJobDialog } from "@/components/post-job-dialog"

export default function RecruiterDashboard() {
  const [recruiter, setRecruiter] = useState<any>(null)
  const [jobs, setJobs] = useState<any[]>([])
  const [payments, setPayments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showPostJob, setShowPostJob] = useState(false)

  // Mock data for demo - replace with real API calls
  useEffect(() => {
    const mockRecruiter = {
      id: "recruiter-1",
      companyName: "TechCorp Europe",
      contactEmail: "hr@techcorp.eu",
      contactPhone: "+31 20 123 4567",
      website: "https://techcorp.eu",
      description: "Leading technology company in Europe",
      credits: 5,
      subscription: "basic",
      createdAt: "2024-01-15T10:00:00Z",
      lastActive: new Date().toISOString(),
    }

    const mockJobs = [
      {
        id: "job-1",
        title: "Senior React Developer",
        company: "TechCorp Europe",
        location: "Amsterdam, Netherlands",
        type: "Hybrid",
        branch: "IT",
        language: "en",
        country: "Netherlands",
        salary: "€65.000 - €80.000",
        description: "We are looking for a Senior React Developer to join our team...",
        requirements: ["React", "TypeScript", "5+ years experience"],
        benefits: ["Health insurance", "Flexible hours", "Remote work"],
        isActive: true,
        createdAt: "2024-01-20T14:30:00Z",
        views: 245,
        applications: 12,
      },
      {
        id: "job-2",
        title: "DevOps Engineer",
        company: "TechCorp Europe",
        location: "Berlin, Germany",
        type: "On-site",
        branch: "IT",
        language: "en",
        country: "Germany",
        salary: "€70.000 - €85.000",
        description: "Join our DevOps team to build scalable infrastructure...",
        requirements: ["AWS", "Kubernetes", "Docker", "4+ years experience"],
        benefits: ["Relocation package", "Learning budget", "Stock options"],
        isActive: true,
        createdAt: "2024-01-18T09:15:00Z",
        views: 189,
        applications: 8,
      },
    ]

    const mockPayments = [
      {
        id: "payment-1",
        amount: 50,
        currency: "EUR",
        type: "job_posting",
        status: "completed",
        jobId: "job-1",
        createdAt: "2024-01-20T14:30:00Z",
        processedAt: "2024-01-20T14:30:05Z",
      },
      {
        id: "payment-2",
        amount: 50,
        currency: "EUR",
        type: "job_posting",
        status: "completed",
        jobId: "job-2",
        createdAt: "2024-01-18T09:15:00Z",
        processedAt: "2024-01-18T09:15:03Z",
      },
    ]

    setRecruiter(mockRecruiter)
    setJobs(mockJobs)
    setPayments(mockPayments)
    setLoading(false)
  }, [])

  const handleJobPosted = (newJob: any) => {
    setJobs([newJob, ...jobs])
    setRecruiter({ ...recruiter, credits: recruiter.credits - 1 })
    setShowPostJob(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Recruiter Dashboard</h1>
              <p className="text-muted-foreground mt-1">Welcome back, {recruiter?.companyName}</p>
            </div>
            <Button onClick={() => setShowPostJob(true)} className="bg-primary hover:bg-primary/90">
              <PlusCircle className="h-4 w-4 mr-2" />
              Post New Job - €50
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-6 mb-8 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Jobs</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{jobs.filter((j) => j.isActive).length}</div>
              <p className="text-xs text-muted-foreground">{jobs.length} total posted</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{jobs.reduce((sum, job) => sum + (job.applications || 0), 0)}</div>
              <p className="text-xs text-muted-foreground">Across all jobs</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Credits Remaining</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{recruiter?.credits || 0}</div>
              <p className="text-xs text-muted-foreground">{recruiter?.subscription} plan</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Views</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{jobs.reduce((sum, job) => sum + (job.views || 0), 0)}</div>
              <p className="text-xs text-muted-foreground">This month</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="jobs" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="jobs">Job Postings</TabsTrigger>
            <TabsTrigger value="candidates">Candidates</TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
          </TabsList>

          <TabsContent value="jobs" className="space-y-6">
            <div className="grid gap-6">
              {jobs.map((job) => (
                <Card key={job.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-xl mb-2">{job.title}</CardTitle>
                        <CardDescription className="flex items-center gap-4 text-base">
                          <span className="flex items-center gap-1">
                            <Building2 className="h-4 w-4" />
                            {job.company}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {job.location}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {new Date(job.createdAt).toLocaleDateString()}
                          </span>
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                      <Badge variant={job.isActive ? "default" : "secondary"}>
                        {job.isActive ? "Active" : "Inactive"}
                      </Badge>
                      <Badge variant="outline">{job.type}</Badge>
                      <Badge variant="outline">{job.branch}</Badge>
                      {job.salary && (
                        <Badge variant="outline" className="flex items-center gap-1">
                          <Euro className="h-3 w-3" />
                          {job.salary}
                        </Badge>
                      )}
                    </div>

                    {job.description && <p className="text-sm text-muted-foreground line-clamp-2">{job.description}</p>}

                    <div className="flex items-center justify-between pt-4 border-t">
                      <div className="flex gap-6 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Eye className="h-4 w-4" />
                          {job.views} views
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {job.applications} applications
                        </span>
                      </div>
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="candidates" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Candidate Applications</CardTitle>
                <CardDescription>Review and manage applications for your job postings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No applications yet</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Applications will appear here when candidates apply to your jobs
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payments" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Payment History</CardTitle>
                <CardDescription>Track your job posting payments and subscription charges</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {payments.map((payment) => (
                    <div key={payment.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-muted rounded-full">
                          <CreditCard className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-medium">Job Posting Payment</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(payment.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">€{payment.amount}</p>
                        <Badge variant={payment.status === "completed" ? "default" : "secondary"}>
                          {payment.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <PostJobDialog
        open={showPostJob}
        onOpenChange={setShowPostJob}
        onJobPosted={handleJobPosted}
        recruiter={recruiter}
      />
    </div>
  )
}
