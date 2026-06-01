import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const STAFF_ROLES = ['founder', 'admin', 'operations_manager', 'marketing_manager', 'customer_support', 'warehouse_staff']

const PUBLIC_PATHS = ['/login', '/_next', '/favicon', '/icon', '/api']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Always allow public paths — no redirect loop possible
  if (PUBLIC_PATHS.some(p => pathname.startsWith(p))) {
    return NextResponse.next()
  }

  // If Supabase env vars not set, just allow through (prevents crash)
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  const response = NextResponse.next({ request: { headers: request.headers } })

  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          getAll() { return request.cookies.getAll() },
          setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
            cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
          },
        },
      }
    )

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role, is_active')
      .eq('id', user.id)
      .single()

    if (!profile || !STAFF_ROLES.includes(profile.role) || !profile.is_active) {
      return NextResponse.redirect(new URL('/login?error=unauthorized', request.url))
    }

    return response
  } catch {
    // On any error, redirect to login safely
    return NextResponse.redirect(new URL('/login', request.url))
  }
}

export const config = {
  // Only run on actual app routes, never on login or static files
  matcher: [
    '/dashboard/:path*',
    '/products/:path*',
    '/orders/:path*',
    '/customers/:path*',
    '/inventory/:path*',
    '/marketing/:path*',
    '/staff/:path*',
    '/analytics/:path*',
    '/settings/:path*',
  ],
}
