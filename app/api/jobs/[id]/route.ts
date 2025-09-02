import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase-server"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createServerSupabaseClient()

    const { data: job, error } = await supabase.from("jobs").select("*").eq("id", params.id).single()

    if (error || !job) {
      // Fallback to mock data if database fails
      const mockJob = {
        id: params.id,
        title: "Senior Software Developer",
        company: "TechCorp Nederland",
        location: "Amsterdam, Nederland",
        type: "Fulltime",
        category: "IT & Software",
        salary: "€60.000 - €80.000",
        description:
          "We zoeken een ervaren software developer om ons team te versterken. Je werkt aan innovatieve projecten met moderne technologieën zoals React, Node.js en cloud platforms.",
        requirements:
          "• Minimaal 5 jaar ervaring met JavaScript/TypeScript\n• Ervaring met React en Node.js\n• Kennis van cloud platforms (AWS/Azure)\n• Goede communicatieve vaardigheden\n• HBO/WO opleiding",
        posted_date: new Date().toISOString(),
        source: "jobpilot",
        url: `https://www.wearejobpilot.com/vacatures/${params.id}`,
      }

      return NextResponse.json(mockJob)
    }

    return NextResponse.json(job)
  } catch (error) {
    console.error("Error fetching job:", error)
    return NextResponse.json({ error: "Failed to fetch job" }, { status: 500 })
  }
}
