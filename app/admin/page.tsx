'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  Package, Truck, Users, Plus, Search, 
  MoreHorizontal, Eye, Edit, Trash2, RefreshCw,
  TrendingUp, Clock, CheckCircle, AlertCircle, LogOut,
  Upload, FileSpreadsheet, AlertTriangle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/use-toast'

type Order = {
  id: string
  tracking_number: string
  customer_name: string
  customer_email: string
  customer_phone: string
  destination_address: string
  destination_city: string
  destination_country: string
  package_description: string
  status: string
  driver_id: string | null
  created_at: string
}

type Driver = {
  id: string
  full_name: string
  phone: string
}

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pendiente' },
  { value: 'warehouse_la', label: 'Bodega LA' },
  { value: 'in_transit_international', label: 'En Tránsito Internacional' },
  { value: 'customs', label: 'En Aduana' },
  { value: 'warehouse_sv', label: 'Bodega SV' },
  { value: 'assigned_to_driver', label: 'Asignado a Motorista' },
  { value: 'out_for_delivery', label: 'En Ruta' },
  { value: 'delivered', label: 'Entregado' },
  { value: 'cancelled', label: 'Cancelado' },
]

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-gray-500',
  warehouse_la: 'bg-blue-500',
  warehouse_sv: 'bg-blue-600',
  in_transit_international: 'bg-purple-500',
  customs: 'bg-orange-500',
  assigned_to_driver: 'bg-yellow-500',
  out_for_delivery: 'bg-cyan-500',
  delivered: 'bg-green-500',
  cancelled: 'bg-red-500',
}

