import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"
import createIntlMiddleware from "next-intl/middleware"
import { locales } from "./i18n"

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // Handle internationalization first
  const intlMiddleware = createIntlMiddleware({
    locales,
    defaultLocale: "en",
    localePrefix: "as-needed",
  })

  // Apply i18n middleware
  const intlResponse = intlMiddleware(request)
  if (intlResponse) {
    response = intlResponse
  }

  // Skip auth check for public routes
  const publicRoutes = ["/", "/login", "/api/auth", "/api/webhook"]
  const isPublicRoute = publicRoutes.some(
    (route) =>
      request.nextUrl.pathname === route ||
      request.nextUrl.pathname.startsWith("/api/auth") ||
      request.nextUrl.pathname.startsWith("/_next") ||
      request.nextUrl.pathname.startsWith("/favicon"),
  )

  if (isPublicRoute) {
    return response
  }

  // Check authentication for protected routes
  const protectedRoutes = ["/dashboard", "/admin", "/recruiter"]
  const isProtectedRoute = protectedRoutes.some((route) => request.nextUrl.pathname.startsWith(route))

  if (isProtectedRoute) {
    try {
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            getAll() {
              return request.cookies.getAll()
            },
            setAll(cookiesToSet) {
              cookiesToSet.forEach(({ name, value, options }) => {
                response.cookies.set(name, value, options)
              })
            },
          },
        },
      )

      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        // Redirect to login if not authenticated
        const redirectUrl = new URL("/login", request.url)
        redirectUrl.searchParams.set("redirect", request.nextUrl.pathname)
        return NextResponse.redirect(redirectUrl)
      }

      // Check role-based access
      if (request.nextUrl.pathname.startsWith("/admin")) {
        const { data: profile } = await supabase.from("user_profiles").select("role").eq("id", user.id).single()

        if (profile?.role !== "admin") {
          return NextResponse.redirect(new URL("/dashboard", request.url))
        }
      }

      if (request.nextUrl.pathname.startsWith("/recruiter")) {
        const { data: profile } = await supabase.from("user_profiles").select("role").eq("id", user.id).single()

        if (profile?.role !== "recruiter" && profile?.role !== "admin") {
          return NextResponse.redirect(new URL("/dashboard", request.url))
        }
      }
    } catch (error) {
      console.error("[v0] Auth middleware error:", error)
      return NextResponse.redirect(new URL("/login", request.url))
    }
  }

  return response
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
}
