'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  Truck, Package, MapPin, Phone, User, Camera,
  CheckCircle, Navigation, Clock, RefreshCw, LogOut
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/components/ui/use-toast'

type Order = {
  id: string
  tracking_number: string
  customer_name: string
  customer_phone: string
  destination_address: string
  destination_city: string
  package_description: string
  status: string
}

const STATUS_LABELS: Record<string, string> = {
  assigned_to_driver: 'Asignado',
  out_for_delivery: 'En Ruta',
  delivered: 'Entregado',
}

export default function DriverDashboard() {
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  useEffect(() => {
    fetchOrders()
  }, [])

  async function fetchOrders() {
    setLoading(true)
    try {
      const res = await fetch('/api/orders?driver=true')
      const data = await res.json()
      setOrders(data.orders || [])
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setLoading(false)
    }
  }

  async function updateStatus(orderId: string, status: string) {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      
      if (res.ok) {
        toast({ title: 'Estado actualizado' })
        fetchOrders()
      } else {
        toast({ title: 'Error al actualizar', variant: 'destructive' })
      }
    } catch (error) {
      console.error('Error updating status:', error)
      toast({ title: 'Error al actualizar', variant: 'destructive' })
    }
  }

  async function uploadProof(orderId: string, file: File) {
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('orderId', orderId)

      const res = await fetch('/api/orders/upload-proof', {
        method: 'POST',
        body: formData,
      })

      if (res.ok) {
        toast({ title: 'Comprobante subido exitosamente' })
        await updateStatus(orderId, 'delivered')
      } else {
        toast({ title: 'Error al subir comprobante', variant: 'destructive' })
      }
    } catch (error) {
      console.error('Error uploading proof:', error)
      toast({ title: 'Error al subir comprobante', variant: 'destructive' })
    } finally {
      setUploading(false)
    }
  }

  const pendingOrders = orders.filter(o => o.status === 'assigned_to_driver')
  const inRouteOrders = orders.filter(o => o.status === 'out_for_delivery')
  const deliveredOrders = orders.filter(o => o.status === 'delivered')

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-10">
        <div className="px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-yellow-500 rounded-lg flex items-center justify-center">
              <Truck className="w-6 h-6 text-black" />
            </div>
            <div>
              <span className="text-lg font-bold text-yellow-500">Yellow Express</span>
              <span className="text-xs text-muted-foreground block">Portal Motorista</span>
            </div>
          </Link>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={fetchOrders}>
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </Button>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={async () => {
                await fetch('/api/auth/logout', { method: 'POST' })
                router.push('/login')
              }}
            >
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="px-4 py-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <Card className="bg-yellow-500/10 border-yellow-500/30">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-yellow-500">{pendingOrders.length}</p>
              <p className="text-xs text-muted-foreground">Asignados</p>
            </CardContent>
          </Card>
          <Card className="bg-blue-500/10 border-blue-500/30">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-blue-500">{inRouteOrders.length}</p>
              <p className="text-xs text-muted-foreground">En Ruta</p>
            </CardContent>
          </Card>
          <Card className="bg-green-500/10 border-green-500/30">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-green-500">{deliveredOrders.length}</p>
              <p className="text-xs text-muted-foreground">Entregados</p>
            </CardContent>
          </Card>
        </div>

        {/* Orders List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="w-10 h-10 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : orders.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Package className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground">No tienes pedidos asignados</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {/* Pending Orders */}
            {pendingOrders.length > 0 && (
              <div>
                <h2 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  PENDIENTES DE INICIAR ({pendingOrders.length})
                </h2>
                {pendingOrders.map(order => (
                  <OrderCard 
                    key={order.id} 
                    order={order}
                    onStartDelivery={() => updateStatus(order.id, 'out_for_delivery')}
                  />
                ))}
              </div>
            )}

            {/* In Route Orders */}
            {inRouteOrders.length > 0 && (
              <div>
                <h2 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                  <Navigation className="w-4 h-4" />
                  EN RUTA ({inRouteOrders.length})
                </h2>
                {inRouteOrders.map(order => (
                  <OrderCard 
                    key={order.id} 
                    order={order}
                    onComplete={() => {
                      setSelectedOrder(order)
                      fileInputRef.current?.click()
                    }}
                    uploading={uploading && selectedOrder?.id === order.id}
                  />
                ))}
              </div>
            )}

            {/* Delivered Orders */}
            {deliveredOrders.length > 0 && (
              <div>
                <h2 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  ENTREGADOS HOY ({deliveredOrders.length})
                </h2>
                {deliveredOrders.map(order => (
                  <OrderCard key={order.id} order={order} completed />
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Hidden file input for photo upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file && selectedOrder) {
            uploadProof(selectedOrder.id, file)
          }
        }}
      />
    </div>
  )
}

function OrderCard({ 
  order, 
  onStartDelivery, 
  onComplete, 
  completed,
  uploading 
}: { 
  order: Order
  onStartDelivery?: () => void
  onComplete?: () => void
  completed?: boolean
  uploading?: boolean
}) {
  const openMaps = () => {
    const address = encodeURIComponent(`${order.destination_address}, ${order.destination_city}, El Salvador`)
    window.open(`https://www.google.com/maps/search/?api=1&query=${address}`, '_blank')
  }

  const callCustomer = () => {
    window.open(`tel:${order.customer_phone}`, '_self')
  }

  return (
    <Card className={`mb-3 ${completed ? 'opacity-60' : ''}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <p className="font-mono text-sm text-yellow-500">{order.tracking_number}</p>
            <p className="font-semibold">{order.customer_name}</p>
          </div>
          <Badge className={
            order.status === 'delivered' ? 'bg-green-500' :
            order.status === 'out_for_delivery' ? 'bg-blue-500' :
            'bg-yellow-500'
          }>
            {STATUS_LABELS[order.status] || order.status}
          </Badge>
        </div>

        <div className="space-y-2 text-sm mb-4">
          <div className="flex items-start gap-2">
            <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
            <div>
              <p>{order.destination_address}</p>
              <p className="text-muted-foreground">{order.destination_city}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-muted-foreground" />
            <p className="text-muted-foreground">{order.package_description || 'Sin descripción'}</p>
          </div>
        </div>

        {!completed && (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="flex-1" onClick={callCustomer}>
              <Phone className="w-4 h-4 mr-1" />
              Llamar
            </Button>
            <Button variant="outline" size="sm" className="flex-1" onClick={openMaps}>
              <Navigation className="w-4 h-4 mr-1" />
              Mapa
            </Button>
            {onStartDelivery && (
              <Button size="sm" className="flex-1" onClick={onStartDelivery}>
                <Truck className="w-4 h-4 mr-1" />
                Iniciar
              </Button>
            )}
            {onComplete && (
              <Button size="sm" className="flex-1" onClick={onComplete} disabled={uploading}>
                {uploading ? (
                  <RefreshCw className="w-4 h-4 mr-1 animate-spin" />
                ) : (
                  <Camera className="w-4 h-4 mr-1" />
                )}
                Entregar
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
