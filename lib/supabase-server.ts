import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export async function createServerSupabaseClient() {
  const cookieStore = await cookies()

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.log("[v0] Supabase environment variables not configured, database features will use fallback data")
    throw new Error("Supabase not configured - missing environment variables")
  }

  try {
    const client = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    })

    // Test the connection
    const { error } = await client.from("jobs").select("count", { count: "exact", head: true })
    if (error && error.code !== "PGRST116") {
      // PGRST116 is "table not found" which is OK for initial setup
      console.warn("[v0] Supabase connection test failed:", error.message)
    }

    return client
  } catch (error) {
    console.error("[v0] Failed to create Supabase client:", error)
    throw new Error(`Supabase client creation failed: ${error instanceof Error ? error.message : "Unknown error"}`)
  }
}
