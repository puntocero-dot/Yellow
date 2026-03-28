import { supabaseAdmin, Order } from './supabase'
import { ORDER_STATUSES } from './utils'
import {
  PRICING,
  PROHIBITED_ITEMS,
  RESTRICTED_ITEMS,
  ALLOWED_ITEMS,
  LA_COVERAGE_CITIES,
  SV_DELIVERY_CITIES,
} from './pricing'

// Modelos de Gemini en orden de preferencia (igual que el chat web)
const MODELS_TO_TRY = [
  'gemini-2.5-flash',
  'gemini-2.0-flash-lite',
  'gemini-2.0-flash',
]

const SYSTEM_PROMPT = `Eres el asistente virtual de Yellow Express, una empresa de envíos de paquetes desde Los Ángeles, California hacia El Salvador. Tu nombre es "YellowBot".

TU PERSONALIDAD:
- Amable, profesional y directo
- Respondes en español
- Usas emojis ocasionalmente pero no en exceso
- Das respuestas concisas pero completas

INFORMACIÓN DEL SERVICIO:
- Precio: $${PRICING.pricePerPound.toFixed(2)} por libra
- Mínimo: $${PRICING.minimumCharge.toFixed(2)} por envío
- Envío en El Salvador: El costo es variable según la distancia y dirección (se confirma al finalizar el pedido).
- Seguro opcional: ${PRICING.insuranceRate * 100}% del valor declarado
- Tiempo de entrega: 7-12 días hábiles
- Recogemos en: ${LA_COVERAGE_CITIES.slice(0, 10).join(', ')} y más ciudades de LA
- Entregamos en: ${SV_DELIVERY_CITIES.slice(0, 10).join(', ')} y todo El Salvador

ARTÍCULOS PROHIBIDOS (NO se pueden enviar bajo ninguna circunstancia):
${PROHIBITED_ITEMS.map(i => `- ${i.item}: ${i.reason}`).join('\n')}

ARTÍCULOS RESTRINGIDOS (requieren documentación):
${RESTRICTED_ITEMS.map(i => `- ${i.item}: ${i.requirement}`).join('\n')}

ARTÍCULOS PERMITIDOS:
${ALLOWED_ITEMS.join(', ')}

ESTADOS DE PEDIDO:
- pending: Pedido creado, esperando procesamiento
- warehouse_la: Recibido en bodega de Los Ángeles
- in_transit_international: En tránsito entre países
- customs: En proceso de aduana
- warehouse_sv: Recibido en bodega de El Salvador
- assigned_to_driver: Asignado a motorista para entrega
- out_for_delivery: En ruta de entrega
- delivered: Entregado exitosamente

REGLAS IMPORTANTES:
1. Si el usuario pregunta sobre un artículo PROHIBIDO, SIEMPRE advierte que NO se puede enviar y explica por qué.
2. Si pregunta sobre artículos RESTRINGIDOS, informa los requisitos necesarios.
3. Para productos perecederos (queso, carne, lácteos, frutas, verduras frescas), explica que NO se pueden enviar porque se dañan en el transporte de 7-12 días.
4. CÁLCULO DE PESO: Si el usuario menciona varias unidades (ej. "2 cajas de 5 libras"), el peso total es la suma de todas (10 libras). SIEMPRE pregunta cuántas unidades son si no está claro.
5. CÁLCULO DE PRECIO: Usa la fórmula: (Peso Total × $${PRICING.pricePerPound.toFixed(2)}) + (Costo de los artículos si aplica) + (Cargos de envío en SV).
6. MÍNIMO: El costo mínimo por envío base es de $${PRICING.minimumCharge.toFixed(2)}.
7. Si el usuario quiere rastrear su pedido, pídele su número de guía (formato: YE + números).
8. Si no puedes ayudar con algo, sugiere contactar soporte: WhatsApp +503 7000-0000.
9. Siempre verifica que el producto sea permitido ANTES de dar cotización.

EJEMPLOS DE CÁLCULO:
- 1 caja de 2 libras: máximo entre (2 × $${PRICING.pricePerPound.toFixed(2)}) y mínimo $${PRICING.minimumCharge.toFixed(2)} + cargos de envío en SV.
- 2 cajas de 5 libras: Peso Total = 10 lbs. (10 × $${PRICING.pricePerPound.toFixed(2)}) = $${(10 * PRICING.pricePerPound).toFixed(2)} + cargos de envío en SV.

Responde de forma natural y conversacional. Si no entiendes algo, pide clarificación.`

