'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import {
  Truck, DollarSign, TrendingUp, TrendingDown, Plus, Trash2,
  Package, Plane, LogOut, RefreshCw, Weight, Calculator,
  AlertTriangle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
  status: string
}

type TripOrder = {
  id: string
  tracking_number: string
  customer_name: string
  customer_phone: string
  destination_city: string
  status: string
  weight_pounds: number | null
  created_at: string
}

type Expense = {
  id: string
  trip_id: string
  category: string
  description: string
  amount: number
  created_at: string
}

type UnassignedOrder = {
  id: string
  tracking_number: string
  customer_name: string
  destination_city: string
  weight_pounds: number | null
}

const PRICE_PER_POUND = 5.50
const HANDLING_FEE = 3.00

const EXPENSE_CATEGORIES = [
  { value: 'flight', label: 'Vuelo', icon: '✈️' },
  { value: 'luggage', label: 'Maletas Extra', icon: '🧳' },
  { value: 'gas', label: 'Gasolina', icon: '⛽' },
  { value: 'taxes', label: 'Impuestos/Taxes', icon: '🏛️' },
  { value: 'food', label: 'Alimentación', icon: '🍔' },
  { value: 'transport', label: 'Transporte Local', icon: '🚗' },
  { value: 'packaging', label: 'Empaque/Materiales', icon: '📦' },
  { value: 'other', label: 'Otros', icon: '📋' },
]

