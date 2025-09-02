import { JobCrawler, crawlerSources } from "./crawler"
import { createServerSupabaseClient } from "./supabase-server"
import type { Job } from "./types"

interface MiningStats {
  totalMined: number
  successRate: number
  duplicatesFiltered: number
  errors: number
  lastRun: Date
  nextRun: Date
}

export class MonsterMiner {
  private crawler: JobCrawler
  private isRunning = false
  private stats: MiningStats = {
    totalMined: 0,
    successRate: 0,
    duplicatesFiltered: 0,
    errors: 0,
    lastRun: new Date(),
    nextRun: new Date(),
  }

  constructor() {
    this.crawler = new JobCrawler()
  }

  async startMonsterMining(
    options: {
      maxJobs?: number
      countries?: string[]
      categories?: string[]
      aggressiveMode?: boolean
    } = {},
  ) {
    if (this.isRunning) {
      throw new Error("Monster mining already running")
    }

    this.isRunning = true
    const { maxJobs = 50000, countries = ["NL", "DE", "FR", "BE", "PL"], aggressiveMode = true } = options

    console.log(`[v0] Starting Monster Mining - Target: ${maxJobs} jobs across ${countries.join(", ")}`)

    try {
      const supabase = createServerSupabaseClient()
      let totalMined = 0
      let errors = 0
      let duplicates = 0

      const miningPromises = countries.map(async (country) => {
        const sources = this.getSourcesForCountry(country)

        for (const source of sources) {
          if (!this.isRunning) break

          try {
            console.log(`[v0] Mining ${source.name} in ${country}...`)

            const jobs = await this.crawler.crawlJobs(source.name, {
              country,
              batchSize: aggressiveMode ? 100 : 20,
              maxPages: aggressiveMode ? 50 : 10,
              delay: aggressiveMode ? 500 : 1000, // Faster in aggressive mode
            })

            const processedJobs = await this.processAndDeduplicateJobs(jobs, supabase)

            if (processedJobs.length > 0) {
              await this.batchInsertJobs(processedJobs, supabase)
              totalMined += processedJobs.length
              duplicates += jobs.length - processedJobs.length

              console.log(`[v0] Mined ${processedJobs.length} new jobs from ${source.name}`)
            }

            if (totalMined >= maxJobs) {
              console.log(`[v0] Target reached: ${totalMined} jobs mined`)
              break
            }
          } catch (error) {
            errors++
            console.error(`[v0] Error mining ${source.name}:`, error)

            continue
          }
        }
      })

      await Promise.allSettled(miningPromises)

      this.stats = {
        totalMined,
        successRate: (totalMined / (totalMined + errors)) * 100,
        duplicatesFiltered: duplicates,
        errors,
        lastRun: new Date(),
        nextRun: new Date(Date.now() + (aggressiveMode ? 2 * 60 * 60 * 1000 : 6 * 60 * 60 * 1000)), // 2h or 6h
      }

      console.log(`[v0] Monster Mining Complete - Mined: ${totalMined}, Duplicates: ${duplicates}, Errors: ${errors}`)

      return this.stats
    } finally {
      this.isRunning = false
    }
  }

  private getSourcesForCountry(country: string) {
    const countrySourceMap: Record<string, string[]> = {
      NL: ["indeed", "linkedin", "monsterboard", "nationale-vacaturebank", "jobbird"],
      DE: ["indeed", "linkedin", "stepstone", "xing", "monster"],
      FR: ["indeed", "linkedin", "pole-emploi", "apec", "monster"],
      BE: ["indeed", "linkedin", "stepstone", "actiris", "vdab"],
      PL: ["indeed", "linkedin", "pracuj", "olx-praca", "monster"],
    }

    const sourceNames = countrySourceMap[country] || ["indeed", "linkedin"]
    return crawlerSources.filter((source) => sourceNames.includes(source.name))
  }

  private async processAndDeduplicateJobs(jobs: Job[], supabase: any): Promise<Job[]> {
    if (jobs.length === 0) return []

    // Get existing jobs for comparison
    const { data: existingJobs } = await supabase
      .from("jobs")
      .select("title, company, location, url")
      .in(
        "url",
        jobs.map((j) => j.url),
      )

    const existingUrls = new Set(existingJobs?.map((j: any) => j.url) || [])
    const existingSignatures = new Set(existingJobs?.map((j: any) => this.createJobSignature(j)) || [])

    const uniqueJobs = jobs
      .filter((job) => {
        // Skip if URL already exists
        if (existingUrls.has(job.url)) return false

        // Skip if similar job exists (same title + company + location)
        const signature = this.createJobSignature(job)
        if (existingSignatures.has(signature)) return false

        existingSignatures.add(signature)
        return true
      })
      .map((job) => ({
        ...job,
        category: this.categorizeJob(job),
        skills: this.extractSkills(job.description),
        salaryRange: this.extractSalaryRange(job.description),
        experienceLevel: this.extractExperienceLevel(job.description),
        isRemote: this.detectRemoteWork(job.description),
        minedAt: new Date().toISOString(),
        source: "monster-miner",
      }))

    return uniqueJobs
  }

