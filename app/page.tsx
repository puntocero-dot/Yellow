'use client'

import Link from 'next/link'
import { Package, Truck, MapPin, MessageCircle, Shield, Clock, Calculator } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function HomePage() {
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
            <Link href="/track" className="text-muted-foreground hover:text-foreground transition">
              Rastrear
            </Link>
            <Link href="/login" className="text-muted-foreground hover:text-foreground transition">
              Ingresar
            </Link>
          </nav>
          <Link href="/cotizar">
            <Button>
              <Calculator className="w-4 h-4 mr-2" />
              Cotizar Envío
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/20 via-transparent to-transparent" />
        <div className="container mx-auto px-4 relative">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Tu conexión entre{' '}
              <span className="text-yellow-500">Los Ángeles</span> y{' '}
              <span className="text-yellow-500">El Salvador</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Envíos rápidos, seguros y confiables. Rastrea tu paquete en tiempo real 
              y recibe notificaciones automáticas por WhatsApp y Email.
            </p>

            {/* Tracking Form */}
            <form onSubmit={handleTrack} className="max-w-xl mx-auto">
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="Ingresa tu número de guía (ej: YE20240115ABC)"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  className="h-12 text-lg"
                />
                <Button type="submit" size="lg" className="h-12 px-8">
                  <MapPin className="w-5 h-5 mr-2" />
                  Rastrear
                </Button>
              </div>
            </form>

            <div className="flex flex-wrap justify-center gap-4 mt-8">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Shield className="w-4 h-4 text-yellow-500" />
                <span>Envíos asegurados</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="w-4 h-4 text-yellow-500" />
                <span>5-7 días hábiles</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MessageCircle className="w-4 h-4 text-yellow-500" />
                <span>Soporte 24/7</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-card">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            ¿Por qué elegir <span className="text-yellow-500">Yellow Express</span>?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="bg-background border-border">
              <CardContent className="pt-6">
                <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center mb-4">
                  <Package className="w-6 h-6 text-yellow-500" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Rastreo en Tiempo Real</h3>
                <p className="text-muted-foreground">
                  Sigue tu paquete desde Los Ángeles hasta tu puerta en El Salvador. 
                  Actualizaciones instantáneas en cada etapa del envío.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-background border-border">
              <CardContent className="pt-6">
                <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center mb-4">
                  <MessageCircle className="w-6 h-6 text-yellow-500" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Notificaciones Automáticas</h3>
                <p className="text-muted-foreground">
                  Recibe alertas por WhatsApp y Email cada vez que tu paquete 
                  cambie de estado. Nunca pierdas de vista tu envío.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-background border-border">
              <CardContent className="pt-6">
                <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center mb-4">
                  <Truck className="w-6 h-6 text-yellow-500" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Entrega a Domicilio</h3>
                <p className="text-muted-foreground">
                  Nuestros motoristas entregan directamente en tu puerta. 
                  Cobertura en todo El Salvador con comprobante de entrega.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Nuestros Servicios</h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card className="bg-card border-yellow-500/30 hover:border-yellow-500 transition">
              <CardContent className="pt-6">
                <h3 className="text-2xl font-bold text-yellow-500 mb-4">📦 Envío de Paquetes</h3>
                <ul className="space-y-2 text-muted-foreground mb-4">
                  <li>• Paquetes de cualquier tamaño</li>
                  <li>• Ropa, electrónicos, documentos</li>
                  <li>• Seguro incluido</li>
                  <li>• Entrega en 5-7 días hábiles</li>
                </ul>
                <p className="text-lg font-semibold">Desde <span className="text-yellow-500">$8</span> por libra</p>
              </CardContent>
            </Card>

            <Card className="bg-card border-yellow-500/30 hover:border-yellow-500 transition">
              <CardContent className="pt-6">
                <h3 className="text-2xl font-bold text-yellow-500 mb-4">🛒 Personal Shopper</h3>
                <ul className="space-y-2 text-muted-foreground mb-4">
                  <li>• Compramos por ti en USA</li>
                  <li>• Amazon, eBay, tiendas locales</li>
                  <li>• Consolidación de paquetes</li>
                  <li>• Fotos de productos antes de enviar</li>
                </ul>
                <p className="text-lg font-semibold"><span className="text-yellow-500">10%</span> del valor + envío</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-yellow-500">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-black mb-4">
            ¿Tienes preguntas? Nuestro chatbot te ayuda 24/7
          </h2>
          <p className="text-black/80 text-lg mb-8 max-w-2xl mx-auto">
            Escríbenos por WhatsApp y nuestro asistente de IA responderá tus dudas 
            sobre envíos, tarifas y estado de pedidos al instante.
          </p>
          <a 
            href="https://wa.me/50312345678" 
            target="_blank" 
            rel="noopener noreferrer"
          >
            <Button size="lg" variant="secondary" className="h-14 px-8 text-lg">
              <MessageCircle className="w-6 h-6 mr-2" />
              Chatear por WhatsApp
            </Button>
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-card border-t border-border">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center">
                  <Truck className="w-5 h-5 text-black" />
                </div>
                <span className="font-bold text-yellow-500">The Yellow Express</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Tu conexión confiable entre Los Ángeles y El Salvador desde 2020.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Enlaces</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/track" className="hover:text-yellow-500">Rastrear Pedido</Link></li>
                <li><Link href="/services" className="hover:text-yellow-500">Servicios</Link></li>
                <li><Link href="/pricing" className="hover:text-yellow-500">Tarifas</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contacto</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>📞 +503 1234 5678</li>
                <li>📧 info@yellowexpress.com</li>
                <li>📍 San Salvador, El Salvador</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Horario</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Lunes - Viernes: 8am - 6pm</li>
                <li>Sábado: 8am - 12pm</li>
                <li>Domingo: Cerrado</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground">
            <p>© 2024 The Yellow Express. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
