import { type NextRequest, NextResponse } from "next/server"
import { constructWebhookEvent } from "@/lib/stripe"
import { createServerSupabaseClient } from "@/lib/supabase-server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get("stripe-signature")

    if (!signature) {
      return NextResponse.json({ error: "Missing stripe signature" }, { status: 400 })
    }

    const event = constructWebhookEvent(body, signature)
    const supabase = createServerSupabaseClient()

    console.log("[v0] Stripe webhook event:", event.type)

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as any
        const { recruiterId, credits, packageType } = session.metadata

        if (!recruiterId || !credits) {
          console.error("[v0] Missing metadata in webhook:", session.metadata)
          break
        }

        // Update payment log
        await supabase
          .from("payment_logs")
          .update({
            status: "completed",
            stripe_payment_intent_id: session.payment_intent,
            completed_at: new Date().toISOString(),
          })
          .eq("stripe_session_id", session.id)

        // Add credits to recruiter
        const { data: recruiter } = await supabase.from("recruiters").select("credits").eq("id", recruiterId).single()

        const newCredits = (recruiter?.credits || 0) + Number.parseInt(credits)

        await supabase
          .from("recruiters")
          .update({
            credits: newCredits,
            updated_at: new Date().toISOString(),
          })
          .eq("id", recruiterId)

        console.log(`[v0] Added ${credits} credits to recruiter ${recruiterId}. New total: ${newCredits}`)
        break
      }

      case "checkout.session.expired":
      case "payment_intent.payment_failed": {
        const session = event.data.object as any

        await supabase
          .from("payment_logs")
          .update({
            status: "failed",
            completed_at: new Date().toISOString(),
          })
          .eq("stripe_session_id", session.id)

        console.log("[v0] Payment failed or expired:", session.id)
        break
      }

      default:
        console.log("[v0] Unhandled webhook event:", event.type)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("[v0] Webhook error:", error)
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 })
  }
}
