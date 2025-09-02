import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase-server"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()

    // Get basic stats
    const [{ count: totalJobs }, { count: activeJobs }, { count: nlJobs }, { count: enJobs }] = await Promise.all([
      supabase.from("jobs").select("*", { count: "exact", head: true }),
      supabase.from("jobs").select("*", { count: "exact", head: true }).eq("is_active", true),
      supabase.from("jobs").select("*", { count: "exact", head: true }).eq("language", "nl"),
      supabase.from("jobs").select("*", { count: "exact", head: true }).eq("language", "en"),
    ])

    // Get jobs by type
    const { data: jobsByType } = await supabase.from("jobs").select("type").eq("is_active", true)

    const typeStats =
      jobsByType?.reduce((acc: any, job: any) => {
        acc[job.type] = (acc[job.type] || 0) + 1
        return acc
      }, {}) || {}

    // Get jobs by branch
    const { data: jobsByBranch } = await supabase.from("jobs").select("branch").eq("is_active", true)

    const branchStats =
      jobsByBranch?.reduce((acc: any, job: any) => {
        acc[job.branch] = (acc[job.branch] || 0) + 1
        return acc
      }, {}) || {}

    // Get recent activity (last 7 days)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const { count: recentJobs } = await supabase
      .from("jobs")
      .select("*", { count: "exact", head: true })
      .gte("created_at", sevenDaysAgo.toISOString())

    const stats = {
      overview: {
        totalJobs: totalJobs || 0,
        activeJobs: activeJobs || 0,
        inactiveJobs: (totalJobs || 0) - (activeJobs || 0),
        recentJobs: recentJobs || 0,
      },
      languages: {
        nl: nlJobs || 0,
        en: enJobs || 0,
      },
      types: typeStats,
      branches: branchStats,
      lastUpdated: new Date().toISOString(),
    }

    return NextResponse.json({
      success: true,
      data: stats,
      message: "Admin statistics retrieved successfully",
    })
  } catch (error) {
    console.error("Admin Stats Error:", error)

    // Fallback mock data if database fails
    const mockStats = {
      overview: {
        totalJobs: 156,
        activeJobs: 142,
        inactiveJobs: 14,
        recentJobs: 23,
      },
      languages: {
        nl: 98,
        en: 44,
      },
      types: {
        Remote: 67,
        Hybrid: 45,
        "On-site": 30,
      },
      branches: {
        IT: 89,
        Marketing: 23,
        Sales: 18,
        Design: 12,
      },
      lastUpdated: new Date().toISOString(),
    }

    return NextResponse.json({
      success: true,
      data: mockStats,
      message: "Admin statistics retrieved (using fallback data)",
    })
  }
}
