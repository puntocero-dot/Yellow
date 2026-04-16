import type { Metadata } from 'next'
import { BreadcrumbSchema } from '@/components/BreadcrumbSchema'

export const metadata: Metadata = {
  title: 'Cotizar Envio a El Salvador | The Yellow Express',
  description: 'Cotiza tu envio de Los Angeles a El Salvador al instante. Calculadora de tarifas con precios desde $6.99 USD por libra. Chatbot con IA para asistencia inmediata.',
  keywords: ['cotizar envio los angeles el salvador', 'calculadora de envio a el salvador', 'cuanto cuesta enviar encomienda', 'cotizacion courier el salvador'],
  alternates: {
    canonical: '/cotizar',
  },
  openGraph: {
    title: 'Cotizar Envio a El Salvador | The Yellow Express',
    description: 'Calcula el costo de tu envio al instante con nuestro chatbot inteligente.',
    url: 'https://www.theyellowexpress.com/cotizar',
  },
}

export default function CotizarLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: 'Inicio', url: '/' },
          { name: 'Cotizar Envio', url: '/cotizar' },
        ]}
      />
      {children}
    </>
  )
}
