import { type NextRequest, NextResponse } from "next/server"
import { monsterMiner } from "@/lib/monster-miner"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { maxJobs = 10000, countries = ["NL", "DE", "FR", "BE", "PL"], categories = [], aggressiveMode = true } = body

    if (monsterMiner.isCurrentlyMining()) {
      return NextResponse.json(
        {
          error: "Monster mining already in progress",
          stats: monsterMiner.getStats(),
        },
        { status: 409 },
      )
    }

    const miningPromise = monsterMiner.startMonsterMining({
      maxJobs,
      countries,
      categories,
      aggressiveMode,
    })

    // Don't await - let it run in background
    miningPromise.catch((error) => {
      console.error("[v0] Monster mining failed:", error)
    })

    return NextResponse.json({
      message: "Monster mining started",
      target: maxJobs,
      countries,
      aggressiveMode,
      estimatedTime: `${Math.ceil(maxJobs / 1000)} hours`,
    })
  } catch (error) {
    console.error("[v0] Monster mining API error:", error)
    return NextResponse.json(
      {
        error: "Failed to start monster mining",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

export async function GET() {
  try {
    const stats = monsterMiner.getStats()
    const isRunning = monsterMiner.isCurrentlyMining()

    return NextResponse.json({
      isRunning,
      stats,
      status: isRunning ? "mining" : "idle",
    })
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to get mining status",
      },
      { status: 500 },
    )
  }
}

export async function DELETE() {
  try {
    monsterMiner.stopMining()

    return NextResponse.json({
      message: "Monster mining stopped",
      stats: monsterMiner.getStats(),
    })
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to stop mining",
      },
      { status: 500 },
    )
  }
}
