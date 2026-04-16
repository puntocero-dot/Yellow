import type { Metadata } from 'next'
import { BreadcrumbSchema } from '@/components/BreadcrumbSchema'

export const metadata: Metadata = {
  title: 'Rastrear Paquete | The Yellow Express',
  description: 'Rastrea tu envio de Los Angeles a El Salvador en tiempo real. Ingresa tu numero de rastreo y conoce el estado exacto de tu paquete en cada etapa.',
  keywords: ['rastrear envio el salvador', 'rastreo de paquetes', 'tracking encomienda', 'seguimiento de envio usa el salvador'],
  alternates: {
    canonical: '/track',
  },
  openGraph: {
    title: 'Rastrear Paquete | The Yellow Express',
    description: 'Rastreo en tiempo real de tu envio desde Los Angeles a El Salvador.',
    url: 'https://www.theyellowexpress.com/track',
  },
}

export default function TrackLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: 'Inicio', url: '/' },
          { name: 'Rastrear Pedido', url: '/track' },
        ]}
      />
      {children}
    </>
  )
}
