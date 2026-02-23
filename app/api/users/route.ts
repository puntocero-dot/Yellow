import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin, isConfigured } from '@/lib/supabase'
import { getSession, hasRole } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    // Require admin authentication
    const session = await getSession()
    if (!session || !hasRole(session, 'admin')) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    if (!isConfigured) {
      return NextResponse.json({ users: [] })
    }

    const { searchParams } = new URL(request.url)
    const role = searchParams.get('role')

    let query = supabaseAdmin
      .from('users')
      .select('id, email, full_name, phone, role, is_active, created_at')
      .order('created_at', { ascending: false })

    if (role) {
      query = query.eq('role', role)
    }

    const { data: users, error } = await query

    if (error) {
      console.error('Error fetching users:', error)
      return NextResponse.json({ error: 'Error fetching users' }, { status: 500 })
    }

    return NextResponse.json({ users })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // Only admin can create users
    const session = await getSession()
    if (!session || !hasRole(session, 'admin')) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { email, full_name, phone, role } = body

    if (!email || !full_name) {
      return NextResponse.json({ error: 'Email y nombre son requeridos' }, { status: 400 })
    }

    if (!isConfigured) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 503 })
    }

    const { data: user, error } = await supabaseAdmin
      .from('users')
      .insert({ email, full_name, phone, role: role || 'customer' })
      .select()
      .single()

    if (error) {
      console.error('Error creating user:', error)
      if (error.code === '23505') {
        return NextResponse.json({ error: 'El email ya está registrado' }, { status: 400 })
      }
      return NextResponse.json({ error: 'Error al crear usuario' }, { status: 500 })
    }

    return NextResponse.json({ user }, { status: 201 })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
