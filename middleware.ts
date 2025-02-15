import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Force dynamic rendering for specific routes
  const dynamicRoutes = [
    '/admin',
    '/dashboard',
    '/settings',
    '/auth/signin',
    '/payment/status'
  ]

  if (dynamicRoutes.some(route => request.nextUrl.pathname.startsWith(route))) {
    const headers = new Headers(request.headers)
    headers.set('x-middleware-cache', 'no-cache')
    
    return NextResponse.next({
      request: {
        headers,
      },
    })
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
} 