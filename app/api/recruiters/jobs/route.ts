import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase-server"
import type { Job } from "@/lib/types"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const recruiterId = searchParams.get("recruiter_id")

    if (!recruiterId) {
      return NextResponse.json(
        {
          success: false,
          error: "recruiter_id is required",
        },
        { status: 400 },
      )
    }

    const supabase = await createServerSupabaseClient()

    // Get recruiter's posted jobs
    const { data: recruiter, error: recruiterError } = await supabase
      .from("recruiters")
      .select("posted_jobs")
      .eq("id", recruiterId)
      .single()

    if (recruiterError) {
      throw recruiterError
    }

    if (!recruiter.posted_jobs || recruiter.posted_jobs.length === 0) {
      return NextResponse.json({
        success: true,
        data: [],
        message: "No jobs posted yet",
      })
    }

    // Get job details
    const { data: jobs, error: jobsError } = await supabase
      .from("jobs")
      .select("*")
      .in("id", recruiter.posted_jobs)
      .order("created_at", { ascending: false })

    if (jobsError) {
      throw jobsError
    }

    return NextResponse.json({
      success: true,
      data: jobs as Job[],
      meta: {
        total: jobs?.length || 0,
      },
    })
  } catch (error) {
    console.error("[v0] Get recruiter jobs error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to get recruiter jobs",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { recruiterId, jobData } = await request.json()

    if (!recruiterId || !jobData) {
      return NextResponse.json(
        {
          success: false,
          error: "recruiterId and jobData are required",
        },
        { status: 400 },
      )
    }

    const supabase = await createServerSupabaseClient()

    // Check recruiter credits
    const { data: recruiter, error: recruiterError } = await supabase
      .from("recruiters")
      .select("credits, subscription")
      .eq("id", recruiterId)
      .single()

    if (recruiterError) {
      throw recruiterError
    }

    // Check if recruiter has credits or subscription
    if (recruiter.subscription === "free" && recruiter.credits < 1) {
      return NextResponse.json(
        {
          success: false,
          error: "Insufficient credits. Please purchase credits or upgrade your subscription.",
          code: "INSUFFICIENT_CREDITS",
        },
        { status: 402 },
      )
    }

    // Create job posting
    const now = new Date().toISOString()
    const job: Omit<Job, "id"> = {
      title: jobData.title,
      company: jobData.company,
      location: jobData.location,
      type: jobData.type || "On-site",
      branch: jobData.branch || "Other",
      language: jobData.language || "en",
      country: jobData.country,
      url: jobData.url || `https://wearejobpilot.com/jobs/${Date.now()}`,
      description: jobData.description,
      salary: jobData.salary,
      requirements: jobData.requirements || [],
      benefits: jobData.benefits || [],
      source: "recruiter-portal",
      datePosted: now,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    }

    const { data: newJob, error: jobError } = await supabase
      .from("jobs")
      .insert({
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
      })
      .select()
      .single()

    if (jobError) {
      throw jobError
    }

    // Update recruiter's posted jobs and deduct credit
    const updatedPostedJobs = [...(recruiter.posted_jobs || []), newJob.id]
    const updatedCredits = recruiter.subscription === "free" ? recruiter.credits - 1 : recruiter.credits

    const { error: updateError } = await supabase
      .from("recruiters")
      .update({
        posted_jobs: updatedPostedJobs,
        credits: updatedCredits,
        last_active: now,
      })
      .eq("id", recruiterId)

    if (updateError) {
      // Rollback job creation if recruiter update fails
      await supabase.from("jobs").delete().eq("id", newJob.id)
      throw updateError
    }

    // Create payment record
    await supabase.from("payments").insert({
      recruiter_id: recruiterId,
      amount: 50,
      currency: "EUR",
      type: "job_posting",
      status: "completed",
      job_id: newJob.id,
      created_at: now,
      processed_at: now,
    })

    console.log(`[v0] Job posted successfully by recruiter ${recruiterId}: ${job.title}`)

    return NextResponse.json({
      success: true,
      data: newJob as Job,
      message: "Job posted successfully! €50 has been charged.",
      meta: {
        creditsRemaining: updatedCredits,
        cost: 50,
        currency: "EUR",
      },
    })
  } catch (error) {
    console.error("[v0] Post job error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to post job",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
