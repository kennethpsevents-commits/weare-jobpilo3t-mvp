import puppeteer from "puppeteer-core"
import chromium from "@sparticuz/chromium"
import type { Job } from "./types"

export interface CrawlerSource {
  name: string
  url: string
  country: string
  language: string
  selectors: {
    jobContainer: string
    title: string
    company: string
    location: string
    url: string
    description?: string
    salary?: string
    type?: string
    datePosted?: string
  }
  pagination?: {
    nextButton: string
    maxPages: number
  }
  rateLimit?: number // milliseconds between requests
}

export const crawlerSources: CrawlerSource[] = [
  // Netherlands
  {
    name: "Indeed NL",
    url: "https://nl.indeed.com/jobs?q=developer&l=Nederland",
    country: "Netherlands",
    language: "nl",
    selectors: {
      jobContainer: "[data-jk]",
      title: "h2 a span",
      company: '[data-testid="company-name"]',
      location: '[data-testid="job-location"]',
      url: "h2 a",
      description: ".jobsearch-jobDescriptionText",
      salary: ".salary-snippet",
      type: ".jobMetadata",
      datePosted: ".date",
    },
    pagination: {
      nextButton: 'a[aria-label="Next Page"]',
      maxPages: 5,
    },
    rateLimit: 2000,
  },
  {
    name: "Nationale Vacaturebank",
    url: "https://www.nationalevacaturebank.nl/vacature/zoeken?query=developer",
    country: "Netherlands",
    language: "nl",
    selectors: {
      jobContainer: ".vacancy-item",
      title: ".vacancy-title a",
      company: ".company-name",
      location: ".location",
      url: ".vacancy-title a",
      description: ".vacancy-description",
      salary: ".salary-info",
    },
    pagination: {
      nextButton: ".pagination-next",
      maxPages: 3,
    },
    rateLimit: 1500,
  },
  // Germany
  {
    name: "StepStone DE",
    url: "https://www.stepstone.de/jobs/entwickler",
    country: "Germany",
    language: "de",
    selectors: {
      jobContainer: "[data-testid='job-item']",
      title: "[data-testid='job-title']",
      company: "[data-testid='company-name']",
      location: "[data-testid='job-location']",
      url: "[data-testid='job-title'] a",
      description: ".job-description",
      salary: ".salary-range",
    },
    pagination: {
      nextButton: "[data-testid='pagination-next']",
      maxPages: 4,
    },
    rateLimit: 3000,
  },
  {
    name: "Xing Jobs",
    url: "https://www.xing.com/jobs/search?keywords=developer&location=Deutschland",
    country: "Germany",
    language: "de",
    selectors: {
      jobContainer: ".job-card",
      title: ".job-title",
      company: ".company-name",
      location: ".job-location",
      url: ".job-title a",
      description: ".job-snippet",
    },
    rateLimit: 2500,
  },
  // Poland
  {
    name: "Pracuj.pl",
    url: "https://www.pracuj.pl/praca/programista",
    country: "Poland",
    language: "pl",
    selectors: {
      jobContainer: "[data-test='list-item-offer']",
      title: "[data-test='offer-title']",
      company: "[data-test='text-company-name']",
      location: "[data-test='text-region']",
      url: "[data-test='offer-title'] a",
      description: "[data-test='offer-description']",
      salary: "[data-test='offer-salary']",
    },
    pagination: {
      nextButton: "[data-test='bottom-pagination-next-page']",
      maxPages: 5,
    },
    rateLimit: 2000,
  },
  {
    name: "NoFluffJobs",
    url: "https://nofluffjobs.com/jobs/developer?criteria=city%3Dwarsaw",
    country: "Poland",
    language: "pl",
    selectors: {
      jobContainer: ".posting-list-item",
      title: ".posting-title__position",
      company: ".posting-title__company",
      location: ".posting-info__location",
      url: ".posting-title a",
      salary: ".posting-info__salary",
    },
    rateLimit: 1800,
  },
  // UK
  {
    name: "Reed UK",
    url: "https://www.reed.co.uk/jobs/developer-jobs",
    country: "United Kingdom",
    language: "en",
    selectors: {
      jobContainer: ".job-result",
      title: ".job-result-heading__title",
      company: ".job-result-heading__company",
      location: ".job-metadata__item--location",
      url: ".job-result-heading__title a",
      description: ".job-result__description",
      salary: ".job-metadata__item--salary",
    },
    pagination: {
      nextButton: ".paginator__btn--next",
      maxPages: 4,
    },
    rateLimit: 2200,
  },
  // France
  {
    name: "Indeed FR",
    url: "https://fr.indeed.com/jobs?q=développeur&l=France",
    country: "France",
    language: "fr",
    selectors: {
      jobContainer: "[data-jk]",
      title: "h2 a span",
      company: '[data-testid="company-name"]',
      location: '[data-testid="job-location"]',
      url: "h2 a",
      description: ".jobsearch-jobDescriptionText",
      salary: ".salary-snippet",
    },
    pagination: {
      nextButton: 'a[aria-label="Page suivante"]',
      maxPages: 3,
    },
    rateLimit: 2500,
  },
]

