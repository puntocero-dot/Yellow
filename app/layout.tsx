import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from '@/components/ui/toaster'
import { GoogleAnalytics } from '@/components/GoogleAnalytics'

const inter = Inter({ subsets: ['latin'], display: 'swap' })

export const metadata: Metadata = {
  title: 'The Yellow Express | Envios Seguros Los Angeles - El Salvador',
  description: 'Lider en logistica transfronteriza y envios de paquetes desde Los Angeles a El Salvador. Entrega en 5-7 dias habiles, rastreo en tiempo real y soporte 24/7 con IA. Courier confiable para encomiendas de Los Angeles a El Salvador.',
  keywords: ['courier el salvador', 'envios de paquetes a el salvador', 'encomiendas los angeles el salvador', 'logistica transfronteriza', 'personal shopper usa el salvador', 'envio de paquetes a centroamerica', 'courier confiable el salvador', 'como enviar paquete de usa a el salvador'],
  metadataBase: new URL('https://www.theyellowexpress.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'The Yellow Express - Tu Conexion Logistica entre USA y El Salvador',
    description: 'Envios rapidos y seguros de paquetes y encomiendas. Rastreo en tiempo real. Entrega a domicilio en los 14 departamentos.',
    url: 'https://www.theyellowexpress.com',
    siteName: 'The Yellow Express',
    locale: 'es_SV',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'The Yellow Express | Envios Los Angeles - El Salvador',
    description: 'Rastreo en tiempo real y entregas seguras en todo El Salvador. Courier confiable desde 2020.',
  },
  icons: {
    icon: '/icon.png',
    apple: '/icon.png',
  },
  manifest: '/manifest.json',
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  '@id': 'https://www.theyellowexpress.com',
  name: 'The Yellow Express',
  url: 'https://www.theyellowexpress.com',
  logo: 'https://www.theyellowexpress.com/icon.png',
  image: 'https://www.theyellowexpress.com/icon.png',
  description: 'Courier confiable para envios de paquetes y encomiendas de Los Angeles a El Salvador con rastreo en tiempo real.',
  priceRange: '$$',
  telephone: '+1-213-377-4155',
  email: 'admin@theyellowexpress.com',
  address: [
    {
      '@type': 'PostalAddress',
      addressLocality: 'Los Angeles',
      addressRegion: 'CA',
      addressCountry: 'US',
      name: 'Bodega Los Angeles',
    },
    {
      '@type': 'PostalAddress',
      addressLocality: 'San Salvador',
      addressCountry: 'SV',
      name: 'Oficina El Salvador',
    },
  ],
  geo: {
    '@type': 'GeoCoordinates',
    latitude: 34.0522,
    longitude: -118.2437,
  },
  areaServed: [
    {
      '@type': 'Country',
      name: 'El Salvador',
    },
    {
      '@type': 'City',
      name: 'Los Angeles',
      containedInPlace: {
        '@type': 'State',
        name: 'California',
      },
    },
  ],
  openingHoursSpecification: [
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      opens: '08:00',
      closes: '18:00',
    },
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: 'Saturday',
      opens: '08:00',
      closes: '12:00',
    },
  ],
  contactPoint: {
    '@type': 'ContactPoint',
    telephone: '+1-213-377-4155',
    contactType: 'customer service',
    areaServed: ['SV', 'US'],
    availableLanguage: ['es', 'en'],
  },
  sameAs: [
    'https://wa.me/12133774155',
  ],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" className="dark">
      <body className={inter.className}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {children}
        <Toaster />
        <GoogleAnalytics />
      </body>
    </html>
  )
}
