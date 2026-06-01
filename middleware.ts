import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const STAFF_ROLES = ['founder', 'admin', 'operations_manager', 'marketing_manager', 'customer_support', 'warehouse_staff']

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const pathname = request.nextUrl.pathname

  if (pathname === '/login') {
    if (user) {
      // Check if staff
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      if (profile && STAFF_ROLES.includes(profile.role)) {
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }
    }
    return response
  }

  // All other routes require staff auth
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

  // Log admin access
  await supabase.from('audit_logs').insert({
    profile_id: user.id,
    action: 'page_access',
    table_name: 'admin_access',
    new_values: { path: pathname, method: request.method },
    ip_address: request.ip ?? request.headers.get('x-forwarded-for'),
    user_agent: request.headers.get('user-agent'),
  })

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api).*)'],
}
