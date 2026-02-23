import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin, isConfigured } from '@/lib/supabase'

const MOCK_ORDER = {
  id: '1',
  tracking_number: 'YE-2024-001234',
  customer_name: 'Juan Pérez',
  customer_email: 'juan@ejemplo.com',
  customer_phone: '+503 7000 1234',
  destination_address: 'Col. Escalón, Calle Principal #123',
  destination_city: 'San Salvador',
  destination_country: 'El Salvador',
  package_description: 'Ropa y accesorios',
  status: 'in_transit_international',
  estimated_delivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
  delivered_at: null,
  created_at: new Date().toISOString(),
}

export async function GET(
  request: NextRequest,
  { params }: { params: { tracking: string } }
) {
  try {
    const tracking = params.tracking.toUpperCase()

    if (!isConfigured) {
      if (tracking.includes('001234') || tracking === 'YE-2024-001234') {
        return NextResponse.json({ order: MOCK_ORDER, history: [] })
      }
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // First try exact match
    let { data: order, error } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq('tracking_number', tracking)
      .maybeSingle()

    // If not found, try partial match
    if (!order) {
      const { data: orders } = await supabaseAdmin
        .from('orders')
        .select('*')
        .ilike('tracking_number', `%${tracking}%`)
        .limit(1)
      
      order = orders?.[0] || null
    }

    if (!order) {
      console.log('Order not found for tracking:', tracking)
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    const { data: history } = await supabaseAdmin
      .from('status_history')
      .select('*')
      .eq('order_id', order.id)
      .order('created_at', { ascending: false })

    return NextResponse.json({ order, history: history || [] })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
