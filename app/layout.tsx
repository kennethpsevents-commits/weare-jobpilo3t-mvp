import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/components/auth-provider"
import "./globals.css"
import { Suspense } from "react"

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
})

export const metadata: Metadata = {
  title: "JobPilot - Find Your Dream Job with AI",
  description:
    "JobPilot is Europe's smartest job aggregator. Find jobs that perfectly match you with our AI-powered matching technology.",
  generator: "JobPilot",
  keywords: ["jobs", "careers", "AI matching", "Europe", "recruitment"],
  authors: [{ name: "JobPilot Team" }],
  openGraph: {
    title: "JobPilot - Find Your Dream Job with AI",
    description: "Europe's smartest job aggregator with AI-powered matching",
    url: "https://www.wearejobpilot.com",
    siteName: "JobPilot",
    type: "website",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`}>
        <Suspense fallback={<div>Loading...</div>}>
          <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
            <AuthProvider>{children}</AuthProvider>
          </ThemeProvider>
          <Analytics />
        </Suspense>
      </body>
    </html>
  )
}
