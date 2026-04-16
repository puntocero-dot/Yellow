import { AnimatedLanding } from '@/components/AnimatedLanding'

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
    {
      '@type': 'Question',
      name: '¿Qué departamentos de El Salvador tienen cobertura de entrega?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Cubrimos los 14 departamentos: San Salvador, La Libertad, Santa Ana, San Miguel, Sonsonate, Usulután, La Paz, Ahuachapán, La Unión, Chalatenango, Cuscatlán, San Vicente, Morazán y Cabañas.',
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
    priceRange: '$$',
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
          name: 'Envío de Encomiendas Los Angeles a El Salvador',
          description: 'Servicio de courier confiable para envio de paquetes desde Los Angeles, California a todo El Salvador con rastreo en tiempo real.',
        },
      },
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'Personal Shopper USA a El Salvador',
          description: 'Servicio de compras en tiendas de Estados Unidos con envio directo a El Salvador.',
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

      <AnimatedLanding />
    </div>
  )
}
