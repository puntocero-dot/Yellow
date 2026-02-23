import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { sendOrderStatusNotification } from '@/lib/notifications'

export async function POST(request: NextRequest) {
  try {
    const { orderId } = await request.json()

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID required' }, { status: 400 })
    }

    const { data: order, error } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single()

    if (error || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    const results = await sendOrderStatusNotification(order)

    // Log notifications
    if (order.customer_phone) {
      await supabaseAdmin.from('notifications').insert({
        order_id: orderId,
        type: 'whatsapp',
        recipient: order.customer_phone,
        message: `Status update: ${order.status}`,
        status: results.whatsapp.success ? 'sent' : 'failed',
        error_message: results.whatsapp.error,
        sent_at: results.whatsapp.success ? new Date().toISOString() : null,
      })
    }

    if (order.customer_email) {
      await supabaseAdmin.from('notifications').insert({
        order_id: orderId,
        type: 'email',
        recipient: order.customer_email,
        message: `Status update: ${order.status}`,
        status: results.email.success ? 'sent' : 'failed',
        error_message: results.email.error,
        sent_at: results.email.success ? new Date().toISOString() : null,
      })
    }

    return NextResponse.json({ success: true, results })
  } catch (error) {
    console.error('Error sending notifications:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
