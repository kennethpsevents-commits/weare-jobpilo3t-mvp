"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, MapPin, Clock, TrendingUp, Brain } from "lucide-react"

interface WhyYouFitProps {
  matchScore: number
  matchReasons: Array<{
    type: "skills" | "location" | "experience" | "language" | "salary"
    evidence: string
    confidence: number
  }>
  userProfile?: {
    skills: string[]
    experience: number
    preferredLocations: string[]
    languages: string[]
  }
  job: {
    title: string
    location: string
    requirements: string[]
    salary?: string
  }
}

export function WhyYouFit({ matchScore, matchReasons, userProfile, job }: WhyYouFitProps) {
  const getReasonIcon = (type: string) => {
    switch (type) {
      case "skills":
        return <Brain className="h-4 w-4" />
      case "location":
        return <MapPin className="h-4 w-4" />
      case "experience":
        return <TrendingUp className="h-4 w-4" />
      case "language":
        return <CheckCircle className="h-4 w-4" />
      case "salary":
        return <Clock className="h-4 w-4" />
      default:
        return <CheckCircle className="h-4 w-4" />
    }
  }

  const getReasonColor = (confidence: number) => {
    if (confidence >= 90) return "bg-green-100 text-green-800 border-green-200"
    if (confidence >= 70) return "bg-blue-100 text-blue-800 border-blue-200"
    return "bg-yellow-100 text-yellow-800 border-yellow-200"
  }

  const getMatchScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600"
    if (score >= 70) return "text-blue-600"
    if (score >= 50) return "text-yellow-600"
    return "text-gray-600"
  }

  return (
    <Card className="border-l-4 border-l-primary">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            Why You're a Great Fit
          </CardTitle>
          <Badge variant="outline" className={`text-lg font-bold ${getMatchScoreColor(matchScore)}`}>
            {matchScore}% Match
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3">
          {matchReasons.map((reason, index) => (
            <div
              key={index}
              className={`flex items-start gap-3 p-3 rounded-lg border ${getReasonColor(reason.confidence)}`}
            >
              <div className="flex-shrink-0 mt-0.5">{getReasonIcon(reason.type)}</div>
              <div className="flex-1">
                <p className="font-medium text-sm">{reason.evidence}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="secondary" className="text-xs">
                    {reason.confidence}% confidence
                  </Badge>
                  <span className="text-xs text-muted-foreground capitalize">{reason.type} match</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {matchScore >= 80 && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-4">
            <div className="flex items-center gap-2 text-green-800">
              <CheckCircle className="h-5 w-5" />
              <span className="font-semibold">Excellent Match!</span>
            </div>
            <p className="text-green-700 text-sm mt-1">
              This position aligns very well with your profile. We recommend applying soon.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
