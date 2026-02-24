'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Truck, MapPin, Search, Package, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'

export default function TrackPage() {
  const [trackingNumber, setTrackingNumber] = useState('')
  const router = useRouter()

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault()
    if (trackingNumber.trim()) {
      router.push(`/track/${trackingNumber.trim()}`)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-yellow-500 rounded-lg flex items-center justify-center">
              <Truck className="w-6 h-6 text-black" />
            </div>
            <span className="text-xl font-bold text-yellow-500">The Yellow Express</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/cotizar" className="text-muted-foreground hover:text-foreground transition">
              Cotizar
            </Link>
            <Link href="/track" className="text-yellow-500 font-medium">
              Rastrear
            </Link>
            <Link href="/pricing" className="text-muted-foreground hover:text-foreground transition">
              Tarifas
            </Link>
            <Link href="/login" className="text-muted-foreground hover:text-foreground transition">
              Ingresar
            </Link>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          <div className="w-16 h-16 bg-yellow-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <MapPin className="w-8 h-8 text-yellow-500" />
          </div>
          <h1 className="text-4xl font-bold mb-4">Rastrear Pedido</h1>
          <p className="text-muted-foreground text-lg mb-8">
            Ingresa tu número de guía para ver el estado actual de tu envío
          </p>

          <form onSubmit={handleTrack} className="max-w-xl mx-auto mb-12">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Ej: YE20260221C78"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  className="h-14 text-lg pl-11"
                  required
                />
              </div>
              <Button type="submit" size="lg" className="h-14 px-8">
                <MapPin className="w-5 h-5 mr-2" />
                Rastrear
              </Button>
            </div>
          </form>

          <div className="grid md:grid-cols-3 gap-6">
            <Card className="bg-card border-border">
              <CardContent className="pt-6 text-center">
                <Package className="w-8 h-8 text-yellow-500 mx-auto mb-3" />
                <h3 className="font-semibold mb-1">Recogido</h3>
                <p className="text-sm text-muted-foreground">
                  Tu paquete es recibido en nuestra bodega de Los Ángeles
                </p>
              </CardContent>
            </Card>
            <Card className="bg-card border-border">
              <CardContent className="pt-6 text-center">
                <Truck className="w-8 h-8 text-yellow-500 mx-auto mb-3" />
                <h3 className="font-semibold mb-1">En Tránsito</h3>
                <p className="text-sm text-muted-foreground">
                  Seguimiento en tiempo real mientras viaja a El Salvador
                </p>
              </CardContent>
            </Card>
            <Card className="bg-card border-border">
              <CardContent className="pt-6 text-center">
                <ArrowRight className="w-8 h-8 text-yellow-500 mx-auto mb-3" />
                <h3 className="font-semibold mb-1">Entregado</h3>
                <p className="text-sm text-muted-foreground">
                  Entrega directa a tu puerta con comprobante
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 border-t border-border mt-auto">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© 2024 The Yellow Express. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  )
}
