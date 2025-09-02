import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase-server"
import { jobIngestionQueue, outreachQueue } from "@/lib/queue/job-processor"

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()

    // System health metrics
    const [jobsCount, usersCount, recruitersCount, applicationsCount, queueStats] = await Promise.all([
      supabase.from("jobs").select("count", { count: "exact" }),
      supabase.from("user_profiles").select("count", { count: "exact" }),
      supabase.from("recruiters").select("count", { count: "exact" }),
      supabase.from("applications").select("count", { count: "exact" }),
      getQueueStats(),
    ])

    // Performance metrics
    const performanceMetrics = await getPerformanceMetrics()

    // Recent activity
    const recentActivity = await getRecentActivity(supabase)

    return NextResponse.json({
      system: {
        status: "healthy",
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        timestamp: new Date().toISOString(),
      },
      metrics: {
        jobs: jobsCount.count || 0,
        users: usersCount.count || 0,
        recruiters: recruitersCount.count || 0,
        applications: applicationsCount.count || 0,
        ...performanceMetrics,
      },
      queues: queueStats,
      activity: recentActivity,
    })
  } catch (error) {
    console.error("[v0] System status error:", error)
    return NextResponse.json({ error: "Failed to get system status" }, { status: 500 })
  }
}

async function getQueueStats() {
  try {
    const [ingestionStats, outreachStats] = await Promise.all([
      jobIngestionQueue.getJobCounts(),
      outreachQueue.getJobCounts(),
    ])

    return {
      ingestion: ingestionStats,
      outreach: outreachStats,
    }
  } catch (error) {
    return { error: "Queue stats unavailable" }
  }
}

async function getPerformanceMetrics() {
  return {
    avgResponseTime: Math.random() * 200 + 50, // Mock data
    errorRate: Math.random() * 0.01,
    throughput: Math.random() * 1000 + 500,
  }
}

async function getRecentActivity(supabase: any) {
  const { data: recentJobs } = await supabase
    .from("jobs")
    .select("title, company, posted_date")
    .order("posted_date", { ascending: false })
    .limit(5)

  const { data: recentApplications } = await supabase
    .from("applications")
    .select("job_id, applied_at")
    .order("applied_at", { ascending: false })
    .limit(5)

  return {
    recentJobs: recentJobs || [],
    recentApplications: recentApplications || [],
  }
}
