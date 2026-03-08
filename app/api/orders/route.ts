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
      weight_pounds,
      declared_value,
      shipping_cost,
      quantity = 1,
      unit_price = 0,
      shipping_fee = 0,
      price_per_pound = 6.99,
    } = body

    // Require admin authentication for creating orders via API
    const session = await getSession()
    if (!session || !hasRole(session, 'admin')) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const missingFields = []
    if (!customer_name) missingFields.push('nombre')
    if (!customer_email) missingFields.push('email')
    if (!customer_phone) missingFields.push('telefono')
    if (!destination_address) missingFields.push('direccion')
    if (!destination_city) missingFields.push('ciudad')

    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Faltan campos requeridos: ${missingFields.join(', ')}` },
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
        weight_pounds: weight_pounds ? parseFloat(weight_pounds) : null,
        declared_value,
        shipping_cost: shipping_cost ? parseFloat(String(shipping_cost)) : 0,
        quantity: quantity ? parseInt(String(quantity)) : 1,
        unit_price: unit_price ? parseFloat(String(unit_price)) : 0,
        shipping_fee: shipping_fee ? parseFloat(String(shipping_fee)) : 0,
        price_per_pound: price_per_pound ? parseFloat(String(price_per_pound)) : 6.99,
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
