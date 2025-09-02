import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase-server"

export async function GET(request: NextRequest) {
  try {
    // Verify this is a legitimate cron request
    const authHeader = request.headers.get("authorization")
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = createServerSupabaseClient()

    // Delete jobs older than 90 days
    const ninetyDaysAgo = new Date()
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90)

    const { data: deletedJobs, error } = await supabase
      .from("jobs")
      .delete()
      .lt("created_at", ninetyDaysAgo.toISOString())
      .select("id")

    if (error) {
      throw error
    }

    console.log(`[v0] Cleaned up ${deletedJobs?.length || 0} old jobs`)

    return NextResponse.json({
      success: true,
      deletedCount: deletedJobs?.length || 0,
      message: "Old jobs cleanup completed successfully",
    })
  } catch (error) {
    console.error("[v0] Cleanup failed:", error)
    return NextResponse.json(
      {
        error: "Cleanup failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
