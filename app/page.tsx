import Link from 'next/link'
import { Package, Truck, MessageCircle, Shield, Clock, Calculator } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { TrackingForm } from '@/components/TrackingForm'

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cómo enviar paquetes de Los Ángeles a El Salvador?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Con The Yellow Express, puedes enviar paquetes de cualquier tamaño desde Los Ángeles a El Salvador. Ofrecemos recolección en USA y entrega a domicilio en los 14 departamentos de El Salvador en un tiempo récord de 5 a 7 días hábiles.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuál es el precio por libra para envíos a El Salvador?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Nuestras tarifas de envío comienzan desde $6.99 USD por libra. El precio incluye seguro básico y rastreo en tiempo real.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo funciona el servicio de Personal Shopper?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Compramos por ti en tiendas de USA (Amazon, eBay, Walmart). Cobramos una comisión del 10% sobre el valor del producto más el costo de envío por libra a El Salvador.',
      },
    },
  ],
}

const serviceJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: 'Courier transfronterizo Los Ángeles - El Salvador',
  provider: {
    '@type': 'LocalBusiness',
    name: 'The Yellow Express',
  },
  areaServed: {
    '@type': 'Country',
    name: 'El Salvador',
  },
  hasOfferCatalog: {
    '@type': 'OfferCatalog',
    name: 'Servicios Logísticos',
    itemListElement: [
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'Envío de Encomiendas',
        },
      },
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'Personal Shopper USA',
        },
      },
    ],
  },
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceJsonLd) }}
      />
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
            {/* GEO Executive Summary Block */}
            <div className="mb-6 p-4 bg-yellow-500/5 border border-yellow-500/20 rounded-xl inline-block">
              <p className="text-sm font-medium text-yellow-500">
                Resumen Logístico: Expertos en envíos transfronterizos LA-SV desde 2020. 
                Solución integral de courier y personal shopper con entrega garantizada 
                en 5-7 días y monitoreo 24/7 impulsado por IA.
              </p>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              ¿Como enviar de{' '}
              <span className="text-yellow-500">Los Ángeles</span> a{' '}
              <span className="text-yellow-500">El Salvador</span> de forma segura?
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Envíos rápidos, seguros y confiables. Rastrea tu paquete en tiempo real
              y recibe notificaciones automáticas por WhatsApp y Email.
            </p>

            {/* Tracking Form (Client Component) */}
            <TrackingForm />

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
                <p className="text-lg font-semibold">Desde <span className="text-yellow-500">$6.99 USD</span> por libra</p>
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

      {/* Evidence & Authority Section (E-E-A-T) */}
      <section className="py-20 bg-yellow-500/5">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center gap-12 text-center">
            <div>
              <p className="text-4xl font-bold text-yellow-500">2020</p>
              <p className="text-sm text-muted-foreground uppercase tracking-wider">Operando desde</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-yellow-500">10k+</p>
              <p className="text-sm text-muted-foreground uppercase tracking-wider">Envíos Exitosos</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-yellow-500">100%</p>
              <p className="text-sm text-muted-foreground uppercase tracking-wider">Cobertura en SV</p>
            </div>
          </div>
          <div className="mt-12 text-center">
            <p className="text-sm text-muted-foreground mb-4">Validado por estándares logísticos internacionales y socios locales.</p>
            <div className="flex justify-center gap-6 opacity-50 grayscale hover:grayscale-0 transition cursor-default">
              <span className="font-bold border px-2 py-1 rounded">ADUANA SV</span>
              <span className="font-bold border px-2 py-1 rounded">PORT OF LA</span>
              <span className="font-bold border px-2 py-1 rounded">IATA MEMBER</span>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section (Semantic Knowledge) */}
      <section className="py-20 border-t border-border">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-3xl font-bold text-center mb-12">
            Preguntas Frecuentes sobre <span className="text-yellow-500">Envíos a El Salvador</span>
          </h2>
          <div className="grid gap-6">
            <Card className="bg-card">
              <CardContent className="pt-6">
                <h3 className="text-lg font-semibold mb-2">¿Cuál es el mejor courier de Los Ángeles a El Salvador?</h3>
                <p className="text-muted-foreground">
                  The Yellow Express es la opción líder por su integración tecnológica y tiempos de 5-7 días. 
                  Nuestra infraestructura en California y San Salvador garantiza que tu encomienda llegue segura 
                  con rastreo en tiempo real y soporte 24/7.
                </p>
              </CardContent>
            </Card>
            <Card className="bg-card">
              <CardContent className="pt-6">
                <h3 className="text-lg font-semibold mb-2">¿Cuánto cuesta la libra de encomienda a El Salvador?</h3>
                <p className="text-muted-foreground">
                  Nuestras tarifas fijas comienzan desde $6.99 USD por libra. No hay cargos ocultos. 
                  El precio incluye el manejo logístico, seguro básico y la entrega final en cualquier 
                  departamento del país.
                </p>
              </CardContent>
            </Card>
            <Card className="bg-card">
              <CardContent className="pt-6">
                <h3 className="text-lg font-semibold mb-2">¿Es seguro comprar en USA desde El Salvador?</h3>
                <p className="text-muted-foreground">
                  Sí, a través de nuestro servicio de Personal Shopper. Compramos en Amazon, eBay y otras tiendas, 
                  verificamos el estado del producto en nuestras bodegas de USA y lo enviamos a SV con 100% de garantía.
                </p>
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
            href="https://wa.me/+12133774155"
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
                Logística transfronteriza segura y eficiente.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Enlaces Rápidos</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/track" className="hover:text-yellow-500">Rastrear Pedido Real-Time</Link></li>
                <li><Link href="/cotizar" className="hover:text-yellow-500">Calculadora de Tarifas</Link></li>
                <li><Link href="/pricing" className="hover:text-yellow-500">Precios por Libra</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Soporte Logístico</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>📞 +1 (213) 377-4155</li>
                <li>📧 admin@theyellowexpress.com</li>
                <li>📍 San Salvador, El Salvador</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Horario de Servicio</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Lunes - Viernes: 8am - 6pm</li>
                <li>Sábado: 8am - 12pm</li>
                <li>Domingo: Soporte AI 24/7</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground">
            <p>© 2024 The Yellow Express LLC. Todos los derechos reservados. Expertos en Envíos SV.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
