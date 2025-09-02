import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase-server"
import { JobCrawler, crawlerSources } from "@/lib/crawler"
import type { Job, CrawlerResult, CrawlerStats } from "@/lib/types"

const mockJobSources = [
  {
    name: "TechJobs NL",
    country: "Netherlands",
    jobs: [
      {
        title: "Senior React Developer",
        company: "InnovateTech",
        location: "Amsterdam, Nederland",
        type: "Hybrid" as const,
        branch: "IT",
        language: "nl" as const,
        country: "Netherlands",
        url: "https://example.com/react-dev-123",
        description:
          "Werk mee aan cutting-edge React applicaties in een dynamisch team. Wij zoeken een ervaren developer die kan bijdragen aan onze moderne tech stack.",
        salary: "€65.000 - €80.000",
        requirements: ["React", "TypeScript", "5+ jaar ervaring", "GraphQL"],
        benefits: ["Flexibele werktijden", "Thuiswerken", "Opleidingsbudget"],
        source: "techjobs-nl",
        isActive: true,
      },
      {
        title: "Full-Stack Developer",
        company: "WebSolutions",
        location: "Utrecht, Nederland",
        type: "Remote" as const,
        branch: "IT",
        language: "nl" as const,
        country: "Netherlands",
        url: "https://example.com/fullstack-456",
        description:
          "Bouw moderne web applicaties met React en Node.js. Perfect voor developers die graag remote werken.",
        salary: "€55.000 - €70.000",
        requirements: ["React", "Node.js", "MongoDB", "3+ jaar ervaring"],
        benefits: ["Remote werk", "Flexibele uren", "Goede werksfeer"],
        source: "websolutions",
        isActive: true,
      },
    ],
  },
  {
    name: "TechJobs DE",
    country: "Germany",
    jobs: [
      {
        title: "DevOps Engineer",
        company: "CloudTech Berlin",
        location: "Berlin, Deutschland",
        type: "On-site" as const,
        branch: "IT",
        language: "de" as const,
        country: "Germany",
        url: "https://example.com/devops-789",
        description:
          "Werden Sie Teil unseres DevOps-Teams und bauen Sie skalierbare Cloud-Infrastruktur auf. Erfahrung mit AWS und Kubernetes erforderlich.",
        salary: "€70.000 - €85.000",
        requirements: ["AWS", "Kubernetes", "Docker", "4+ Jahre Erfahrung"],
        benefits: ["Umzugspaket", "Krankenversicherung", "Weiterbildungsbudget"],
        source: "cloudtech-berlin",
        isActive: true,
      },
    ],
  },
  {
    name: "TechJobs PL",
    country: "Poland",
    jobs: [
      {
        title: "Frontend Developer",
        company: "Warsaw Tech",
        location: "Warszawa, Polska",
        type: "Hybrid" as const,
        branch: "IT",
        language: "pl" as const,
        country: "Poland",
        url: "https://example.com/frontend-pl-123",
        description:
          "Dołącz do naszego zespołu i twórz nowoczesne aplikacje webowe. Szukamy doświadczonego developera Frontend.",
        salary: "12.000 - 18.000 PLN",
        requirements: ["React", "JavaScript", "CSS", "3+ lata doświadczenia"],
        benefits: ["Praca hybrydowa", "Prywatna opieka medyczna", "Karta Multisport"],
        source: "warsaw-tech",
        isActive: true,
      },
    ],
  },
]

