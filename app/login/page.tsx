"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuth } from "@/components/auth-provider"
import Link from "next/link"

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const { signIn, signUp } = useAuth()
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const formData = new FormData(e.target as HTMLFormElement)
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    try {
      await signIn(email, password)
      router.push("/dashboard")
    } catch (error: any) {
      setError(error.message || "Er is een fout opgetreden bij het inloggen")
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setSuccess(null)

    const formData = new FormData(e.target as HTMLFormElement)
    const email = formData.get("registerEmail") as string
    const password = formData.get("registerPassword") as string
    const firstName = formData.get("firstName") as string
    const lastName = formData.get("lastName") as string

    try {
      await signUp(email, password, firstName, lastName)
      setSuccess("Account succesvol aangemaakt! Controleer je e-mail voor verificatie.")
    } catch (error: any) {
      setError(error.message || "Er is een fout opgetreden bij het aanmaken van je account")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-16 max-w-md">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold">Welkom bij JobPilot</h1>
        <p className="text-muted-foreground mt-2">Log in of maak een account aan om te beginnen</p>
      </div>

      {error && (
        <Alert className="mb-6 border-destructive">
          <AlertDescription className="text-destructive">{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="mb-6 border-green-500">
          <AlertDescription className="text-green-700">{success}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="login" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="login">Inloggen</TabsTrigger>
          <TabsTrigger value="register">Registreren</TabsTrigger>
        </TabsList>

        <TabsContent value="login">
          <Card>
            <CardHeader>
              <CardTitle>Inloggen</CardTitle>
              <CardDescription>Voer je gegevens in om in te loggen</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">E-mailadres</Label>
                  <Input id="email" name="email" type="email" placeholder="je@voorbeeld.nl" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Wachtwoord</Label>
                  <Input id="password" name="password" type="password" required />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Bezig met inloggen..." : "Inloggen"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="register">
          <Card>
            <CardHeader>
              <CardTitle>Account aanmaken</CardTitle>
              <CardDescription>Maak een gratis account aan om te beginnen</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">Voornaam</Label>
                    <Input id="firstName" name="firstName" placeholder="Jan" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Achternaam</Label>
                    <Input id="lastName" name="lastName" placeholder="Jansen" required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="registerEmail">E-mailadres</Label>
                  <Input id="registerEmail" name="registerEmail" type="email" placeholder="je@voorbeeld.nl" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="registerPassword">Wachtwoord</Label>
                  <Input id="registerPassword" name="registerPassword" type="password" required />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Account aanmaken..." : "Account aanmaken"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="text-center mt-6">
        <Link href="/" className="text-sm text-muted-foreground hover:underline">
          Terug naar homepage
        </Link>
      </div>
    </div>
  )
}
