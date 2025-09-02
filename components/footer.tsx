import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"

export function Footer() {
  return (
    <footer className="bg-muted/50 border-t">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold">
                JP
              </div>
              <span className="text-xl font-bold">JobPilot</span>
            </div>
            <p className="text-sm text-muted-foreground">
              De slimste job aggregator van Nederland. Vind vacatures die perfect bij je passen met onze AI-powered
              matching technologie.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Voor Werkzoekenden</h3>
            <nav className="space-y-2">
              <Link href="/vacatures" className="block text-sm text-muted-foreground hover:text-foreground">
                Alle Vacatures
              </Link>
              <Link href="/ai-matching" className="block text-sm text-muted-foreground hover:text-foreground">
                AI Career Matching
              </Link>
              <Link href="/profiel" className="block text-sm text-muted-foreground hover:text-foreground">
                Mijn Profiel
              </Link>
              <Link href="/tips" className="block text-sm text-muted-foreground hover:text-foreground">
                Carrière Tips
              </Link>
            </nav>
          </div>

          {/* Employer Links */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Voor Werkgevers</h3>
            <nav className="space-y-2">
              <Link href="/werkgevers" className="block text-sm text-muted-foreground hover:text-foreground">
                Vacature Plaatsen
              </Link>
              <Link href="/werkgevers/prijzen" className="block text-sm text-muted-foreground hover:text-foreground">
                Prijzen
              </Link>
              <Link href="/werkgevers/dashboard" className="block text-sm text-muted-foreground hover:text-foreground">
                Employer Dashboard
              </Link>
              <Link href="/contact" className="block text-sm text-muted-foreground hover:text-foreground">
                Contact
              </Link>
            </nav>
          </div>

          {/* Newsletter */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Blijf op de hoogte</h3>
            <p className="text-sm text-muted-foreground">Ontvang wekelijks de beste vacatures in je inbox.</p>
            <div className="flex space-x-2">
              <Input placeholder="Je email adres" className="flex-1" />
              <Button size="sm">Aanmelden</Button>
            </div>
          </div>
        </div>

        <Separator className="my-8" />

        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="flex space-x-6 text-sm text-muted-foreground">
            <Link href="/privacy" className="hover:text-foreground">
              Privacy Beleid
            </Link>
            <Link href="/voorwaarden" className="hover:text-foreground">
              Algemene Voorwaarden
            </Link>
            <Link href="/cookies" className="hover:text-foreground">
              Cookie Beleid
            </Link>
          </div>
          <p className="text-sm text-muted-foreground">© 2025 JobPilot. Alle rechten voorbehouden.</p>
        </div>
      </div>
    </footer>
  )
}
