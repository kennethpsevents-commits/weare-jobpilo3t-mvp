export interface Job {
  id: string
  title: string
  company: string
  location: string
  type: "Remote" | "On-site" | "Hybrid"
  branch: string
  language: "en" | "nl" | "de" | "fr" | "pl"
  url: string
  description?: string
  salary?: string
  requirements?: string[]
  benefits?: string[]
  country?: string
  datePosted?: string
  createdAt: string
  updatedAt: string
  source: string
  isActive: boolean
}

export interface JobFilters {
  search?: string
  location?: string
  type?: Job["type"]
  branch?: string
  language?: Job["language"]
  country?: string
  salaryMin?: number
  salaryMax?: number
  datePosted?: "today" | "week" | "month" | "all"
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
  meta?: {
    total?: number
    page?: number
    limit?: number
    hasMore?: boolean
  }
}

export interface CrawlerResult {
  jobs: Job[]
  source: string
  crawledAt: string
  totalFound: number
  errors?: string[]
  duration?: number
  duplicatesRemoved?: number
}

export interface CrawlerStats {
  totalJobs: number
  jobsByCountry: Record<string, number>
  jobsByBranch: Record<string, number>
  jobsByType: Record<string, number>
  jobsByLanguage: Record<string, number>
  recentCrawls: {
    source: string
    jobsFound: number
    crawledAt: string
    duration: number
    success: boolean
  }[]
  lastCrawlTime: string
  activeSources: number
  totalSources: number
}

export interface AIMatchingResult {
  jobId: string
  matchScore: number
  reasons: string[]
  skillsMatch: string[]
  skillsGap: string[]
  salaryFit: "below" | "match" | "above"
  locationFit: "exact" | "nearby" | "remote"
}

export interface UserProfile {
  id: string
  skills: string[]
  experience: number
  preferredLocations: string[]
  preferredType: Job["type"]
  preferredBranches: string[]
  salaryExpectation?: {
    min: number
    max: number
    currency: string
  }
  languages: string[]
  cv?: string
  createdAt: string
  updatedAt: string
}

export interface Recruiter {
  id: string
  companyName: string
  contactEmail: string
  contactPhone?: string
  website?: string
  description?: string
  postedJobs: string[]
  credits: number
  subscription: "free" | "basic" | "premium"
  createdAt: string
  lastActive: string
}

export interface Payment {
  id: string
  recruiterId: string
  amount: number
  currency: string
  type: "job_posting" | "subscription" | "credits"
  status: "pending" | "completed" | "failed" | "refunded"
  jobId?: string
  createdAt: string
  processedAt?: string
}

export interface EvidenceChip {
  kind: "skill" | "distance" | "seniority" | "salary" | "freshness"
  label: string
  sourceField: string
  confidence: number
}

export interface MatchResult {
  candidateId: string
  jobId: string
  score: number
  chips: EvidenceChip[]
  embedding?: number[]
}

export interface OutreachRequest {
  jobId: string
  candidateIds: string[]
  channel: "whatsapp" | "sms" | "email"
  templateId: string
  variables: Record<string, string>
  schedule?: { propose: string[] }
}

export interface JobWithEmbedding extends Job {
  embedding?: number[]
  canonicalHash: string
  freshness: number
  semantic: number
  clickScore: number
  finalRank: number
}

export interface CrawlerSource {
  id: string
  name: string
  type: "api" | "crawler"
  url: string
  enabled: boolean
  rateLimit: number
  lastCrawl?: Date
  jobsFound: number
  errors: string[]
}