export async function GET(request: NextRequest) {
  const startTime = Date.now()

  try {
    const { searchParams } = new URL(request.url)
    const source = searchParams.get("source") || "all"
    const dryRun = searchParams.get("dry_run") === "true"
    const maxJobs = Number.parseInt(searchParams.get("max_jobs") || "100")
    const useMock = searchParams.get("use_mock") === "true"
    const country = searchParams.get("country")
    const massMode = searchParams.get("mass_mode") === "true" // Added mass crawling mode

    console.log(
      `[v0] Advanced crawler starting - source: ${source}, country: ${country}, mass_mode: ${massMode}, max_jobs: ${maxJobs}`,
    )

    let crawledJobs: Job[] = []
    const errors: string[] = []
    let duplicatesRemoved = 0
    const now = new Date().toISOString()

    if (useMock) {
      const filteredSources = country
        ? mockJobSources.filter((s) => s.country.toLowerCase() === country.toLowerCase())
        : mockJobSources

      for (const jobSource of filteredSources) {
        for (const jobData of jobSource.jobs) {
          const job: Job = {
            id: `crawled-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            ...jobData,
            createdAt: now,
            updatedAt: now,
          }
          crawledJobs.push(job)
        }
      }
    } else {
      const crawler = new JobCrawler()

      try {
        if (massMode) {
          // Mass crawl all sources
          console.log(`[v0] Starting mass crawl of all ${crawlerSources.length} sources`)
          crawledJobs = await crawler.crawlAllSources(Math.floor(maxJobs / crawlerSources.length))
        } else {
          // Selective crawling
          let sourcesToCrawl = crawlerSources

          if (source !== "all") {
            sourcesToCrawl = crawlerSources.filter((s) => s.name.toLowerCase().includes(source.toLowerCase()))
          }

          if (country) {
            sourcesToCrawl = sourcesToCrawl.filter((s) => s.country.toLowerCase() === country.toLowerCase())
          }

          console.log(`[v0] Crawling ${sourcesToCrawl.length} selected sources`)

          for (const crawlerSource of sourcesToCrawl) {
            try {
              console.log(`[v0] Crawling ${crawlerSource.name} (${crawlerSource.country})...`)
              const jobs = await crawler.crawlSource(crawlerSource, Math.floor(maxJobs / sourcesToCrawl.length))
              crawledJobs.push(...jobs)
              console.log(`[v0] Successfully crawled ${jobs.length} jobs from ${crawlerSource.name}`)
            } catch (error) {
              const errorMsg = `Failed to crawl ${crawlerSource.name}: ${error}`
              console.error(`[v0] ${errorMsg}`)
              errors.push(errorMsg)
              continue
            }
          }
        }
      } finally {
        await crawler.close()
      }
    }

    const originalCount = crawledJobs.length
    const uniqueJobs = new Map<string, Job>()

    crawledJobs.forEach((job) => {
      const key = `${job.title.toLowerCase()}-${job.company.toLowerCase()}-${job.location.toLowerCase()}`
      if (!uniqueJobs.has(key)) {
        uniqueJobs.set(key, job)
      }
    })

    crawledJobs = Array.from(uniqueJobs.values())
    duplicatesRemoved = originalCount - crawledJobs.length

    if (dryRun) {
      const duration = Date.now() - startTime
      return NextResponse.json({
        success: true,
        data: {
          jobs: crawledJobs,
          source: source,
          crawledAt: now,
          totalFound: crawledJobs.length,
          duplicatesRemoved,
          errors,
          duration,
          dryRun: true,
        } as CrawlerResult,
        message: `Dry run completed. Found ${crawledJobs.length} unique jobs (${duplicatesRemoved} duplicates removed).`,
      })
    }

    let savedJobs = []
    let supabaseAvailable = true

    try {
      const supabase = await createServerSupabaseClient()

      const jobsToInsert = crawledJobs.map((job) => ({
        title: job.title,
        company: job.company,
        location: job.location,
        type: job.type,
        branch: job.branch,
        language: job.language,
        country: job.country,
        url: job.url,
        description: job.description,
        salary: job.salary,
        requirements: job.requirements,
        benefits: job.benefits,
        source: job.source,
        date_posted: job.datePosted,
        is_active: job.isActive,
        created_at: job.createdAt,
        updated_at: job.updatedAt,
      }))

      const { data, error } = await supabase
        .from("jobs")
        .upsert(jobsToInsert, {
          onConflict: "url",
          ignoreDuplicates: false,
        })
        .select()

      if (!error && data) {
        savedJobs = data
        console.log(`[v0] Successfully saved ${data.length} jobs to database`)
      } else if (error) {
        console.error(`[v0] Database error:`, error)
        errors.push(`Database error: ${error.message}`)
      }

      await supabase.from("crawl_logs").insert({
        source: source,
        jobs_found: crawledJobs.length,
        jobs_saved: savedJobs.length,
        duplicates_removed: duplicatesRemoved,
        errors: errors,
        duration: Date.now() - startTime,
        crawled_at: now,
        success: errors.length === 0,
      })
    } catch (supabaseError) {
      console.log(`[v0] Supabase not available, using fallback storage:`, supabaseError)
      supabaseAvailable = false
      savedJobs = crawledJobs
      errors.push(`Database unavailable: ${supabaseError}`)
    }

    const duration = Date.now() - startTime
    console.log(
      `[v0] Crawl completed in ${duration}ms - found: ${crawledJobs.length}, saved: ${savedJobs.length}, errors: ${errors.length}`,
    )

    return NextResponse.json({
      success: true,
      data: {
        jobs: savedJobs,
        source: source,
        crawledAt: now,
        totalFound: crawledJobs.length,
        duplicatesRemoved,
        errors,
        duration,
      } as CrawlerResult,
      message: `Crawl completed. Found ${crawledJobs.length} jobs, saved ${savedJobs.length}${duplicatesRemoved > 0 ? `, removed ${duplicatesRemoved} duplicates` : ""}.`,
      meta: {
        total: savedJobs.length,
        supabaseAvailable,
        errorCount: errors.length,
      },
    })
  } catch (error) {
    const duration = Date.now() - startTime
    console.error("[v0] Crawler Error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Crawl failed",
        details: error instanceof Error ? error.message : "Unknown error",
        duration,
      },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { sources, maxJobs = 100, dryRun = false, country, massMode = false } = await request.json()

    const params = new URLSearchParams({
      source: sources?.join(",") || "all",
      max_jobs: maxJobs.toString(),
      dry_run: dryRun.toString(),
      use_mock: "false",
      mass_mode: massMode.toString(),
    })

    if (country) {
      params.append("country", country)
    }

    const crawlResponse = await fetch(`${request.nextUrl.origin}/api/crawl?${params.toString()}`)

    if (!crawlResponse.ok) {
      throw new Error(`Crawl request failed with status: ${crawlResponse.status}`)
    }

    const result = await crawlResponse.json()

    return NextResponse.json(result)
  } catch (error) {
    console.error("[v0] Manual crawl trigger error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to trigger crawl",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()

    // Get crawler statistics
    const { data: crawlLogs } = await supabase
      .from("crawl_logs")
      .select("*")
      .order("crawled_at", { ascending: false })
      .limit(10)

    const { data: jobs } = await supabase
      .from("jobs")
      .select("country, branch, type, language, created_at")
      .eq("is_active", true)

    if (!jobs) {
      throw new Error("Failed to fetch job statistics")
    }

    const stats: CrawlerStats = {
      totalJobs: jobs.length,
      jobsByCountry: jobs.reduce(
        (acc, job) => {
          acc[job.country || "Unknown"] = (acc[job.country || "Unknown"] || 0) + 1
          return acc
        },
        {} as Record<string, number>,
      ),
      jobsByBranch: jobs.reduce(
        (acc, job) => {
          acc[job.branch] = (acc[job.branch] || 0) + 1
          return acc
        },
        {} as Record<string, number>,
      ),
      jobsByType: jobs.reduce(
        (acc, job) => {
          acc[job.type] = (acc[job.type] || 0) + 1
          return acc
        },
        {} as Record<string, number>,
      ),
      jobsByLanguage: jobs.reduce(
        (acc, job) => {
          acc[job.language] = (acc[job.language] || 0) + 1
          return acc
        },
        {} as Record<string, number>,
      ),
      recentCrawls:
        crawlLogs?.map((log) => ({
          source: log.source,
          jobsFound: log.jobs_found,
          crawledAt: log.crawled_at,
          duration: log.duration,
          success: log.success,
        })) || [],
      lastCrawlTime: crawlLogs?.[0]?.crawled_at || new Date().toISOString(),
      activeSources: crawlerSources.length,
      totalSources: crawlerSources.length,
    }

    return NextResponse.json({
      success: true,
      data: stats,
    })
  } catch (error) {
    console.error("[v0] Stats error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to get crawler statistics",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
