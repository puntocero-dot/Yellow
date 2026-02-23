import { NextRequest, NextResponse } from 'next/server'
import { processMessage } from '@/lib/ai-agent'
import { sendWhatsAppNotification } from '@/lib/notifications'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    
    const body = formData.get('Body') as string
    const from = formData.get('From') as string
    
    if (!body || !from) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const phoneNumber = from.replace('whatsapp:', '')

    // Log user message
    await supabaseAdmin.from('ai_conversations').insert({
      phone_number: phoneNumber,
      message_type: 'user',
      message: body,
    })

    // Process message with AI
    const response = await processMessage(body, phoneNumber)

    // Log assistant response
    await supabaseAdmin.from('ai_conversations').insert({
      phone_number: phoneNumber,
      message_type: 'assistant',
      message: response,
    })

    // Send response via WhatsApp
    await sendWhatsAppNotification(from, response)

    // Return TwiML response (empty to avoid duplicate messages)
    return new NextResponse(
      '<?xml version="1.0" encoding="UTF-8"?><Response></Response>',
      {
        headers: { 'Content-Type': 'text/xml' },
      }
    )
  } catch (error) {
    console.error('WhatsApp webhook error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ 
    status: 'ok', 
    message: 'Yellow Express AI Agent WhatsApp Webhook' 
  })
}
