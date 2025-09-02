"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, CreditCard, Loader2 } from "lucide-react"
import { useTranslations } from "next-intl"

interface PaymentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  recruiterId: string
  currentCredits: number
}

const CREDIT_PACKAGES = {
  STARTER: { credits: 1, price: 50, name: "Single Job Post", popular: false },
  PROFESSIONAL: { credits: 5, price: 225, name: "Professional Pack", popular: true, savings: 25 },
  ENTERPRISE: { credits: 20, price: 800, name: "Enterprise Pack", popular: false, savings: 200 },
}

export function PaymentDialog({ open, onOpenChange, recruiterId, currentCredits }: PaymentDialogProps) {
  const [loading, setLoading] = useState<string | null>(null)
  const t = useTranslations("recruiter.payment")

  const handlePurchase = async (packageType: keyof typeof CREDIT_PACKAGES) => {
    setLoading(packageType)

    try {
      const response = await fetch("/api/payments/create-checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          packageType,
          recruiterId,
          returnUrl: window.location.href,
        }),
      })

      const data = await response.json()

      if (data.url) {
        window.location.href = data.url
      } else {
        throw new Error(data.error || "Failed to create checkout session")
      }
    } catch (error) {
      console.error("Payment error:", error)
      alert("Failed to start payment process. Please try again.")
    } finally {
      setLoading(null)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            {t("title")}
          </DialogTitle>
          <DialogDescription>
            {t("description")} {t("currentCredits")}: <Badge variant="secondary">{currentCredits}</Badge>
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-4">
          {Object.entries(CREDIT_PACKAGES).map(([key, pkg]) => (
            <Card key={key} className={`relative ${pkg.popular ? "border-primary shadow-lg" : ""}`}>
              {pkg.popular && (
                <Badge className="absolute -top-2 left-1/2 -translate-x-1/2" variant="default">
                  {t("mostPopular")}
                </Badge>
              )}
              <CardHeader className="text-center">
                <CardTitle className="text-lg">{pkg.name}</CardTitle>
                <CardDescription>
                  <div className="text-2xl font-bold text-foreground">€{pkg.price}</div>
                  {pkg.savings && (
                    <div className="text-sm text-green-600">
                      {t("save")} €{pkg.savings}
                    </div>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">{pkg.credits}</div>
                  <div className="text-sm text-muted-foreground">
                    {pkg.credits === 1 ? t("jobPost") : t("jobPosts")}
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    {t("features.instantActivation")}
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    {t("features.aiMatching")}
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    {t("features.candidateAccess")}
                  </div>
                  {pkg.credits > 1 && (
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500" />
                      {t("features.bulkDiscount")}
                    </div>
                  )}
                </div>

                <Button
                  className="w-full"
                  variant={pkg.popular ? "default" : "outline"}
                  onClick={() => handlePurchase(key as keyof typeof CREDIT_PACKAGES)}
                  disabled={loading !== null}
                >
                  {loading === key ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      {t("processing")}
                    </>
                  ) : (
                    <>
                      {t("purchase")} - €{pkg.price}
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <DialogFooter className="text-center text-sm text-muted-foreground">
          <div className="w-full">
            <p>{t("securePayment")}</p>
            <p className="mt-1">{t("supportedMethods")}</p>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
