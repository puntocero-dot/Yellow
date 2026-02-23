'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { 
  Package, Truck, MapPin, Clock, CheckCircle, 
  AlertCircle, Plane, Building2, User, ArrowLeft 
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

type Order = {
  id: string
  tracking_number: string
  customer_name: string
  destination_address: string
  destination_city: string
  destination_country: string
  package_description: string
  status: string
  estimated_delivery: string | null
  delivered_at: string | null
  created_at: string
}

type StatusHistory = {
  id: string
  status: string
  created_at: string
  notes: string | null
}

const STATUS_CONFIG: Record<string, { 
  label: string
  icon: React.ReactNode
  color: string
  description: string 
}> = {
  pending: { 
    label: 'Pendiente', 
    icon: <Clock className="w-5 h-5" />, 
    color: 'bg-gray-500',
    description: 'Tu pedido ha sido creado y está esperando procesamiento.'
  },
  warehouse_la: { 
    label: 'Bodega Los Ángeles', 
    icon: <Building2 className="w-5 h-5" />, 
    color: 'bg-blue-500',
    description: 'Tu paquete ha sido recibido en nuestra bodega de Los Ángeles.'
  },
  in_transit_international: { 
    label: 'En Tránsito Internacional', 
    icon: <Plane className="w-5 h-5" />, 
    color: 'bg-purple-500',
    description: 'Tu paquete está en camino de Los Ángeles a El Salvador.'
  },
  customs: { 
    label: 'En Aduana', 
    icon: <Building2 className="w-5 h-5" />, 
    color: 'bg-orange-500',
    description: 'Tu paquete está siendo procesado en aduana.'
  },
  warehouse_sv: { 
    label: 'Bodega El Salvador', 
    icon: <Building2 className="w-5 h-5" />, 
    color: 'bg-blue-600',
    description: 'Tu paquete ha llegado a nuestra bodega en El Salvador.'
  },
  assigned_to_driver: { 
    label: 'Asignado a Motorista', 
    icon: <User className="w-5 h-5" />, 
    color: 'bg-yellow-500',
    description: 'Un motorista ha sido asignado para entregar tu paquete.'
  },
  out_for_delivery: { 
    label: 'En Ruta de Entrega', 
    icon: <Truck className="w-5 h-5" />, 
    color: 'bg-cyan-500',
    description: '¡Tu paquete está en camino! El motorista llegará pronto.'
  },
  delivered: { 
    label: 'Entregado', 
    icon: <CheckCircle className="w-5 h-5" />, 
    color: 'bg-green-500',
    description: '¡Tu paquete ha sido entregado exitosamente!'
  },
  cancelled: { 
    label: 'Cancelado', 
    icon: <AlertCircle className="w-5 h-5" />, 
    color: 'bg-red-500',
    description: 'Este pedido ha sido cancelado.'
  },
}

const STATUS_ORDER = [
  'pending',
  'warehouse_la',
  'in_transit_international',
  'customs',
  'warehouse_sv',
  'assigned_to_driver',
  'out_for_delivery',
  'delivered'
]

