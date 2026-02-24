import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getSession } from '@/lib/auth'

// Assign orders to a trip
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getSession()
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { order_ids, weight_pounds } = body

    if (!order_ids || !Array.isArray(order_ids)) {
      return NextResponse.json({ error: 'order_ids requerido' }, { status: 400 })
    }

    // Update orders with trip_id
    for (const orderId of order_ids) {
      const updateData: Record<string, unknown> = { trip_id: params.id }
      if (weight_pounds?.[orderId]) {
        updateData.weight_pounds = parseFloat(weight_pounds[orderId])
      }
      await supabaseAdmin
        .from('orders')
        .update(updateData)
        .eq('id', orderId)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error assigning orders:', error)
    return NextResponse.json({ error: 'Error al asignar pedidos' }, { status: 500 })
  }
}

// Update weight for an order in a trip
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getSession()
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { order_id, weight_pounds } = body

    if (!order_id) {
      return NextResponse.json({ error: 'order_id requerido' }, { status: 400 })
    }

    const { error } = await supabaseAdmin
      .from('orders')
      .update({ weight_pounds: parseFloat(weight_pounds) || 0 })
      .eq('id', order_id)
      .eq('trip_id', params.id)

    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating order weight:', error)
    return NextResponse.json({ error: 'Error al actualizar peso' }, { status: 500 })
  }
}
