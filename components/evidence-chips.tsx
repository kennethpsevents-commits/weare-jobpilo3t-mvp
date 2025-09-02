"use client"

import { Badge } from "@/components/ui/badge"
import { Brain, MapPin, TrendingUp, Euro, Clock, CheckCircle } from "lucide-react"
import type { EvidenceChip } from "@/lib/types"

interface EvidenceChipsProps {
  chips: EvidenceChip[]
  maxChips?: number
}

export function EvidenceChips({ chips, maxChips = 5 }: EvidenceChipsProps) {
  const displayChips = chips.slice(0, maxChips)

  const getChipIcon = (kind: EvidenceChip["kind"]) => {
    switch (kind) {
      case "skill":
        return <Brain className="h-3 w-3" />
      case "distance":
        return <MapPin className="h-3 w-3" />
      case "seniority":
        return <TrendingUp className="h-3 w-3" />
      case "salary":
        return <Euro className="h-3 w-3" />
      case "freshness":
        return <Clock className="h-3 w-3" />
      default:
        return <CheckCircle className="h-3 w-3" />
    }
  }

  const getChipVariant = (confidence: number) => {
    if (confidence >= 90) return "default"
    if (confidence >= 70) return "secondary"
    return "outline"
  }

  const getChipColor = (kind: EvidenceChip["kind"]) => {
    switch (kind) {
      case "skill":
        return "bg-blue-50 text-blue-700 border-blue-200"
      case "distance":
        return "bg-green-50 text-green-700 border-green-200"
      case "seniority":
        return "bg-purple-50 text-purple-700 border-purple-200"
      case "salary":
        return "bg-yellow-50 text-yellow-700 border-yellow-200"
      case "freshness":
        return "bg-orange-50 text-orange-700 border-orange-200"
      default:
        return "bg-gray-50 text-gray-700 border-gray-200"
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      {displayChips.map((chip, index) => (
        <Badge
          key={index}
          variant="outline"
          className={`flex items-center gap-1 text-xs ${getChipColor(chip.kind)}`}
          title={`${chip.confidence}% confidence - Source: ${chip.sourceField}`}
        >
          {getChipIcon(chip.kind)}
          {chip.label}
        </Badge>
      ))}
      {chips.length > maxChips && (
        <Badge variant="outline" className="text-xs text-muted-foreground">
          +{chips.length - maxChips} more
        </Badge>
      )}
    </div>
  )
}
