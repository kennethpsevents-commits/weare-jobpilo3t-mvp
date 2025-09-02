import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase-server"
import type { UserProfile } from "@/lib/types"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("user_id")

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          error: "user_id is required",
        },
        { status: 400 },
      )
    }

    const supabase = await createServerSupabaseClient()
    const { data, error } = await supabase.from("user_profiles").select("*").eq("id", userId).single()

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json(
          {
            success: false,
            error: "User profile not found",
          },
          { status: 404 },
        )
      }
      throw error
    }

    return NextResponse.json({
      success: true,
      data: data as UserProfile,
    })
  } catch (error) {
    console.error("[v0] Get user profile error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to get user profile",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const profileData = await request.json()

    const userProfile: Omit<UserProfile, "id" | "createdAt" | "updatedAt"> = {
      skills: profileData.skills || [],
      experience: profileData.experience || 0,
      preferredLocations: profileData.preferredLocations || [],
      preferredType: profileData.preferredType || "On-site",
      preferredBranches: profileData.preferredBranches || [],
      salaryExpectation: profileData.salaryExpectation,
      languages: profileData.languages || ["en"],
      cv: profileData.cv,
    }

    const supabase = await createServerSupabaseClient()
    const { data, error } = await supabase
      .from("user_profiles")
      .insert({
        ...userProfile,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    console.log(`[v0] Created user profile with ${userProfile.skills.length} skills`)

    return NextResponse.json({
      success: true,
      data: data as UserProfile,
      message: "User profile created successfully",
    })
  } catch (error) {
    console.error("[v0] Create user profile error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create user profile",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("user_id")
    const profileData = await request.json()

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          error: "user_id is required",
        },
        { status: 400 },
      )
    }

    const updateData = {
      skills: profileData.skills,
      experience: profileData.experience,
      preferred_locations: profileData.preferredLocations,
      preferred_type: profileData.preferredType,
      preferred_branches: profileData.preferredBranches,
      salary_expectation: profileData.salaryExpectation,
      languages: profileData.languages,
      cv: profileData.cv,
      updated_at: new Date().toISOString(),
    }

    // Remove undefined values
    Object.keys(updateData).forEach((key) => {
      if (updateData[key as keyof typeof updateData] === undefined) {
        delete updateData[key as keyof typeof updateData]
      }
    })

    const supabase = await createServerSupabaseClient()
    const { data, error } = await supabase.from("user_profiles").update(updateData).eq("id", userId).select().single()

    if (error) {
      throw error
    }

    console.log(`[v0] Updated user profile ${userId}`)

    return NextResponse.json({
      success: true,
      data: data as UserProfile,
      message: "User profile updated successfully",
    })
  } catch (error) {
    console.error("[v0] Update user profile error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update user profile",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("user_id")

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          error: "user_id is required",
        },
        { status: 400 },
      )
    }

    const supabase = await createServerSupabaseClient()
    const { error } = await supabase.from("user_profiles").delete().eq("id", userId)

    if (error) {
      throw error
    }

    console.log(`[v0] Deleted user profile ${userId}`)

    return NextResponse.json({
      success: true,
      message: "User profile deleted successfully",
    })
  } catch (error) {
    console.error("[v0] Delete user profile error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete user profile",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
