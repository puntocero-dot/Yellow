// Precios por libra según destino
export const PRICING = {
  // Precio base por libra (USD)
  pricePerPound: 5.50,
  // Precio mínimo de envío
  minimumCharge: 15.00,
  // Cargo por manejo
  handlingFee: 3.00,
  // Seguro opcional (% del valor declarado)
  insuranceRate: 0.03,
}

// Ciudades de cobertura en Los Ángeles
export const LA_COVERAGE_CITIES = [
  'Los Angeles',
  'Long Beach',
  'Santa Ana',
  'Anaheim',
  'Irvine',
  'Glendale',
  'Huntington Beach',
  'Santa Clarita',
  'Garden Grove',
  'Oceanside',
  'Rancho Cucamonga',
  'Ontario',
  'Fontana',
  'Moreno Valley',
  'San Bernardino',
  'Riverside',
  'Corona',
  'Pomona',
  'Pasadena',
  'Torrance',
  'Downey',
  'West Covina',
  'Norwalk',
  'El Monte',
  'Inglewood',
  'Burbank',
  'Compton',
  'Carson',
  'Costa Mesa',
  'Mission Viejo',
]

// Ciudades de entrega en El Salvador
export const SV_DELIVERY_CITIES = [
  'San Salvador',
  'Santa Ana',
  'San Miguel',
  'Soyapango',
  'Santa Tecla',
  'Mejicanos',
  'Apopa',
  'Delgado',
  'Ilopango',
  'Tonacatepeque',
  'San Marcos',
  'Antiguo Cuscatlán',
  'Chalchuapa',
  'Ahuachapán',
  'Usulután',
  'Sonsonate',
  'Cojutepeque',
  'Zacatecoluca',
  'San Vicente',
  'La Unión',
]

// Artículos PROHIBIDOS (no se pueden enviar)
export const PROHIBITED_ITEMS = [
  { item: 'Armas de fuego y municiones', reason: 'Prohibido por ley' },
  { item: 'Drogas y sustancias controladas', reason: 'Ilegal' },
  { item: 'Explosivos y materiales inflamables', reason: 'Peligroso' },
  { item: 'Dinero en efectivo', reason: 'Regulaciones bancarias' },
  { item: 'Animales vivos', reason: 'Requiere permisos especiales' },
  { item: 'Plantas y semillas', reason: 'Regulaciones fitosanitarias' },
  { item: 'Productos perecederos sin refrigeración', reason: 'Riesgo de deterioro' },
  { item: 'Materiales radioactivos', reason: 'Peligroso' },
  { item: 'Artículos falsificados', reason: 'Ilegal' },
  { item: 'Pornografía', reason: 'Prohibido' },
]

// Artículos RESTRINGIDOS (requieren documentación)
export const RESTRICTED_ITEMS = [
  { item: 'Medicamentos con receta', requirement: 'Receta médica válida' },
  { item: 'Suplementos alimenticios', requirement: 'Factura y registro sanitario' },
  { item: 'Electrónicos nuevos (valor > $200)', requirement: 'Factura original' },
  { item: 'Perfumes y cosméticos', requirement: 'Límite de 3 unidades por tipo' },
  { item: 'Alimentos empacados', requirement: 'Etiqueta con ingredientes' },
  { item: 'Baterías de litio', requirement: 'Deben ir dentro del dispositivo' },
  { item: 'Líquidos', requirement: 'Máximo 500ml por envase, sellado' },
]

// Artículos PERMITIDOS comunes
export const ALLOWED_ITEMS = [
  'Ropa y calzado',
  'Electrónicos (celulares, tablets, laptops)',
  'Accesorios y joyería de fantasía',
  'Juguetes',
  'Libros y revistas',
  'Artículos para el hogar',
  'Herramientas manuales',
  'Productos de belleza (cantidades personales)',
  'Vitaminas y suplementos (uso personal)',
  'Repuestos de vehículos (pequeños)',
  'Artículos deportivos',
  'Instrumentos musicales pequeños',
]

// Enlaces útiles de aduanas
export const CUSTOMS_LINKS = {
  usa: 'https://www.cbp.gov/travel/international-visitors/know-before-you-go',
  elsalvador: 'https://www.aduana.gob.sv/',
}

// Calcular precio estimado
export function calculateShippingCost(
  weightPounds: number,
  declaredValue: number = 0,
  includeInsurance: boolean = false
): {
  baseCost: number
  handlingFee: number
  insurance: number
  total: number
  breakdown: string[]
} {
  const baseCost = Math.max(
    weightPounds * PRICING.pricePerPound,
    PRICING.minimumCharge
  )
  
  const handlingFee = PRICING.handlingFee
  const insurance = includeInsurance ? declaredValue * PRICING.insuranceRate : 0
  const total = baseCost + handlingFee + insurance

  const breakdown = [
    `Envío (${weightPounds} lbs x $${PRICING.pricePerPound.toFixed(2)}): $${baseCost.toFixed(2)}`,
    `Cargo por manejo: $${handlingFee.toFixed(2)}`,
  ]

  if (includeInsurance && insurance > 0) {
    breakdown.push(`Seguro (${(PRICING.insuranceRate * 100).toFixed(0)}% de $${declaredValue.toFixed(2)}): $${insurance.toFixed(2)}`)
  }

  breakdown.push(`**Total estimado: $${total.toFixed(2)}**`)

  return { baseCost, handlingFee, insurance, total, breakdown }
}
