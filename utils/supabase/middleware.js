import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import { returnPath } from '@/lib/returnPath'

export async function updateSession(request) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set({
            name, 
            value,
            ...options,
            sameSite: 'lax',
            secure: process.env.NODE_ENV === 'production'
          }))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set({
              name, 
              value, 
              ...options,
              sameSite: 'lax',
              secure: process.env.NODE_ENV === 'production'
            })
          )
        },
      },
    }
  )

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Ochrona ścieżek zaczynających się od /dashboard
  if (request.nextUrl.pathname.startsWith('/dashboard') && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    if (request.nextUrl.pathname === '/dashboard/ogloszenia') {
      url.searchParams.set('returnTo', '/dashboard/ogloszenia')
    }
    return NextResponse.redirect(url)
  }

  // Ochrona ścieżek zaczynających się od /admin
  if (request.nextUrl.pathname.startsWith('/admin')) {
    if (!user) {
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      return NextResponse.redirect(url)
    }

    // Sprawdź rolę
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      const url = request.nextUrl.clone()
      url.pathname = '/dashboard'
      return NextResponse.redirect(url)
    }
  }

  // Przekierowanie zalogowanych z /login do /dashboard
  if (request.nextUrl.pathname === '/login' && user) {
    return NextResponse.redirect(new URL(returnPath(request.nextUrl.searchParams.get('returnTo')), request.url))
  }

  return supabaseResponse
}
