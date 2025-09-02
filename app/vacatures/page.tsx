"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { JobSearch } from "@/components/job-search"
import { JobCard } from "@/components/job-card"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Filter, SlidersHorizontal } from "lucide-react"
import type { Job } from "@/lib/types"

export default function VacaturesPage() {
  const searchParams = useSearchParams()
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [showFilters, setShowFilters] = useState(false)

  // Filter states
  const [filters, setFilters] = useState({
    search: searchParams.get("search") || "",
    location: searchParams.get("location") || "",
    type: searchParams.get("type") || "",
    branch: "",
    language: "nl",
  })

  const jobsPerPage = 12

  const fetchJobs = async (page = 1) => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        limit: jobsPerPage.toString(),
        offset: ((page - 1) * jobsPerPage).toString(),
        language: filters.language,
      })

      if (filters.search) params.set("search", filters.search)
      if (filters.location) params.set("location", filters.location)
      if (filters.type) params.set("type", filters.type)
      if (filters.branch) params.set("branch", filters.branch)

      const response = await fetch(`/api/jobs?${params.toString()}`)
      const data = await response.json()

      if (data.success) {
        setJobs(data.data)
        setTotal(data.total || data.data.length)
      }
    } catch (error) {
      console.error("Failed to fetch jobs:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchJobs(currentPage)
  }, [filters, currentPage])

  const handleSearch = (searchFilters: { search: string; location: string; type: string }) => {
    setFilters((prev) => ({ ...prev, ...searchFilters }))
    setCurrentPage(1)
  }

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
    setCurrentPage(1)
  }

  const totalPages = Math.ceil(total / jobsPerPage)

  const branches = ["IT", "Marketing", "Sales", "Design", "Finance", "HR", "Operations"]
  const jobTypes = ["Remote", "Hybrid", "On-site"]

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Search Header */}
      <section className="py-8 px-4 bg-muted/30 border-b">
        <div className="container mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-2">Vacatures</h1>
            <p className="text-muted-foreground">
              {total > 0 ? `${total} vacatures gevonden` : "Zoek naar je ideale baan"}
            </p>
          </div>
          <JobSearch onSearch={handleSearch} />
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <aside className="w-full lg:w-64 space-y-6">
            <div className="flex items-center justify-between lg:hidden">
              <h2 className="text-lg font-semibold">Filters</h2>
              <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)}>
                <SlidersHorizontal className="h-4 w-4 mr-2" />
                {showFilters ? "Verberg" : "Toon"} Filters
              </Button>
            </div>

            <div className={`space-y-6 ${showFilters ? "block" : "hidden lg:block"}`}>
              {/* Job Type Filter */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Type Werk</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {jobTypes.map((type) => (
                    <div key={type} className="flex items-center space-x-2">
                      <Checkbox
                        id={type}
                        checked={filters.type === type}
                        onCheckedChange={(checked) => handleFilterChange("type", checked ? type : "")}
                      />
                      <label
                        htmlFor={type}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {type}
                      </label>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Branch Filter */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Branche</CardTitle>
                </CardHeader>
                <CardContent>
                  <Select value={filters.branch} onValueChange={(value) => handleFilterChange("branch", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecteer branche" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Alle branches</SelectItem>
                      {branches.map((branch) => (
                        <SelectItem key={branch} value={branch}>
                          {branch}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>

              {/* Language Filter */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Taal</CardTitle>
                </CardHeader>
                <CardContent>
                  <Select value={filters.language} onValueChange={(value) => handleFilterChange("language", value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="nl">Nederlands</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>
            </div>
          </aside>

          {/* Jobs List */}
          <main className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm text-muted-foreground">
                Pagina {currentPage} van {totalPages} ({total} resultaten)
              </p>
              <Select defaultValue="newest">
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Nieuwste eerst</SelectItem>
                  <SelectItem value="oldest">Oudste eerst</SelectItem>
                  <SelectItem value="relevance">Meest relevant</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[...Array(8)].map((_, i) => (
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
            ) : jobs.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {jobs.map((job) => (
                    <JobCard key={job.id} job={job} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center space-x-2 mt-12">
                    <Button
                      variant="outline"
                      onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                    >
                      Vorige
                    </Button>

                    <div className="flex space-x-1">
                      {[...Array(Math.min(5, totalPages))].map((_, i) => {
                        const pageNum = i + 1
                        return (
                          <Button
                            key={pageNum}
                            variant={currentPage === pageNum ? "default" : "outline"}
                            size="sm"
                            onClick={() => setCurrentPage(pageNum)}
                          >
                            {pageNum}
                          </Button>
                        )
                      })}
                    </div>

                    <Button
                      variant="outline"
                      onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Volgende
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <Card className="text-center py-12">
                <CardContent>
                  <Filter className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Geen vacatures gevonden</h3>
                  <p className="text-muted-foreground mb-4">
                    Probeer je zoekcriteria aan te passen of verwijder enkele filters.
                  </p>
                  <Button
                    onClick={() => setFilters({ search: "", location: "", type: "", branch: "", language: "nl" })}
                  >
                    Filters Wissen
                  </Button>
                </CardContent>
              </Card>
            )}
          </main>
        </div>
      </div>

      <Footer />
    </div>
  )
}
