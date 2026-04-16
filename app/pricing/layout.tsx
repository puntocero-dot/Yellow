import type { Metadata } from 'next'
import { BreadcrumbSchema } from '@/components/BreadcrumbSchema'

export const metadata: Metadata = {
  title: 'Tarifas de Envio Los Angeles a El Salvador | The Yellow Express',
  description: 'Conoce el precio por libra para enviar encomiendas de Los Angeles a El Salvador. Tarifas transparentes desde $6.99 USD/lb. Sin cargos ocultos. Entrega en 5-7 dias.',
  keywords: ['precio por libra encomienda el salvador', 'tarifas envio usa el salvador', 'cuanto cuesta enviar paquete a el salvador', 'courier los angeles el salvador precios'],
  alternates: {
    canonical: '/pricing',
  },
  openGraph: {
    title: 'Tarifas de Envio a El Salvador | The Yellow Express',
    description: 'Precios transparentes para envio de paquetes. Desde $6.99 USD por libra con seguro incluido.',
    url: 'https://www.theyellowexpress.com/pricing',
  },
}

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: 'Inicio', url: '/' },
          { name: 'Tarifas', url: '/pricing' },
        ]}
      />
      {children}
    </>
  )
}
