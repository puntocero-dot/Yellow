import { createHmac } from 'crypto'
import { cookies } from 'next/headers'

const SESSION_SECRET = process.env.SESSION_SECRET || 'ye-default-secret-change-in-production-2024'

export interface SessionData {
  userId: string
  email: string
  role: string
  fullName: string
  exp: number
}

// Sign session data with HMAC to prevent forgery
export function signSession(data: SessionData): string {
  const payload = Buffer.from(JSON.stringify(data)).toString('base64')
  const signature = createHmac('sha256', SESSION_SECRET)
    .update(payload)
    .digest('hex')
  return `${payload}.${signature}`
}

// Verify and decode session token
export function verifySession(token: string): SessionData | null {
  try {
    const [payload, signature] = token.split('.')
    if (!payload || !signature) return null

    const expectedSignature = createHmac('sha256', SESSION_SECRET)
      .update(payload)
      .digest('hex')

    // Timing-safe comparison
    if (signature.length !== expectedSignature.length) return null
    let mismatch = 0
    for (let i = 0; i < signature.length; i++) {
      mismatch |= signature.charCodeAt(i) ^ expectedSignature.charCodeAt(i)
    }
    if (mismatch !== 0) return null

    const data: SessionData = JSON.parse(
      Buffer.from(payload, 'base64').toString('utf-8')
    )

    // Check expiration
    if (data.exp < Date.now()) return null

    return data
  } catch {
    return null
  }
}

// Get current session from cookies (for API routes)
export async function getSession(): Promise<SessionData | null> {
  try {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get('session')
    if (!sessionCookie) return null
    return verifySession(sessionCookie.value)
  } catch {
    return null
  }
}

// Check if user has required role
export function hasRole(session: SessionData | null, ...roles: string[]): boolean {
  if (!session) return false
  return roles.includes(session.role)
}
