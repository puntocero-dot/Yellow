import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin, isConfigured } from '@/lib/supabase'
import { getSession, hasRole } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    // Require authentication
    const session = await getSession()
    if (!session || !hasRole(session, 'admin', 'driver')) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    if (!isConfigured) {
      return NextResponse.json({ orders: [] })
    }

    const { searchParams } = new URL(request.url)
    const isDriver = searchParams.get('driver') === 'true'
    
    let query = supabaseAdmin
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })

    if (isDriver) {
      query = query.in('status', ['assigned_to_driver', 'out_for_delivery', 'delivered'])
    }

    const { data: orders, error } = await query

    if (error) {
      console.error('Error fetching orders:', error)
      return NextResponse.json({ error: 'Error fetching orders' }, { status: 500 })
    }

    return NextResponse.json({ orders })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const {
      customer_name,
      customer_email,
      customer_phone,
      destination_address,
      destination_city,
      destination_country = 'El Salvador',
      package_description,
      package_weight,
      declared_value,
      shipping_cost,
    } = body

    // Require admin authentication for creating orders via API
    const session = await getSession()
    if (!session || !hasRole(session, 'admin')) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    if (!customer_name || !customer_email || !customer_phone || !destination_address || !destination_city) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    if (!isConfigured) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 503 })
    }

    const { data: order, error } = await supabaseAdmin
      .from('orders')
      .insert({
        customer_name,
        customer_email,
        customer_phone,
        destination_address,
        destination_city,
        destination_country,
        package_description,
        package_weight,
        declared_value,
        shipping_cost,
        status: 'pending',
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating order:', error)
      return NextResponse.json({ error: 'Error creating order' }, { status: 500 })
    }

    return NextResponse.json({ order }, { status: 201 })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
