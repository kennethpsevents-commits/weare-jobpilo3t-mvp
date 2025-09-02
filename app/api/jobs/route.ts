import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase-server"
import type { Job } from "@/lib/types"
import seedJobs from "@/data/seed-jobs.json"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search") || ""
    const location = searchParams.get("location") || ""
    const type = searchParams.get("type") || ""
    const branch = searchParams.get("branch") || ""
    const language = searchParams.get("language") || "nl"
    const limit = Number.parseInt(searchParams.get("limit") || "50")
    const offset = Number.parseInt(searchParams.get("offset") || "0")

    console.log("[v0] Jobs API called with params:", { search, location, type, branch, language, limit, offset })

    let usingFallback = false
    let jobs: any[] = []

    try {
      const supabase = await createServerSupabaseClient()

      // Build query with better error handling
      let query = supabase
        .from("jobs")
        .select("*")
        .eq("is_active", true)
        .eq("language", language)
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1)

      // Apply filters
      if (search) {
        query = query.or(`title.ilike.%${search}%,company.ilike.%${search}%,description.ilike.%${search}%`)
      }
      if (location) {
        query = query.ilike("location", `%${location}%`)
      }
      if (type) {
        query = query.eq("type", type)
      }
      if (branch) {
        query = query.eq("branch", branch)
      }

      const { data: dbJobs, error } = await query

      if (error) {
        console.log("[v0] Database query error, using fallback data:", error.message)
        throw error
      }

      if (dbJobs && dbJobs.length > 0) {
        console.log("[v0] Successfully fetched jobs from database:", dbJobs.length)
        jobs = dbJobs
      } else {
        console.log("[v0] No jobs found in database, using seed data")
        usingFallback = true
      }
    } catch (dbError) {
      console.log(
        "[v0] Database not available, using seed data:",
        dbError instanceof Error ? dbError.message : "Unknown error",
      )
      usingFallback = true
    }

    if (usingFallback || jobs.length === 0) {
      const filteredSeedJobs = seedJobs
        .filter((job: any) => {
          if (language && job.language !== language) return false
          if (search) {
            const searchLower = search.toLowerCase()
            const matchesSearch =
              job.title.toLowerCase().includes(searchLower) ||
              job.company.toLowerCase().includes(searchLower) ||
              (job.description && job.description.toLowerCase().includes(searchLower)) ||
              (job.requirements && job.requirements.some((req: string) => req.toLowerCase().includes(searchLower)))
            if (!matchesSearch) return false
          }
          if (location && !job.location.toLowerCase().includes(location.toLowerCase())) return false
          if (type && job.type !== type) return false
          if (branch && job.branch !== branch) return false
          return true
        })
        .slice(offset, offset + limit)

      console.log("[v0] Returning seed data:", filteredSeedJobs.length, "jobs")

      return NextResponse.json({
        success: true,
        data: filteredSeedJobs,
        total: filteredSeedJobs.length,
        totalAvailable: seedJobs.length,
        usingFallback: true,
        message: "Using demo data - connect Supabase for live job data",
      })
    }

    return NextResponse.json({
      success: true,
      data: jobs,
      total: jobs.length,
      usingFallback: false,
    })
  } catch (error) {
    console.error("[v0] Jobs API Error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch jobs",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const job: Omit<Job, "id" | "createdAt" | "updatedAt"> = await request.json()

    if (!job.title || !job.company || !job.location) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: title, company, and location are required",
        },
        { status: 400 },
      )
    }

    try {
      const supabase = await createServerSupabaseClient()

      const { data, error } = await supabase
        .from("jobs")
        .insert([
          {
            title: job.title,
            company: job.company,
            location: job.location,
            type: job.type,
            branch: job.branch,
            language: job.language,
            url: job.url,
            description: job.description,
            salary: job.salary,
            requirements: job.requirements,
            benefits: job.benefits,
            source: job.source,
            is_active: job.isActive,
          },
        ])
        .select()
        .single()

      if (error) {
        console.error("[v0] Database insert error:", error)
        return NextResponse.json({ success: false, error: error.message }, { status: 400 })
      }

      console.log("[v0] Job created successfully:", data.id)
      return NextResponse.json({
        success: true,
        data: data,
        message: "Job created successfully",
      })
    } catch (dbError) {
      console.error("[v0] Database not available for job creation:", dbError)
      return NextResponse.json(
        {
          success: false,
          error: "Database not available - cannot create job",
          details: "Supabase connection required for job creation",
        },
        { status: 503 },
      )
    }
  } catch (error) {
    console.error("[v0] Job creation error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create job",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
