import { type NextRequest, NextResponse } from "next/server"

// Get crawl history and status
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = Number.parseInt(searchParams.get("limit") || "20")
    const offset = Number.parseInt(searchParams.get("offset") || "0")

    // In a real implementation, you would have a crawl_logs table
    // For now, we'll return mock crawl history
    const mockCrawlHistory = [
      {
        id: "crawl-1",
        source: "indeed-nl",
        status: "completed",
        jobsFound: 45,
        jobsSaved: 42,
        startedAt: new Date(Date.now() - 3600000).toISOString(),
        completedAt: new Date(Date.now() - 3300000).toISOString(),
        duration: 300000, // 5 minutes
        errors: [],
      },
      {
        id: "crawl-2",
        source: "linkedin-jobs",
        status: "completed",
        jobsFound: 38,
        jobsSaved: 35,
        startedAt: new Date(Date.now() - 7200000).toISOString(),
        completedAt: new Date(Date.now() - 6900000).toISOString(),
        duration: 300000,
        errors: ["Rate limited on page 3"],
      },
      {
        id: "crawl-3",
        source: "all",
        status: "running",
        jobsFound: 12,
        jobsSaved: 10,
        startedAt: new Date(Date.now() - 600000).toISOString(),
        completedAt: null,
        duration: null,
        errors: [],
      },
    ]

    const paginatedHistory = mockCrawlHistory.slice(offset, offset + limit)

    return NextResponse.json({
      success: true,
      data: {
        crawls: paginatedHistory,
        total: mockCrawlHistory.length,
        pagination: {
          limit,
          offset,
          hasMore: offset + limit < mockCrawlHistory.length,
        },
      },
    })
  } catch (error) {
    console.error("Admin crawl history error:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch crawl history" }, { status: 500 })
  }
}

// Trigger manual crawl
export async function POST(request: NextRequest) {
  try {
    const { sources, maxJobs, dryRun } = await request.json()

    // Trigger crawl via the main crawl endpoint
    const crawlResponse = await fetch(`${request.nextUrl.origin}/api/crawl`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sources, maxJobs, dryRun }),
    })

    const result = await crawlResponse.json()

    return NextResponse.json({
      success: true,
      data: result.data,
      message: "Crawl triggered successfully",
    })
  } catch (error) {
    console.error("Admin crawl trigger error:", error)
    return NextResponse.json({ success: false, error: "Failed to trigger crawl" }, { status: 500 })
  }
}
