import { Resend } from 'resend'
import twilio from 'twilio'
import { Order } from './supabase'
import { ORDER_STATUSES } from './utils'

// Lazy initialization to prevent build-time crash when keys are not set
let _resend: Resend | null = null
function getResend(): Resend {
  if (!_resend) {
    _resend = new Resend(process.env.RESEND_API_KEY || 'not-configured')
  }
  return _resend
}

let _twilioClient: ReturnType<typeof twilio> | null = null
function getTwilioClient() {
  if (!_twilioClient) {
    _twilioClient = twilio(
      process.env.TWILIO_ACCOUNT_SID || 'not-configured',
      process.env.TWILIO_AUTH_TOKEN || 'not-configured'
    )
  }
  return _twilioClient
}

const TWILIO_WHATSAPP_NUMBER = process.env.TWILIO_WHATSAPP_NUMBER || 'whatsapp:+14155238886'
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'noreply@theyellowexpress.com'

export async function sendWhatsAppNotification(
  to: string,
  message: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const formattedTo = to.startsWith('whatsapp:') ? to : `whatsapp:${to}`
    
    await getTwilioClient().messages.create({
      body: message,
      from: TWILIO_WHATSAPP_NUMBER,
      to: formattedTo,
    })

    return { success: true }
  } catch (error) {
    console.error('WhatsApp notification error:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}

export async function sendEmailNotification(
  to: string,
  subject: string,
  htmlContent: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await getResend().emails.send({
      from: `The Yellow Express <${FROM_EMAIL}>`,
      to: [to],
      subject,
      html: htmlContent,
    })

    return { success: true }
  } catch (error) {
    console.error('Email notification error:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}

export function generateStatusUpdateMessage(order: Order): string {
  const statusInfo = ORDER_STATUSES[order.status as keyof typeof ORDER_STATUSES]
  const trackingUrl = `${process.env.NEXT_PUBLIC_APP_URL}/track/${order.tracking_number}`
  
  return `🚚 *The Yellow Express*

Hola ${order.customer_name},

Tu pedido *${order.tracking_number}* ha sido actualizado.

📦 *Estado actual:* ${statusInfo?.label || order.status}
📍 *Destino:* ${order.destination_city}, ${order.destination_country}

${order.status === 'out_for_delivery' ? '🏍️ Tu paquete está en camino. ¡Prepárate para recibirlo!' : ''}
${order.status === 'delivered' ? '✅ ¡Tu paquete ha sido entregado! Gracias por confiar en nosotros.' : ''}

Rastrea tu pedido: ${trackingUrl}

¿Tienes preguntas? Responde a este mensaje y nuestro asistente te ayudará.

The Yellow Express - Tu conexión entre LA y El Salvador 🇺🇸✈️🇸🇻`
}

export function generateStatusUpdateEmail(order: Order): { subject: string; html: string } {
  const statusInfo = ORDER_STATUSES[order.status as keyof typeof ORDER_STATUSES]
  const trackingUrl = `${process.env.NEXT_PUBLIC_APP_URL}/track/${order.tracking_number}`
  
  const subject = `📦 Actualización de tu pedido ${order.tracking_number} - ${statusInfo?.label || order.status}`
  
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #FFD700 0%, #E5C100 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="color: #1A1A1A; margin: 0; font-size: 28px;">🚚 The Yellow Express</h1>
    <p style="color: #1A1A1A; margin: 10px 0 0 0; opacity: 0.8;">Tu conexión entre LA y El Salvador</p>
  </div>
  
  <div style="background: #1A1A1A; padding: 30px; border-radius: 0 0 10px 10px;">
    <h2 style="color: #FFD700; margin-top: 0;">Hola ${order.customer_name},</h2>
    
    <p style="color: #FFFFFF;">Tu pedido ha sido actualizado con el siguiente estado:</p>
    
    <div style="background: #2D2D2D; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #FFD700;">
      <p style="margin: 0; color: #FFFFFF;"><strong>Número de guía:</strong> ${order.tracking_number}</p>
      <p style="margin: 10px 0 0 0; color: #FFD700; font-size: 18px;"><strong>Estado:</strong> ${statusInfo?.label || order.status}</p>
      <p style="margin: 10px 0 0 0; color: #FFFFFF;"><strong>Destino:</strong> ${order.destination_city}, ${order.destination_country}</p>
    </div>
    
    ${order.status === 'out_for_delivery' ? `
    <div style="background: #FFD700; color: #1A1A1A; padding: 15px; border-radius: 8px; text-align: center; margin: 20px 0;">
      <p style="margin: 0; font-weight: bold;">🏍️ ¡Tu paquete está en camino!</p>
      <p style="margin: 5px 0 0 0;">Prepárate para recibirlo.</p>
    </div>
    ` : ''}
    
    ${order.status === 'delivered' ? `
    <div style="background: #22C55E; color: #FFFFFF; padding: 15px; border-radius: 8px; text-align: center; margin: 20px 0;">
      <p style="margin: 0; font-weight: bold;">✅ ¡Tu paquete ha sido entregado!</p>
      <p style="margin: 5px 0 0 0;">Gracias por confiar en nosotros.</p>
    </div>
    ` : ''}
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${trackingUrl}" style="background: #FFD700; color: #1A1A1A; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
        Rastrear mi pedido
      </a>
    </div>
    
    <hr style="border: none; border-top: 1px solid #2D2D2D; margin: 30px 0;">
    
    <p style="color: #888; font-size: 12px; text-align: center;">
      ¿Tienes preguntas? Contáctanos por WhatsApp o responde a este correo.<br>
      The Yellow Express - Envíos confiables entre Los Ángeles y El Salvador
    </p>
  </div>
</body>
</html>
`
  
  return { subject, html }
}

export async function sendOrderStatusNotification(order: Order): Promise<{
  whatsapp: { success: boolean; error?: string }
  email: { success: boolean; error?: string }
}> {
  const results: {
    whatsapp: { success: boolean; error?: string }
    email: { success: boolean; error?: string }
  } = {
    whatsapp: { success: false, error: 'Not sent' },
    email: { success: false, error: 'Not sent' },
  }

  if (order.customer_phone) {
    const whatsappMessage = generateStatusUpdateMessage(order)
    results.whatsapp = await sendWhatsAppNotification(order.customer_phone, whatsappMessage)
  }

  if (order.customer_email) {
    const { subject, html } = generateStatusUpdateEmail(order)
    results.email = await sendEmailNotification(order.customer_email, subject, html)
  }

  return results
}
