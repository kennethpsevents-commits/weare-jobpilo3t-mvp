export async function createServerSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.log("[v0] Supabase environment variables not configured, database features will use fallback data")
    return null
  }

  try {
    const { createServerClient } = require("@supabase/ssr")
    const { cookies } = require("next/headers")

    const cookieStore = await cookies()

    const client = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet: any[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
          } catch {
            // Server Component context - can be ignored
          }
        },
      },
    })

    return client
  } catch (error) {
    console.error("[v0] Failed to create Supabase server client:", error)
    return null
  }
}
