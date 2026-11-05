import { updateSession } from '@/utils/supabase/middleware'

export async function proxy(request) {
  return await updateSession(request)
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/admin/:path*',
    '/login',
  ],
}