  private createJobSignature(job: any): string {
    const title = job.title.toLowerCase().replace(/[^a-z0-9]/g, "")
    const company = job.company.toLowerCase().replace(/[^a-z0-9]/g, "")
    const location = job.location.toLowerCase().replace(/[^a-z0-9]/g, "")
    return `${title}-${company}-${location}`
  }

  private categorizeJob(job: Job): string {
    const title = job.title.toLowerCase()
    const description = job.description.toLowerCase()

    const categories = {
      technology: ["developer", "engineer", "programmer", "software", "tech", "it", "data", "ai", "ml"],
      marketing: ["marketing", "seo", "social media", "content", "brand", "digital"],
      sales: ["sales", "account", "business development", "commercial"],
      finance: ["finance", "accounting", "controller", "analyst", "banking"],
      healthcare: ["nurse", "doctor", "medical", "healthcare", "clinical"],
      education: ["teacher", "education", "training", "instructor"],
      logistics: ["logistics", "supply chain", "warehouse", "transport"],
      "customer-service": ["customer service", "support", "helpdesk"],
    }

    for (const [category, keywords] of Object.entries(categories)) {
      if (keywords.some((keyword) => title.includes(keyword) || description.includes(keyword))) {
        return category
      }
    }

    return "general"
  }

  private extractSkills(description: string): string[] {
    const commonSkills = [
      "javascript",
      "python",
      "java",
      "react",
      "node.js",
      "sql",
      "aws",
      "docker",
      "excel",
      "powerpoint",
      "salesforce",
      "hubspot",
      "google analytics",
      "photoshop",
      "figma",
      "sketch",
      "adobe",
      "wordpress",
    ]

    const foundSkills = commonSkills.filter((skill) => description.toLowerCase().includes(skill.toLowerCase()))

    return foundSkills.slice(0, 10) // Limit to 10 skills
  }

  private extractSalaryRange(description: string): { min?: number; max?: number; currency?: string } | null {
    const salaryPatterns = [
      /€\s*(\d+(?:\.\d+)?)\s*k?\s*-\s*€?\s*(\d+(?:\.\d+)?)\s*k?/i,
      /(\d+(?:\.\d+)?)\s*k?\s*-\s*(\d+(?:\.\d+)?)\s*k?\s*euro/i,
      /salary:\s*€\s*(\d+(?:\.\d+)?)\s*k?\s*-\s*€?\s*(\d+(?:\.\d+)?)\s*k?/i,
    ]

    for (const pattern of salaryPatterns) {
      const match = description.match(pattern)
      if (match) {
        const min = Number.parseFloat(match[1]) * (match[1].includes("k") ? 1000 : 1)
        const max = Number.parseFloat(match[2]) * (match[2].includes("k") ? 1000 : 1)
        return { min, max, currency: "EUR" }
      }
    }

    return null
  }

  private extractExperienceLevel(description: string): string {
    const desc = description.toLowerCase()

    if (desc.includes("senior") || desc.includes("lead") || desc.includes("principal")) return "senior"
    if (desc.includes("junior") || desc.includes("entry") || desc.includes("graduate")) return "junior"
    if (desc.includes("mid") || desc.includes("intermediate")) return "mid"

    return "not-specified"
  }

  private detectRemoteWork(description: string): boolean {
    const remoteKeywords = ["remote", "work from home", "telecommute", "distributed", "anywhere"]
    return remoteKeywords.some((keyword) => description.toLowerCase().includes(keyword))
  }

  private async batchInsertJobs(jobs: Job[], supabase: any) {
    const batchSize = 50

    for (let i = 0; i < jobs.length; i += batchSize) {
      const batch = jobs.slice(i, i + batchSize)

      const { error } = await supabase.from("jobs").upsert(batch, {
        onConflict: "url",
        ignoreDuplicates: true,
      })

      if (error) {
        console.error(`[v0] Batch insert error:`, error)
      }
    }
  }

  getStats(): MiningStats {
    return this.stats
  }

  stopMining() {
    this.isRunning = false
    console.log("[v0] Monster mining stopped")
  }

  isCurrentlyMining(): boolean {
    return this.isRunning
  }
}

export const monsterMiner = new MonsterMiner()
