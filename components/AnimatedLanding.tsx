'use client'

import Link from 'next/link'
import { Package, Truck, MessageCircle, Shield, Clock, Calculator, Plane, Home, Warehouse, Star, CheckCircle, ArrowRight, Globe, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { TrackingForm } from '@/components/TrackingForm'
import { Header } from '@/components/Header'
import { LandingAnimations } from '@/components/LandingAnimations'
import {
  motion,
  FadeIn,
  SlideIn,
  ScaleIn,
  TextReveal,
  StaggerChildren,
  StaggerItem,
  FloatingElement,
  HeroParticles,
  AccordionItem,
} from '@/components/motion'
import { HeroCanvas } from '@/components/three/HeroCanvas'

const departments = [
  'San Salvador', 'La Libertad', 'Santa Ana', 'San Miguel',
  'Sonsonate', 'Usulutan', 'La Paz', 'Ahuachapan',
  'La Union', 'Chalatenango', 'Cuscatlan', 'San Vicente',
  'Morazan', 'Cabanas',
]

export function AnimatedLanding() {
  return (
    <>
      <Header />

      {/* Hero Section */}
      <section className="relative py-20 md:py-32 overflow-hidden">
        {/* Animated gradient backgrounds */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-yellow-500/20 via-yellow-500/5 to-transparent"
          animate={{
            opacity: [0.7, 1, 0.7],
          }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-yellow-500/10 via-transparent to-transparent"
          animate={{
            scale: [1, 1.05, 1],
            opacity: [0.5, 0.8, 0.5],
          }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* 3D Hero Canvas (with fallback for mobile) */}
        <HeroCanvas />

        {/* Floating particles */}
        <HeroParticles count={20} />

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: -20, filter: 'blur(10px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className="mb-6 p-4 bg-yellow-500/5 border border-yellow-500/20 rounded-xl inline-block"
            >
              <p className="text-sm font-medium text-yellow-500">
                Expertos en envios transfronterizos LA-SV desde 2020.
                Courier y personal shopper con entrega en 5-7 dias y monitoreo 24/7.
              </p>
            </motion.div>

            {/* H1 with text reveal */}
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              <TextReveal
                text="Envia de Los Angeles a El Salvador de forma segura"
                highlightWords={['Los', 'Angeles', 'El', 'Salvador']}
                highlightClassName="text-yellow-500"
              />
            </h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6, ease: 'easeOut' }}
              className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto"
            >
              Encomiendas de Los Angeles a El Salvador con courier confiable.
              Rastrea tu paquete en tiempo real y recibe notificaciones automaticas por WhatsApp y Email.
            </motion.p>

            {/* Tracking Form */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.8, type: 'spring', stiffness: 200, damping: 20 }}
            >
              <TrackingForm />
            </motion.div>

            {/* Trust indicators */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={{
                hidden: {},
                visible: { transition: { staggerChildren: 0.1, delayChildren: 1.0 } },
              }}
              className="flex flex-wrap justify-center gap-4 mt-8"
            >
              {[
                { icon: Shield, text: 'Envios asegurados' },
                { icon: Clock, text: '5-7 dias habiles' },
                { icon: MessageCircle, text: 'Soporte 24/7' },
              ].map((item) => (
                <motion.div
                  key={item.text}
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
                  }}
                  className="flex items-center gap-2 text-sm text-muted-foreground"
                >
                  <item.icon className="w-4 h-4 text-yellow-500" />
                  <span>{item.text}</span>
                </motion.div>
              ))}
            </motion.div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row justify-center gap-3 mt-8">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 1.2 }}
              >
                <Link href="/cotizar">
                  <Button size="lg" className="h-12 px-6 text-base w-full sm:w-auto">
                    <Calculator className="w-5 h-5 mr-2" />
                    Cotizar Envio
                  </Button>
                </Link>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 1.2 }}
              >
                <Link href="/pricing">
                  <Button size="lg" variant="outline" className="h-12 px-6 text-base w-full sm:w-auto">
                    Ver Tarifas
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-card border-y border-border">
        <div className="container mx-auto px-4">
          <FadeIn>
            <h2 className="text-3xl font-bold text-center mb-4">
              Como <span className="text-yellow-500">Funciona</span>
            </h2>
            <p className="text-muted-foreground text-center mb-16 max-w-xl mx-auto">
              En 4 simples pasos, tu paquete llega de Los Angeles a tu puerta en El Salvador
            </p>
          </FadeIn>
          <StaggerChildren className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
            {/* Animated connecting line (desktop) */}
            <motion.div
              className="hidden md:block absolute top-12 left-[12.5%] right-[12.5%] h-0.5 border-t-2 border-dashed border-yellow-500/30 origin-left"
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.2, delay: 0.3, ease: 'easeOut' }}
            />

            {[
              { step: 1, icon: Package, title: 'Solicita tu Envio', desc: 'Cotiza en linea o por WhatsApp. Registramos tu paquete al instante.' },
              { step: 2, icon: Warehouse, title: 'Bodega en LA', desc: 'Recibimos tu paquete en nuestra bodega de Los Angeles y lo preparamos.' },
              { step: 3, icon: Plane, title: 'Envio Internacional', desc: 'Tu paquete viaja seguro con rastreo en tiempo real en todo momento.' },
              { step: 4, icon: Home, title: 'Entrega a tu Puerta', desc: 'Nuestro motorista entrega directamente en tu domicilio en El Salvador.' },
            ].map((item) => (
              <StaggerItem key={item.step} className="text-center relative">
                <ScaleIn delay={item.step * 0.1}>
                  <motion.div
                    className="w-24 h-24 mx-auto bg-yellow-500/10 border-2 border-yellow-500/30 rounded-2xl flex items-center justify-center mb-4 relative"
                    whileHover={{ scale: 1.05, borderColor: 'rgba(255, 215, 0, 0.6)' }}
                    transition={{ duration: 0.2 }}
                  >
                    <item.icon className="w-10 h-10 text-yellow-500" />
                    <motion.div
                      className="absolute -top-3 -right-3 w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center text-black font-bold text-sm"
                      initial={{ scale: 0 }}
                      whileInView={{ scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.3 + item.step * 0.15, type: 'spring', stiffness: 400, damping: 15 }}
                    >
                      {item.step}
                    </motion.div>
                  </motion.div>
                </ScaleIn>
                <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </StaggerItem>
            ))}
          </StaggerChildren>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <FadeIn>
            <h2 className="text-3xl font-bold text-center mb-12">
              Por que elegir <span className="text-yellow-500">Yellow Express</span>
            </h2>
          </FadeIn>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Package,
                title: 'Rastreo en Tiempo Real',
                desc: 'Sigue tu paquete desde Los Angeles hasta tu puerta en El Salvador. Actualizaciones instantaneas en cada etapa del envio de paquetes a centroamerica.',
                direction: 'left' as const,
              },
              {
                icon: MessageCircle,
                title: 'Notificaciones Automaticas',
                desc: 'Recibe alertas por WhatsApp y Email cada vez que tu paquete cambie de estado. Nunca pierdas de vista tu envio.',
                direction: 'up' as const,
              },
              {
                icon: Truck,
                title: 'Entrega a Domicilio',
                desc: 'Nuestros motoristas entregan directamente en tu puerta. Cobertura en todo El Salvador con comprobante de entrega. Courier confiable.',
                direction: 'right' as const,
              },
            ].map((feature, i) => (
              <SlideIn key={i} direction={feature.direction} delay={i * 0.15}>
                <motion.div whileHover={{ y: -6, transition: { duration: 0.2 } }}>
                  <Card className="bg-card border-border hover:border-yellow-500/50 transition-colors duration-300 h-full">
                    <CardContent className="pt-6">
                      <motion.div
                        className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center mb-4"
                        whileHover={{ rotate: 10, scale: 1.1 }}
                        transition={{ duration: 0.2 }}
                      >
                        <feature.icon className="w-6 h-6 text-yellow-500" />
                      </motion.div>
                      <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                      <p className="text-muted-foreground">{feature.desc}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              </SlideIn>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 bg-card">
        <div className="container mx-auto px-4">
          <FadeIn>
            <h2 className="text-3xl font-bold text-center mb-12">Nuestros Servicios</h2>
          </FadeIn>
          <StaggerChildren className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {[
              {
                icon: Package,
                title: 'Envio de Paquetes',
                items: [
                  'Paquetes de cualquier tamano',
                  'Ropa, electronicos, documentos',
                  'Seguro incluido',
                  'Entrega en 5-7 dias habiles',
                ],
                price: '$6.99 USD',
                priceLabel: 'Desde',
                priceSuffix: 'por libra',
              },
              {
                icon: Globe,
                title: 'Personal Shopper',
                items: [
                  'Compramos por ti en USA',
                  'Amazon, eBay, tiendas locales',
                  'Consolidacion de paquetes',
                  'Fotos antes de enviar',
                ],
                price: '10%',
                priceLabel: '',
                priceSuffix: 'del valor + envio',
              },
            ].map((service, i) => (
              <StaggerItem key={i}>
                <motion.div
                  whileHover={{
                    y: -4,
                    boxShadow: '0 20px 40px rgba(255, 215, 0, 0.1)',
                  }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="bg-background border-yellow-500/30 hover:border-yellow-500 transition-colors duration-300 h-full">
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-3 mb-4">
                        <motion.div
                          className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center"
                          whileHover={{ rotate: 10, scale: 1.1 }}
                        >
                          <service.icon className="w-6 h-6 text-yellow-500" />
                        </motion.div>
                        <h3 className="text-2xl font-bold text-yellow-500">{service.title}</h3>
                      </div>
                      <ul className="space-y-2 text-muted-foreground mb-4">
                        {service.items.map((item, j) => (
                          <li key={j} className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                            {item}
                          </li>
                        ))}
                      </ul>
                      <p className="text-lg font-semibold">
                        {service.priceLabel} <span className="text-yellow-500 text-2xl">{service.price}</span> {service.priceSuffix}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              </StaggerItem>
            ))}
          </StaggerChildren>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <FadeIn>
            <h2 className="text-3xl font-bold text-center mb-4">
              Lo que dicen nuestros <span className="text-yellow-500">clientes</span>
            </h2>
            <p className="text-muted-foreground text-center mb-12 max-w-xl mx-auto">
              Miles de salvadorenos confian en Yellow Express para sus envios
            </p>
          </FadeIn>
          <StaggerChildren className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              { name: 'Maria Garcia', location: 'San Salvador', text: 'Excelente servicio. Mi paquete llego en 6 dias y pude rastrearlo todo el tiempo. El motorista fue muy amable.' },
              { name: 'Carlos Hernandez', location: 'Santa Ana', text: 'Use el Personal Shopper para comprar en Amazon. Todo llego perfecto y el precio fue muy justo. Lo recomiendo.' },
              { name: 'Ana Martinez', location: 'San Miguel', text: 'Llevo 2 anos usando Yellow Express. Siempre puntuales y el soporte por WhatsApp es increible, responden al instante.' },
            ].map((testimonial, i) => (
              <StaggerItem key={i}>
                <motion.div
                  whileHover={{
                    y: -8,
                    boxShadow: '0 20px 40px rgba(255, 215, 0, 0.15)',
                  }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="bg-card border-border hover:border-yellow-500/30 transition-colors duration-300 h-full">
                    <CardContent className="pt-6">
                      <div className="flex gap-1 mb-3">
                        {[...Array(5)].map((_, j) => (
                          <motion.div
                            key={j}
                            initial={{ opacity: 0, scale: 0 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.3 + j * 0.1, type: 'spring', stiffness: 400 }}
                          >
                            <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                          </motion.div>
                        ))}
                      </div>
                      <p className="text-muted-foreground mb-4 italic">&ldquo;{testimonial.text}&rdquo;</p>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-yellow-500/20 rounded-full flex items-center justify-center text-yellow-500 font-bold text-sm">
                          {testimonial.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <p className="font-semibold text-sm">{testimonial.name}</p>
                          <p className="text-xs text-muted-foreground">{testimonial.location}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </StaggerItem>
            ))}
          </StaggerChildren>
        </div>
      </section>

      {/* Stats Section */}
      <LandingAnimations />

      {/* Departments Coverage Section */}
      <section className="py-20 border-t border-border">
        <div className="container mx-auto px-4">
          <FadeIn>
            <h2 className="text-3xl font-bold text-center mb-4">
              Cobertura en los <span className="text-yellow-500">14 Departamentos</span> de El Salvador
            </h2>
            <p className="text-muted-foreground text-center mb-12 max-w-xl mx-auto">
              Entrega a domicilio en todo El Salvador. Nuestro servicio de envio de paquetes desde Los Angeles cubre cada rincon del pais.
            </p>
          </FadeIn>
          <StaggerChildren className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3 max-w-5xl mx-auto">
            {departments.map((dept) => (
              <StaggerItem key={dept}>
                <motion.div
                  className="flex items-center gap-2 p-3 bg-card border border-border rounded-lg text-center justify-center"
                  whileHover={{
                    scale: 1.05,
                    borderColor: 'rgba(255, 215, 0, 0.5)',
                    backgroundColor: 'rgba(255, 215, 0, 0.05)',
                  }}
                  transition={{ duration: 0.2 }}
                >
                  <MapPin className="w-3 h-3 text-yellow-500 shrink-0" />
                  <span className="text-sm font-medium">{dept}</span>
                </motion.div>
              </StaggerItem>
            ))}
          </StaggerChildren>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 border-t border-border">
        <div className="container mx-auto px-4 max-w-4xl">
          <FadeIn>
            <h2 className="text-3xl font-bold text-center mb-12">
              Preguntas Frecuentes sobre <span className="text-yellow-500">Envios a El Salvador</span>
            </h2>
          </FadeIn>
          <StaggerChildren className="grid gap-4">
            {[
              {
                q: 'Cual es el mejor courier de Los Angeles a El Salvador?',
                a: 'The Yellow Express es la opcion lider por su integracion tecnologica y tiempos de 5-7 dias. Nuestra infraestructura en California y San Salvador garantiza que tu encomienda llegue segura con rastreo en tiempo real y soporte 24/7.',
              },
              {
                q: 'Cuanto cuesta la libra de encomienda a El Salvador?',
                a: 'Nuestras tarifas fijas comienzan desde $6.99 USD por libra. No hay cargos ocultos. El precio incluye el manejo logistico, seguro basico y la entrega final en cualquier departamento del pais.',
              },
              {
                q: 'Es seguro comprar en USA desde El Salvador?',
                a: 'Si, a traves de nuestro servicio de Personal Shopper. Compramos en Amazon, eBay y otras tiendas, verificamos el estado del producto en nuestras bodegas de USA y lo enviamos a SV con 100% de garantia.',
              },
              {
                q: 'Como enviar un paquete de USA a El Salvador?',
                a: 'Es muy facil: cotiza en linea o por WhatsApp, lleva tu paquete a nuestra bodega en Los Angeles (o solicita recoleccion), y nosotros nos encargamos del resto. Recibes actualizaciones en tiempo real hasta la entrega a domicilio.',
              },
            ].map((faq, i) => (
              <StaggerItem key={i}>
                <Card className="bg-card hover:border-yellow-500/30 transition-colors duration-300">
                  <CardContent className="pt-6 pb-4">
                    <AccordionItem
                      title={<h3 className="text-lg font-semibold">{faq.q}</h3>}
                    >
                      <p className="text-muted-foreground">{faq.a}</p>
                    </AccordionItem>
                  </CardContent>
                </Card>
              </StaggerItem>
            ))}
          </StaggerChildren>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-yellow-500 relative overflow-hidden">
        <motion.div
          className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,_rgba(0,0,0,0.1),transparent)]"
          animate={{
            backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
        />
        <div className="container mx-auto px-4 text-center relative">
          <ScaleIn>
            <div className="flex justify-center mb-6">
              <FloatingElement duration={3} distance={6}>
                <div className="w-16 h-16 bg-black/10 rounded-2xl flex items-center justify-center">
                  <MessageCircle className="w-8 h-8 text-black" />
                </div>
              </FloatingElement>
            </div>
          </ScaleIn>
          <FadeIn delay={0.2}>
            <h2 className="text-3xl md:text-4xl font-bold text-black mb-4">
              Tienes preguntas? Nuestro chatbot te ayuda 24/7
            </h2>
          </FadeIn>
          <FadeIn delay={0.4}>
            <p className="text-black/70 text-lg mb-8 max-w-2xl mx-auto">
              Escribenos por WhatsApp y nuestro asistente de IA respondera tus dudas
              sobre envios, tarifas y estado de pedidos al instante.
            </p>
          </FadeIn>
          <FadeIn delay={0.6}>
            <a
              href="https://wa.me/+12133774155"
              target="_blank"
              rel="noopener noreferrer"
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-block"
              >
                <Button size="lg" variant="secondary" className="h-14 px-8 text-lg">
                  <MessageCircle className="w-6 h-6 mr-2" />
                  Chatear por WhatsApp
                </Button>
              </motion.div>
            </a>
          </FadeIn>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-card border-t border-border">
        <div className="container mx-auto px-4">
          <FadeIn>
            <div className="grid md:grid-cols-4 gap-8">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center">
                    <Truck className="w-5 h-5 text-black" />
                  </div>
                  <span className="font-bold text-yellow-500">The Yellow Express</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Tu conexion confiable entre Los Angeles y El Salvador desde 2020.
                  Logistica transfronteriza segura y eficiente.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Enlaces Rapidos</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li><Link href="/track" className="hover:text-yellow-500 transition">Rastrear Pedido</Link></li>
                  <li><Link href="/cotizar" className="hover:text-yellow-500 transition">Calculadora de Tarifas</Link></li>
                  <li><Link href="/pricing" className="hover:text-yellow-500 transition">Precios por Libra</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Soporte</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2"><span>+1 (213) 377-4155</span></li>
                  <li className="flex items-center gap-2"><span>admin@theyellowexpress.com</span></li>
                  <li className="flex items-center gap-2"><span>San Salvador, El Salvador</span></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Horario de Servicio</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>Lunes - Viernes: 8am - 6pm</li>
                  <li>Sabado: 8am - 12pm</li>
                  <li>Domingo: Soporte AI 24/7</li>
                </ul>
              </div>
            </div>
          </FadeIn>
          <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} The Yellow Express LLC. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </>
  )
}
