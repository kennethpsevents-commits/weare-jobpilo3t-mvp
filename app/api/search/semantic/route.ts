import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase-server"

export async function POST(request: NextRequest) {
  try {
    const { query, embedding, filters = {} } = await request.json()

    if (!embedding || !Array.isArray(embedding)) {
      return NextResponse.json({ success: false, error: "Valid embedding vector required" }, { status: 400 })
    }

    const supabase = createServerSupabaseClient()

    // Use the semantic search function
    const { data: semanticResults, error: searchError } = await supabase.rpc("search_jobs_semantic", {
      query_embedding: embedding,
      match_threshold: filters.threshold || 0.7,
      match_count: filters.limit || 50,
    })

    if (searchError) {
      console.error("Semantic search error:", searchError)
      return NextResponse.json({ success: false, error: "Semantic search failed" }, { status: 500 })
    }

    // Get full job details for matched jobs
    const jobIds = semanticResults?.map((r) => r.job_id) || []

    if (jobIds.length === 0) {
      return NextResponse.json({
        success: true,
        data: [],
        meta: { total: 0, semanticMatches: 0 },
      })
    }

    const { data: jobs, error: jobsError } = await supabase
      .from("jobs")
      .select("*")
      .in("id", jobIds)
      .eq("is_active", true)

    if (jobsError) {
      console.error("Jobs fetch error:", jobsError)
      return NextResponse.json({ success: false, error: "Failed to fetch job details" }, { status: 500 })
    }

    // Merge similarity scores with job data
    const jobsWithScores =
      jobs
        ?.map((job) => {
          const semanticMatch = semanticResults.find((r) => r.job_id === job.id)
          return {
            ...job,
            semanticScore: semanticMatch?.similarity || 0,
          }
        })
        .sort((a, b) => b.semanticScore - a.semanticScore) || []

    return NextResponse.json({
      success: true,
      data: jobsWithScores,
      meta: {
        total: jobsWithScores.length,
        semanticMatches: semanticResults?.length || 0,
        query: query,
      },
    })
  } catch (error) {
    console.error("Semantic search API error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
