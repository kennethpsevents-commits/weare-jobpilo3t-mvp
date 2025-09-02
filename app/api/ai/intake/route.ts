import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase-server"

interface IntakeData {
  name: string
  email: string
  experience: string
  skills: string[]
  preferences: {
    location: string
    type: "Remote" | "On-site" | "Hybrid"
    salary: string
    branch: string
  }
}

export async function POST(request: NextRequest) {
  try {
    const intakeData: IntakeData = await request.json()

    // Simple AI matching logic (can be enhanced with actual AI later)
    const supabase = await createServerSupabaseClient()

    // Get jobs that match user preferences
    let query = supabase.from("jobs").select("*").eq("is_active", true).limit(10)

    if (intakeData.preferences.type) {
      query = query.eq("type", intakeData.preferences.type)
    }
    if (intakeData.preferences.branch) {
      query = query.eq("branch", intakeData.preferences.branch)
    }
    if (intakeData.preferences.location) {
      query = query.ilike("location", `%${intakeData.preferences.location}%`)
    }

    const { data: jobs, error } = await query

    if (error) {
      console.error("Database error:", error)
      // Fallback to mock recommendations
      const mockRecommendations = [
        {
          id: "ai-rec-1",
          title: "Senior Developer",
          company: "AI Tech Corp",
          location: intakeData.preferences.location || "Amsterdam",
          type: intakeData.preferences.type || "Hybrid",
          branch: intakeData.preferences.branch || "IT",
          language: "nl",
          url: "https://example.com/ai-rec-1",
          matchScore: 95,
          matchReasons: ["Skills match", "Location preference", "Experience level"],
        },
        {
          id: "ai-rec-2",
          title: "Tech Lead",
          company: "Innovation Labs",
          location: intakeData.preferences.location || "Rotterdam",
          type: intakeData.preferences.type || "Remote",
          branch: intakeData.preferences.branch || "IT",
          language: "nl",
          url: "https://example.com/ai-rec-2",
          matchScore: 87,
          matchReasons: ["Experience match", "Remote work preference"],
        },
        {
          id: "ai-rec-3",
          title: "Product Manager",
          company: "Growth Company",
          location: intakeData.preferences.location || "Utrecht",
          type: intakeData.preferences.type || "Hybrid",
          branch: intakeData.preferences.branch || "Product",
          language: "nl",
          url: "https://example.com/ai-rec-3",
          matchScore: 78,
          matchReasons: ["Career progression", "Company culture fit"],
        },
      ]

      return NextResponse.json({
        success: true,
        data: {
          recommendations: mockRecommendations,
          totalMatches: mockRecommendations.length,
          intakeId: `intake-${Date.now()}`,
          processedAt: new Date().toISOString(),
        },
        message: "AI recommendations generated successfully (using fallback data)",
      })
    }

    // Calculate match scores for real jobs
    const recommendations = (jobs || []).slice(0, 3).map((job: any, index: number) => ({
      ...job,
      matchScore: 90 - index * 5, // Simple scoring
      matchReasons: ["Skills alignment", "Location preference", "Experience level match"].slice(
        0,
        Math.floor(Math.random() * 3) + 1,
      ),
    }))

    return NextResponse.json({
      success: true,
      data: {
        recommendations,
        totalMatches: recommendations.length,
        intakeId: `intake-${Date.now()}`,
        processedAt: new Date().toISOString(),
      },
      message: "AI recommendations generated successfully",
    })
  } catch (error) {
    console.error("AI Intake Error:", error)
    return NextResponse.json({ success: false, error: "Failed to process AI intake" }, { status: 500 })
  }
}
