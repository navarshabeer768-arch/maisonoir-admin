import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const STAFF_ROLES = ['founder', 'admin', 'operations_manager', 'marketing_manager', 'customer_support', 'warehouse_staff']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Only protect dashboard and admin routes
  const protectedPaths = ['/dashboard', '/products', '/orders', '/customers', '/inventory', '/marketing', '/staff', '/analytics', '/settings']
  const isProtected = protectedPaths.some(p => pathname.startsWith(p))

  if (!isProtected) {
    return NextResponse.next()
  }

  // If env vars missing, redirect to login
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  const response = NextResponse.next({ request: { headers: request.headers } })

  try {
    // Use SERVICE ROLE KEY to bypass RLS when checking profile
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return request.cookies.getAll() },
          setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            )
          },
        },
      }
    )

    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    // Use service role to fetch profile (bypasses RLS)
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role, is_active')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      console.error('Profile fetch error:', profileError?.message)
      return NextResponse.redirect(new URL('/login?error=profile_not_found', request.url))
    }

    if (!STAFF_ROLES.includes(profile.role)) {
      return NextResponse.redirect(new URL('/login?error=unauthorized', request.url))
    }

    if (!profile.is_active) {
      return NextResponse.redirect(new URL('/login?error=inactive', request.url))
    }

    return response
  } catch (err) {
    console.error('Middleware error:', err)
    return NextResponse.redirect(new URL('/login?error=server_error', request.url))
  }
}

export const config = {
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
