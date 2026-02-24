'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Truck, Plane, Plus, Edit, Trash2, Calendar,
  MapPin, Clock, CheckCircle, AlertTriangle, LogOut,
  RefreshCw, Package
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/use-toast'

type Trip = {
  id: string
  name: string
  departure_date: string
  return_date: string | null
  origin: string
  destination: string
  status: string
  notes: string | null
  created_at: string
}

const STATUS_OPTIONS = [
  { value: 'planned', label: 'Planificado', color: 'bg-blue-500' },
  { value: 'collecting', label: 'Recolectando', color: 'bg-yellow-500' },
  { value: 'in_transit', label: 'En Tránsito', color: 'bg-purple-500' },
  { value: 'completed', label: 'Completado', color: 'bg-green-500' },
  { value: 'cancelled', label: 'Cancelado', color: 'bg-red-500' },
]

export default function TripsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [trips, setTrips] = useState<Trip[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null)

  const [newTrip, setNewTrip] = useState({
    name: '',
    departure_date: '',
    return_date: '',
    origin: 'Los Angeles',
    destination: 'San Salvador',
    notes: '',
  })

  useEffect(() => { fetchTrips() }, [])

  async function fetchTrips() {
    try {
      const res = await fetch('/api/trips')
      const data = await res.json()
      setTrips(data.trips || [])
    } catch (error) {
      console.error('Error fetching trips:', error)
    } finally {
      setLoading(false)
    }
  }

  async function createTrip() {
    try {
      const res = await fetch('/api/trips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTrip),
      })
      if (res.ok) {
        toast({ title: 'Viaje creado exitosamente' })
        setIsCreateOpen(false)
        setNewTrip({ name: '', departure_date: '', return_date: '', origin: 'Los Angeles', destination: 'San Salvador', notes: '' })
        fetchTrips()
      } else {
        const data = await res.json()
        toast({ title: data.error || 'Error al crear viaje', variant: 'destructive' })
      }
    } catch (error) {
      console.error('Error creating trip:', error)
      toast({ title: 'Error al crear viaje', variant: 'destructive' })
    }
  }

  async function updateTrip() {
    if (!selectedTrip) return
    try {
      const res = await fetch(`/api/trips/${selectedTrip.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: selectedTrip.name,
          departure_date: selectedTrip.departure_date,
          return_date: selectedTrip.return_date,
          origin: selectedTrip.origin,
          destination: selectedTrip.destination,
          status: selectedTrip.status,
          notes: selectedTrip.notes,
        }),
      })
      if (res.ok) {
        toast({ title: 'Viaje actualizado' })
        setIsEditOpen(false)
        fetchTrips()
      } else {
        toast({ title: 'Error al actualizar', variant: 'destructive' })
      }
    } catch (error) {
      console.error('Error updating trip:', error)
      toast({ title: 'Error al actualizar', variant: 'destructive' })
    }
  }

  async function deleteTrip() {
    if (!selectedTrip) return
    try {
      const res = await fetch(`/api/trips/${selectedTrip.id}`, { method: 'DELETE' })
      if (res.ok) {
        toast({ title: 'Viaje eliminado' })
        setIsDeleteOpen(false)
        setSelectedTrip(null)
        fetchTrips()
      } else {
        toast({ title: 'Error al eliminar', variant: 'destructive' })
      }
    } catch (error) {
      console.error('Error deleting trip:', error)
      toast({ title: 'Error al eliminar', variant: 'destructive' })
    }
  }

  const upcomingTrips = trips.filter(t => ['planned', 'collecting'].includes(t.status))
  const activeTrips = trips.filter(t => t.status === 'in_transit')
  const completedTrips = trips.filter(t => t.status === 'completed')

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
            <Link href="/admin" className="text-muted-foreground hover:text-foreground">Pedidos</Link>
            <Link href="/admin/trips" className="text-yellow-500 font-medium">Viajes</Link>
            <Link href="/admin/finances" className="text-muted-foreground hover:text-foreground">Finanzas</Link>
            <Link href="/admin/users" className="text-muted-foreground hover:text-foreground">Usuarios</Link>
            <Button variant="ghost" size="sm" onClick={async () => {
              await fetch('/api/auth/logout', { method: 'POST' })
              router.push('/login')
            }}>
              <LogOut className="w-4 h-4 mr-2" /> Salir
            </Button>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Viajes</p>
                  <p className="text-3xl font-bold">{trips.length}</p>
                </div>
                <Plane className="w-10 h-10 text-yellow-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Próximos</p>
                  <p className="text-3xl font-bold text-blue-500">{upcomingTrips.length}</p>
                </div>
                <Calendar className="w-10 h-10 text-blue-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">En Tránsito</p>
                  <p className="text-3xl font-bold text-purple-500">{activeTrips.length}</p>
                </div>
                <Plane className="w-10 h-10 text-purple-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Completados</p>
                  <p className="text-3xl font-bold text-green-500">{completedTrips.length}</p>
                </div>
                <CheckCircle className="w-10 h-10 text-green-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Programación de Viajes</h2>
          <div className="flex gap-2">
            <Button variant="outline" onClick={fetchTrips}>
              <RefreshCw className="w-4 h-4 mr-2" /> Actualizar
            </Button>
            <Button onClick={() => setIsCreateOpen(true)}>
              <Plus className="w-4 h-4 mr-2" /> Nuevo Viaje
            </Button>
          </div>
        </div>

        {/* Trips List */}
        {loading ? (
          <div className="p-8 text-center">
            <div className="w-8 h-8 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : trips.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              <Plane className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No hay viajes programados</p>
              <Button className="mt-4" onClick={() => setIsCreateOpen(true)}>
                <Plus className="w-4 h-4 mr-2" /> Crear Primer Viaje
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {trips.map(trip => {
              const statusOpt = STATUS_OPTIONS.find(s => s.value === trip.status)
              return (
                <Card key={trip.id} className="hover:border-yellow-500/30 transition">
                  <CardContent className="py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                          <Plane className="w-6 h-6 text-yellow-500" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">{trip.name}</h3>
                          <div className="flex items-center gap-3 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(trip.departure_date + 'T00:00:00').toLocaleDateString('es-SV', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {trip.origin} → {trip.destination}
                            </span>
                          </div>
                          {trip.notes && (
                            <p className="text-xs text-muted-foreground mt-1">{trip.notes}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge className={`${statusOpt?.color || 'bg-gray-500'} text-white`}>
                          {statusOpt?.label || trip.status}
                        </Badge>
                        <Link href={`/admin/finances?trip=${trip.id}`}>
                          <Button variant="outline" size="sm">
                            <Package className="w-4 h-4 mr-1" /> Finanzas
                          </Button>
                        </Link>
                        <Button variant="ghost" size="icon" onClick={() => {
                          setSelectedTrip({ ...trip })
                          setIsEditOpen(true)
                        }}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-400 hover:bg-red-500/10" onClick={() => {
                          setSelectedTrip(trip)
                          setIsDeleteOpen(true)
                        }}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </main>

      {/* Create Trip Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Nuevo Viaje</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Nombre del Viaje</Label>
              <Input
                value={newTrip.name}
                onChange={(e) => setNewTrip({ ...newTrip, name: e.target.value })}
                placeholder="Viaje 28 Feb 2026"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Fecha de Salida</Label>
                <Input
                  type="date"
                  value={newTrip.departure_date}
                  onChange={(e) => setNewTrip({ ...newTrip, departure_date: e.target.value })}
                />
              </div>
              <div>
                <Label>Fecha de Regreso</Label>
                <Input
                  type="date"
                  value={newTrip.return_date}
                  onChange={(e) => setNewTrip({ ...newTrip, return_date: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Origen</Label>
                <Input
                  value={newTrip.origin}
                  onChange={(e) => setNewTrip({ ...newTrip, origin: e.target.value })}
                />
              </div>
              <div>
                <Label>Destino</Label>
                <Input
                  value={newTrip.destination}
                  onChange={(e) => setNewTrip({ ...newTrip, destination: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label>Notas</Label>
              <Input
                value={newTrip.notes}
                onChange={(e) => setNewTrip({ ...newTrip, notes: e.target.value })}
                placeholder="Vuelo AA123, Terminal 4..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancelar</Button>
            <Button onClick={createTrip}>Crear Viaje</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Trip Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Viaje</DialogTitle>
          </DialogHeader>
          {selectedTrip && (
            <div className="space-y-4">
              <div>
                <Label>Nombre</Label>
                <Input
                  value={selectedTrip.name}
                  onChange={(e) => setSelectedTrip({ ...selectedTrip, name: e.target.value })}
                />
              </div>
              <div>
                <Label>Estado</Label>
                <Select value={selectedTrip.status} onValueChange={(v) => setSelectedTrip({ ...selectedTrip, status: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Fecha de Salida</Label>
                  <Input
                    type="date"
                    value={selectedTrip.departure_date}
                    onChange={(e) => setSelectedTrip({ ...selectedTrip, departure_date: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Fecha de Regreso</Label>
                  <Input
                    type="date"
                    value={selectedTrip.return_date || ''}
                    onChange={(e) => setSelectedTrip({ ...selectedTrip, return_date: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Origen</Label>
                  <Input
                    value={selectedTrip.origin}
                    onChange={(e) => setSelectedTrip({ ...selectedTrip, origin: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Destino</Label>
                  <Input
                    value={selectedTrip.destination}
                    onChange={(e) => setSelectedTrip({ ...selectedTrip, destination: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <Label>Notas</Label>
                <Input
                  value={selectedTrip.notes || ''}
                  onChange={(e) => setSelectedTrip({ ...selectedTrip, notes: e.target.value })}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>Cancelar</Button>
            <Button onClick={updateTrip}>Guardar Cambios</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-500">
              <AlertTriangle className="w-5 h-5" />
              Eliminar Viaje
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-muted-foreground">
              ¿Eliminar <strong className="text-foreground">{selectedTrip?.name}</strong>?
              Los pedidos asignados se desvincularán pero no se eliminarán.
            </p>
            <p className="text-sm text-red-400 mt-2">Esta acción no se puede deshacer.</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>Cancelar</Button>
            <Button variant="destructive" onClick={deleteTrip}>
              <Trash2 className="w-4 h-4 mr-2" /> Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
