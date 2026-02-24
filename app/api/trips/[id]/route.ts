import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getSession } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getSession()
  if (!session || !['admin', 'supervisor'].includes(session.role)) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  try {
    const { id } = params

    // Get trip
    const { data: trip, error: tripError } = await supabaseAdmin
      .from('trips')
      .select('*')
      .eq('id', id)
      .single()

    if (tripError) throw tripError

    // Get expenses for this trip
    const { data: expenses } = await supabaseAdmin
      .from('trip_expenses')
      .select('*')
      .eq('trip_id', id)
      .order('created_at', { ascending: false })

    // Get orders assigned to this trip
    const { data: orders } = await supabaseAdmin
      .from('orders')
      .select('id, tracking_number, customer_name, customer_phone, destination_city, status, weight_pounds, created_at')
      .eq('trip_id', id)
      .order('created_at', { ascending: false })

    return NextResponse.json({
      trip,
      expenses: expenses || [],
      orders: orders || [],
    })
  } catch (error) {
    console.error('Error fetching trip:', error)
    return NextResponse.json({ error: 'Error al obtener viaje' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getSession()
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  try {
    const { id } = params
    const body = await request.json()

    const updateData: Record<string, unknown> = {}
    if (body.name !== undefined) updateData.name = body.name
    if (body.departure_date !== undefined) updateData.departure_date = body.departure_date
    if (body.return_date !== undefined) updateData.return_date = body.return_date
    if (body.origin !== undefined) updateData.origin = body.origin
    if (body.destination !== undefined) updateData.destination = body.destination
    if (body.status !== undefined) updateData.status = body.status
    if (body.notes !== undefined) updateData.notes = body.notes

    const { data, error } = await supabaseAdmin
      .from('trips')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return NextResponse.json({ trip: data })
  } catch (error) {
    console.error('Error updating trip:', error)
    return NextResponse.json({ error: 'Error al actualizar viaje' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getSession()
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  try {
    const { id } = params

    // Unassign orders from this trip first
    await supabaseAdmin
      .from('orders')
      .update({ trip_id: null })
      .eq('trip_id', id)

    const { error } = await supabaseAdmin
      .from('trips')
      .delete()
      .eq('id', id)

    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting trip:', error)
    return NextResponse.json({ error: 'Error al eliminar viaje' }, { status: 500 })
  }
}
