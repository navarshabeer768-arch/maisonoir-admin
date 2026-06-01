import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const protectedPaths = ['/dashboard', '/products', '/orders', '/customers', '/inventory', '/marketing', '/staff', '/analytics', '/settings']
  const isProtected = protectedPaths.some(p => pathname.startsWith(p))

  if (!isProtected) return NextResponse.next()
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  const response = NextResponse.next({ request: { headers: request.headers } })

  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
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

    const { data: { user } } = await supabase.auth.getUser()

    // Only check if logged in — role check done in each page
    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    return response
  } catch {
    return NextResponse.redirect(new URL('/login', request.url))
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
