import type { EvidenceChip, Job, UserProfile } from "./types"

export class EvidenceGenerator {
  static generateChips(
    job: Job,
    userProfile: UserProfile,
    matchData: {
      skillsMatch: string[]
      experienceScore: number
      locationDistance?: number
      salaryFit: "below" | "match" | "above"
      daysSincePosted: number
    },
  ): EvidenceChip[] {
    const chips: EvidenceChip[] = []

    // Skills evidence
    matchData.skillsMatch.forEach((skill) => {
      chips.push({
        kind: "skill",
        label: `Matches skill: ${skill}`,
        sourceField: "job.requirements",
        confidence: 95,
      })
    })

    // Distance evidence
    if (matchData.locationDistance !== undefined) {
      if (matchData.locationDistance === 0) {
        chips.push({
          kind: "distance",
          label: "Exact location match",
          sourceField: "job.location",
          confidence: 100,
        })
      } else if (matchData.locationDistance < 15) {
        chips.push({
          kind: "distance",
          label: `<${Math.round(matchData.locationDistance)}km from preferred location`,
          sourceField: "job.location",
          confidence: 90,
        })
      } else if (matchData.locationDistance < 50) {
        chips.push({
          kind: "distance",
          label: `${Math.round(matchData.locationDistance)}km from preferred location`,
          sourceField: "job.location",
          confidence: 70,
        })
      }
    }

    // Remote work evidence
    if (job.type === "Remote" && userProfile.preferredType === "Remote") {
      chips.push({
        kind: "distance",
        label: "Remote work available",
        sourceField: "job.type",
        confidence: 100,
      })
    }

    // Experience evidence
    if (matchData.experienceScore > 0.8) {
      chips.push({
        kind: "seniority",
        label: "Experience level matches",
        sourceField: "job.description",
        confidence: Math.round(matchData.experienceScore * 100),
      })
    }

    // Salary evidence
    if (matchData.salaryFit === "match") {
      chips.push({
        kind: "salary",
        label: "Salary within expected range",
        sourceField: "job.salary",
        confidence: 85,
      })
    } else if (matchData.salaryFit === "above") {
      chips.push({
        kind: "salary",
        label: "Salary above expectations",
        sourceField: "job.salary",
        confidence: 95,
      })
    }

    // Freshness evidence
    if (matchData.daysSincePosted <= 1) {
      chips.push({
        kind: "freshness",
        label: "Posted today",
        sourceField: "job.postedAt",
        confidence: 100,
      })
    } else if (matchData.daysSincePosted <= 7) {
      chips.push({
        kind: "freshness",
        label: `Posted ${matchData.daysSincePosted} days ago`,
        sourceField: "job.postedAt",
        confidence: 90,
      })
    }

    // Sort by confidence and return top 5
    return chips.sort((a, b) => b.confidence - a.confidence).slice(0, 5)
  }
}
