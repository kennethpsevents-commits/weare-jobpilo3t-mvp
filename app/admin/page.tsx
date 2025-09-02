"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Globe,
  Play,
  RefreshCw,
  Settings,
  TrendingUp,
  Users,
  Briefcase,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react"

interface CrawlHistory {
  id: string
  source: string
  status: "completed" | "running" | "failed"
  jobsFound: number
  jobsSaved: number
  startedAt: string
  completedAt: string | null
  duration: number | null
  errors: string[]
}

export default function AdminPage() {
  const [stats, setStats] = useState<any>(null)
  const [crawlHistory, setCrawlHistory] = useState<CrawlHistory[]>([])
  const [loading, setLoading] = useState(true)
  const [crawling, setCrawling] = useState(false)

  // Crawl settings
  const [selectedSources, setSelectedSources] = useState<string[]>(["all"])
  const [maxJobs, setMaxJobs] = useState(50)
  const [dryRun, setDryRun] = useState(false)

  const crawlSources = [
    { id: "all", name: "Alle bronnen" },
    { id: "indeed-nl", name: "Indeed Nederland" },
    { id: "linkedin-jobs", name: "LinkedIn Jobs" },
    { id: "techjobs-nl", name: "TechJobs NL" },
  ]

  useEffect(() => {
    fetchStats()
    fetchCrawlHistory()
  }, [])

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/admin/stats")
      const data = await response.json()
      if (data.success) {
        setStats(data.data)
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error)
    }
  }

  const fetchCrawlHistory = async () => {
    try {
      const response = await fetch("/api/admin/crawl")
      const data = await response.json()
      if (data.success) {
        setCrawlHistory(data.data.crawls)
      }
    } catch (error) {
      console.error("Failed to fetch crawl history:", error)
    } finally {
      setLoading(false)
    }
  }

  const triggerCrawl = async () => {
    setCrawling(true)
    try {
      const response = await fetch("/api/admin/crawl", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sources: selectedSources,
          maxJobs,
          dryRun,
        }),
      })

      const result = await response.json()
      if (result.success) {
        // Refresh data
        await fetchStats()
        await fetchCrawlHistory()
      }
    } catch (error) {
      console.error("Failed to trigger crawl:", error)
    } finally {
      setCrawling(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "running":
        return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />
      case "failed":
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <AlertCircle className="h-4 w-4 text-yellow-500" />
    }
  }

  const formatDuration = (ms: number | null) => {
    if (!ms) return "N/A"
    const minutes = Math.floor(ms / 60000)
    const seconds = Math.floor((ms % 60000) / 1000)
    return `${minutes}m ${seconds}s`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/4"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-muted rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">JobPilot Admin Dashboard</h1>
          <p className="text-muted-foreground">Beheer vacatures, crawlers en bekijk statistieken</p>
        </div>

        {/* Stats Overview */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Totaal Vacatures</CardTitle>
                <Briefcase className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.overview.totalJobs}</div>
                <p className="text-xs text-muted-foreground">{stats.overview.activeJobs} actief</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Nieuwe Vacatures</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.overview.recentJobs}</div>
                <p className="text-xs text-muted-foreground">Laatste 7 dagen</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Nederlandse Jobs</CardTitle>
                <Globe className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.languages.nl}</div>
                <p className="text-xs text-muted-foreground">{stats.languages.en} Engels</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Remote Jobs</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.types.Remote || 0}</div>
                <p className="text-xs text-muted-foreground">{stats.types.Hybrid || 0} hybride</p>
              </CardContent>
            </Card>
          </div>
        )}

        <Tabs defaultValue="crawler" className="space-y-6">
          <TabsList>
            <TabsTrigger value="crawler">Crawler Beheer</TabsTrigger>
            <TabsTrigger value="history">Crawl Geschiedenis</TabsTrigger>
            <TabsTrigger value="settings">Instellingen</TabsTrigger>
          </TabsList>

          <TabsContent value="crawler" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Nieuwe Crawl Starten</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Bronnen</label>
                    <div className="space-y-2">
                      {crawlSources.map((source) => (
                        <div key={source.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={source.id}
                            checked={selectedSources.includes(source.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedSources([...selectedSources, source.id])
                              } else {
                                setSelectedSources(selectedSources.filter((s) => s !== source.id))
                              }
                            }}
                          />
                          <label htmlFor={source.id} className="text-sm">
                            {source.name}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Max Vacatures</label>
                      <Input
                        type="number"
                        value={maxJobs}
                        onChange={(e) => setMaxJobs(Number.parseInt(e.target.value))}
                        min={1}
                        max={200}
                      />
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox id="dry-run" checked={dryRun} onCheckedChange={setDryRun} />
                      <label htmlFor="dry-run" className="text-sm">
                        Dry Run (niet opslaan)
                      </label>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="flex justify-between items-center">
                  <p className="text-sm text-muted-foreground">
                    Crawl {selectedSources.length} bron(nen) voor max {maxJobs} vacatures
                  </p>
                  <Button onClick={triggerCrawl} disabled={crawling || selectedSources.length === 0}>
                    {crawling ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Crawling...
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4 mr-2" />
                        Start Crawl
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Crawl Geschiedenis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {crawlHistory.map((crawl) => (
                    <div key={crawl.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        {getStatusIcon(crawl.status)}
                        <div>
                          <div className="font-medium">{crawl.source}</div>
                          <div className="text-sm text-muted-foreground">
                            {new Date(crawl.startedAt).toLocaleString("nl-NL")}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-6">
                        <div className="text-center">
                          <div className="text-sm font-medium">{crawl.jobsFound}</div>
                          <div className="text-xs text-muted-foreground">Gevonden</div>
                        </div>
                        <div className="text-center">
                          <div className="text-sm font-medium">{crawl.jobsSaved}</div>
                          <div className="text-xs text-muted-foreground">Opgeslagen</div>
                        </div>
                        <div className="text-center">
                          <div className="text-sm font-medium">{formatDuration(crawl.duration)}</div>
                          <div className="text-xs text-muted-foreground">Duur</div>
                        </div>
                        <Badge
                          variant={
                            crawl.status === "completed"
                              ? "default"
                              : crawl.status === "running"
                                ? "secondary"
                                : "destructive"
                          }
                        >
                          {crawl.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Crawler Instellingen</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Automatische Crawl Interval</label>
                    <Select defaultValue="daily">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hourly">Elk uur</SelectItem>
                        <SelectItem value="daily">Dagelijks</SelectItem>
                        <SelectItem value="weekly">Wekelijks</SelectItem>
                        <SelectItem value="manual">Handmatig</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Max Crawl Duur (minuten)</label>
                    <Input type="number" defaultValue={30} min={5} max={120} />
                  </div>
                </div>

                <Separator />

                <div className="flex justify-end">
                  <Button>
                    <Settings className="h-4 w-4 mr-2" />
                    Instellingen Opslaan
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Footer />
    </div>
  )
}
