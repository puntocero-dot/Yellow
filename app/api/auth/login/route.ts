import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin, isConfigured } from '@/lib/supabase'
import { cookies } from 'next/headers'
import bcrypt from 'bcryptjs'
import { signSession } from '@/lib/auth'

// Fallback users (only used when Supabase is not configured)
// Passwords are bcrypt hashed
const FALLBACK_USERS = [
  { 
    id: '1', 
    email: 'admin@theyellowexpress.com', 
    // Hash generated with bcrypt.hashSync('YellowAdmin2026!', 10)
    password_hash: '$2a$10$placeholder',
    full_name: 'Admin Yellow Express', 
    role: 'admin',
    phone: '+1 323 555 0100'
  },
  { 
    id: '2', 
    email: 'driver1@theyellowexpress.com', 
    password_hash: '$2a$10$placeholder',
    full_name: 'Carlos Martínez', 
    role: 'driver',
    phone: '+503 7890 1234'
  },
  { 
    id: '3', 
    email: 'driver2@theyellowexpress.com', 
    password_hash: '$2a$10$placeholder',
    full_name: 'María López', 
    role: 'driver',
    phone: '+503 7890 5678'
  },
]

// Generate hashes on first load
let hashesGenerated = false
async function ensureHashes() {
  if (hashesGenerated) return
  FALLBACK_USERS[0].password_hash = await bcrypt.hash('YellowAdmin2026!', 10)
  FALLBACK_USERS[1].password_hash = await bcrypt.hash('YellowDriver2026!', 10)
  FALLBACK_USERS[2].password_hash = await bcrypt.hash('YellowDriver2026!', 10)
  hashesGenerated = true
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email y contraseña son requeridos' },
        { status: 400 }
      )
    }

    // Rate limit: basic delay to slow brute force
    await new Promise(resolve => setTimeout(resolve, 500))

    let user = null

    if (isConfigured) {
      // Check database users with bcrypt
      const { data: dbUser, error } = await supabaseAdmin
        .from('users')
        .select('*')
        .eq('email', email.toLowerCase())
        .single()

      if (dbUser && !error && dbUser.password_hash) {
        const passwordValid = await bcrypt.compare(password, dbUser.password_hash)
        if (passwordValid) {
          user = {
            id: dbUser.id,
            email: dbUser.email,
            full_name: dbUser.full_name,
            role: dbUser.role,
            phone: dbUser.phone,
          }
        }
      }
    } else {
      // Fallback users only when Supabase is not configured
      await ensureHashes()
      const fallbackUser = FALLBACK_USERS.find(
        u => u.email.toLowerCase() === email.toLowerCase()
      )
      if (fallbackUser) {
        const passwordValid = await bcrypt.compare(password, fallbackUser.password_hash)
        if (passwordValid) {
          user = {
            id: fallbackUser.id,
            email: fallbackUser.email,
            full_name: fallbackUser.full_name,
            role: fallbackUser.role,
            phone: fallbackUser.phone,
          }
        }
      }
    }

    if (!user) {
      return NextResponse.json(
        { error: 'Credenciales inválidas' },
        { status: 401 }
      )
    }

    // Create signed session token (HMAC-SHA256)
    const sessionToken = signSession({
      userId: user.id,
      email: user.email,
      role: user.role,
      fullName: user.full_name,
      exp: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
    })

    // Set secure cookie
    const cookieStore = await cookies()
    cookieStore.set('session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60, // 24 hours
      path: '/',
    })

    return NextResponse.json({ 
      success: true, 
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
      }
    })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
