// Advanced crawler scheduler for automated job mining
export class CrawlerScheduler {
  private isRunning = false
  private intervalId: NodeJS.Timeout | null = null

  constructor(private intervalMinutes = 60) {}

  start() {
    if (this.isRunning) {
      console.log("[Scheduler] Already running")
      return
    }

    this.isRunning = true
    console.log(`[Scheduler] Starting crawler scheduler (every ${this.intervalMinutes} minutes)`)

    // Run immediately on start
    this.runCrawl()

    // Schedule recurring crawls
    this.intervalId = setInterval(
      () => {
        this.runCrawl()
      },
      this.intervalMinutes * 60 * 1000,
    )
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = null
    }
    this.isRunning = false
    console.log("[Scheduler] Crawler scheduler stopped")
  }

  private async runCrawl() {
    try {
      console.log("[Scheduler] Starting scheduled crawl")

      const response = await fetch("/api/crawl?mass_mode=true&max_jobs=500", {
        method: "GET",
      })

      if (response.ok) {
        const result = await response.json()
        console.log(`[Scheduler] Scheduled crawl completed: ${result.data?.totalFound || 0} jobs found`)
      } else {
        console.error("[Scheduler] Scheduled crawl failed:", response.statusText)
      }
    } catch (error) {
      console.error("[Scheduler] Scheduled crawl error:", error)
    }
  }

  isActive(): boolean {
    return this.isRunning
  }
}

// Global scheduler instance
let globalScheduler: CrawlerScheduler | null = null

export function startGlobalScheduler(intervalMinutes = 60) {
  if (!globalScheduler) {
    globalScheduler = new CrawlerScheduler(intervalMinutes)
  }
  globalScheduler.start()
  return globalScheduler
}

export function stopGlobalScheduler() {
  if (globalScheduler) {
    globalScheduler.stop()
  }
}

export function getSchedulerStatus() {
  return {
    isActive: globalScheduler?.isActive() || false,
    instance: !!globalScheduler,
  }
}
