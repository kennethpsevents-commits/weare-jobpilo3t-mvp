import type { Job, UserProfile, AIMatchingResult } from "./types"

export interface MatchingCriteria {
  skillsWeight: number // 0-1
  experienceWeight: number // 0-1
  locationWeight: number // 0-1
  salaryWeight: number // 0-1
  typeWeight: number // 0-1
  languageWeight: number // 0-1
}

export class AIJobMatcher {
  private defaultCriteria: MatchingCriteria = {
    skillsWeight: 0.4,
    experienceWeight: 0.25,
    locationWeight: 0.15,
    salaryWeight: 0.1,
    typeWeight: 0.05,
    languageWeight: 0.05,
  }

  async matchJobsForUser(
    userProfile: UserProfile,
    jobs: Job[],
    criteria: Partial<MatchingCriteria> = {},
  ): Promise<AIMatchingResult[]> {
    const matchCriteria = { ...this.defaultCriteria, ...criteria }
    const results: AIMatchingResult[] = []

    for (const job of jobs) {
      const matchResult = await this.calculateJobMatch(userProfile, job, matchCriteria)
      if (matchResult.matchScore > 0.3) {
        // Only include jobs with decent match scores
        results.push(matchResult)
      }
    }

    // Sort by match score descending
    return results.sort((a, b) => b.matchScore - a.matchScore)
  }

  private async calculateJobMatch(
    userProfile: UserProfile,
    job: Job,
    criteria: MatchingCriteria,
  ): Promise<AIMatchingResult> {
    const skillsScore = this.calculateSkillsMatch(userProfile.skills, job.requirements || [])
    const experienceScore = this.calculateExperienceMatch(userProfile.experience, job.description || "")
    const locationScore = this.calculateLocationMatch(userProfile.preferredLocations, job.location, job.type)
    const salaryScore = this.calculateSalaryMatch(userProfile.salaryExpectation, job.salary)
    const typeScore = this.calculateTypeMatch(userProfile.preferredType, job.type)
    const languageScore = this.calculateLanguageMatch(userProfile.languages, job.language)

    const matchScore =
      skillsScore.score * criteria.skillsWeight +
      experienceScore.score * criteria.experienceWeight +
      locationScore.score * criteria.locationWeight +
      salaryScore.score * criteria.salaryWeight +
      typeScore.score * criteria.typeWeight +
      languageScore.score * criteria.languageWeight

    const reasons: string[] = []
    const skillsMatch: string[] = []
    const skillsGap: string[] = []

    // Collect matching skills and gaps
    skillsScore.matches.forEach((skill) => {
      skillsMatch.push(skill)
      reasons.push(`✓ ${skill} expertise matches requirement`)
    })

    skillsScore.gaps.forEach((skill) => {
      skillsGap.push(skill)
    })

    // Add other reasons based on scores
    if (experienceScore.score > 0.8) {
      reasons.push(`✓ Experience level (${userProfile.experience} years) exceeds requirements`)
    } else if (experienceScore.score > 0.6) {
      reasons.push(`✓ Experience level matches job requirements`)
    }

    if (locationScore.score > 0.9) {
      reasons.push(`✓ Perfect location match`)
    } else if (locationScore.score > 0.7) {
      reasons.push(`✓ Good location compatibility`)
    }

    if (salaryScore.score > 0.8) {
      reasons.push(`✓ Salary range aligns with expectations`)
    }

    if (typeScore.score === 1) {
      reasons.push(`✓ Work type (${job.type}) matches preference`)
    }

    return {
      jobId: job.id,
      matchScore: Math.round(matchScore * 100) / 100,
      reasons: reasons.slice(0, 5), // Top 5 reasons
      skillsMatch,
      skillsGap: skillsGap.slice(0, 3), // Top 3 skill gaps
      salaryFit: salaryScore.fit,
      locationFit: locationScore.fit,
    }
  }

  private calculateSkillsMatch(
    userSkills: string[],
    jobRequirements: string[],
  ): { score: number; matches: string[]; gaps: string[] } {
    if (jobRequirements.length === 0) {
      return { score: 0.5, matches: [], gaps: [] } // Neutral score if no requirements
    }

    const userSkillsLower = userSkills.map((s) => s.toLowerCase())
    const jobRequirementsLower = jobRequirements.map((r) => r.toLowerCase())

    const matches: string[] = []
    const gaps: string[] = []

    jobRequirementsLower.forEach((requirement) => {
      const matchFound = userSkillsLower.some((userSkill) => {
        return (
          userSkill.includes(requirement) ||
          requirement.includes(userSkill) ||
          this.areSkillsSimilar(userSkill, requirement)
        )
      })

      if (matchFound) {
        matches.push(jobRequirements[jobRequirementsLower.indexOf(requirement)])
      } else {
        gaps.push(jobRequirements[jobRequirementsLower.indexOf(requirement)])
      }
    })

    const score = matches.length / jobRequirements.length

    return { score, matches, gaps }
  }

