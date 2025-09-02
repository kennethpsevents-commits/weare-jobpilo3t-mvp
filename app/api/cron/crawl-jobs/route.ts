import { type NextRequest, NextResponse } from "next/server"
import { monsterMiner } from "@/lib/monster-miner"

export async function GET(request: NextRequest) {
  try {
    // Verify this is a legitimate cron request
    const authHeader = request.headers.get("authorization")
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    console.log("[v0] Starting scheduled job crawling...")

    // Start monster mining with moderate settings for scheduled runs
    const stats = await monsterMiner.startMonsterMining({
      maxJobs: 5000, // Smaller batch for scheduled runs
      countries: ["NL", "DE", "FR", "BE", "PL"],
      aggressiveMode: false, // Less aggressive for scheduled runs
    })

    console.log("[v0] Scheduled crawling completed:", stats)

    return NextResponse.json({
      success: true,
      stats,
      message: "Scheduled job crawling completed successfully",
    })
  } catch (error) {
    console.error("[v0] Scheduled crawling failed:", error)
    return NextResponse.json(
      {
        error: "Scheduled crawling failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
