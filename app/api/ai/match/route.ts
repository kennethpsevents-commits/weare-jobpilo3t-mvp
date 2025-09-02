import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase-server"
import { getAIMatcher } from "@/lib/ai-matcher"
import type { UserProfile, Job } from "@/lib/types"

export async function POST(request: NextRequest) {
  try {
    const { userProfile, jobIds, criteria } = await request.json()

    if (!userProfile) {
      return NextResponse.json(
        {
          success: false,
          error: "User profile is required",
        },
        { status: 400 },
      )
    }

    console.log(`[v0] AI Matching request for user with ${userProfile.skills?.length || 0} skills`)

    let jobs: Job[] = []

    try {
      const supabase = await createServerSupabaseClient()

      let query = supabase.from("jobs").select("*").eq("is_active", true)

      if (jobIds && jobIds.length > 0) {
        query = query.in("id", jobIds)
      } else {
        // Get recent jobs if no specific jobs requested
        query = query.order("created_at", { ascending: false }).limit(100)
      }

      const { data, error } = await query

      if (error) {
        console.error("[v0] Database error:", error)
        throw error
      }

      jobs = data || []
    } catch (dbError) {
      console.log("[v0] Database not available, using mock data")
      // Fallback to mock data
      jobs = [
        {
          id: "mock-1",
          title: "Senior React Developer",
          company: "TechCorp",
          location: "Amsterdam, Netherlands",
          type: "Hybrid",
          branch: "IT",
          language: "nl",
          country: "Netherlands",
          url: "https://example.com/job1",
          description:
            "We are looking for a Senior React Developer with 5+ years of experience in React, TypeScript, and Node.js.",
          salary: "€65.000 - €80.000",
          requirements: ["React", "TypeScript", "Node.js", "5+ years experience"],
          benefits: ["Flexible hours", "Remote work", "Learning budget"],
          source: "techcorp",
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "mock-2",
          title: "Full-Stack Developer",
          company: "StartupXYZ",
          location: "Berlin, Germany",
          type: "Remote",
          branch: "IT",
          language: "en",
          country: "Germany",
          url: "https://example.com/job2",
          description:
            "Join our startup as a Full-Stack Developer. Experience with Python, Django, and React required.",
          salary: "€55.000 - €70.000",
          requirements: ["Python", "Django", "React", "3+ years experience"],
          benefits: ["Stock options", "Remote work", "Flexible schedule"],
          source: "startupxyz",
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ] as Job[]
    }

    if (jobs.length === 0) {
      return NextResponse.json({
        success: true,
        data: [],
        message: "No jobs found to match against",
      })
    }

    const aiMatcher = getAIMatcher()
    const matchResults = await aiMatcher.matchJobsForUser(userProfile, jobs, criteria)

    console.log(`[v0] AI Matching completed: ${matchResults.length} matches found from ${jobs.length} jobs`)

    // Add job details to match results
    const enrichedResults = matchResults.map((result) => {
      const job = jobs.find((j) => j.id === result.jobId)
      return {
        ...result,
        job,
      }
    })

    return NextResponse.json({
      success: true,
      data: enrichedResults,
      message: `Found ${matchResults.length} job matches`,
      meta: {
        totalJobsAnalyzed: jobs.length,
        averageMatchScore:
          matchResults.length > 0
            ? Math.round((matchResults.reduce((sum, r) => sum + r.matchScore, 0) / matchResults.length) * 100) / 100
            : 0,
      },
    })
  } catch (error) {
    console.error("[v0] AI Matching error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "AI matching failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("user_id")
    const jobId = searchParams.get("job_id")

    if (!userId || !jobId) {
      return NextResponse.json(
        {
          success: false,
          error: "user_id and job_id are required",
        },
        { status: 400 },
      )
    }

    // Get user profile and job details
    const supabase = await createServerSupabaseClient()

    const [userResult, jobResult] = await Promise.all([
      supabase.from("user_profiles").select("*").eq("id", userId).single(),
      supabase.from("jobs").select("*").eq("id", jobId).single(),
    ])

    if (userResult.error || jobResult.error) {
      return NextResponse.json(
        {
          success: false,
          error: "User or job not found",
        },
        { status: 404 },
      )
    }

    const userProfile = userResult.data as UserProfile
    const job = jobResult.data as Job

    const aiMatcher = getAIMatcher()
    const matchResults = await aiMatcher.matchJobsForUser(userProfile, [job])

    if (matchResults.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          matchScore: 0,
          explanation: "This job does not meet the minimum matching criteria.",
        },
      })
    }

    const matchResult = matchResults[0]
    const explanation = await aiMatcher.generateMatchExplanation(matchResult, job)

    return NextResponse.json({
      success: true,
      data: {
        ...matchResult,
        job,
        explanation,
      },
    })
  } catch (error) {
    console.error("[v0] Single job match error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to analyze job match",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