  private areSkillsSimilar(skill1: string, skill2: string): boolean {
    const synonyms: Record<string, string[]> = {
      javascript: ["js", "ecmascript", "node.js", "nodejs"],
      typescript: ["ts"],
      react: ["reactjs", "react.js"],
      vue: ["vuejs", "vue.js"],
      angular: ["angularjs"],
      python: ["py"],
      "node.js": ["nodejs", "node", "javascript"],
      mongodb: ["mongo"],
      postgresql: ["postgres", "psql"],
      "c#": ["csharp", "dotnet", ".net"],
      "c++": ["cpp"],
    }

    const skill1Lower = skill1.toLowerCase()
    const skill2Lower = skill2.toLowerCase()

    // Check if skills are synonyms
    for (const [key, values] of Object.entries(synonyms)) {
      if (
        (key === skill1Lower && values.includes(skill2Lower)) ||
        (key === skill2Lower && values.includes(skill1Lower)) ||
        (values.includes(skill1Lower) && values.includes(skill2Lower))
      ) {
        return true
      }
    }

    return false
  }

  private calculateExperienceMatch(userExperience: number, jobDescription: string): { score: number } {
    const experiencePatterns = [
      /(\d+)\+?\s*(year|years|jaar|jaren|jahr|jahre|an|ans|année|années|rok|lat|lata)\s*(experience|ervaring|erfahrung|expérience|doświadczenia)/gi,
      /(junior|medior|senior)/gi,
    ]

    let requiredExperience = 0
    const levelMatch = 1

    // Extract required experience from job description
    for (const pattern of experiencePatterns) {
      const matches = jobDescription.match(pattern)
      if (matches) {
        const numberMatch = matches[0].match(/\d+/)
        if (numberMatch) {
          requiredExperience = Number.parseInt(numberMatch[0])
          break
        }

        // Handle level-based matching
        const levelMatch = matches[0].toLowerCase()
        if (levelMatch.includes("junior") && userExperience >= 0 && userExperience <= 2) {
          return { score: 1 }
        } else if (levelMatch.includes("medior") && userExperience >= 2 && userExperience <= 5) {
          return { score: 1 }
        } else if (levelMatch.includes("senior") && userExperience >= 5) {
          return { score: 1 }
        }
      }
    }

    if (requiredExperience === 0) {
      return { score: 0.7 } // Neutral score if no experience requirement found
    }

    // Calculate score based on experience difference
    if (userExperience >= requiredExperience) {
      const overQualification = userExperience - requiredExperience
      if (overQualification <= 2) {
        return { score: 1 } // Perfect match
      } else if (overQualification <= 5) {
        return { score: 0.9 } // Slightly overqualified
      } else {
        return { score: 0.7 } // Significantly overqualified
      }
    } else {
      const underQualification = requiredExperience - userExperience
      if (underQualification <= 1) {
        return { score: 0.8 } // Close enough
      } else if (underQualification <= 2) {
        return { score: 0.6 } // Somewhat underqualified
      } else {
        return { score: 0.3 } // Significantly underqualified
      }
    }
  }

  private calculateLocationMatch(
    preferredLocations: string[],
    jobLocation: string,
    jobType: Job["type"],
  ): { score: number; fit: "exact" | "nearby" | "remote" } {
    if (jobType === "Remote") {
      return { score: 1, fit: "remote" }
    }

    const jobLocationLower = jobLocation.toLowerCase()
    const preferredLower = preferredLocations.map((loc) => loc.toLowerCase())

    // Exact match
    for (const preferred of preferredLower) {
      if (jobLocationLower.includes(preferred) || preferred.includes(jobLocationLower)) {
        return { score: 1, fit: "exact" }
      }
    }

    // Country/region match
    const countries = [
      "netherlands",
      "nederland",
      "germany",
      "deutschland",
      "poland",
      "polska",
      "france",
      "uk",
      "united kingdom",
    ]
    for (const country of countries) {
      if (jobLocationLower.includes(country)) {
        for (const preferred of preferredLower) {
          if (preferred.includes(country)) {
            return { score: 0.7, fit: "nearby" }
          }
        }
      }
    }

    // Hybrid jobs get partial location score
    if (jobType === "Hybrid") {
      return { score: 0.6, fit: "nearby" }
    }

    return { score: 0.2, fit: "nearby" }
  }

