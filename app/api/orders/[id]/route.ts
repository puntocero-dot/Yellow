import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { sendOrderStatusNotification } from '@/lib/notifications'
import { getSession, hasRole } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Require authentication
    const session = await getSession()
    if (!session || !hasRole(session, 'admin', 'driver')) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { data: order, error } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq('id', params.id)
      .single()

    if (error || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    return NextResponse.json({ order })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Require admin or driver role
    const session = await getSession()
    if (!session || !hasRole(session, 'admin', 'driver')) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { 
      status, 
      driver_id, 
      delivery_notes, 
      weight_pounds,
      quantity,
      unit_price,
      shipping_fee,
      price_per_pound,
      customer_name,
      customer_email,
      customer_phone,
      destination_address,
      destination_city,
      package_description,
      shipping_cost,
    } = body

    const updateData: Record<string, unknown> = {}
    
    if (status) {
      updateData.status = status
      if (status === 'delivered') {
        updateData.delivered_at = new Date().toISOString()
      }
    }
    
    if (driver_id !== undefined) {
      updateData.driver_id = driver_id
    }
    
    if (delivery_notes) {
      updateData.delivery_notes = delivery_notes
    }

    if (weight_pounds !== undefined) {
      updateData.weight_pounds = weight_pounds === '' || weight_pounds === null ? null : parseFloat(weight_pounds)
    }
    
    if (quantity !== undefined && quantity !== null) updateData.quantity = parseInt(String(quantity))
    if (unit_price !== undefined && unit_price !== null) updateData.unit_price = parseFloat(String(unit_price))
    if (shipping_fee !== undefined && shipping_fee !== null) updateData.shipping_fee = parseFloat(String(shipping_fee))
    if (price_per_pound !== undefined && price_per_pound !== null) updateData.price_per_pound = parseFloat(String(price_per_pound))
    if (customer_name !== undefined) updateData.customer_name = customer_name
    if (customer_email !== undefined) updateData.customer_email = customer_email
    if (customer_phone !== undefined) updateData.customer_phone = customer_phone
    if (destination_address !== undefined) updateData.destination_address = destination_address
    if (destination_city !== undefined) updateData.destination_city = destination_city
    if (package_description !== undefined) updateData.package_description = package_description
    if (shipping_cost !== undefined && shipping_cost !== null) updateData.shipping_cost = parseFloat(String(shipping_cost))

    const { data: order, error } = await supabaseAdmin
      .from('orders')
      .update(updateData)
      .eq('id', params.id)
      .select()
      .single()

    if (error) {
      console.error('Error updating order:', error)
      return NextResponse.json({ error: 'Error updating order' }, { status: 500 })
    }

    // Send notifications on status change
    if (status && order) {
      try {
        await sendOrderStatusNotification(order)
      } catch (notifError) {
        console.error('Error sending notification:', notifError)
      }
    }

    return NextResponse.json({ order })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Only admin can delete orders
    const session = await getSession()
    if (!session || !hasRole(session, 'admin')) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { error } = await supabaseAdmin
      .from('orders')
      .delete()
      .eq('id', params.id)

    if (error) {
      console.error('Error deleting order:', error)
      return NextResponse.json({ error: 'Error deleting order' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
