import Stripe from "stripe"

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is not set")
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-06-20",
})

export const STRIPE_CONFIG = {
  JOB_POSTING_PRICE: 5000, // €50.00 in cents
  CURRENCY: "eur",
  CREDIT_PACKAGES: {
    STARTER: { credits: 1, price: 5000, name: "Single Job Post" }, // €50
    PROFESSIONAL: { credits: 5, price: 22500, name: "Professional Pack" }, // €225 (10% discount)
    ENTERPRISE: { credits: 20, price: 80000, name: "Enterprise Pack" }, // €800 (20% discount)
  },
}

export async function createPaymentIntent(amount: number, currency = "eur", metadata: Record<string, string> = {}) {
  return await stripe.paymentIntents.create({
    amount,
    currency,
    metadata,
    automatic_payment_methods: {
      enabled: true,
    },
  })
}

export async function createCheckoutSession(
  priceData: {
    currency: string
    product_data: {
      name: string
      description?: string
    }
    unit_amount: number
  },
  successUrl: string,
  cancelUrl: string,
  metadata: Record<string, string> = {},
) {
  return await stripe.checkout.sessions.create({
    payment_method_types: ["card", "ideal", "bancontact"],
    line_items: [
      {
        price_data: priceData,
        quantity: 1,
      },
    ],
    mode: "payment",
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata,
  })
}

export async function retrievePaymentIntent(paymentIntentId: string) {
  return await stripe.paymentIntents.retrieve(paymentIntentId)
}

export async function constructWebhookEvent(body: string, signature: string) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  if (!webhookSecret) {
    throw new Error("STRIPE_WEBHOOK_SECRET is not set")
  }

  return stripe.webhooks.constructEvent(body, signature, webhookSecret)
}