export default function FinancesPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()

  const [trips, setTrips] = useState<Trip[]>([])
  const [selectedTripId, setSelectedTripId] = useState<string>('')
  const [tripOrders, setTripOrders] = useState<TripOrder[]>([])
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [unassignedOrders, setUnassignedOrders] = useState<UnassignedOrder[]>([])
  const [loading, setLoading] = useState(true)

  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false)
  const [isAssignOrderOpen, setIsAssignOrderOpen] = useState(false)
  const [isDeleteExpenseOpen, setIsDeleteExpenseOpen] = useState(false)
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null)

  const [newExpense, setNewExpense] = useState({
    category: 'flight',
    description: '',
    amount: '',
  })

  const [editingWeight, setEditingWeight] = useState<string | null>(null)
  const [weightValue, setWeightValue] = useState('')

  useEffect(() => {
    fetchTrips()
  }, [])

  useEffect(() => {
    const tripParam = searchParams.get('trip')
    if (tripParam && trips.length > 0) {
      setSelectedTripId(tripParam)
    }
  }, [searchParams, trips])

  useEffect(() => {
    if (selectedTripId) {
      fetchTripDetails()
      fetchUnassignedOrders()
    }
  }, [selectedTripId])

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

  async function fetchTripDetails() {
    try {
      const res = await fetch(`/api/trips/${selectedTripId}`)
      const data = await res.json()
      setTripOrders(data.orders || [])
      setExpenses(data.expenses || [])
    } catch (error) {
      console.error('Error fetching trip details:', error)
    }
  }

  async function fetchUnassignedOrders() {
    try {
      const res = await fetch('/api/orders')
      const data = await res.json()
      const allOrders = data.orders || []
      setUnassignedOrders(allOrders.filter((o: { trip_id: string | null }) => !o.trip_id))
    } catch (error) {
      console.error('Error fetching orders:', error)
    }
  }

  async function addExpense() {
    if (!selectedTripId) return
    try {
      const res = await fetch(`/api/trips/${selectedTripId}/expenses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newExpense),
      })
      if (res.ok) {
        toast({ title: 'Gasto agregado' })
        setIsAddExpenseOpen(false)
        setNewExpense({ category: 'flight', description: '', amount: '' })
        fetchTripDetails()
      } else {
        toast({ title: 'Error al agregar gasto', variant: 'destructive' })
      }
    } catch (error) {
      console.error('Error adding expense:', error)
      toast({ title: 'Error al agregar gasto', variant: 'destructive' })
    }
  }

  async function deleteExpense() {
    if (!selectedTripId || !selectedExpense) return
    try {
      const res = await fetch(`/api/trips/${selectedTripId}/expenses?expenseId=${selectedExpense.id}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        toast({ title: 'Gasto eliminado' })
        setIsDeleteExpenseOpen(false)
        setSelectedExpense(null)
        fetchTripDetails()
      }
    } catch (error) {
      console.error('Error deleting expense:', error)
    }
  }

  async function assignOrder(orderId: string) {
    if (!selectedTripId) return
    try {
      const res = await fetch(`/api/trips/${selectedTripId}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order_ids: [orderId] }),
      })
      if (res.ok) {
        toast({ title: 'Pedido asignado al viaje' })
        fetchTripDetails()
        fetchUnassignedOrders()
      }
    } catch (error) {
      console.error('Error assigning order:', error)
    }
  }

  async function updateWeight(orderId: string) {
    if (!selectedTripId) return
    try {
      await fetch(`/api/trips/${selectedTripId}/orders`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order_id: orderId, weight_pounds: weightValue }),
      })
      setEditingWeight(null)
      fetchTripDetails()
    } catch (error) {
      console.error('Error updating weight:', error)
    }
  }

  // Calculations
  const totalPounds = tripOrders.reduce((sum, o) => sum + (o.weight_pounds || 0), 0)
  const totalRevenue = tripOrders.reduce((sum, o) => {
    const lbs = o.weight_pounds || 0
    const base = Math.max(lbs * PRICE_PER_POUND, lbs > 0 ? 15 : 0)
    return sum + base + (lbs > 0 ? HANDLING_FEE : 0)
  }, 0)
  const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount), 0)
  const netProfit = totalRevenue - totalExpenses

  const expensesByCategory = EXPENSE_CATEGORIES.map(cat => ({
    ...cat,
    total: expenses.filter(e => e.category === cat.value).reduce((sum, e) => sum + Number(e.amount), 0),
  })).filter(c => c.total > 0)

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
            <Link href="/admin/trips" className="text-muted-foreground hover:text-foreground">Viajes</Link>
            <Link href="/admin/finances" className="text-yellow-500 font-medium">Finanzas</Link>
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
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold">Costos y Ganancias</h1>
          <div className="flex items-center gap-3">
            <Label className="text-sm text-muted-foreground">Viaje:</Label>
            <Select value={selectedTripId} onValueChange={setSelectedTripId}>
              <SelectTrigger className="w-[280px]">
                <SelectValue placeholder="Seleccionar viaje..." />
              </SelectTrigger>
              <SelectContent>
                {trips.map(trip => (
                  <SelectItem key={trip.id} value={trip.id}>
                    {trip.name} — {new Date(trip.departure_date + 'T00:00:00').toLocaleDateString('es-SV')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {!selectedTripId ? (
          <Card>
            <CardContent className="py-16 text-center text-muted-foreground">
              <DollarSign className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg">Selecciona un viaje para ver sus costos y ganancias</p>
              <p className="text-sm mt-2">O <Link href="/admin/trips" className="text-yellow-500 hover:underline">crea un nuevo viaje</Link></p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Libras Totales</p>
                      <p className="text-3xl font-bold">{totalPounds.toFixed(1)}</p>
                    </div>
                    <Weight className="w-10 h-10 text-yellow-500 opacity-50" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Ingresos</p>
                      <p className="text-3xl font-bold text-green-500">${totalRevenue.toFixed(2)}</p>
                    </div>
                    <TrendingUp className="w-10 h-10 text-green-500 opacity-50" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Costos</p>
                      <p className="text-3xl font-bold text-red-500">${totalExpenses.toFixed(2)}</p>
                    </div>
                    <TrendingDown className="w-10 h-10 text-red-500 opacity-50" />
                  </div>
                </CardContent>
              </Card>
              <Card className={netProfit >= 0 ? 'border-green-500/30' : 'border-red-500/30'}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Ganancia Neta</p>
                      <p className={`text-3xl font-bold ${netProfit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        ${netProfit.toFixed(2)}
                      </p>
                    </div>
                    <DollarSign className={`w-10 h-10 opacity-50 ${netProfit >= 0 ? 'text-green-500' : 'text-red-500'}`} />
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
              {/* INGRESOS - Orders */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-green-500" />
                    Ingresos por Pedidos
                  </h2>
                  <Button size="sm" variant="outline" onClick={() => setIsAssignOrderOpen(true)}>
                    <Plus className="w-4 h-4 mr-1" /> Asignar Pedido
                  </Button>
                </div>
                <Card>
                  <CardContent className="p-0">
                    {tripOrders.length === 0 ? (
                      <div className="py-8 text-center text-muted-foreground">
                        <Package className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No hay pedidos asignados a este viaje</p>
                      </div>
                    ) : (
                      <table className="w-full">
                        <thead className="bg-muted/50">
                          <tr>
                            <th className="text-left p-3 text-sm font-medium">Pedido</th>
                            <th className="text-left p-3 text-sm font-medium">Cliente</th>
                            <th className="text-right p-3 text-sm font-medium">Libras</th>
                            <th className="text-right p-3 text-sm font-medium">USD</th>
                          </tr>
                        </thead>
                        <tbody>
                          {tripOrders.map(order => {
                            const lbs = order.weight_pounds || 0
                            const base = Math.max(lbs * PRICE_PER_POUND, lbs > 0 ? 15 : 0)
                            const orderTotal = base + (lbs > 0 ? HANDLING_FEE : 0)
                            return (
                              <tr key={order.id} className="border-t border-border">
                                <td className="p-3">
                                  <span className="font-mono text-yellow-500 text-sm">{order.tracking_number}</span>
                                </td>
                                <td className="p-3">
                                  <p className="text-sm font-medium">{order.customer_name}</p>
                                  <p className="text-xs text-muted-foreground">{order.destination_city}</p>
                                </td>
                                <td className="p-3 text-right">
                                  {editingWeight === order.id ? (
                                    <div className="flex items-center gap-1 justify-end">
                                      <Input
                                        type="number"
                                        step="0.1"
                                        value={weightValue}
                                        onChange={(e) => setWeightValue(e.target.value)}
                                        className="w-20 h-7 text-sm text-right"
                                        onKeyDown={(e) => { if (e.key === 'Enter') updateWeight(order.id) }}
                                        autoFocus
                                      />
                                      <Button size="sm" variant="ghost" className="h-7 px-2 text-xs" onClick={() => updateWeight(order.id)}>✓</Button>
                                    </div>
                                  ) : (
                                    <button
                                      className="text-sm hover:text-yellow-500 cursor-pointer"
                                      onClick={() => { setEditingWeight(order.id); setWeightValue(String(lbs)) }}
                                    >
                                      {lbs > 0 ? `${lbs} lbs` : <span className="text-muted-foreground italic">sin peso</span>}
                                    </button>
                                  )}
                                </td>
                                <td className="p-3 text-right font-semibold text-sm">
                                  {lbs > 0 ? `$${orderTotal.toFixed(2)}` : '-'}
                                </td>
                              </tr>
                            )
                          })}
                        </tbody>
                        <tfoot className="bg-muted/30">
                          <tr className="border-t-2 border-border">
                            <td className="p-3 font-semibold" colSpan={2}>Total</td>
                            <td className="p-3 text-right font-bold">{totalPounds.toFixed(1)} lbs</td>
                            <td className="p-3 text-right font-bold text-green-500">${totalRevenue.toFixed(2)}</td>
                          </tr>
                        </tfoot>
                      </table>
                    )}
                  </CardContent>
                </Card>

                <p className="text-xs text-muted-foreground mt-2">
                  Tarifa: ${PRICE_PER_POUND}/lb + ${HANDLING_FEE} manejo | Mínimo: $15.00 | Click en libras para editar
                </p>
              </div>

              {/* COSTOS - Expenses */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <TrendingDown className="w-5 h-5 text-red-500" />
                    Costos del Viaje
                  </h2>
                  <Button size="sm" variant="outline" onClick={() => setIsAddExpenseOpen(true)}>
                    <Plus className="w-4 h-4 mr-1" /> Agregar Costo
                  </Button>
                </div>
                <Card>
                  <CardContent className="p-0">
                    {expenses.length === 0 ? (
                      <div className="py-8 text-center text-muted-foreground">
                        <DollarSign className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No hay costos registrados</p>
                      </div>
                    ) : (
                      <table className="w-full">
                        <thead className="bg-muted/50">
                          <tr>
                            <th className="text-left p-3 text-sm font-medium">Categoría</th>
                            <th className="text-left p-3 text-sm font-medium">Descripción</th>
                            <th className="text-right p-3 text-sm font-medium">Monto</th>
                            <th className="p-3 w-10"></th>
                          </tr>
                        </thead>
                        <tbody>
                          {expenses.map(expense => {
                            const cat = EXPENSE_CATEGORIES.find(c => c.value === expense.category)
                            return (
                              <tr key={expense.id} className="border-t border-border">
                                <td className="p-3">
                                  <span className="text-sm">{cat?.icon} {cat?.label || expense.category}</span>
                                </td>
                                <td className="p-3 text-sm text-muted-foreground">{expense.description}</td>
                                <td className="p-3 text-right font-semibold text-sm text-red-400">
                                  ${Number(expense.amount).toFixed(2)}
                                </td>
                                <td className="p-3">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 text-red-500 hover:text-red-400"
                                    onClick={() => { setSelectedExpense(expense); setIsDeleteExpenseOpen(true) }}
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </Button>
                                </td>
                              </tr>
                            )
                          })}
                        </tbody>
                        <tfoot className="bg-muted/30">
                          <tr className="border-t-2 border-border">
                            <td className="p-3 font-semibold" colSpan={2}>Total Costos</td>
                            <td className="p-3 text-right font-bold text-red-500">${totalExpenses.toFixed(2)}</td>
                            <td></td>
                          </tr>
                        </tfoot>
                      </table>
                    )}
                  </CardContent>
                </Card>

                {/* Expense Breakdown */}
                {expensesByCategory.length > 0 && (
                  <Card className="mt-4">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm text-muted-foreground">Desglose por Categoría</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {expensesByCategory.map(cat => (
                          <div key={cat.value} className="flex items-center justify-between">
                            <span className="text-sm">{cat.icon} {cat.label}</span>
                            <div className="flex items-center gap-2">
                              <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-red-500 rounded-full"
                                  style={{ width: `${(cat.total / totalExpenses) * 100}%` }}
                                />
                              </div>
                              <span className="text-sm font-semibold w-20 text-right">${cat.total.toFixed(2)}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>

            {/* Profit Summary Banner */}
            <Card className={`mt-8 ${netProfit >= 0 ? 'border-green-500/50 bg-green-500/5' : 'border-red-500/50 bg-red-500/5'}`}>
              <CardContent className="py-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold">Resumen del Viaje</h3>
                    <p className="text-sm text-muted-foreground">
                      {tripOrders.length} pedidos · {totalPounds.toFixed(1)} libras
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-8">
                      <div>
                        <p className="text-xs text-muted-foreground">Ingresos</p>
                        <p className="text-lg font-bold text-green-500">+${totalRevenue.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Costos</p>
                        <p className="text-lg font-bold text-red-500">-${totalExpenses.toFixed(2)}</p>
                      </div>
                      <div className="pl-4 border-l border-border">
                        <p className="text-xs text-muted-foreground">Ganancia Neta</p>
                        <p className={`text-2xl font-bold ${netProfit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                          ${netProfit.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </main>

      {/* Add Expense Dialog */}
      <Dialog open={isAddExpenseOpen} onOpenChange={setIsAddExpenseOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Agregar Costo</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Categoría</Label>
              <Select value={newExpense.category} onValueChange={(v) => setNewExpense({ ...newExpense, category: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {EXPENSE_CATEGORIES.map(cat => (
                    <SelectItem key={cat.value} value={cat.value}>{cat.icon} {cat.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Descripción</Label>
              <Input
                value={newExpense.description}
                onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                placeholder="Ej: Vuelo AA123 LAX-SAL"
              />
            </div>
            <div>
              <Label>Monto (USD)</Label>
              <Input
                type="number"
                step="0.01"
                value={newExpense.amount}
                onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                placeholder="350.00"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddExpenseOpen(false)}>Cancelar</Button>
            <Button onClick={addExpense}>Agregar Costo</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign Order Dialog */}
      <Dialog open={isAssignOrderOpen} onOpenChange={setIsAssignOrderOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Asignar Pedido al Viaje</DialogTitle>
          </DialogHeader>
          <div className="max-h-[400px] overflow-y-auto">
            {unassignedOrders.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No hay pedidos sin asignar</p>
            ) : (
              <div className="space-y-2">
                {unassignedOrders.map(order => (
                  <div key={order.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50">
                    <div>
                      <span className="font-mono text-yellow-500 text-sm">{order.tracking_number}</span>
                      <p className="text-sm">{order.customer_name} · {order.destination_city}</p>
                    </div>
                    <Button size="sm" onClick={() => assignOrder(order.id)}>
                      <Plus className="w-4 h-4 mr-1" /> Asignar
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAssignOrderOpen(false)}>Cerrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Expense Confirmation */}
      <Dialog open={isDeleteExpenseOpen} onOpenChange={setIsDeleteExpenseOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-500">
              <AlertTriangle className="w-5 h-5" /> Eliminar Gasto
            </DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground">
            ¿Eliminar <strong className="text-foreground">{selectedExpense?.description}</strong> (${Number(selectedExpense?.amount || 0).toFixed(2)})?
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteExpenseOpen(false)}>Cancelar</Button>
            <Button variant="destructive" onClick={deleteExpense}>
              <Trash2 className="w-4 h-4 mr-2" /> Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
