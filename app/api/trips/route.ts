import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getSession } from '@/lib/auth'

export async function GET(request: NextRequest) {
  const session = await getSession()
  if (!session || !['admin', 'supervisor'].includes(session.role)) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  try {
    const { data, error } = await supabaseAdmin
      .from('trips')
      .select('*')
      .order('departure_date', { ascending: false })

    if (error) throw error
    return NextResponse.json({ trips: data || [] })
  } catch (error) {
    console.error('Error fetching trips:', error)
    return NextResponse.json({ error: 'Error al obtener viajes' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const session = await getSession()
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { name, departure_date, return_date, origin, destination, notes } = body

    if (!name || !departure_date) {
      return NextResponse.json({ error: 'Nombre y fecha de salida son requeridos' }, { status: 400 })
    }

    const { data, error } = await supabaseAdmin
      .from('trips')
      .insert({
        name,
        departure_date,
        return_date: return_date || null,
        origin: origin || 'Los Angeles',
        destination: destination || 'San Salvador',
        notes: notes || null,
        status: 'planned',
      })
      .select()
      .single()

    if (error) throw error
    return NextResponse.json({ trip: data })
  } catch (error) {
    console.error('Error creating trip:', error)
    return NextResponse.json({ error: 'Error al crear viaje' }, { status: 500 })
  }
}
