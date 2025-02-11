import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { withAuth } from "next-auth/middleware"
// Correct the import statement for NextMiddleware
import NextMiddleware from "next-auth/middleware"

// Middleware function to handle CSP headers
function middleware(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64')
  const cspHeader = `
    default-src 'self';
    script-src 'self' 'unsafe-eval' 'unsafe-inline' https: blob:;
    style-src 'self' 'unsafe-inline';
    img-src 'self' blob: data: https:;
    font-src 'self';
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
    worker-src 'self' blob: https:;
    connect-src 'self' https: blob: data:;
    media-src 'self' blob:;
  `.replace(/\s{2,}/g, ' ').trim()

  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-nonce', nonce)

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })

  response.headers.set(
    'Content-Security-Policy',
    cspHeader
  )

  // Add Cross-Origin-Isolation headers
  response.headers.set('Cross-Origin-Opener-Policy', 'same-origin')
  response.headers.set('Cross-Origin-Embedder-Policy', 'require-corp')
  response.headers.set('Cross-Origin-Resource-Policy', 'cross-origin')

  return response
}

// Export the middleware with proper typing
export default withAuth(middleware as NextMiddleware, {
  callbacks: {
    authorized: ({ token }) => !!token
  },
  pages: {
    signIn: '/auth/signin'
  }
})

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - tesseract (tesseract worker files)
     */
    {
      source: '/((?!api|_next/static|_next/image|favicon.ico|tesseract).*)',
      missing: [
        { type: 'header', key: 'next-router-prefetch' },
        { type: 'header', key: 'purpose', value: 'prefetch' },
      ],
    },
    "/settings",
    "/dashboard",
    "/api/conversions/:path*",
    "/admin/:path*"
  ],
}