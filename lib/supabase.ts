let supabase: any = null

export function getSupabaseClient() {
  // Return null if environment variables are not set
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.log("[v0] Supabase environment variables not configured")
    return null
  }

  if (!supabase) {
    try {
      const { createBrowserClient } = require("@supabase/ssr")
      supabase = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
    } catch (error) {
      console.error("[v0] Failed to create Supabase client:", error)
      return null
    }
  }
  return supabase
}

export { supabase }
