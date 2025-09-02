import { type NextRequest, NextResponse } from "next/server"

interface EmployerLead {
  companyName: string
  contactName: string
  email: string
  phone?: string
  jobTitle: string
  jobDescription: string
  requirements: string
  location: string
  type: "Remote" | "On-site" | "Hybrid"
  salary?: string
  urgency: "Low" | "Medium" | "High"
  message?: string
}

export async function POST(request: NextRequest) {
  try {
    const leadData: EmployerLead = await request.json()

    // Validate required fields
    const requiredFields = [
      "companyName",
      "contactName",
      "email",
      "jobTitle",
      "jobDescription",
      "requirements",
      "location",
      "type",
    ]
    const missingFields = requiredFields.filter((field) => !leadData[field as keyof EmployerLead])

    if (missingFields.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: `Missing required fields: ${missingFields.join(", ")}`,
        },
        { status: 400 },
      )
    }

    // Create lead record
    const lead = {
      id: `lead-${Date.now()}`,
      ...leadData,
      status: "new",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    // In a real implementation, you would:
    // 1. Save to database
    // 2. Send notification email
    // 3. Integrate with CRM
    // 4. Send Slack notification (if configured)

    console.log("[Employer Lead] New lead received:", {
      company: leadData.companyName,
      contact: leadData.contactName,
      email: leadData.email,
      jobTitle: leadData.jobTitle,
      urgency: leadData.urgency,
    })

    // Mock Slack webhook (optional)
    if (process.env.SLACK_WEBHOOK_URL) {
      try {
        const slackMessage = {
          text: `🚀 New Employer Lead: ${leadData.companyName}`,
          blocks: [
            {
              type: "section",
              text: {
                type: "mrkdwn",
                text: `*New Employer Lead Received*\n\n*Company:* ${leadData.companyName}\n*Contact:* ${leadData.contactName}\n*Email:* ${leadData.email}\n*Job Title:* ${leadData.jobTitle}\n*Location:* ${leadData.location}\n*Type:* ${leadData.type}\n*Urgency:* ${leadData.urgency}`,
              },
            },
          ],
        }

        await fetch(process.env.SLACK_WEBHOOK_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(slackMessage),
        })
      } catch (slackError) {
        console.error("Failed to send Slack notification:", slackError)
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        leadId: lead.id,
        status: "received",
        estimatedResponseTime: "24 hours",
      },
      message: "Thank you for your interest! We'll contact you within 24 hours.",
    })
  } catch (error) {
    console.error("Employer Lead Error:", error)
    return NextResponse.json({ success: false, error: "Failed to submit lead" }, { status: 500 })
  }
}
