# 🚚 The Yellow Express

Sistema de gestión de envíos entre Los Ángeles y El Salvador.

## Stack
- Next.js 14 + React 18 + Tailwind CSS
- Supabase (PostgreSQL)
- Twilio (WhatsApp) + Resend (Email)
- OpenAI GPT-4o-mini

## Instalación

```bash
npm install
cp .env.example .env.local
# Editar .env.local con tus credenciales
npm run dev
```

## Configuración Supabase
1. Crear proyecto en supabase.com
2. Ejecutar `database-schema.sql` en SQL Editor
3. Crear bucket `delivery-proofs` en Storage

## URLs
- `/` - Landing page
- `/admin` - Dashboard administrador
- `/driver` - Portal motorista
- `/track/[tracking]` - Rastreo público

## API Endpoints
- `GET/POST /api/orders` - Listar/crear pedidos
- `PATCH /api/orders/[id]` - Actualizar pedido
- `GET /api/orders/track/[tracking]` - Rastrear pedido
- `POST /api/ai-agent/whatsapp` - Webhook chatbot
- `POST /api/notifications/send` - Enviar notificaciones

## Webhook Twilio
URL: `https://tu-dominio.com/api/ai-agent/whatsapp`
