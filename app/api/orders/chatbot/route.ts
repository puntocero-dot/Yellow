import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { calculateShippingCost } from '@/lib/pricing'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const {
      customer_name,
      customer_email,
      customer_phone,
      destination_address,
      destination_city,
      package_description,
      package_weight,
      declared_value = 0,
    } = body

    // Validaciones
    if (!customer_name || !customer_phone || !destination_address || !destination_city || !package_description || !package_weight) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos' },
        { status: 400 }
      )
    }

    // Calcular costo de envío
    const quote = calculateShippingCost(package_weight, declared_value, false)

    // Crear el pedido
    const { data: order, error } = await supabaseAdmin
      .from('orders')
      .insert({
        customer_name,
        customer_email: customer_email || `${customer_phone}@chatbot.yellowexpress.com`,
        customer_phone,
        destination_address,
        destination_city,
        destination_country: 'El Salvador',
        package_description,
        package_weight,
        declared_value,
        shipping_cost: quote.total,
        status: 'pending_confirmation',
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating order:', error)
      return NextResponse.json(
        { error: 'Error al crear el pedido' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        tracking_number: order.tracking_number,
        shipping_cost: quote.total,
        status: order.status,
      },
      message: `Pedido creado con número de rastreo: ${order.tracking_number}`
    })

  } catch (error) {
    console.error('Error in chatbot order API:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
