import { NextRequest, NextResponse } from 'next/server'
import { 
  PRICING, 
  PROHIBITED_ITEMS, 
  RESTRICTED_ITEMS, 
  ALLOWED_ITEMS,
  LA_COVERAGE_CITIES,
  SV_DELIVERY_CITIES,
} from '@/lib/pricing'

const SYSTEM_PROMPT = `Eres el asistente virtual de Yellow Express, una empresa de envíos de paquetes desde Los Ángeles, California hacia El Salvador.

TU PERSONALIDAD:
- Amable, profesional y directo
- Respondes en español
- Usas emojis ocasionalmente pero no en exceso
- Das respuestas concisas pero completas

INFORMACIÓN DEL SERVICIO:
- Precio: $${PRICING.pricePerPound.toFixed(2)} por libra
- Mínimo: $${PRICING.minimumCharge.toFixed(2)}
- Cargo por manejo: $${PRICING.handlingFee.toFixed(2)}
- Seguro opcional: ${(PRICING.insuranceRate * 100)}% del valor declarado
- Tiempo de entrega: 7-12 días hábiles
- Recogemos en: ${LA_COVERAGE_CITIES.slice(0, 10).join(', ')} y más ciudades de LA
- Entregamos en: ${SV_DELIVERY_CITIES.slice(0, 10).join(', ')} y todo El Salvador

ARTÍCULOS PROHIBIDOS (NO se pueden enviar bajo ninguna circunstancia):
${PROHIBITED_ITEMS.map(i => `- ${i.item}: ${i.reason}`).join('\n')}

ARTÍCULOS RESTRINGIDOS (requieren documentación):
${RESTRICTED_ITEMS.map(i => `- ${i.item}: ${i.requirement}`).join('\n')}

ARTÍCULOS PERMITIDOS:
${ALLOWED_ITEMS.join(', ')}

REGLAS IMPORTANTES:
1. Si el usuario pregunta sobre un artículo PROHIBIDO, SIEMPRE advierte que NO se puede enviar y explica por qué.
2. Si pregunta sobre artículos RESTRINGIDOS, informa los requisitos necesarios.
3. Para productos perecederos (queso, carne, lácteos, frutas, verduras frescas), explica que NO se pueden enviar porque se dañan en el transporte de 7-12 días.
4. Cuando des precios, usa la fórmula: (peso × $5.50) + $3.00 manejo, mínimo $15.
5. Si el usuario quiere hacer un pedido, dile que escriba "hacer un pedido".
6. Siempre verifica que el producto sea permitido ANTES de dar cotización.

EJEMPLOS DE CÁLCULO:
- 2 libras: (2 × $5.50) + $3.00 = $14.00, pero mínimo es $15.00, entonces $15.00
- 5 libras: (5 × $5.50) + $3.00 = $30.50
- 10 libras: (10 × $5.50) + $3.00 = $58.00

Responde de forma natural y conversacional. Si no entiendes algo, pide clarificación.`

// Simple in-memory rate limiting
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()
const RATE_LIMIT_WINDOW = 60 * 1000 // 1 minute
const RATE_LIMIT_MAX = 20 // max requests per window

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const entry = rateLimitMap.get(ip)
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW })
    return true
  }
  if (entry.count >= RATE_LIMIT_MAX) return false
  entry.count++
  return true
}

// Modelos disponibles en orden de preferencia
const MODELS_TO_TRY = [
  'gemini-2.5-flash',
  'gemini-2.0-flash-lite',
  'gemini-2.0-flash',
]

async function callGeminiAPI(apiKey: string, modelName: string, prompt: string) {
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

export async function POST(request: NextRequest) {
  try {
    const { message, conversationHistory } = await request.json()

    if (!message) {
      return NextResponse.json({ error: 'Mensaje requerido' }, { status: 400 })
    }

    // Rate limiting
    const clientIp = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
    if (!checkRateLimit(clientIp)) {
      return NextResponse.json({ 
        response: '⏳ Has enviado muchos mensajes. Espera un momento antes de continuar.',
        error: 'rate_limit'
      })
    }

    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      return NextResponse.json({ 
        response: 'Lo siento, el servicio de IA no está configurado.',
        error: 'API key not configured'
      })
    }

    // Construir contexto con historial reciente
    let contextMessages = ''
    if (conversationHistory && conversationHistory.length > 0) {
      const recent = conversationHistory.slice(-6)
      contextMessages = '\n\nConversación previa:\n' + recent.map((m: {type: string, content: string}) => 
        `${m.type === 'user' ? 'Usuario' : 'Asistente'}: ${m.content}`
      ).join('\n')
    }

    const fullPrompt = `${SYSTEM_PROMPT}${contextMessages}\n\nUsuario: ${message}\n\nAsistente:`

    // Intentar con cada modelo hasta que uno funcione
    let response = ''
    let lastError = ''
    
    for (const modelName of MODELS_TO_TRY) {
      try {
        console.log(`Trying model: ${modelName}`)
        response = await callGeminiAPI(apiKey, modelName, fullPrompt)
        console.log(`Success with model: ${modelName}`)
        break
      } catch (err: unknown) {
        lastError = err instanceof Error ? err.message : 'Unknown error'
        console.log(`Model ${modelName} failed: ${lastError}`)
        // Si es rate limit, no probar más modelos
        if (lastError.includes('429')) {
          return NextResponse.json({ 
            response: '⏳ El servicio está ocupado. Espera unos segundos e intenta de nuevo.',
            error: 'rate_limit'
          })
        }
        continue
      }
    }
    
    if (!response) {
      console.error('All models failed. Last error:', lastError)
      return NextResponse.json({ 
        response: 'No pude conectar con el servicio de IA. Por favor intenta de nuevo.',
        error: lastError
      }, { status: 500 })
    }

    // Extraer peso si se menciona en la respuesta
    const weightMatch = response.match(/(\d+(?:\.\d+)?)\s*libras?/i)
    const extractedWeight = weightMatch ? parseFloat(weightMatch[1]) : null

    return NextResponse.json({ 
      response,
      extractedWeight,
    })

  } catch (error: unknown) {
    console.error('Error in chat API:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ 
      response: 'Hubo un problema al procesar tu mensaje. Por favor intenta de nuevo.',
      error: errorMessage
    }, { status: 500 })
  }
}
