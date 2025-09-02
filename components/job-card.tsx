import Link from "next/link"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MapPin, Clock, Building, Heart } from "lucide-react"
import type { Job } from "@/lib/types"

interface JobCardProps {
  job: Job
}

export function JobCard({ job }: JobCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 1) return "1 dag geleden"
    if (diffDays < 7) return `${diffDays} dagen geleden`
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weken geleden`
    return `${Math.ceil(diffDays / 30)} maanden geleden`
  }

  return (
    <Card className="hover:shadow-md transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1 flex-1">
            <Link href={`/vacatures/${job.id}`} className="hover:text-primary">
              <h3 className="font-semibold text-lg leading-tight text-balance">{job.title}</h3>
            </Link>
            <div className="flex items-center text-muted-foreground">
              <Building className="h-4 w-4 mr-1" />
              <span className="text-sm">{job.company}</span>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-red-500">
            <Heart className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="space-y-3">
          {/* Location and Type */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center">
              <MapPin className="h-4 w-4 mr-1" />
              <span>{job.location}</span>
            </div>
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-1" />
              <span>{formatDate(job.createdAt)}</span>
            </div>
          </div>

          {/* Badges */}
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">{job.type}</Badge>
            <Badge variant="outline">{job.branch}</Badge>
            {job.salary && <Badge variant="outline">{job.salary}</Badge>}
          </div>

          {/* Description */}
          {job.description && <p className="text-sm text-muted-foreground line-clamp-2">{job.description}</p>}

          {/* Requirements */}
          {job.requirements && job.requirements.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {job.requirements.slice(0, 3).map((req, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {req}
                </Badge>
              ))}
              {job.requirements.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{job.requirements.length - 3} meer
                </Badge>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button asChild className="flex-1">
              <Link href={job.url} target="_blank" rel="noopener noreferrer">
                Solliciteren
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href={`/vacatures/${job.id}`}>Details</Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
