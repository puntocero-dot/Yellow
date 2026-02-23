import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatTrackingNumber(id: string): string {
  const date = new Date()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `YE${year}${month}${day}${id.slice(0, 3).toUpperCase()}`
}

export function formatDate(date: Date | string): string {
  const d = new Date(date)
  return d.toLocaleDateString('es-SV', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount)
}

export const ORDER_STATUSES = {
  pending: { label: 'Pendiente', color: 'bg-gray-500' },
  warehouse_la: { label: 'Bodega LA', color: 'bg-blue-500' },
  warehouse_sv: { label: 'Bodega SV', color: 'bg-blue-600' },
  in_transit_international: { label: 'En Tránsito Internacional', color: 'bg-purple-500' },
  customs: { label: 'En Aduana', color: 'bg-orange-500' },
  assigned_to_driver: { label: 'Asignado a Motorista', color: 'bg-yellow-500' },
  out_for_delivery: { label: 'En Ruta de Entrega', color: 'bg-cyan-500' },
  delivered: { label: 'Entregado', color: 'bg-green-500' },
  cancelled: { label: 'Cancelado', color: 'bg-red-500' }
} as const

export type OrderStatus = keyof typeof ORDER_STATUSES

export const USER_ROLES = {
  admin: 'Administrador',
  driver: 'Motorista',
  customer: 'Cliente'
} as const

export type UserRole = keyof typeof USER_ROLES
