"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BookmarkIcon, BriefcaseIcon, UserIcon, SettingsIcon } from "lucide-react"

export default function DashboardPage() {
  const [savedJobs, setSavedJobs] = useState([])
  const [applications, setApplications] = useState([])

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Mijn Dashboard</h1>
        <p className="text-muted-foreground">Beheer je sollicitaties en bewaarde vacatures</p>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overzicht</TabsTrigger>
          <TabsTrigger value="applications">Sollicitaties</TabsTrigger>
          <TabsTrigger value="saved">Bewaarde Vacatures</TabsTrigger>
          <TabsTrigger value="profile">Profiel</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Actieve Sollicitaties</CardTitle>
                <BriefcaseIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">3</div>
                <p className="text-xs text-muted-foreground">+1 deze week</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Bewaarde Vacatures</CardTitle>
                <BookmarkIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">12</div>
                <p className="text-xs text-muted-foreground">+2 deze week</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Profiel Volledigheid</CardTitle>
                <UserIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">85%</div>
                <p className="text-xs text-muted-foreground">Bijna compleet</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">AI Matches</CardTitle>
                <SettingsIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">7</div>
                <p className="text-xs text-muted-foreground">Nieuwe matches</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Recente Sollicitaties</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Senior Developer</p>
                      <p className="text-sm text-muted-foreground">TechCorp</p>
                    </div>
                    <Badge variant="outline">In behandeling</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Frontend Developer</p>
                      <p className="text-sm text-muted-foreground">StartupXYZ</p>
                    </div>
                    <Badge variant="secondary">Afgewezen</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>AI Aanbevelingen</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">React Developer</p>
                      <p className="text-sm text-muted-foreground">95% match</p>
                    </div>
                    <Button size="sm">Bekijk</Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Full Stack Engineer</p>
                      <p className="text-sm text-muted-foreground">88% match</p>
                    </div>
                    <Button size="sm">Bekijk</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="applications">
          <Card>
            <CardHeader>
              <CardTitle>Mijn Sollicitaties</CardTitle>
              <CardDescription>Overzicht van al je sollicitaties en hun status</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Je hebt nog geen sollicitaties. Begin met zoeken naar vacatures!</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="saved">
          <Card>
            <CardHeader>
              <CardTitle>Bewaarde Vacatures</CardTitle>
              <CardDescription>Vacatures die je hebt bewaard voor later</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Je hebt nog geen vacatures bewaard. Bewaar interessante vacatures om ze later terug te vinden!
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profiel Instellingen</CardTitle>
              <CardDescription>Beheer je persoonlijke informatie en voorkeuren</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Profiel instellingen komen binnenkort beschikbaar.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
