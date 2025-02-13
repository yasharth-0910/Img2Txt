import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Force dynamic rendering for all routes
  const headers = new Headers(request.headers)
  headers.set('x-middleware-cache', 'no-cache')
  
  return NextResponse.next({
    request: {
      headers,
    },
  })
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
} 