'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { 
  Truck, Package, MapPin, AlertTriangle, 
  CheckCircle, XCircle, Info, ExternalLink, Send,
  MessageCircle, Loader2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  PRICING,
  LA_COVERAGE_CITIES,
  SV_DELIVERY_CITIES,
  PROHIBITED_ITEMS,
  RESTRICTED_ITEMS,
  ALLOWED_ITEMS,
  CUSTOMS_LINKS,
  calculateShippingCost,
} from '@/lib/pricing'

type Message = {
  id: string
  type: 'user' | 'bot'
  content: string
}

type OrderData = {
  product?: string
  weight?: number
  contactName?: string
  contactPhone?: string
  deliveryCity?: string
  deliveryAddress?: string
}

type ConversationState = 
  | 'idle' 
  | 'asking_product'
  | 'asking_weight'
  | 'asking_name'
  | 'asking_phone'
  | 'asking_city'
  | 'asking_address'
  | 'confirming'
  | 'saving'

export default function CotizarPage() {
  const [activeTab, setActiveTab] = useState<'chat' | 'articulos' | 'cobertura'>('chat')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [isTyping, setIsTyping] = useState(false)
  
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'bot',
      content: 'Hola, soy el asistente de Yellow Express 👋\n\nPuedo ayudarte a cotizar envíos o crear un pedido. Solo dime qué necesitas, por ejemplo:\n\n• "Quiero enviar 5 libras"\n• "Necesito hacer un pedido"\n• "¿Qué puedo enviar?"',
    }
  ])
  const [inputMessage, setInputMessage] = useState('')
  const [conversationState, setConversationState] = useState<ConversationState>('idle')
  const [orderData, setOrderData] = useState<OrderData>({})

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  function addBotMessage(content: string) {
    const botMessage: Message = {
      id: Date.now().toString(),
      type: 'bot',
      content,
    }
    setMessages(prev => [...prev, botMessage])
  }

  function extractNumber(text: string): number | null {
    const patterns = [
      /([\d.]+)\s*(?:libras?|lbs?|lb)/i,
      /(?:de|son|pesa|pesan|tiene|como|aproximadamente|aprox)\s*([\d.]+)/i,
      /([\d.]+)\s*(?:kilos?|kg)/i,
    ]
    
    for (const pattern of patterns) {
      const match = text.match(pattern)
      if (match) {
        let num = parseFloat(match[1])
        if (text.toLowerCase().includes('kilo') || text.toLowerCase().includes('kg')) {
          num = num * 2.205
        }
        return num
      }
    }
    
    const simpleNum = text.match(/^[\d.]+$/)
    if (simpleNum) return parseFloat(simpleNum[0])
    
    return null
  }

  function extractPhone(text: string): string | null {
    const cleaned = text.replace(/[\s\-\(\)\.]/g, '')
    if (/^\+?\d{8,15}$/.test(cleaned)) {
      return cleaned
    }
    return null
  }

  // Palabras clave de artículos PROHIBIDOS
  const PROHIBITED_KEYWORDS = [
    { keywords: ['arma', 'pistola', 'rifle', 'escopeta', 'municion', 'bala'], item: 'Armas y municiones' },
    { keywords: ['droga', 'marihuana', 'cocaina', 'heroina', 'metanfetamina', 'cannabis'], item: 'Drogas y sustancias controladas' },
    { keywords: ['polvora', 'explosivo', 'dinamita', 'petardo', 'cohete', 'fuego artificial', 'pirotecnia', 'bomba'], item: 'Explosivos y materiales inflamables' },
    { keywords: ['gasolina', 'diesel', 'combustible', 'inflamable', 'gas propano', 'butano'], item: 'Materiales inflamables' },
    { keywords: ['dinero', 'efectivo', 'billetes', 'dolares en efectivo', 'cash'], item: 'Dinero en efectivo' },
    { keywords: ['animal vivo', 'mascota', 'perro', 'gato', 'pajaro', 'reptil', 'insecto vivo'], item: 'Animales vivos' },
    { keywords: ['planta viva', 'semilla', 'tierra', 'abono organico'], item: 'Plantas y semillas' },
    { keywords: ['carne fresca', 'pescado fresco', 'marisco', 'lacteo', 'perecedero'], item: 'Productos perecederos' },
    { keywords: ['radioactivo', 'nuclear', 'uranio'], item: 'Materiales radioactivos' },
    { keywords: ['falsificado', 'pirata', 'replica', 'imitacion', 'clon'], item: 'Artículos falsificados' },
    { keywords: ['pornografia', 'contenido adulto'], item: 'Material prohibido' },
    { keywords: ['cuchillo', 'navaja', 'machete', 'espada', 'daga'], item: 'Armas blancas' },
  ]

  // Palabras clave de artículos RESTRINGIDOS
  const RESTRICTED_KEYWORDS = [
    { keywords: ['medicamento', 'medicina', 'pastilla', 'farmaco', 'antibiotico', 'controlado'], item: 'Medicamentos', requirement: 'receta médica válida' },
    { keywords: ['suplemento', 'proteina', 'vitamina'], item: 'Suplementos', requirement: 'factura y etiqueta original' },
    { keywords: ['perfume', 'colonia', 'fragancia'], item: 'Perfumes', requirement: 'máximo 3 unidades' },
    { keywords: ['bateria', 'pila de litio', 'powerbank'], item: 'Baterías de litio', requirement: 'deben ir dentro del dispositivo' },
    { keywords: ['liquido', 'aceite', 'shampoo', 'crema'], item: 'Líquidos', requirement: 'máximo 500ml por envase, sellado' },
    { keywords: ['alcohol', 'vino', 'cerveza', 'licor', 'whisky', 'ron'], item: 'Bebidas alcohólicas', requirement: 'límite de 3 botellas, selladas' },
  ]

  // Analizar si el mensaje menciona artículos prohibidos
  function detectProhibitedItems(text: string): { found: boolean; items: string[] } {
    const lowerText = text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    const foundItems: string[] = []
    
    for (const prohibited of PROHIBITED_KEYWORDS) {
      for (const keyword of prohibited.keywords) {
        const normalizedKeyword = keyword.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        if (lowerText.includes(normalizedKeyword)) {
          if (!foundItems.includes(prohibited.item)) {
            foundItems.push(prohibited.item)
          }
          break
        }
      }
    }
    
    return { found: foundItems.length > 0, items: foundItems }
  }

  // Analizar si el mensaje menciona artículos restringidos
  function detectRestrictedItems(text: string): { found: boolean; items: { item: string; requirement: string }[] } {
    const lowerText = text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    const foundItems: { item: string; requirement: string }[] = []
    
    for (const restricted of RESTRICTED_KEYWORDS) {
      for (const keyword of restricted.keywords) {
        const normalizedKeyword = keyword.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        if (lowerText.includes(normalizedKeyword)) {
          if (!foundItems.find(i => i.item === restricted.item)) {
            foundItems.push({ item: restricted.item, requirement: restricted.requirement })
          }
          break
        }
      }
    }
    
    return { found: foundItems.length > 0, items: foundItems }
  }

  async function saveOrder(): Promise<{ success: boolean; trackingNumber?: string; error?: string }> {
    try {
      const response = await fetch('/api/orders/chatbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name: orderData.contactName,
          customer_phone: orderData.contactPhone,
          destination_address: orderData.deliveryAddress,
          destination_city: orderData.deliveryCity,
          package_description: orderData.product,
          package_weight: orderData.weight,
        }),
      })

      const data = await response.json()
      
      if (data.success) {
        return { success: true, trackingNumber: data.order.tracking_number }
      } else {
        return { success: false, error: data.error }
      }
    } catch (error) {
      return { success: false, error: 'Error de conexión' }
    }
  }

  async function processMessage(userInput: string) {
    const input = userInput.trim()
    const lowerInput = input.toLowerCase()

    // Si estamos en medio de un flujo de pedido, usar lógica local
    if (conversationState !== 'idle') {
      await handleOrderFlow(input, lowerInput)
      return
    }

    // Detectar si quiere iniciar un pedido
    if (/hacer.*pedido|crear.*pedido|quiero.*pedir|necesito.*enviar.*a|enviar.*paquete.*a/i.test(lowerInput)) {
      setConversationState('asking_product')
      addBotMessage('Perfecto, vamos a crear tu pedido. Primero cuéntame, ¿qué producto o artículos vas a enviar?')
      return
    }

    // Confirmar pedido después de cotización
    if (/^(sí|si|claro|dale|ok|va|vamos)$/i.test(lowerInput) && orderData.weight) {
      setConversationState('asking_product')
      addBotMessage('Perfecto, vamos a crear tu pedido. ¿Qué producto o artículos vas a enviar?')
      return
    }

    // ============================================
    // RESPUESTAS LOCALES RÁPIDAS (sin usar IA)
    // ============================================
    
    // Saludos
    if (/^(hola|hey|buenas?|buenos?|hi|hello|qué tal|que tal|saludos)$/i.test(lowerInput)) {
      const responses = [
        '¡Hola! 👋 Soy el asistente de Yellow Express. ¿En qué puedo ayudarte hoy?\n\nPuedo ayudarte con:\n• Cotizaciones de envío\n• Crear pedidos\n• Información sobre qué puedes enviar',
        '¡Hola! ¿Cómo estás? Cuéntame qué necesitas enviar y te ayudo con la cotización.',
        '¡Buenas! Estoy aquí para ayudarte con tus envíos a El Salvador. ¿Qué necesitas?',
      ]
      addBotMessage(responses[Math.floor(Math.random() * responses.length)])
      return
    }

    // Precios generales
    if (/^(precio|precios|cuanto|cuánto|tarifa|costo)s?$/i.test(lowerInput) || 
        /cuánto.*cuesta|cuanto.*cuesta|cuál.*precio|cual.*precio/i.test(lowerInput)) {
      addBotMessage(`💰 **Nuestros precios:**\n\n• **$${PRICING.pricePerPound.toFixed(2)} por libra**\n• Mínimo: $${PRICING.minimumCharge.toFixed(2)}\n• Manejo: $${PRICING.handlingFee.toFixed(2)}\n\nEjemplos:\n• 3 lb → $${calculateShippingCost(3, 0, false).total.toFixed(2)}\n• 5 lb → $${calculateShippingCost(5, 0, false).total.toFixed(2)}\n• 10 lb → $${calculateShippingCost(10, 0, false).total.toFixed(2)}\n\nDime el peso de tu paquete para cotizar.`)
      return
    }

    // Detectar peso para cotización rápida
    const weight = extractNumber(input)
    if (weight && weight > 0) {
      const quote = calculateShippingCost(weight, 0, false)
      addBotMessage(`📦 Para **${weight} libras** el costo es **$${quote.total.toFixed(2)}**\n\nDesglose:\n• Envío: $${quote.baseCost.toFixed(2)}\n• Manejo: $${quote.handlingFee.toFixed(2)}\n\n⏱️ Tiempo de entrega: 7-12 días hábiles\n\n¿Te gustaría crear un pedido?`)
      setOrderData({ weight })
      return
    }

    // Qué puedo enviar
    if (/qué puedo|que puedo|permitido|que si puedo/i.test(lowerInput)) {
      addBotMessage('✅ **Puedes enviar:**\n\n• Ropa, zapatos y accesorios\n• Electrónicos (celulares, laptops, tablets)\n• Juguetes y artículos para niños\n• Vitaminas y suplementos\n• Artículos para el hogar\n• Herramientas pequeñas\n\n⚠️ Electrónicos nuevos de más de $200 necesitan factura.\n\n¿Qué vas a enviar?')
      return
    }

    // Tiempo de entrega
    if (/cuánto tarda|cuanto tarda|tiempo|días|dias|demora|llega|cuando llega/i.test(lowerInput)) {
      addBotMessage('⏱️ **Tiempo de entrega: 7-12 días hábiles**\n\n• Recepción en LA: 1-2 días\n• Vuelo a El Salvador: 5-7 días\n• Entrega a domicilio: 1-3 días\n\nHacemos envíos cada semana.')
      return
    }

    // Gracias
    if (/gracias|thank|genial|excelente|perfecto/i.test(lowerInput)) {
      addBotMessage('¡Con gusto! 😊 Si necesitas algo más, aquí estoy.')
      return
    }

    // ============================================
    // USAR GEMINI AI PARA PREGUNTAS COMPLEJAS
    // ============================================
    try {
      const recentMessages = messages.slice(-6).map(m => ({
        type: m.type,
        content: m.content
      }))

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: input,
          conversationHistory: recentMessages
        })
      })

      const data = await response.json()

      if (data.error === 'rate_limit') {
        // Fallback cuando hay rate limiting
        addBotMessage('Estoy procesando muchas consultas. Mientras tanto, puedo ayudarte con:\n\n• **Cotización**: dime el peso (ej: "5 libras")\n• **Crear pedido**: di "hacer un pedido"\n• **Precios**: pregunta "cuánto cuesta"\n\n¿Qué necesitas?')
        return
      }

      if (data.response) {
        addBotMessage(data.response)
        if (data.extractedWeight) {
          setOrderData({ weight: data.extractedWeight })
        }
      } else {
        addBotMessage('No entendí tu pregunta. ¿Puedes reformularla?\n\nPuedo ayudarte con cotizaciones, pedidos o información sobre envíos.')
      }
    } catch (error) {
      console.error('Error calling AI:', error)
      addBotMessage('Hubo un problema técnico. Intenta con:\n\n• "5 libras" para cotizar\n• "hacer un pedido" para crear uno\n• "qué puedo enviar" para ver artículos')
    }
  }

  async function handleOrderFlow(input: string, lowerInput: string) {
    // Permitir cancelar en cualquier momento
    if (/cancelar|salir|no quiero|olvidalo|olvídalo/i.test(lowerInput)) {
      setConversationState('idle')
      setOrderData({})
      addBotMessage('Entendido, cancelé el pedido. Si necesitas algo más, aquí estoy.')
      return
    }

    switch (conversationState) {
      case 'asking_product':
        if (input.length < 3) {
          addBotMessage('Necesito más detalle sobre el producto. ¿Qué vas a enviar?')
          return
        }
        
        // Validar que el producto no sea prohibido
        const productProhibited = detectProhibitedItems(input)
        if (productProhibited.found) {
          const itemsList = productProhibited.items.join(', ')
          setConversationState('idle')
          setOrderData({})
          addBotMessage(`🚫 **Lo siento, no podemos crear un pedido para eso.**\n\n"${itemsList}" está en nuestra lista de artículos prohibidos.\n\nNo podemos enviar armas, explosivos, drogas, materiales inflamables ni otros artículos peligrosos.\n\n¿Hay algo más que pueda ayudarte a enviar?`)
          return
        }
        
        // Verificar si tiene restricciones
        const productRestricted = detectRestrictedItems(input)
        if (productRestricted.found) {
          const requirements = productRestricted.items.map(i => `• ${i.item}: ${i.requirement}`).join('\n')
          addBotMessage(`⚠️ **Ese artículo tiene restricciones:**\n\n${requirements}\n\nPodemos continuar si cumples con los requisitos. ¿Cuánto pesa aproximadamente?`)
          setOrderData(prev => ({ ...prev, product: input }))
          setConversationState('asking_weight')
          return
        }
        
        setOrderData(prev => ({ ...prev, product: input }))
        setConversationState('asking_weight')
        addBotMessage(`✅ Anotado: "${input}". ¿Cuánto pesa aproximadamente? Puedes decirme en libras o kilos.`)
        break

      case 'asking_weight':
        const weight = extractNumber(input)
        if (!weight || weight <= 0) {
          addBotMessage('No entendí el peso. Dime un número, por ejemplo "5 libras" o simplemente "5".')
          return
        }
        const quote = calculateShippingCost(weight, 0, false)
        setOrderData(prev => ({ ...prev, weight }))
        setConversationState('asking_name')
        addBotMessage(`${weight} libras, el costo sería $${quote.total.toFixed(2)}. Ahora necesito tus datos de contacto. ¿Cuál es tu nombre completo?`)
        break

      case 'asking_name':
        if (input.length < 3) {
          addBotMessage('Necesito tu nombre completo para el pedido.')
          return
        }
        setOrderData(prev => ({ ...prev, contactName: input }))
        setConversationState('asking_phone')
        addBotMessage(`Gracias ${input.split(' ')[0]}. ¿Cuál es tu número de teléfono o WhatsApp?`)
        break

      case 'asking_phone':
        const phone = extractPhone(input)
        if (!phone) {
          addBotMessage('No reconocí el número. Por favor escríbelo con el código de país, por ejemplo: +503 7890 1234')
          return
        }
        setOrderData(prev => ({ ...prev, contactPhone: phone }))
        setConversationState('asking_city')
        addBotMessage('Perfecto. ¿En qué ciudad de El Salvador se entregará el paquete?')
        break

      case 'asking_city':
        if (input.length < 3) {
          addBotMessage('¿En qué ciudad se entrega? Por ejemplo: San Salvador, Santa Ana, San Miguel...')
          return
        }
        setOrderData(prev => ({ ...prev, deliveryCity: input }))
        setConversationState('asking_address')
        addBotMessage(`Entrega en ${input}. ¿Cuál es la dirección completa de entrega?`)
        break

      case 'asking_address':
        if (input.length < 10) {
          addBotMessage('Necesito la dirección completa con colonia, calle y número de casa.')
          return
        }
        setOrderData(prev => ({ ...prev, deliveryAddress: input }))
        setConversationState('confirming')
        
        const finalQuote = calculateShippingCost(orderData.weight || 0, 0, false)
        addBotMessage(`Perfecto, este es el resumen de tu pedido:\n\n📦 **Producto:** ${orderData.product}\n⚖️ **Peso:** ${orderData.weight} lb\n💰 **Costo:** $${finalQuote.total.toFixed(2)}\n\n👤 **Nombre:** ${orderData.contactName}\n📱 **Teléfono:** ${orderData.contactPhone}\n📍 **Entrega:** ${input}, ${orderData.deliveryCity}\n\n¿Confirmas el pedido? (sí/no)`)
        break

      case 'confirming':
        if (/sí|si|confirmo|correcto|dale|ok|va/i.test(lowerInput)) {
          setConversationState('saving')
          setIsTyping(true)
          
          const result = await saveOrder()
          setIsTyping(false)
          
          if (result.success) {
            addBotMessage(`✅ ¡Pedido creado exitosamente!\n\n🔢 **Número de rastreo:** ${result.trackingNumber}\n\nTe contactaremos pronto para coordinar la recepción del paquete. Puedes rastrear tu envío en cualquier momento con ese número.\n\n¿Necesitas algo más?`)
          } else {
            addBotMessage(`Hubo un problema al guardar el pedido: ${result.error}. Por favor intenta de nuevo o contáctanos por WhatsApp.`)
          }
          
          setConversationState('idle')
          setOrderData({})
        } else if (/no|cancelar|corregir|cambiar/i.test(lowerInput)) {
          setConversationState('idle')
          setOrderData({})
          addBotMessage('Entendido, cancelé el pedido. Si quieres empezar de nuevo, solo dime "quiero hacer un pedido".')
        } else {
          addBotMessage('¿Confirmas el pedido? Responde "sí" para confirmar o "no" para cancelar.')
        }
        break
    }
  }

  async function handleSendMessage() {
    if (!inputMessage.trim() || isTyping) return

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage,
    }

    setMessages(prev => [...prev, userMessage])
    const currentInput = inputMessage
    setInputMessage('')
    setIsTyping(true)

    // Mantener foco en el input
    setTimeout(() => inputRef.current?.focus(), 50)

    // Simular delay natural
    await new Promise(resolve => setTimeout(resolve, 400 + Math.random() * 300))
    
    await processMessage(currentInput)
    setIsTyping(false)

    // Restaurar foco después de responder
    setTimeout(() => inputRef.current?.focus(), 100)
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-yellow-500 rounded-lg flex items-center justify-center">
              <Truck className="w-6 h-6 text-black" />
            </div>
            <div>
              <span className="text-xl font-bold text-yellow-500">Yellow Express</span>
              <span className="text-xs text-muted-foreground block">Asistente de Envíos</span>
            </div>
          </Link>
          <nav className="flex items-center gap-2">
            <Button 
              variant={activeTab === 'chat' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setActiveTab('chat')}
            >
              <MessageCircle className="w-4 h-4 mr-1" />
              Chat
            </Button>
            <Button 
              variant={activeTab === 'articulos' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setActiveTab('articulos')}
            >
              <Package className="w-4 h-4 mr-1" />
              Artículos
            </Button>
            <Button 
              variant={activeTab === 'cobertura' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setActiveTab('cobertura')}
            >
              <MapPin className="w-4 h-4 mr-1" />
              Cobertura
            </Button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-6 max-w-4xl flex flex-col">
        {activeTab === 'chat' ? (
          <Card className="flex-1 flex flex-col min-h-[500px]">
            <CardContent className="flex-1 flex flex-col p-0">
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] p-4 rounded-2xl text-sm whitespace-pre-wrap ${
                        msg.type === 'user'
                          ? 'bg-yellow-500 text-black rounded-br-sm'
                          : 'bg-muted rounded-bl-sm'
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-muted p-4 rounded-2xl rounded-bl-sm">
                      <Loader2 className="w-4 h-4 animate-spin" />
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Actions */}
              {conversationState === 'idle' && (
                <div className="px-4 pb-2 border-t pt-2">
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {['5 libras', 'Hacer un pedido', '¿Qué puedo enviar?'].map((suggestion) => (
                      <Button
                        key={suggestion}
                        variant="outline"
                        size="sm"
                        className="whitespace-nowrap text-xs"
                        onClick={() => setInputMessage(suggestion)}
                      >
                        {suggestion}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* Input */}
              <div className="p-4 border-t">
                <div className="flex gap-2">
                  <Input
                    ref={inputRef}
                    autoFocus
                    placeholder={
                      conversationState === 'idle' 
                        ? "Escribe tu mensaje..." 
                        : conversationState === 'asking_product' ? "Describe el producto..."
                        : conversationState === 'asking_weight' ? "Peso en libras..."
                        : conversationState === 'asking_name' ? "Tu nombre completo..."
                        : conversationState === 'asking_phone' ? "Tu número de teléfono..."
                        : conversationState === 'asking_city' ? "Ciudad de entrega..."
                        : conversationState === 'asking_address' ? "Dirección completa..."
                        : "Escribe tu respuesta..."
                    }
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        handleSendMessage()
                      }
                    }}
                    className="text-base"
                    disabled={isTyping}
                  />
                  <Button onClick={handleSendMessage} disabled={isTyping}>
                    {isTyping ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : activeTab === 'articulos' ? (
          <div className="space-y-6 overflow-y-auto">
            <Card className="border-red-500/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-500">
                  <XCircle className="w-5 h-5" />
                  Artículos Prohibidos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {PROHIBITED_ITEMS.map((item, i) => (
                    <div key={i} className="flex items-start gap-2 p-2 bg-red-500/5 rounded">
                      <XCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-sm">{item.item}</p>
                        <p className="text-xs text-muted-foreground">{item.reason}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-orange-500/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-orange-500">
                  <AlertTriangle className="w-5 h-5" />
                  Artículos Restringidos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {RESTRICTED_ITEMS.map((item, i) => (
                    <div key={i} className="flex items-start gap-2 p-2 bg-orange-500/5 rounded">
                      <AlertTriangle className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-sm">{item.item}</p>
                        <p className="text-xs text-muted-foreground">Requisito: {item.requirement}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-green-500/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-500">
                  <CheckCircle className="w-5 h-5" />
                  Artículos Permitidos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {ALLOWED_ITEMS.map((item, i) => (
                    <Badge key={i} variant="secondary" className="bg-green-500/10 text-green-700">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      {item}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="w-5 h-5 text-blue-500" />
                  Enlaces de Aduanas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <a 
                  href={CUSTOMS_LINKS.elsalvador}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                >
                  <span className="text-2xl">🇸🇻</span>
                  <div className="flex-1">
                    <p className="font-medium">Aduana de El Salvador</p>
                  </div>
                  <ExternalLink className="w-4 h-4 text-muted-foreground" />
                </a>
                <a 
                  href={CUSTOMS_LINKS.usa}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                >
                  <span className="text-2xl">🇺🇸</span>
                  <div className="flex-1">
                    <p className="font-medium">CBP - U.S. Customs</p>
                  </div>
                  <ExternalLink className="w-4 h-4 text-muted-foreground" />
                </a>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="space-y-6 overflow-y-auto">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-2xl">🇺🇸</span>
                  Ciudades de Recolección - Los Ángeles
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {LA_COVERAGE_CITIES.map((city, i) => (
                    <div key={i} className="flex items-center gap-2 p-2 bg-blue-500/5 rounded text-sm">
                      <MapPin className="w-3 h-3 text-blue-500" />
                      {city}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-2xl">🇸🇻</span>
                  Ciudades de Entrega - El Salvador
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {SV_DELIVERY_CITIES.map((city, i) => (
                    <div key={i} className="flex items-center gap-2 p-2 bg-green-500/5 rounded text-sm">
                      <MapPin className="w-3 h-3 text-green-500" />
                      {city}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  )
}