  private calculateSalaryMatch(
    salaryExpectation: UserProfile["salaryExpectation"],
    jobSalary: string | undefined,
  ): { score: number; fit: "below" | "match" | "above" } {
    if (!salaryExpectation || !jobSalary) {
      return { score: 0.5, fit: "match" } // Neutral if no salary info
    }

    const salaryNumbers = this.extractSalaryNumbers(jobSalary)
    if (salaryNumbers.length === 0) {
      return { score: 0.5, fit: "match" }
    }

    const jobSalaryMin = Math.min(...salaryNumbers)
    const jobSalaryMax = Math.max(...salaryNumbers)
    const userMin = salaryExpectation.min
    const userMax = salaryExpectation.max

    // Perfect overlap
    if (jobSalaryMin <= userMax && jobSalaryMax >= userMin) {
      const overlapStart = Math.max(jobSalaryMin, userMin)
      const overlapEnd = Math.min(jobSalaryMax, userMax)
      const overlapSize = overlapEnd - overlapStart
      const userRange = userMax - userMin
      const overlapRatio = overlapSize / userRange

      if (overlapRatio > 0.8) {
        return { score: 1, fit: "match" }
      } else if (overlapRatio > 0.5) {
        return { score: 0.8, fit: "match" }
      } else {
        return { score: 0.6, fit: "match" }
      }
    }

    // Job salary below expectations
    if (jobSalaryMax < userMin) {
      const gap = userMin - jobSalaryMax
      const gapRatio = gap / userMin
      if (gapRatio < 0.1) {
        return { score: 0.7, fit: "below" }
      } else if (gapRatio < 0.2) {
        return { score: 0.5, fit: "below" }
      } else {
        return { score: 0.2, fit: "below" }
      }
    }

    // Job salary above expectations (good for user)
    if (jobSalaryMin > userMax) {
      return { score: 0.9, fit: "above" }
    }

    return { score: 0.5, fit: "match" }
  }

  private extractSalaryNumbers(salary: string): number[] {
    const numbers: number[] = []
    const patterns = [
      /€\s*(\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{2})?)/g,
      /\$\s*(\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{2})?)/g,
      /£\s*(\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{2})?)/g,
      /(\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{2})?)\s*(?:€|\$|£|PLN|USD|EUR)/g,
    ]

    for (const pattern of patterns) {
      let match
      while ((match = pattern.exec(salary)) !== null) {
        const numberStr = match[1].replace(/[.,]/g, "")
        const number = Number.parseInt(numberStr)
        if (number > 1000) {
          // Assume it's annual salary
          numbers.push(number)
        } else if (number > 10) {
          // Assume it's hourly rate, convert to annual (assuming 40h/week, 52 weeks)
          numbers.push(number * 40 * 52)
        }
      }
    }

    return numbers
  }

  private calculateTypeMatch(preferredType: Job["type"], jobType: Job["type"]): { score: number } {
    if (preferredType === jobType) {
      return { score: 1 }
    }

    // Partial matches
    if (preferredType === "Remote" && jobType === "Hybrid") {
      return { score: 0.7 }
    }
    if (preferredType === "Hybrid" && (jobType === "Remote" || jobType === "On-site")) {
      return { score: 0.6 }
    }

    return { score: 0.3 }
  }

  private calculateLanguageMatch(userLanguages: string[], jobLanguage: string): { score: number } {
    const userLangsLower = userLanguages.map((lang) => lang.toLowerCase())
    const jobLangLower = jobLanguage.toLowerCase()

    if (userLangsLower.includes(jobLangLower)) {
      return { score: 1 }
    }

    // English as fallback
    if (jobLangLower === "en" && userLangsLower.includes("english")) {
      return { score: 1 }
    }

    return { score: 0.3 }
  }

  async generateMatchExplanation(matchResult: AIMatchingResult, job: Job): Promise<string> {
    const { matchScore, reasons, skillsMatch, skillsGap } = matchResult

    let explanation = `This job has a ${Math.round(matchScore * 100)}% match with your profile.\n\n`

    if (reasons.length > 0) {
      explanation += "Why this job matches:\n"
      reasons.forEach((reason) => {
        explanation += `• ${reason}\n`
      })
      explanation += "\n"
    }

    if (skillsMatch.length > 0) {
      explanation += `Your matching skills: ${skillsMatch.join(", ")}\n\n`
    }

    if (skillsGap.length > 0) {
      explanation += `Skills to develop: ${skillsGap.join(", ")}\n\n`
    }

    explanation += `Salary fit: ${matchResult.salaryFit}\n`
    explanation += `Location fit: ${matchResult.locationFit}`

    return explanation
  }
}

// Singleton instance
let aiMatcher: AIJobMatcher | null = null

export function getAIMatcher(): AIJobMatcher {
  if (!aiMatcher) {
    aiMatcher = new AIJobMatcher()
  }
  return aiMatcher
}
