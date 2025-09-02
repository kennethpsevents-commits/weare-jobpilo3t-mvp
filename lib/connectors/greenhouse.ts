import type { Job } from "@/lib/types"

export class GreenhouseConnector {
  private apiKey: string
  private baseUrl = "https://harvest-api.greenhouse.io/v1"

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  async fetchJobs(companyId: string): Promise<Job[]> {
    try {
      const response = await fetch(`${this.baseUrl}/jobs?per_page=500`, {
        headers: {
          Authorization: `Basic ${Buffer.from(this.apiKey + ":").toString("base64")}`,
          "On-Behalf-Of": companyId,
        },
      })

      if (!response.ok) {
        throw new Error(`Greenhouse API error: ${response.status}`)
      }

      const data = await response.json()
      return data.jobs.map(this.transformGreenhouseJob)
    } catch (error) {
      console.error("[v0] Greenhouse connector error:", error)
      throw error
    }
  }

  private transformGreenhouseJob(ghJob: any): Job {
    return {
      id: `gh_${ghJob.id}`,
      title: ghJob.name,
      company: ghJob.departments?.[0]?.name || "Unknown Company",
      location: ghJob.offices?.[0]?.location?.name || "Remote",
      type: ghJob.custom_fields?.employment_type || "Full-time",
      salary: this.extractSalary(ghJob.custom_fields),
      description: ghJob.content || "",
      requirements: this.extractRequirements(ghJob.content),
      benefits: [],
      skills: this.extractSkills(ghJob.content),
      experience_level: this.determineExperienceLevel(ghJob.content),
      remote: ghJob.offices?.[0]?.location?.name?.toLowerCase().includes("remote") || false,
      posted_date: new Date(ghJob.created_at),
      expires_date: ghJob.custom_fields?.application_deadline
        ? new Date(ghJob.custom_fields.application_deadline)
        : null,
      apply_url: ghJob.absolute_url,
      source: "greenhouse",
      source_id: ghJob.id.toString(),
      category: this.categorizeJob(ghJob.departments?.[0]?.name),
      country: this.extractCountry(ghJob.offices?.[0]?.location?.name),
      language: "en",
      views: 0,
      applications: 0,
      recruiter_id: null,
      is_featured: false,
      is_active: true,
    }
  }

  private extractSalary(customFields: any): string {
    const salaryField = customFields?.find(
      (f: any) => f.name.toLowerCase().includes("salary") || f.name.toLowerCase().includes("compensation"),
    )
    return salaryField?.value || ""
  }

  private extractRequirements(content: string): string[] {
    const requirementSection = content.match(/requirements?:?\s*(.*?)(?=\n\n|\n[A-Z]|$)/is)
    if (!requirementSection) return []

    return requirementSection[1]
      .split(/\n|•|-/)
      .map((req) => req.trim())
      .filter((req) => req.length > 10)
      .slice(0, 10)
  }

  private extractSkills(content: string): string[] {
    const skillKeywords = [
      "JavaScript",
      "TypeScript",
      "React",
      "Node.js",
      "Python",
      "Java",
      "SQL",
      "AWS",
      "Docker",
      "Kubernetes",
      "Git",
      "Agile",
      "Scrum",
      "REST",
      "GraphQL",
    ]

    return skillKeywords.filter((skill) => content.toLowerCase().includes(skill.toLowerCase()))
  }

  private determineExperienceLevel(content: string): string {
    const lowerContent = content.toLowerCase()
    if (lowerContent.includes("senior") || lowerContent.includes("lead")) return "Senior"
    if (lowerContent.includes("junior") || lowerContent.includes("entry")) return "Junior"
    if (lowerContent.includes("mid") || lowerContent.includes("intermediate")) return "Mid"
    return "Mid"
  }

  private categorizeJob(department: string): string {
    if (!department) return "Other"
    const dept = department.toLowerCase()
    if (dept.includes("engineering") || dept.includes("development")) return "Technology"
    if (dept.includes("marketing")) return "Marketing"
    if (dept.includes("sales")) return "Sales"
    if (dept.includes("design")) return "Design"
    if (dept.includes("product")) return "Product"
    return "Other"
  }

  private extractCountry(location: string): string {
    if (!location) return "Unknown"
    if (location.includes("Netherlands") || location.includes("Amsterdam")) return "Netherlands"
    if (location.includes("Germany") || location.includes("Berlin")) return "Germany"
    if (location.includes("France") || location.includes("Paris")) return "France"
    if (location.includes("UK") || location.includes("London")) return "United Kingdom"
    return "Unknown"
  }
}
