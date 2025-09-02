import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase-server"
import type { Recruiter } from "@/lib/types"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const recruiterId = searchParams.get("recruiter_id")

    if (!recruiterId) {
      return NextResponse.json(
        {
          success: false,
          error: "recruiter_id is required",
        },
        { status: 400 },
      )
    }

    const supabase = await createServerSupabaseClient()
    const { data, error } = await supabase.from("recruiters").select("*").eq("id", recruiterId).single()

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json(
          {
            success: false,
            error: "Recruiter not found",
          },
          { status: 404 },
        )
      }
      throw error
    }

    return NextResponse.json({
      success: true,
      data: data as Recruiter,
    })
  } catch (error) {
    console.error("[v0] Get recruiter error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to get recruiter",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const recruiterData = await request.json()

    const recruiter: Omit<Recruiter, "id" | "createdAt" | "lastActive"> = {
      companyName: recruiterData.companyName,
      contactEmail: recruiterData.contactEmail,
      contactPhone: recruiterData.contactPhone,
      website: recruiterData.website,
      description: recruiterData.description,
      postedJobs: [],
      credits: 0,
      subscription: "free",
    }

    const supabase = await createServerSupabaseClient()
    const { data, error } = await supabase
      .from("recruiters")
      .insert({
        ...recruiter,
        created_at: new Date().toISOString(),
        last_active: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    console.log(`[v0] Created recruiter account for ${recruiter.companyName}`)

    return NextResponse.json({
      success: true,
      data: data as Recruiter,
      message: "Recruiter account created successfully",
    })
  } catch (error) {
    console.error("[v0] Create recruiter error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create recruiter account",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const recruiterId = searchParams.get("recruiter_id")
    const recruiterData = await request.json()

    if (!recruiterId) {
      return NextResponse.json(
        {
          success: false,
          error: "recruiter_id is required",
        },
        { status: 400 },
      )
    }

    const updateData = {
      company_name: recruiterData.companyName,
      contact_email: recruiterData.contactEmail,
      contact_phone: recruiterData.contactPhone,
      website: recruiterData.website,
      description: recruiterData.description,
      credits: recruiterData.credits,
      subscription: recruiterData.subscription,
      last_active: new Date().toISOString(),
    }

    // Remove undefined values
    Object.keys(updateData).forEach((key) => {
      if (updateData[key as keyof typeof updateData] === undefined) {
        delete updateData[key as keyof typeof updateData]
      }
    })

    const supabase = await createServerSupabaseClient()
    const { data, error } = await supabase.from("recruiters").update(updateData).eq("id", recruiterId).select().single()

    if (error) {
      throw error
    }

    console.log(`[v0] Updated recruiter ${recruiterId}`)

    return NextResponse.json({
      success: true,
      data: data as Recruiter,
      message: "Recruiter account updated successfully",
    })
  } catch (error) {
    console.error("[v0] Update recruiter error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update recruiter account",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
