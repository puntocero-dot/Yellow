'use client'

import Link from 'next/link'
import { Truck, Package, Shield, Clock, Calculator, CheckCircle, XCircle, AlertTriangle, MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default function PricingPage() {
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
            <Link href="/pricing" className="text-yellow-500 font-medium">
              Tarifas
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

      <main className="container mx-auto px-4 py-16">
        {/* Hero */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Tarifas <span className="text-yellow-500">Transparentes</span>
          </h1>
          <p className="text-lg text-muted-foreground">
            Sin costos ocultos. Conoce exactamente cuánto cuesta enviar tu paquete 
            de Los Ángeles a El Salvador.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-20">
          <Card className="border-border relative">
            <CardHeader className="text-center pb-2">
              <Package className="w-10 h-10 text-yellow-500 mx-auto mb-2" />
              <CardTitle className="text-xl">Paquete Pequeño</CardTitle>
              <p className="text-sm text-muted-foreground">Hasta 1 libra</p>
            </CardHeader>
            <CardContent className="text-center">
              <div className="mb-6">
                <span className="text-4xl font-bold text-yellow-500">$15</span>
                <span className="text-muted-foreground text-sm">.00</span>
              </div>
              <ul className="space-y-3 text-sm text-left mb-6">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                  Precio mínimo de envío
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                  Incluye cargo por manejo
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                  Rastreo en tiempo real
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                  5-7 días hábiles
                </li>
              </ul>
              <Link href="/cotizar">
                <Button className="w-full" variant="outline">Cotizar Ahora</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="border-yellow-500 relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <Badge className="bg-yellow-500 text-black font-semibold px-4">Popular</Badge>
            </div>
            <CardHeader className="text-center pb-2">
              <Package className="w-10 h-10 text-yellow-500 mx-auto mb-2" />
              <CardTitle className="text-xl">Paquete Mediano</CardTitle>
              <p className="text-sm text-muted-foreground">1 - 10 libras</p>
            </CardHeader>
            <CardContent className="text-center">
              <div className="mb-6">
                <span className="text-4xl font-bold text-yellow-500">$5.50</span>
                <span className="text-muted-foreground text-sm">/libra</span>
              </div>
              <ul className="space-y-3 text-sm text-left mb-6">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                  + $3.00 cargo por manejo
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                  Rastreo en tiempo real
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                  Notificaciones WhatsApp
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                  Entrega a domicilio
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                  5-7 días hábiles
                </li>
              </ul>
              <Link href="/cotizar">
                <Button className="w-full">Cotizar Ahora</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="border-border relative">
            <CardHeader className="text-center pb-2">
              <Shield className="w-10 h-10 text-yellow-500 mx-auto mb-2" />
              <CardTitle className="text-xl">Personal Shopper</CardTitle>
              <p className="text-sm text-muted-foreground">Compramos por ti</p>
            </CardHeader>
            <CardContent className="text-center">
              <div className="mb-6">
                <span className="text-4xl font-bold text-yellow-500">10%</span>
                <span className="text-muted-foreground text-sm"> + envío</span>
              </div>
              <ul className="space-y-3 text-sm text-left mb-6">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                  Compra en Amazon, eBay, etc.
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                  Consolidación de paquetes
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                  Fotos antes de enviar
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                  Todo incluido
                </li>
              </ul>
              <Link href="/cotizar">
                <Button className="w-full" variant="outline">Consultar</Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Pricing Details */}
        <div className="max-w-4xl mx-auto mb-20">
          <h2 className="text-3xl font-bold text-center mb-8">
            Detalle de <span className="text-yellow-500">Tarifas</span>
          </h2>
          <Card>
            <CardContent className="p-0">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left p-4 font-medium">Concepto</th>
                    <th className="text-right p-4 font-medium">Precio</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t border-border">
                    <td className="p-4">Precio por libra</td>
                    <td className="p-4 text-right font-semibold text-yellow-500">$5.50 USD</td>
                  </tr>
                  <tr className="border-t border-border">
                    <td className="p-4">Envío mínimo</td>
                    <td className="p-4 text-right font-semibold text-yellow-500">$15.00 USD</td>
                  </tr>
                  <tr className="border-t border-border">
                    <td className="p-4">Cargo por manejo</td>
                    <td className="p-4 text-right font-semibold text-yellow-500">$3.00 USD</td>
                  </tr>
                  <tr className="border-t border-border">
                    <td className="p-4">Seguro (opcional)</td>
                    <td className="p-4 text-right font-semibold text-yellow-500">3% del valor declarado</td>
                  </tr>
                  <tr className="border-t border-border">
                    <td className="p-4">Personal Shopper</td>
                    <td className="p-4 text-right font-semibold text-yellow-500">10% del valor + envío</td>
                  </tr>
                  <tr className="border-t border-border">
                    <td className="p-4">Tiempo de entrega estimado</td>
                    <td className="p-4 text-right font-semibold">5-7 días hábiles</td>
                  </tr>
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>

        {/* Calculation Examples */}
        <div className="max-w-4xl mx-auto mb-20">
          <h2 className="text-3xl font-bold text-center mb-8">
            Ejemplos de <span className="text-yellow-500">Cálculo</span>
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="bg-card">
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground mb-2">2 libras</p>
                <div className="space-y-1 text-sm mb-3">
                  <p>2 × $5.50 = $11.00</p>
                  <p>+ $3.00 manejo</p>
                  <p className="text-xs text-muted-foreground">= $14.00 (mínimo $15)</p>
                </div>
                <p className="text-2xl font-bold text-yellow-500">$15.00</p>
              </CardContent>
            </Card>
            <Card className="bg-card">
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground mb-2">5 libras</p>
                <div className="space-y-1 text-sm mb-3">
                  <p>5 × $5.50 = $27.50</p>
                  <p>+ $3.00 manejo</p>
                </div>
                <p className="text-2xl font-bold text-yellow-500">$30.50</p>
              </CardContent>
            </Card>
            <Card className="bg-card">
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground mb-2">10 libras</p>
                <div className="space-y-1 text-sm mb-3">
                  <p>10 × $5.50 = $55.00</p>
                  <p>+ $3.00 manejo</p>
                </div>
                <p className="text-2xl font-bold text-yellow-500">$58.00</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Prohibited / Restricted Items */}
        <div className="max-w-4xl mx-auto mb-20">
          <h2 className="text-3xl font-bold text-center mb-8">
            Artículos <span className="text-yellow-500">Permitidos y Prohibidos</span>
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="border-red-500/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-500">
                  <XCircle className="w-5 h-5" />
                  Artículos Prohibidos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <XCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                    <span>Armas de fuego y municiones</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <XCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                    <span>Drogas y sustancias controladas</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <XCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                    <span>Explosivos y materiales inflamables</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <XCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                    <span>Dinero en efectivo</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <XCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                    <span>Animales vivos</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <XCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                    <span>Materiales radioactivos</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <XCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                    <span>Artículos falsificados</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-yellow-500/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-yellow-500">
                  <AlertTriangle className="w-5 h-5" />
                  Artículos Restringidos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-yellow-500 mt-0.5 shrink-0" />
                    <span><strong>Medicamentos:</strong> Receta médica válida</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-yellow-500 mt-0.5 shrink-0" />
                    <span><strong>Electrónicos {'>'}$200:</strong> Factura original</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-yellow-500 mt-0.5 shrink-0" />
                    <span><strong>Perfumes:</strong> Máx 3 unidades por tipo</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-yellow-500 mt-0.5 shrink-0" />
                    <span><strong>Alimentos empacados:</strong> Etiqueta con ingredientes</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-yellow-500 mt-0.5 shrink-0" />
                    <span><strong>Baterías de litio:</strong> Dentro del dispositivo</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-yellow-500 mt-0.5 shrink-0" />
                    <span><strong>Líquidos:</strong> Máx 500ml sellado</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Allowed items */}
        <div className="max-w-4xl mx-auto mb-20">
          <Card className="border-green-500/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-500">
                <CheckCircle className="w-5 h-5" />
                Artículos Permitidos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                {[
                  'Ropa y calzado',
                  'Celulares y tablets',
                  'Laptops',
                  'Accesorios y joyería',
                  'Juguetes',
                  'Libros y revistas',
                  'Artículos del hogar',
                  'Herramientas manuales',
                  'Productos de belleza',
                  'Vitaminas (uso personal)',
                  'Repuestos pequeños',
                  'Artículos deportivos',
                ].map((item) => (
                  <div key={item} className="flex items-center gap-2">
                    <CheckCircle className="w-3 h-3 text-green-500 shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* CTA */}
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold mb-4">¿Listo para enviar?</h2>
          <p className="text-muted-foreground mb-6">
            Usa nuestro chatbot inteligente para cotizar y crear tu pedido en minutos.
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/cotizar">
              <Button size="lg">
                <Calculator className="w-5 h-5 mr-2" />
                Cotizar Envío
              </Button>
            </Link>
            <Link href="/track">
              <Button size="lg" variant="outline">
                <Package className="w-5 h-5 mr-2" />
                Rastrear Pedido
              </Button>
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 border-t border-border mt-16">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© 2024 The Yellow Express. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  )
}
