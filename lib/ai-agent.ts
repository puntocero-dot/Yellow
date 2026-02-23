import OpenAI from 'openai'
import { supabaseAdmin, Order } from './supabase'
import { ORDER_STATUSES } from './utils'

// Lazy initialization to prevent build-time crash when API key is not set
let _openai: OpenAI | null = null
function getOpenAI(): OpenAI {
  if (!_openai) {
    _openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY || 'not-configured',
    })
  }
  return _openai
}

const SYSTEM_PROMPT = `Eres el asistente virtual de The Yellow Express, una empresa de envíos entre Los Ángeles, California y El Salvador. Tu nombre es "YellowBot".

INFORMACIÓN DE LA EMPRESA:
- Servicio de envíos de paquetes entre LA y El Salvador
- Tiempo de entrega estimado: 5-7 días hábiles
- Servicio de Personal Shopper disponible
- Horario de atención: Lunes a Sábado 8am-6pm (hora de El Salvador)
- WhatsApp de soporte: +503 1234 5678

TARIFAS APROXIMADAS:
- Paquetes pequeños (hasta 1 lb): $8-12
- Paquetes medianos (1-5 lbs): $15-25
- Paquetes grandes (5-10 lbs): $30-50
- Personal Shopper: 10% del valor de compra + envío

ESTADOS DE PEDIDO:
- pending: Pedido creado, esperando procesamiento
- warehouse_la: Recibido en bodega de Los Ángeles
- warehouse_sv: Recibido en bodega de El Salvador
- in_transit_international: En tránsito entre países
- customs: En proceso de aduana
- assigned_to_driver: Asignado a motorista para entrega
- out_for_delivery: En ruta de entrega
- delivered: Entregado exitosamente

INSTRUCCIONES:
1. Responde siempre en español de manera amigable y profesional
2. Si el usuario pregunta por un pedido, usa la función de búsqueda
3. Proporciona información clara sobre estados y tiempos estimados
4. Si no puedes ayudar, sugiere contactar soporte humano
5. Mantén las respuestas concisas pero informativas
6. Usa emojis moderadamente para hacer la conversación más amigable`

export async function searchOrder(trackingNumber: string): Promise<Order | null> {
  const cleanTracking = trackingNumber.replace(/[^a-zA-Z0-9]/g, '').toUpperCase()
  
  const { data, error } = await supabaseAdmin
    .from('orders')
    .select('*')
    .or(`tracking_number.ilike.%${cleanTracking}%,id.eq.${cleanTracking}`)
    .limit(1)
    .single()

  if (error || !data) {
    return null
  }

  return data as Order
}

export function formatOrderStatus(order: Order): string {
  const statusInfo = ORDER_STATUSES[order.status as keyof typeof ORDER_STATUSES]
  
  let response = `📦 *Información de tu pedido*

🔢 *Guía:* ${order.tracking_number}
📊 *Estado:* ${statusInfo?.label || order.status}
📍 *Destino:* ${order.destination_city}, ${order.destination_country}
📅 *Fecha de creación:* ${new Date(order.created_at).toLocaleDateString('es-SV')}`

  if (order.estimated_delivery) {
    response += `\n🗓️ *Entrega estimada:* ${new Date(order.estimated_delivery).toLocaleDateString('es-SV')}`
  }

  if (order.status === 'delivered' && order.delivered_at) {
    response += `\n✅ *Entregado el:* ${new Date(order.delivered_at).toLocaleDateString('es-SV')}`
  }

  if (order.status === 'out_for_delivery') {
    response += `\n\n🏍️ ¡Tu paquete está en camino! El motorista se comunicará contigo pronto.`
  }

  return response
}

export async function processMessage(
  userMessage: string,
  userPhone: string
): Promise<string> {
  try {
    const trackingPatterns = [
      /YE\d{8}[A-Z0-9]{3}/i,
      /guía\s*[:#]?\s*([A-Z0-9]+)/i,
      /pedido\s*[:#]?\s*([A-Z0-9]+)/i,
      /paquete\s*[:#]?\s*([A-Z0-9]+)/i,
      /tracking\s*[:#]?\s*([A-Z0-9]+)/i,
      /#([A-Z0-9]{10,})/i,
    ]

    let trackingNumber: string | null = null
    
    for (const pattern of trackingPatterns) {
      const match = userMessage.match(pattern)
      if (match) {
        trackingNumber = match[1] || match[0]
        break
      }
    }

    if (trackingNumber) {
      const order = await searchOrder(trackingNumber)
      
      if (order) {
        return formatOrderStatus(order)
      } else {
        return `❌ No encontré ningún pedido con el número *${trackingNumber}*.

Por favor verifica el número de guía e intenta de nuevo. Si el problema persiste, contacta a nuestro equipo de soporte.

📞 WhatsApp: +503 1234 5678`
      }
    }

    const completion = await getOpenAI().chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userMessage },
      ],
      max_tokens: 500,
      temperature: 0.7,
    })

    return completion.choices[0]?.message?.content || 
      'Lo siento, no pude procesar tu mensaje. Por favor intenta de nuevo o contacta a soporte.'

  } catch (error) {
    console.error('AI Agent error:', error)
    return `⚠️ Disculpa, estoy teniendo problemas técnicos en este momento.

Por favor intenta de nuevo en unos minutos o contacta directamente a nuestro equipo:
📞 WhatsApp: +503 1234 5678

¡Gracias por tu paciencia!`
  }
}
