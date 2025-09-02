import { Queue, Worker, type Job as BullJob } from "bullmq"
import { Redis } from "ioredis"
import { GreenhouseConnector } from "@/lib/connectors/greenhouse"
import { createServerSupabaseClient } from "@/lib/supabase-server"

const redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379")

// Job ingestion queue
export const jobIngestionQueue = new Queue("job-ingestion", { connection: redis })

// Email outreach queue
export const outreachQueue = new Queue("outreach", { connection: redis })

// Job processing worker
const jobIngestionWorker = new Worker(
  "job-ingestion",
  async (job: BullJob) => {
    const { connectorType, companyId, apiKey } = job.data

    console.log(`[v0] Processing job ingestion for ${connectorType} company ${companyId}`)

    try {
      let jobs = []

      switch (connectorType) {
        case "greenhouse":
          const greenhouse = new GreenhouseConnector(apiKey)
          jobs = await greenhouse.fetchJobs(companyId)
          break
        default:
          throw new Error(`Unknown connector type: ${connectorType}`)
      }

      // Store jobs in database
      const supabase = createServerSupabaseClient()

      for (const jobData of jobs) {
        const { error } = await supabase.from("jobs").upsert(jobData, { onConflict: "source_id" })

        if (error) {
          console.error("[v0] Error storing job:", error)
        }
      }

      console.log(`[v0] Successfully processed ${jobs.length} jobs`)
      return { processed: jobs.length }
    } catch (error) {
      console.error("[v0] Job ingestion error:", error)
      throw error
    }
  },
  { connection: redis },
)

// Outreach processing worker
const outreachWorker = new Worker(
  "outreach",
  async (job: BullJob) => {
    const { type, recipient, message, jobId } = job.data

    console.log(`[v0] Processing ${type} outreach to ${recipient}`)

    try {
      switch (type) {
        case "email":
          await sendEmail(recipient, message, jobId)
          break
        case "whatsapp":
          await sendWhatsApp(recipient, message, jobId)
          break
        case "sms":
          await sendSMS(recipient, message, jobId)
          break
      }

      // Log outreach attempt
      const supabase = createServerSupabaseClient()
      await supabase.from("outreach_logs").insert({
        type,
        recipient,
        job_id: jobId,
        status: "sent",
        sent_at: new Date().toISOString(),
      })

      return { status: "sent" }
    } catch (error) {
      console.error("[v0] Outreach error:", error)
      throw error
    }
  },
  { connection: redis },
)

async function sendEmail(recipient: string, message: string, jobId: string) {
  // Email implementation using SendGrid/Resend
  console.log(`[v0] Sending email to ${recipient} for job ${jobId}`)
}

async function sendWhatsApp(recipient: string, message: string, jobId: string) {
  // WhatsApp Business API implementation
  console.log(`[v0] Sending WhatsApp to ${recipient} for job ${jobId}`)
}

async function sendSMS(recipient: string, message: string, jobId: string) {
  // SMS implementation using Twilio
  console.log(`[v0] Sending SMS to ${recipient} for job ${jobId}`)
}

export { jobIngestionWorker, outreachWorker }
