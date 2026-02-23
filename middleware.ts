import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const SESSION_SECRET = process.env.SESSION_SECRET || 'ye-default-secret-change-in-production-2024'

// HMAC-SHA256 using Web Crypto API (Edge Runtime compatible)
async function hmacSha256(key: string, message: string): Promise<string> {
  const encoder = new TextEncoder()
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    encoder.encode(key),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  const signature = await crypto.subtle.sign('HMAC', cryptoKey, encoder.encode(message))
  return Array.from(new Uint8Array(signature))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

// Verify session in middleware (Edge Runtime compatible)
async function verifySessionToken(token: string) {
  try {
    const [payload, signature] = token.split('.')
    if (!payload || !signature) return null

    const expectedSignature = await hmacSha256(SESSION_SECRET, payload)

    if (signature.length !== expectedSignature.length) return null
    let mismatch = 0
    for (let i = 0; i < signature.length; i++) {
      mismatch |= signature.charCodeAt(i) ^ expectedSignature.charCodeAt(i)
    }
    if (mismatch !== 0) return null

    const data = JSON.parse(atob(payload))

    if (data.exp < Date.now()) return null
    return data
  } catch {
    return null
  }
}

export async function middleware(request: NextRequest) {
  const sessionCookie = request.cookies.get('session')
  const { pathname } = request.nextUrl

  // Protected routes
  const adminRoutes = ['/admin']
  const driverRoutes = ['/driver']
  const protectedRoutes = [...adminRoutes, ...driverRoutes]

  // Check if current path is protected
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))

  if (!isProtectedRoute) {
    return NextResponse.next()
  }

  // No session - redirect to login
  if (!sessionCookie) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Verify signed session
  const sessionData = await verifySessionToken(sessionCookie.value)

  if (!sessionData) {
    const response = NextResponse.redirect(new URL('/login', request.url))
    response.cookies.delete('session')
    return response
  }

  const userRole = sessionData.role

  // Check role-based access
  const isAdminRoute = adminRoutes.some(route => pathname.startsWith(route))
  const isDriverRoute = driverRoutes.some(route => pathname.startsWith(route))

  // Admin can access everything
  if (userRole === 'admin') {
    return NextResponse.next()
  }

  // Driver can only access driver routes
  if (userRole === 'driver' && isDriverRoute) {
    return NextResponse.next()
  }

  // Driver trying to access admin routes
  if (userRole === 'driver' && isAdminRoute) {
    return NextResponse.redirect(new URL('/driver', request.url))
  }

  // Customer trying to access protected routes
  if (userRole === 'customer') {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/driver/:path*'],
}
