import { type NextRequest, NextResponse } from "next/server"
import { createCheckoutSession, STRIPE_CONFIG } from "@/lib/stripe"
import { createServerSupabaseClient } from "@/lib/supabase-server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { packageType, recruiterId, returnUrl } = body

    if (!packageType || !recruiterId) {
      return NextResponse.json({ error: "Package type and recruiter ID are required" }, { status: 400 })
    }

    const creditPackage = STRIPE_CONFIG.CREDIT_PACKAGES[packageType as keyof typeof STRIPE_CONFIG.CREDIT_PACKAGES]
    if (!creditPackage) {
      return NextResponse.json({ error: "Invalid package type" }, { status: 400 })
    }

    const supabase = createServerSupabaseClient()

    // Verify recruiter exists
    const { data: recruiter, error: recruiterError } = await supabase
      .from("recruiters")
      .select("id, company, email")
      .eq("id", recruiterId)
      .single()

    if (recruiterError || !recruiter) {
      return NextResponse.json({ error: "Recruiter not found" }, { status: 404 })
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://www.wearejobpilot.com"
    const successUrl = `${baseUrl}/recruiter/payment-success?session_id={CHECKOUT_SESSION_ID}`
    const cancelUrl = returnUrl || `${baseUrl}/recruiter`

    const session = await createCheckoutSession(
      {
        currency: STRIPE_CONFIG.CURRENCY,
        product_data: {
          name: creditPackage.name,
          description: `${creditPackage.credits} job posting credits for JobPilot`,
        },
        unit_amount: creditPackage.price,
      },
      successUrl,
      cancelUrl,
      {
        recruiterId: recruiterId.toString(),
        packageType,
        credits: creditPackage.credits.toString(),
        company: recruiter.company,
      },
    )

    // Log payment attempt
    await supabase.from("payment_logs").insert({
      recruiter_id: recruiterId,
      stripe_session_id: session.id,
      amount: creditPackage.price,
      credits: creditPackage.credits,
      status: "pending",
      package_type: packageType,
    })

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
      amount: creditPackage.price,
      credits: creditPackage.credits,
    })
  } catch (error) {
    console.error("[v0] Payment checkout error:", error)
    return NextResponse.json(
      {
        error: "Failed to create checkout session",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
