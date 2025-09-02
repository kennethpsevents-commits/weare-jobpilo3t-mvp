"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, MapPin, Briefcase } from "lucide-react"

interface JobSearchProps {
  onSearch?: (filters: {
    search: string
    location: string
    type: string
  }) => void
}

export function JobSearch({ onSearch }: JobSearchProps) {
  const [search, setSearch] = useState("")
  const [location, setLocation] = useState("")
  const [type, setType] = useState("all") // Updated default value to "all"

  const handleSearch = () => {
    onSearch?.({ search, location, type })
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="flex flex-col md:flex-row gap-4 p-4 bg-card rounded-lg border shadow-sm">
        {/* Search Input */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Functietitel, bedrijf of trefwoorden..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Location Input */}
        <div className="flex-1 relative">
          <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Locatie (stad, provincie...)"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Job Type Select */}
        <div className="w-full md:w-48">
          <Select value={type} onValueChange={setType}>
            <SelectTrigger>
              <Briefcase className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Type werk" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle types</SelectItem> {/* Updated value prop */}
              <SelectItem value="remote">Remote</SelectItem> {/* Updated value prop */}
              <SelectItem value="hybrid">Hybride</SelectItem> {/* Updated value prop */}
              <SelectItem value="onsite">Op kantoor</SelectItem> {/* Updated value prop */}
            </SelectContent>
          </Select>
        </div>

        {/* Search Button */}
        <Button onClick={handleSearch} className="w-full md:w-auto">
          <Search className="h-4 w-4 mr-2" />
          Zoeken
        </Button>
      </div>
    </div>
  )
}