export default function TrackingPage() {
  const params = useParams()
  const tracking = params.tracking as string
  
  const [order, setOrder] = useState<Order | null>(null)
  const [history, setHistory] = useState<StatusHistory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchOrder() {
      try {
        const res = await fetch(`/api/orders/track/${tracking}`)
        const data = await res.json()
        
        if (!res.ok) {
          setError(data.error || 'Pedido no encontrado')
          return
        }
        
        setOrder(data.order)
        setHistory(data.history || [])
      } catch {
        setError('Error al cargar la información del pedido')
      } finally {
        setLoading(false)
      }
    }

    if (tracking) {
      fetchOrder()
    }
  }, [tracking])

  const currentStatusIndex = order ? STATUS_ORDER.indexOf(order.status) : -1

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Buscando tu pedido...</p>
        </div>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Pedido no encontrado</h2>
            <p className="text-muted-foreground mb-6">
              No pudimos encontrar un pedido con el número de guía <strong>{tracking}</strong>. 
              Por favor verifica el número e intenta de nuevo.
            </p>
            <Link href="/">
              <Button>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver al inicio
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  const statusConfig = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <Link href="/" className="flex items-center gap-2 w-fit">
            <div className="w-10 h-10 bg-yellow-500 rounded-lg flex items-center justify-center">
              <Truck className="w-6 h-6 text-black" />
            </div>
            <span className="text-xl font-bold text-yellow-500">The Yellow Express</span>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Link href="/" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver al inicio
        </Link>

        {/* Order Info Card */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Número de Guía</p>
                <CardTitle className="text-2xl text-yellow-500">{order.tracking_number}</CardTitle>
              </div>
              <Badge className={`${statusConfig.color} text-white px-4 py-2 text-sm`}>
                {statusConfig.icon}
                <span className="ml-2">{statusConfig.label}</span>
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <Package className="w-4 h-4 text-yellow-500" />
                  Información del Paquete
                </h3>
                <p className="text-muted-foreground">{order.package_description || 'Sin descripción'}</p>
              </div>
              <div>
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-yellow-500" />
                  Destino
                </h3>
                <p className="text-muted-foreground">
                  {order.destination_address}<br />
                  {order.destination_city}, {order.destination_country}
                </p>
              </div>
            </div>

            {order.estimated_delivery && order.status !== 'delivered' && (
              <div className="mt-6 p-4 bg-yellow-500/10 rounded-lg border border-yellow-500/30">
                <p className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-yellow-500" />
                  <span className="font-medium">Entrega estimada:</span>
                  <span>{new Date(order.estimated_delivery).toLocaleDateString('es-SV', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}</span>
                </p>
              </div>
            )}

            {order.status === 'delivered' && order.delivered_at && (
              <div className="mt-6 p-4 bg-green-500/10 rounded-lg border border-green-500/30">
                <p className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="font-medium">Entregado el:</span>
                  <span>{new Date(order.delivered_at).toLocaleDateString('es-SV', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}</span>
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Progress Timeline */}
        <Card>
          <CardHeader>
            <CardTitle>Progreso del Envío</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              {STATUS_ORDER.map((status, index) => {
                const config = STATUS_CONFIG[status]
                const isCompleted = index <= currentStatusIndex
                const isCurrent = index === currentStatusIndex
                
                return (
                  <div key={status} className="flex gap-4 pb-8 last:pb-0">
                    {/* Timeline line */}
                    <div className="flex flex-col items-center">
                      <div className={`
                        w-10 h-10 rounded-full flex items-center justify-center
                        ${isCompleted ? config.color : 'bg-muted'}
                        ${isCurrent ? 'ring-4 ring-yellow-500/30' : ''}
                        text-white transition-all
                      `}>
                        {config.icon}
                      </div>
                      {index < STATUS_ORDER.length - 1 && (
                        <div className={`
                          w-0.5 flex-1 mt-2
                          ${index < currentStatusIndex ? config.color : 'bg-muted'}
                        `} />
                      )}
                    </div>
                    
                    {/* Content */}
                    <div className={`flex-1 ${!isCompleted ? 'opacity-50' : ''}`}>
                      <h4 className={`font-semibold ${isCurrent ? 'text-yellow-500' : ''}`}>
                        {config.label}
                      </h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        {config.description}
                      </p>
                      {isCurrent && history.length > 0 && (
                        <p className="text-xs text-muted-foreground mt-2">
                          Última actualización: {new Date(history[0]?.created_at || order.created_at).toLocaleString('es-SV')}
                        </p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Help Section */}
        <div className="mt-8 text-center">
          <p className="text-muted-foreground mb-4">
            ¿Tienes preguntas sobre tu pedido?
          </p>
          <a 
            href={`https://wa.me/50312345678?text=Hola, tengo una consulta sobre mi pedido ${order.tracking_number}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="outline">
              Contactar por WhatsApp
            </Button>
          </a>
        </div>
      </main>
    </div>
  )
}