// Llamada a la API REST de Gemini (sin SDK, como el chat web)
async function callGeminiAPI(
  apiKey: string,
  modelName: string,
  prompt: string
): Promise<string> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 500,
      },
    }),
  })

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}))
    throw new Error(`${res.status}: ${JSON.stringify(errorData)}`)
  }

  const data = await res.json()
  return data.candidates?.[0]?.content?.parts?.[0]?.text || ''
}

// Buscar pedido por número de guía en Supabase
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

// Formatear la información de un pedido para enviarlo por WhatsApp
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

// Procesar mensaje del usuario (WhatsApp)
export async function processMessage(
  userMessage: string,
  userPhone: string
): Promise<string> {
  try {
    // 1. Detectar si el usuario está consultando por un número de guía
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

    // 2. Si hay número de guía, buscar en la BD directamente
    if (trackingNumber) {
      const order = await searchOrder(trackingNumber)

      if (order) {
        return formatOrderStatus(order)
      } else {
        return `❌ No encontré ningún pedido con el número *${trackingNumber}*.

Por favor verifica el número de guía e intenta de nuevo. Si el problema persiste, contacta a nuestro equipo de soporte.

📞 WhatsApp: +503 7000-0000`
      }
    }

    // 3. Para cualquier otra consulta, usar Google Gemini
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      console.error('GEMINI_API_KEY no configurada')
      return `⚠️ El servicio de IA no está configurado en este momento.\n\nPor favor contacta a nuestro equipo:\n📞 WhatsApp: +503 7000-0000`
    }

    const fullPrompt = `${SYSTEM_PROMPT}\n\nUsuario: ${userMessage}\n\nAsistente:`

    // 4. Intentar con cada modelo hasta que uno funcione (fallback igual que el chat web)
    let response = ''
    let lastError = ''

    for (const modelName of MODELS_TO_TRY) {
      try {
        console.log(`[WhatsApp AI] Trying model: ${modelName}`)
        response = await callGeminiAPI(apiKey, modelName, fullPrompt)
        console.log(`[WhatsApp AI] Success with model: ${modelName}`)
        break
      } catch (err: unknown) {
        lastError = err instanceof Error ? err.message : 'Unknown error'
        console.log(`[WhatsApp AI] Model ${modelName} failed: ${lastError}`)

        // Si es rate limit, no probar más modelos
        if (lastError.includes('429')) {
          return `⏳ El servicio está ocupado en este momento. Espera unos segundos e intenta de nuevo.\n\n📞 Si es urgente: +503 7000-0000`
        }
        continue
      }
    }

    if (!response) {
      console.error('[WhatsApp AI] All models failed. Last error:', lastError)
      return `⚠️ Disculpa, estoy teniendo problemas técnicos en este momento.\n\nPor favor intenta de nuevo en unos minutos o contacta directamente a nuestro equipo:\n📞 WhatsApp: +503 7000-0000\n\n¡Gracias por tu paciencia!`
    }

    return response

  } catch (error) {
    console.error('[WhatsApp AI] Unexpected error:', error)
    return `⚠️ Disculpa, ocurrió un error inesperado.\n\nPor favor contacta a nuestro equipo:\n📞 WhatsApp: +503 7000-0000`
  }
}