export class JobCrawler {
  private browser: any = null
  private page: any = null
  private crawledUrls: Set<string> = new Set() // Added deduplication tracking

  async initialize() {
    if (!this.browser) {
      const isProduction = process.env.NODE_ENV === "production"

      if (isProduction) {
        this.browser = await puppeteer.launch({
          args: [...chromium.args, "--disable-web-security", "--disable-features=VizDisplayCompositor"],
          defaultViewport: chromium.defaultViewport,
          executablePath: await chromium.executablePath(),
          headless: chromium.headless,
        })
      } else {
        this.browser = await puppeteer.launch({
          headless: true,
          args: [
            "--no-sandbox",
            "--disable-setuid-sandbox",
            "--disable-dev-shm-usage",
            "--disable-accelerated-2d-canvas",
            "--no-first-run",
            "--no-zygote",
            "--single-process",
            "--disable-gpu",
            "--disable-web-security",
            "--disable-features=VizDisplayCompositor",
          ],
        })
      }

      this.page = await this.browser.newPage()

      const userAgents = [
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      ]

      await this.page.setUserAgent(userAgents[Math.floor(Math.random() * userAgents.length)])
      await this.page.setViewport({ width: 1366, height: 768 })

      // Block images and stylesheets for faster crawling
      await this.page.setRequestInterception(true)
      this.page.on("request", (req: any) => {
        if (req.resourceType() == "stylesheet" || req.resourceType() == "image") {
          req.abort()
        } else {
          req.continue()
        }
      })
    }
  }

  async crawlAllSources(maxJobsPerSource = 100): Promise<Job[]> {
    const allJobs: Job[] = []
    const errors: string[] = []

    console.log(`[Crawler] Starting mass crawl of ${crawlerSources.length} sources`)

    for (const source of crawlerSources) {
      try {
        console.log(`[Crawler] Processing ${source.name} (${source.country})`)

        const jobs = await this.crawlSource(source, maxJobsPerSource)
        const uniqueJobs = this.deduplicateJobs(jobs)

        allJobs.push(...uniqueJobs)
        console.log(`[Crawler] ${source.name}: ${uniqueJobs.length} unique jobs added`)

        // Rate limiting between sources
        if (source.rateLimit) {
          await this.delay(source.rateLimit)
        }
      } catch (error) {
        const errorMsg = `Failed to crawl ${source.name}: ${error}`
        console.error(`[Crawler] ${errorMsg}`)
        errors.push(errorMsg)
      }
    }

    console.log(`[Crawler] Mass crawl completed: ${allJobs.length} total jobs, ${errors.length} errors`)

    if (errors.length > 0) {
      console.error("[Crawler] Errors encountered:", errors)
    }

    return this.deduplicateJobs(allJobs)
  }