export default function AdminDashboard() {
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isBulkUploadOpen, setIsBulkUploadOpen] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [bulkUploading, setBulkUploading] = useState(false)
  const { toast } = useToast()

  const [newOrder, setNewOrder] = useState({
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    destination_address: '',
    destination_city: '',
    package_description: '',
  })

  useEffect(() => {
    fetchOrders()
    fetchDrivers()
  }, [])

  async function fetchOrders() {
    try {
      const res = await fetch('/api/orders')
      const data = await res.json()
      setOrders(data.orders || [])
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setLoading(false)
    }
  }

  async function fetchDrivers() {
    try {
      const res = await fetch('/api/users?role=driver')
      const data = await res.json()
      setDrivers(data.users || [])
    } catch (error) {
      console.error('Error fetching drivers:', error)
    }
  }

  async function createOrder() {
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newOrder),
      })
      
      if (res.ok) {
        toast({ title: 'Pedido creado exitosamente' })
        setIsCreateDialogOpen(false)
        setNewOrder({
          customer_name: '',
          customer_email: '',
          customer_phone: '',
          destination_address: '',
          destination_city: '',
          package_description: '',
        })
        fetchOrders()
      } else {
        toast({ title: 'Error al crear pedido', variant: 'destructive' })
      }
    } catch (error) {
      console.error('Error creating order:', error)
      toast({ title: 'Error al crear pedido', variant: 'destructive' })
    }
  }

  async function deleteOrder(orderId: string) {
    try {
      const res = await fetch(`/api/orders/${orderId}`, { method: 'DELETE' })
      if (res.ok) {
        toast({ title: 'Pedido eliminado exitosamente' })
        setIsDeleteDialogOpen(false)
        setSelectedOrder(null)
        fetchOrders()
      } else {
        toast({ title: 'Error al eliminar pedido', variant: 'destructive' })
      }
    } catch (error) {
      console.error('Error deleting order:', error)
      toast({ title: 'Error al eliminar pedido', variant: 'destructive' })
    }
  }

  async function handleBulkUpload(file: File) {
    setBulkUploading(true)
    try {
      const text = await file.text()
      const lines = text.split('\n').filter(l => l.trim())
      if (lines.length < 2) {
        toast({ title: 'El archivo está vacío o no tiene datos', variant: 'destructive' })
        setBulkUploading(false)
        return
      }

      const headers = lines[0].split(',').map(h => h.trim().toLowerCase())
      const requiredFields = ['nombre', 'email', 'telefono', 'direccion', 'ciudad']
      const missing = requiredFields.filter(f => !headers.includes(f))
      if (missing.length > 0) {
        toast({ title: `Columnas faltantes: ${missing.join(', ')}`, variant: 'destructive' })
        setBulkUploading(false)
        return
      }

      let created = 0
      let errors = 0

      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim())
        const row: Record<string, string> = {}
        headers.forEach((h, idx) => { row[h] = values[idx] || '' })

        try {
          const res = await fetch('/api/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              customer_name: row['nombre'],
              customer_email: row['email'],
              customer_phone: row['telefono'],
              destination_address: row['direccion'],
              destination_city: row['ciudad'],
              package_description: row['descripcion'] || '',
            }),
          })
          if (res.ok) created++
          else errors++
        } catch {
          errors++
        }
      }

      toast({ title: `Carga masiva: ${created} creados, ${errors} errores` })
      setIsBulkUploadOpen(false)
      fetchOrders()
    } catch (error) {
      console.error('Error bulk upload:', error)
      toast({ title: 'Error al procesar archivo', variant: 'destructive' })
    } finally {
      setBulkUploading(false)
    }
  }

  async function updateOrderStatus(orderId: string, status: string, driverId?: string) {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, driver_id: driverId }),
      })
      
      if (res.ok) {
        toast({ title: 'Pedido actualizado' })
        fetchOrders()
        setIsEditDialogOpen(false)
      } else {
        toast({ title: 'Error al actualizar', variant: 'destructive' })
      }
    } catch (error) {
      console.error('Error updating order:', error)
      toast({ title: 'Error al actualizar', variant: 'destructive' })
    }
  }

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.tracking_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer_phone.includes(searchTerm)
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    inTransit: orders.filter(o => ['in_transit_international', 'out_for_delivery'].includes(o.status)).length,
    delivered: orders.filter(o => o.status === 'delivered').length,
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-yellow-500 rounded-lg flex items-center justify-center">
              <Truck className="w-6 h-6 text-black" />
            </div>
            <div>
              <span className="text-xl font-bold text-yellow-500">Yellow Express</span>
              <span className="text-xs text-muted-foreground block">Panel de Administración</span>
            </div>
          </Link>
          <nav className="flex items-center gap-4">
            <Link href="/admin" className="text-yellow-500 font-medium">Pedidos</Link>
            <Link href="/admin/trips" className="text-muted-foreground hover:text-foreground">Viajes</Link>
            <Link href="/admin/finances" className="text-muted-foreground hover:text-foreground">Finanzas</Link>
            <Link href="/admin/users" className="text-muted-foreground hover:text-foreground">Usuarios</Link>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={async () => {
                await fetch('/api/auth/logout', { method: 'POST' })
                router.push('/login')
              }}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Salir
            </Button>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Pedidos</p>
                  <p className="text-3xl font-bold">{stats.total}</p>
                </div>
                <Package className="w-10 h-10 text-yellow-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pendientes</p>
                  <p className="text-3xl font-bold text-orange-500">{stats.pending}</p>
                </div>
                <Clock className="w-10 h-10 text-orange-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">En Tránsito</p>
                  <p className="text-3xl font-bold text-blue-500">{stats.inTransit}</p>
                </div>
                <TrendingUp className="w-10 h-10 text-blue-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Entregados</p>
                  <p className="text-3xl font-bold text-green-500">{stats.delivered}</p>
                </div>
                <CheckCircle className="w-10 h-10 text-green-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actions Bar */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por guía, nombre o teléfono..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filtrar estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                {STATUS_OPTIONS.map(opt => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={fetchOrders}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Actualizar
            </Button>
            <Button variant="outline" onClick={() => setIsBulkUploadOpen(true)}>
              <Upload className="w-4 h-4 mr-2" />
              Carga Masiva
            </Button>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Pedido
            </Button>
          </div>
        </div>

        {/* Orders Table */}
        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-8 text-center">
                <div className="w-8 h-8 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin mx-auto" />
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No se encontraron pedidos</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-left p-4 font-medium">Guía</th>
                      <th className="text-left p-4 font-medium">Cliente</th>
                      <th className="text-left p-4 font-medium">Destino</th>
                      <th className="text-left p-4 font-medium">Estado</th>
                      <th className="text-left p-4 font-medium">Fecha</th>
                      <th className="text-right p-4 font-medium">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.map(order => (
                      <tr key={order.id} className="border-t border-border hover:bg-muted/30">
                        <td className="p-4">
                          <span className="font-mono text-yellow-500">{order.tracking_number}</span>
                        </td>
                        <td className="p-4">
                          <div>
                            <p className="font-medium">{order.customer_name}</p>
                            <p className="text-sm text-muted-foreground">{order.customer_phone}</p>
                          </div>
                        </td>
                        <td className="p-4">
                          <p className="text-sm">{order.destination_city}</p>
                        </td>
                        <td className="p-4">
                          <Badge className={`${STATUS_COLORS[order.status]} text-white`}>
                            {STATUS_OPTIONS.find(s => s.value === order.status)?.label || order.status}
                          </Badge>
                        </td>
                        <td className="p-4 text-sm text-muted-foreground">
                          {new Date(order.created_at).toLocaleDateString('es-SV')}
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex justify-end gap-2">
                            <Link href={`/track/${order.tracking_number}`}>
                              <Button variant="ghost" size="icon">
                                <Eye className="w-4 h-4" />
                              </Button>
                            </Link>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => {
                                setSelectedOrder(order)
                                setIsEditDialogOpen(true)
                              }}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              className="text-red-500 hover:text-red-400 hover:bg-red-500/10"
                              onClick={() => {
                                setSelectedOrder(order)
                                setIsDeleteDialogOpen(true)
                              }}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Create Order Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Crear Nuevo Pedido</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Nombre del Cliente</Label>
              <Input
                value={newOrder.customer_name}
                onChange={(e) => setNewOrder({ ...newOrder, customer_name: e.target.value })}
                placeholder="Juan Pérez"
              />
            </div>
            <div>
              <Label>Email</Label>
              <Input
                type="email"
                value={newOrder.customer_email}
                onChange={(e) => setNewOrder({ ...newOrder, customer_email: e.target.value })}
                placeholder="juan@ejemplo.com"
              />
            </div>
            <div>
              <Label>Teléfono (WhatsApp)</Label>
              <Input
                value={newOrder.customer_phone}
                onChange={(e) => setNewOrder({ ...newOrder, customer_phone: e.target.value })}
                placeholder="+503 7000 1234"
              />
            </div>
            <div>
              <Label>Dirección de Entrega</Label>
              <Input
                value={newOrder.destination_address}
                onChange={(e) => setNewOrder({ ...newOrder, destination_address: e.target.value })}
                placeholder="Col. Escalón, Calle Principal #123"
              />
            </div>
            <div>
              <Label>Ciudad</Label>
              <Input
                value={newOrder.destination_city}
                onChange={(e) => setNewOrder({ ...newOrder, destination_city: e.target.value })}
                placeholder="San Salvador"
              />
            </div>
            <div>
              <Label>Descripción del Paquete</Label>
              <Input
                value={newOrder.package_description}
                onChange={(e) => setNewOrder({ ...newOrder, package_description: e.target.value })}
                placeholder="Ropa y accesorios"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={createOrder}>
              Crear Pedido
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-500">
              <AlertTriangle className="w-5 h-5" />
              Eliminar Pedido
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-muted-foreground">
              ¿Estás seguro de que deseas eliminar el pedido{' '}
              <strong className="text-foreground">{selectedOrder?.tracking_number}</strong>
              {' '}de <strong className="text-foreground">{selectedOrder?.customer_name}</strong>?
            </p>
            <p className="text-sm text-red-400 mt-2">Esta acción no se puede deshacer.</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => selectedOrder && deleteOrder(selectedOrder.id)}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Upload Dialog */}
      <Dialog open={isBulkUploadOpen} onOpenChange={setIsBulkUploadOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-yellow-500" />
              Carga Masiva de Pedidos
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-muted/50 p-4 rounded-lg text-sm">
              <p className="font-medium mb-2">Formato del archivo CSV:</p>
              <code className="text-xs text-yellow-500 block bg-background p-2 rounded">
                nombre,email,telefono,direccion,ciudad,descripcion
              </code>
              <p className="text-muted-foreground mt-2">
                Cada fila es un pedido. La primera fila debe ser el encabezado.
              </p>
            </div>
            <div>
              <Label>Seleccionar archivo CSV</Label>
              <Input
                type="file"
                accept=".csv"
                disabled={bulkUploading}
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) handleBulkUpload(file)
                }}
                className="mt-1"
              />
            </div>
            {bulkUploading && (
              <div className="flex items-center gap-2 text-yellow-500">
                <div className="w-4 h-4 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin" />
                <span className="text-sm">Procesando pedidos...</span>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsBulkUploadOpen(false)} disabled={bulkUploading}>
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Order Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Pedido {selectedOrder?.tracking_number}</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <div>
                <Label>Estado</Label>
                <Select 
                  value={selectedOrder.status} 
                  onValueChange={(value) => setSelectedOrder({ ...selectedOrder, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {['assigned_to_driver', 'out_for_delivery'].includes(selectedOrder.status) && (
                <div>
                  <Label>Asignar Motorista</Label>
                  <Select 
                    value={selectedOrder.driver_id || ''} 
                    onValueChange={(value) => setSelectedOrder({ ...selectedOrder, driver_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar motorista" />
                    </SelectTrigger>
                    <SelectContent>
                      {drivers.map(driver => (
                        <SelectItem key={driver.id} value={driver.id}>
                          {driver.full_name} - {driver.phone}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              
              <div className="bg-muted/50 p-4 rounded-lg">
                <p className="text-sm"><strong>Cliente:</strong> {selectedOrder.customer_name}</p>
                <p className="text-sm"><strong>Teléfono:</strong> {selectedOrder.customer_phone}</p>
                <p className="text-sm"><strong>Destino:</strong> {selectedOrder.destination_city}</p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={() => selectedOrder && updateOrderStatus(
              selectedOrder.id, 
              selectedOrder.status, 
              selectedOrder.driver_id || undefined
            )}>
              Guardar Cambios
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
