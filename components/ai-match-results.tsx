"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { ExternalLink, MapPin, Building2, Euro } from "lucide-react"
import type { AIMatchingResult, Job } from "@/lib/types"

interface AIMatchResultsProps {
  userProfile: any
  onMatchingComplete?: (results: any[]) => void
}

export function AIMatchResults({ userProfile, onMatchingComplete }: AIMatchResultsProps) {
  const [matchResults, setMatchResults] = useState<(AIMatchingResult & { job: Job })[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const runMatching = async () => {
    if (!userProfile) return

    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/ai/match", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userProfile,
          criteria: {
            skillsWeight: 0.4,
            experienceWeight: 0.25,
            locationWeight: 0.15,
            salaryWeight: 0.1,
            typeWeight: 0.05,
            languageWeight: 0.05,
          },
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()

      if (result.success) {
        setMatchResults(result.data || [])
        onMatchingComplete?.(result.data || [])
      } else {
        setError(result.error || "Matching failed")
      }
    } catch (err) {
      console.error("AI Matching error:", err)
      setError(err instanceof Error ? err.message : "Unknown error occurred")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (userProfile) {
      runMatching()
    }
  }, [userProfile])

  const getMatchColor = (score: number) => {
    if (score >= 0.8) return "bg-green-500"
    if (score >= 0.6) return "bg-yellow-500"
    return "bg-red-500"
  }

  const getMatchLabel = (score: number) => {
    if (score >= 0.8) return "Excellent Match"
    if (score >= 0.6) return "Good Match"
    if (score >= 0.4) return "Fair Match"
    return "Poor Match"
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600">Analyzing job matches with AI...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Card className="border-red-200">
        <CardContent className="pt-6">
          <div className="text-center">
            <p className="text-red-600 mb-4">Error: {error}</p>
            <Button onClick={runMatching} variant="outline">
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (matchResults.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <p className="text-gray-600 mb-4">No job matches found. Try updating your profile or skills.</p>
            <Button onClick={runMatching} variant="outline">
              Refresh Matches
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">AI Job Matches</h2>
        <Button onClick={runMatching} variant="outline" disabled={loading}>
          Refresh Matches
        </Button>
      </div>

      <div className="grid gap-6">
        {matchResults.map((result) => (
          <Card key={result.jobId} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-xl mb-2">{result.job.title}</CardTitle>
                  <CardDescription className="flex items-center gap-4 text-base">
                    <span className="flex items-center gap-1">
                      <Building2 className="h-4 w-4" />
                      {result.job.company}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {result.job.location}
                    </span>
                  </CardDescription>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-2 mb-2">
                    <Progress value={result.matchScore * 100} className="w-20" />
                    <span className="text-sm font-medium">{Math.round(result.matchScore * 100)}%</span>
                  </div>
                  <Badge variant={result.matchScore >= 0.7 ? "default" : "secondary"}>
                    {getMatchLabel(result.matchScore)}
                  </Badge>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">{result.job.type}</Badge>
                <Badge variant="outline">{result.job.branch}</Badge>
                {result.job.salary && (
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Euro className="h-3 w-3" />
                    {result.job.salary}
                  </Badge>
                )}
              </div>

              {result.job.description && <p className="text-sm text-gray-600 line-clamp-2">{result.job.description}</p>}

              {result.reasons.length > 0 && (
                <div>
                  <h4 className="font-medium text-sm mb-2">Why this matches:</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {result.reasons.slice(0, 3).map((reason, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-green-500 mt-0.5">•</span>
                        {reason}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex flex-wrap gap-4 text-sm">
                {result.skillsMatch.length > 0 && (
                  <div>
                    <span className="font-medium text-green-600">Matching skills: </span>
                    <span className="text-gray-600">{result.skillsMatch.slice(0, 3).join(", ")}</span>
                  </div>
                )}
                {result.skillsGap.length > 0 && (
                  <div>
                    <span className="font-medium text-orange-600">Skills to develop: </span>
                    <span className="text-gray-600">{result.skillsGap.slice(0, 2).join(", ")}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-4 border-t">
                <div className="flex gap-4 text-sm text-gray-500">
                  <span>Salary: {result.salaryFit}</span>
                  <span>Location: {result.locationFit}</span>
                </div>
                <Button asChild size="sm">
                  <a
                    href={result.job.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2"
                  >
                    View Job
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