  async crawlSource(source: CrawlerSource, maxJobs = 50): Promise<Job[]> {
    await this.initialize()
    const jobs: Job[] = []

    try {
      console.log(`[Crawler] Starting crawl for ${source.name}`)

      await this.page.goto(source.url, {
        waitUntil: "domcontentloaded",
        timeout: 45000,
      })

      // Wait for job containers with longer timeout
      await this.page.waitForSelector(source.selectors.jobContainer, { timeout: 15000 })

      let currentPage = 1
      const maxPages = source.pagination?.maxPages || 1

      while (currentPage <= maxPages && jobs.length < maxJobs) {
        console.log(`[Crawler] Processing page ${currentPage} of ${source.name}`)

        const pageJobs = await this.extractJobsFromPage(source)
        jobs.push(...pageJobs)

        if (currentPage < maxPages && source.pagination?.nextButton) {
          try {
            const nextButton = await this.page.$(source.pagination.nextButton)
            if (nextButton) {
              await nextButton.click()
              await this.delay(3000) // Wait for page load
              currentPage++
            } else {
              console.log(`[Crawler] No next button found for ${source.name}`)
              break
            }
          } catch (paginationError) {
            console.log(`[Crawler] Pagination failed for ${source.name}:`, paginationError)
            break
          }
        } else {
          break
        }
      }

      console.log(`[Crawler] Completed ${source.name}: ${jobs.length} jobs found`)
      return jobs.slice(0, maxJobs)
    } catch (error) {
      console.error(`[Crawler] Error crawling ${source.name}:`, error)
      return []
    }
  }

  private async extractJobsFromPage(source: CrawlerSource): Promise<Job[]> {
    const jobs: Job[] = []

    try {
      const jobElements = await this.page.$$(source.selectors.jobContainer)

      for (const jobElement of jobElements) {
        try {
          const job = await this.extractJobData(jobElement, source)
          if (job) {
            jobs.push(job)
          }
        } catch (error) {
          console.error("[Crawler] Error extracting job:", error)
          continue
        }
      }
    } catch (error) {
      console.error("[Crawler] Error extracting jobs from page:", error)
    }

    return jobs
  }

