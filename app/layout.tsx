import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from '@/components/ui/toaster'

const inter = Inter({ subsets: ['latin'], display: 'swap' })

export const metadata: Metadata = {
  title: 'The Yellow Express | Envíos Seguros Los Ángeles - El Salvador',
  description: 'Líder en logística transfronteriza y envíos de paquetes desde Los Ángeles a El Salvador. Entrega en 5-7 días hábiles, rastreo en tiempo real y soporte 24/7 con IA.',
  keywords: ['courier el salvador', 'enviós de paquetes a el salvador', 'encomiendas los angeles el salvador', 'logistica transfronteriza', 'personal shopper usa el salvador'],
  metadataBase: new URL('https://www.theyellowexpress.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'The Yellow Express - Tu Conexión Logística entre USA y El Salvador',
    description: 'Envíos rápidos y seguros de paquetes y encomiendas. Rastreo en tiempo real.',
    url: 'https://www.theyellowexpress.com',
    siteName: 'The Yellow Express',
    locale: 'es_SV',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'The Yellow Express | Envíos Los Ángeles - El Salvador',
    description: 'Rastreo en tiempo real y entregas seguras en todo El Salvador.',
  },
  icons: {
    icon: '/icon.png',
    apple: '/icon.png',
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'The Yellow Express',
  url: 'https://www.theyellowexpress.com',
  logo: 'https://www.theyellowexpress.com/icon.png',
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
      </body>
    </html>
  )
}