  private async extractJobData(jobElement: any, source: CrawlerSource): Promise<Job | null> {
    try {
      const title = await this.extractText(jobElement, source.selectors.title)
      const company = await this.extractText(jobElement, source.selectors.company)
      const location = await this.extractText(jobElement, source.selectors.location)
      const url = await this.extractAttribute(jobElement, source.selectors.url, "href")

      if (!title || !company || !location) {
        return null
      }

      // Check for duplicates
      const jobKey = `${title.toLowerCase()}-${company.toLowerCase()}-${location.toLowerCase()}`
      if (this.crawledUrls.has(jobKey)) {
        return null
      }
      this.crawledUrls.add(jobKey)

      const description = source.selectors.description
        ? await this.extractText(jobElement, source.selectors.description)
        : undefined

      const salary = source.selectors.salary ? await this.extractText(jobElement, source.selectors.salary) : undefined

      const datePosted = source.selectors.datePosted
        ? await this.extractText(jobElement, source.selectors.datePosted)
        : undefined

      const type = this.detectJobType(title, description, location)

      // AI-powered branch categorization
      const branch = this.categorizeBranch(title, description)

      const now = new Date().toISOString()

      return {
        id: `crawled-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        title: title.trim(),
        company: company.trim(),
        location: location.trim(),
        type,
        branch,
        language: source.language,
        url: this.resolveUrl(url, source.url),
        description: description?.trim(),
        salary: this.normalizeSalary(salary?.trim()),
        requirements: this.extractRequirements(description || "", source.language),
        benefits: this.extractBenefits(description || "", source.language),
        source: source.name.toLowerCase().replace(/\s+/g, "-"),
        country: source.country,
        datePosted: this.parseDate(datePosted),
        isActive: true,
        createdAt: now,
        updatedAt: now,
      }
    } catch (error) {
      console.error("[Crawler] Error extracting job data:", error)
      return null
    }
  }

  private async extractText(element: any, selector: string): Promise<string | null> {
    try {
      const targetElement = await element.$(selector)
      if (targetElement) {
        return await targetElement.evaluate((el: any) => el.textContent?.trim() || null)
      }
      return null
    } catch {
      return null
    }
  }

  private async extractAttribute(element: any, selector: string, attribute: string): Promise<string | null> {
    try {
      const targetElement = await element.$(selector)
      if (targetElement) {
        return await targetElement.evaluate((el: any, attr: string) => el.getAttribute(attr), attribute)
      }
      return null
    } catch {
      return null
    }
  }

  private resolveUrl(url: string, baseUrl: string): string {
    if (!url) return baseUrl
    if (url.startsWith("http")) return url
    if (url.startsWith("/")) {
      const base = new URL(baseUrl)
      return `${base.protocol}//${base.host}${url}`
    }
    return `${baseUrl}/${url}`
  }

  private extractRequirements(description: string, language: string): string[] {
    const requirements: string[] = []
    const text = description.toLowerCase()

    const techSkills = [
      "react",
      "vue",
      "angular",
      "node.js",
      "python",
      "java",
      "javascript",
      "typescript",
      "php",
      "c#",
      "c++",
      "ruby",
      "go",
      "rust",
      "kotlin",
      "swift",
      "sql",
      "mongodb",
      "postgresql",
      "mysql",
      "redis",
      "elasticsearch",
      "aws",
      "azure",
      "gcp",
      "docker",
      "kubernetes",
      "jenkins",
      "git",
      "html",
      "css",
      "sass",
      "webpack",
      "babel",
      "graphql",
      "rest api",
    ]

    techSkills.forEach((skill) => {
      if (text.includes(skill)) {
        requirements.push(skill.charAt(0).toUpperCase() + skill.slice(1))
      }
    })

    // Multi-language experience extraction
    const experiencePatterns = {
      nl: /(\d+)\+?\s*(jaar|jaren)\s*(ervaring|experience)/gi,
      en: /(\d+)\+?\s*(year|years)\s*(experience|exp)/gi,
      de: /(\d+)\+?\s*(jahr|jahre)\s*(erfahrung|berufserfahrung)/gi,
      fr: /(\d+)\+?\s*(an|ans|année|années)\s*(expérience|exp)/gi,
      pl: /(\d+)\+?\s*(rok|lat|lata)\s*(doświadczenia|doświadczenie)/gi,
    }

    const pattern = experiencePatterns[language as keyof typeof experiencePatterns] || experiencePatterns["en"]
    const experienceMatch = text.match(pattern)
    if (experienceMatch) {
      requirements.push(`${experienceMatch[1]}+ years experience`)
    }

    return requirements.slice(0, 8)
  }

  private extractBenefits(description: string, language: string): string[] {
    const benefits: string[] = []
    const text = description.toLowerCase()

    const benefitKeywords = {
      en: [
        "health insurance",
        "dental",
        "vision",
        "retirement",
        "401k",
        "vacation",
        "pto",
        "flexible hours",
        "remote work",
        "bonus",
        "stock options",
      ],
      nl: [
        "zorgverzekering",
        "pensioen",
        "vakantiegeld",
        "flexibele werktijden",
        "thuiswerken",
        "bonus",
        "reiskostenvergoeding",
      ],
      de: ["krankenversicherung", "rente", "urlaub", "flexible arbeitszeiten", "homeoffice", "bonus", "firmenwagen"],
      fr: ["assurance santé", "retraite", "congés", "horaires flexibles", "télétravail", "prime", "tickets restaurant"],
      pl: [
        "ubezpieczenie zdrowotne",
        "emerytura",
        "urlop",
        "elastyczne godziny",
        "praca zdalna",
        "premia",
        "karta multisport",
      ],
    }

    const keywords = benefitKeywords[language as keyof typeof benefitKeywords] || benefitKeywords["en"]

    keywords.forEach((benefit) => {
      if (text.includes(benefit)) {
        benefits.push(benefit)
      }
    })

    return benefits.slice(0, 5)
  }

  private normalizeSalary(salary: string | undefined): string | undefined {
    if (!salary) return undefined

    // Remove extra whitespace and normalize currency symbols
    return salary
      .trim()
      .replace(/\s+/g, " ")
      .replace(/€\s*(\d)/g, "€$1")
      .replace(/\$\s*(\d)/g, "$$$1")
      .replace(/£\s*(\d)/g, "£$1")
  }

  private parseDate(dateString: string | undefined): string | undefined {
    if (!dateString) return undefined

    try {
      // Handle various date formats
      const date = new Date(dateString)
      if (isNaN(date.getTime())) {
        return undefined
      }
      return date.toISOString()
    } catch {
      return undefined
    }
  }

  private deduplicateJobs(jobs: Job[]): Job[] {
    const seen = new Set<string>()
    return jobs.filter((job) => {
      const key = `${job.title.toLowerCase()}-${job.company.toLowerCase()}-${job.location.toLowerCase()}`
      if (seen.has(key)) {
        return false
      }
      seen.add(key)
      return true
    })
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  private detectJobType(title: string, description = "", location: string): "Remote" | "On-site" | "Hybrid" {
    const text = `${title} ${description} ${location}`.toLowerCase()

    const remoteKeywords = [
      "remote",
      "thuiswerken",
      "home office",
      "telecommute",
      "work from home",
      "à distance",
      "fernarbeit",
    ]
    const hybridKeywords = ["hybrid", "hybride", "flexible", "mix", "teilweise remote"]

    if (remoteKeywords.some((keyword) => text.includes(keyword))) {
      return "Remote"
    } else if (hybridKeywords.some((keyword) => text.includes(keyword))) {
      return "Hybrid"
    }

    return "On-site"
  }

  private categorizeBranch(title: string, description = ""): string {
    const text = `${title} ${description}`.toLowerCase()

    const categories = {
      IT: [
        "developer",
        "programmer",
        "software",
        "web",
        "mobile",
        "frontend",
        "backend",
        "fullstack",
        "devops",
        "data",
        "ai",
        "machine learning",
        "cloud",
        "cybersecurity",
        "entwickler",
        "programmeur",
        "informatique",
      ],
      Marketing: [
        "marketing",
        "seo",
        "content",
        "social media",
        "digital marketing",
        "brand",
        "campaign",
        "advertising",
        "pr",
        "communication",
      ],
      Sales: ["sales", "account manager", "business development", "verkoop", "vertrieb", "commercial", "vente"],
      Design: ["designer", "ux", "ui", "graphic", "creative", "art director", "visual", "ontwerper", "design"],
      Finance: [
        "finance",
        "accounting",
        "controller",
        "analyst",
        "treasury",
        "audit",
        "boekhouding",
        "financiën",
        "comptable",
      ],
      HR: ["hr", "human resources", "recruiter", "talent", "people", "personeelszaken", "rh", "ressources humaines"],
      Operations: [
        "operations",
        "logistics",
        "supply chain",
        "project manager",
        "coordinator",
        "operaties",
        "logistiek",
      ],
      "Customer Service": ["customer service", "support", "helpdesk", "client", "klantendienst", "service client"],
      Healthcare: ["healthcare", "medical", "nurse", "doctor", "pharmaceutical", "zorg", "medisch", "santé"],
      Education: ["teacher", "education", "training", "instructor", "onderwijs", "leraar", "éducation"],
      Legal: ["legal", "lawyer", "juridisch", "advocaat", "juriste", "droit"],
      Engineering: ["engineer", "mechanical", "electrical", "civil", "ingenieur", "ingénieur", "technisch"],
    }

    for (const [category, keywords] of Object.entries(categories)) {
      if (keywords.some((keyword) => text.includes(keyword))) {
        return category
      }
    }

    return "Other"
  }

  async close() {
    if (this.browser) {
      await this.browser.close()
      this.browser = null
      this.page = null
    }
  }
}
