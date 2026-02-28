# Yellow Express — Estado Completo del Proyecto

> **Última actualización:** 27 Feb 2026  
> **Repo:** https://github.com/puntocero-dot/Yellow.git  
> **Producción:** https://theyellowexpress.com  
> **Hosting:** Vercel (auto-deploy desde rama `main`)  
> **Dominio:** theyellowexpress.com (DNS en Bluehost apuntando a Vercel)  
> **Base de datos:** Supabase (PostgreSQL)

---

## 1. Stack Tecnológico

| Capa | Tecnología | Versión |
|------|-----------|---------|
| Framework | Next.js (App Router) | 14.0.4 |
| Frontend | React + TailwindCSS | React 18, TW 3.3 |
| Componentes UI | Radix UI + shadcn/ui | Dialog, Select, Toast, Badge, Label, etc. |
| Iconos | lucide-react | 0.294 |
| Backend | Next.js API Routes (Node.js) | — |
| Base de datos | Supabase (PostgreSQL) | supabase-js 2.39 |
| Autenticación | HMAC-SHA256 signed sessions + bcryptjs | Custom (no Supabase Auth) |
| IA Chat público | Google Gemini API (REST directo) | gemini-2.5-flash / 2.0-flash |
| IA WhatsApp | OpenAI GPT | openai 4.24 |
| Email | Resend | 2.1 |
| WhatsApp | Twilio | 4.19 |
| Passwords | bcryptjs | 3.0.3 |
| Deploy | Vercel | — |

---

## 2. Variables de Entorno (`.env.local`)

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...

# Session Security (HMAC signing)
SESSION_SECRET=un-string-aleatorio-largo

# Google Gemini AI (chatbot público en /cotizar)
GEMINI_API_KEY=...

# Twilio WhatsApp (agente IA vía WhatsApp)
TWILIO_ACCOUNT_SID=...
TWILIO_AUTH_TOKEN=...
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886

# Resend Email (notificaciones de estado)
RESEND_API_KEY=...
RESEND_FROM_EMAIL=noreply@theyellowexpress.com

# OpenAI (agente WhatsApp)
OPENAI_API_KEY=...

# App
NEXT_PUBLIC_APP_URL=https://theyellowexpress.com
```

> **IMPORTANTE:** `.env.local` está en `.gitignore`. Nunca commitear keys reales. El archivo `.env.example` tiene placeholders.

---

## 3. Base de Datos — Esquema Supabase

### Tabla `users`
| Columna | Tipo | Notas |
|---------|------|-------|
| id | UUID PK | gen_random_uuid() |
| email | TEXT UNIQUE | ej: admin@theyellowexpress.com |
| full_name | TEXT | |
| phone | TEXT | |
| role | TEXT | `admin`, `driver`, `customer` |
| password_hash | TEXT | bcrypt hash |
| is_active | BOOLEAN | |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | |

### Tabla `orders`
| Columna | Tipo | Notas |
|---------|------|-------|
| id | UUID PK | |
| tracking_number | TEXT UNIQUE | Formato: `YE{timestamp}{random}` |
| customer_id | UUID FK → users | Nullable |
| customer_name | TEXT | |
| customer_email | TEXT | |
| customer_phone | TEXT | |
| origin_address | TEXT | |
| destination_address | TEXT | |
| destination_city | TEXT | |
| destination_country | TEXT | Default 'El Salvador' |
| package_description | TEXT | |
| package_weight | DECIMAL | Peso original del paquete |
| **weight_pounds** | DECIMAL(10,2) | **Peso teórico para finanzas** (agregado en migration-trips.sql) |
| declared_value | DECIMAL | |
| shipping_cost | DECIMAL | |
| status | TEXT | Ver estados abajo |
| driver_id | UUID FK → users | Nullable |
| **trip_id** | UUID FK → trips | **Viaje asignado** (agregado en migration-trips.sql) |
| delivery_proof_url | TEXT | URL de imagen Supabase Storage |
| delivery_notes | TEXT | |
| estimated_delivery | TIMESTAMPTZ | |
| delivered_at | TIMESTAMPTZ | |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | |

**Estados de pedido (OrderStatus):**
```
pending → warehouse_la → in_transit_international → customs → warehouse_sv → assigned_to_driver → out_for_delivery → delivered
                                                                                                                    → cancelled
```

### Tabla `trips` (migration-trips.sql)
| Columna | Tipo | Notas |
|---------|------|-------|
| id | UUID PK | |
| name | TEXT | ej: "Viaje 28 Feb 2026" |
| departure_date | DATE | |
| return_date | DATE | Nullable |
| origin | TEXT | Default 'Los Angeles' |
| destination | TEXT | Default 'San Salvador' |
| status | TEXT | `planned`, `collecting`, `in_transit`, `completed`, `cancelled` |
| notes | TEXT | |
| created_at | TIMESTAMPTZ | |

### Tabla `trip_expenses` (migration-trips.sql)
| Columna | Tipo | Notas |
|---------|------|-------|
| id | UUID PK | |
| trip_id | UUID FK → trips | ON DELETE CASCADE |
| category | TEXT | `flight`, `luggage`, `gas`, `taxes`, `food`, `transport`, `packaging`, `other` |
| description | TEXT | |
| amount | DECIMAL(10,2) | En USD |
| created_at | TIMESTAMPTZ | |

### Migraciones SQL
| Archivo | Estado | Propósito |
|---------|--------|-----------|
| `migration-security.sql` | ✅ Ejecutada | password_hash, emails @theyellowexpress.com |
| `migration-trips.sql` | ✅ Ejecutada | Tablas trips, trip_expenses + columnas trip_id/weight_pounds en orders |

---

## 4. Autenticación y Seguridad

### Flujo de Login
1. `POST /api/auth/login` recibe `{ email, password }`
2. Busca usuario en Supabase con `supabaseAdmin` (service role key)
3. Compara password con `bcrypt.compare()` contra `password_hash`
4. Si Supabase no está configurado, usa `FALLBACK_USERS` hardcoded (solo dev)
5. Genera token HMAC-SHA256: `base64(payload).hmac_signature`
6. Guarda en cookie `session` (httpOnly, secure, sameSite=strict, 24h)

### Verificación de Sesión
- **En API routes (Node.js runtime):** `lib/auth.ts` → `getSession()` usa `crypto.createHmac`
- **En middleware (Edge runtime):** `middleware.ts` → `verifySessionToken()` usa `crypto.subtle` (Web Crypto API)
- Ambas verifican firma HMAC y expiración
- Timing-safe comparison para evitar timing attacks

### Middleware (`middleware.ts`)
- Protege rutas `/admin/*` y `/driver/*`
- Sin cookie → redirige a `/login?redirect=...`
- Cookie inválida/expirada → elimina cookie, redirige a `/login`
- **admin** → acceso a todo
- **driver** → solo `/driver/*`; si intenta `/admin` → redirige a `/driver`
- **customer** → redirige a `/`

### Roles y Credenciales de Producción
| Rol | Email | Password | Acceso |
|-----|-------|----------|--------|
| admin | admin@theyellowexpress.com | YellowAdmin2026! | Todo |
| driver | driver1@theyellowexpress.com | YellowDriver2026! | /driver |
| driver | driver2@theyellowexpress.com | YellowDriver2026! | /driver |

### Headers de Seguridad (`next.config.js`)
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `X-XSS-Protection: 1; mode=block`
- `Permissions-Policy: camera=(), microphone=(), geolocation=()`

### Rate Limiting
- `/api/chat`: In-memory rate limit: 20 requests/minuto por IP

---

## 5. Páginas del Frontend

### Páginas Públicas

| Ruta | Archivo | Descripción |
|------|---------|-------------|
| `/` | `app/page.tsx` | Landing page. Hero, tracking form, servicios, footer |
| `/cotizar` | `app/cotizar/page.tsx` | Chatbot IA (Gemini). Cotizador conversacional con detección de artículos prohibidos/restringidos, creación de pedidos, cálculo de precios |
| `/pricing` | `app/pricing/page.tsx` | Tarifas transparentes: cards de precios, ejemplos de cálculo, tabla de artículos prohibidos/restringidos/permitidos |
| `/track` | `app/track/page.tsx` | Formulario de rastreo: input de número de guía → redirige a `/track/[tracking]` |
| `/track/[tracking]` | `app/track/[tracking]/page.tsx` | Página dinámica de rastreo: muestra estado, timeline, detalles del pedido |
| `/login` | `app/login/page.tsx` | Login form (email + password). Sin credenciales demo visibles |

### Panel Admin (requiere `role: admin`)

| Ruta | Archivo | Funcionalidades |
|------|---------|-----------------|
| `/admin` | `app/admin/page.tsx` | **Dashboard de Pedidos.** Stats (total, pendientes, en tránsito, entregados). Tabla de pedidos con búsqueda y filtro por estado. Crear pedido (con campo peso). Editar estado/motorista. Eliminar con confirmación popup. Carga masiva CSV. Columna de peso (lbs) visible |
| `/admin/trips` | `app/admin/trips/page.tsx` | **Programación de Viajes.** CRUD completo de viajes. Stats (total, próximos, en tránsito, completados). Estados: planificado → recolectando → en tránsito → completado. Link directo a finanzas del viaje |
| `/admin/finances` | `app/admin/finances/page.tsx` | **Costos y Ganancias por Viaje.** Selector de viaje. Tabla de ingresos (pedidos + libras + USD). Tabla de costos por categoría. Peso editable inline (click para editar). Asignar pedidos a viajes. Desglose por categoría con barras. Banner resumen: ingresos − costos = ganancia neta |
| `/admin/users` | `app/admin/users/page.tsx` | **Gestión de Usuarios.** CRUD de usuarios. Roles: admin, driver, customer. Activar/desactivar |

### Panel Motorista (requiere `role: driver`)

| Ruta | Archivo | Funcionalidades |
|------|---------|-----------------|
| `/driver` | `app/driver/page.tsx` | Lista de pedidos asignados (assigned_to_driver, out_for_delivery, delivered). Cambiar estado. Subir foto de prueba de entrega (Supabase Storage). Botón de llamar al cliente |

### Navegación Admin
Todas las páginas admin comparten un header con: **Pedidos | Viajes | Finanzas | Usuarios | Salir**

---

## 6. API Routes

### Autenticación
| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| POST | `/api/auth/login` | Público | Login con email+password. Devuelve cookie session |
| POST | `/api/auth/logout` | Público | Elimina cookie session |
| GET | `/api/auth/me` | Requiere session | Devuelve datos del usuario actual |

### Pedidos
| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/api/orders` | admin, driver | Lista todos los pedidos. Query `?driver=true` filtra por estados de driver |
| POST | `/api/orders` | admin | Crear pedido. Campos: customer_name, customer_email, customer_phone, destination_address, destination_city, package_description, **weight_pounds** |
| GET | `/api/orders/[id]` | admin, driver | Obtener pedido por ID |
| PATCH | `/api/orders/[id]` | admin, driver | Actualizar estado, driver_id, delivery_notes. Envía notificación automática al cambiar estado |
| DELETE | `/api/orders/[id]` | admin | Eliminar pedido |
| GET | `/api/orders/track/[tracking]` | Público | Rastrear por tracking_number (sin auth) |
| POST | `/api/orders/chatbot` | Público | Crear pedido desde chatbot |
| POST | `/api/orders/upload-proof` | driver | Subir foto de prueba de entrega |

### Viajes
| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/api/trips` | admin, supervisor | Lista todos los viajes |
| POST | `/api/trips` | admin | Crear viaje |
| GET | `/api/trips/[id]` | admin, supervisor | Detalle del viaje + expenses + orders asignados |
| PATCH | `/api/trips/[id]` | admin | Actualizar viaje (nombre, fechas, estado, notas) |
| DELETE | `/api/trips/[id]` | admin | Eliminar viaje (desvincula pedidos primero) |
| GET | `/api/trips/[id]/expenses` | admin, supervisor | Listar gastos del viaje |
| POST | `/api/trips/[id]/expenses` | admin | Agregar gasto (category, description, amount) |
| DELETE | `/api/trips/[id]/expenses?expenseId=...` | admin | Eliminar gasto |
| POST | `/api/trips/[id]/orders` | admin | Asignar pedidos al viaje |
| PATCH | `/api/trips/[id]/orders` | admin | Actualizar peso de pedido en viaje |

### Usuarios
| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/api/users` | admin | Lista usuarios. Query `?role=driver` filtra por rol |
| POST | `/api/users` | admin | Crear usuario |
| PATCH | `/api/users/[id]` | admin | Actualizar usuario |
| DELETE | `/api/users/[id]` | admin | Eliminar usuario |

### IA y Comunicaciones
| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| POST | `/api/chat` | Público (rate limited) | Chat con Gemini AI. Usa system prompt con info de Yellow Express. Fallback entre modelos: gemini-2.5-flash → 2.0-flash-lite → 2.0-flash |
| POST | `/api/ai-agent/whatsapp` | Público (webhook Twilio) | Agente IA para WhatsApp usando OpenAI |
| POST | `/api/notifications/send` | admin | Enviar notificación manual (email/WhatsApp) |

---

## 7. Librerías Core (`lib/`)

### `lib/auth.ts`
- `signSession(data)` → genera token `base64(payload).hmac_hex`
- `verifySession(token)` → verifica firma + expiración → `SessionData | null`
- `getSession()` → lee cookie → verifySession (para API routes)
- `hasRole(session, ...roles)` → verifica si el usuario tiene el rol

### `lib/supabase.ts`
- `supabase` — cliente anon (para frontend)
- `supabaseAdmin` — cliente service_role (para API routes)
- `isConfigured` — boolean, true si las env vars están seteadas
- Si no está configurado, retorna mock clients que no crashean
- Tipos exportados: `User`, `Order`, `OrderStatus`, `StatusHistory`, `Notification`

### `lib/pricing.ts`
- `PRICING` — objeto con pricePerPound ($5.50), minimumCharge ($15), handlingFee ($3), insuranceRate (3%)
- `LA_COVERAGE_CITIES` — 30 ciudades del área de Los Ángeles
- `SV_DELIVERY_CITIES` — 20 ciudades de El Salvador
- `PROHIBITED_ITEMS` — 10 artículos prohibidos con razón
- `RESTRICTED_ITEMS` — 7 artículos restringidos con requisito
- `ALLOWED_ITEMS` — 12 artículos permitidos comunes
- `calculateShippingCost(weight, declaredValue, includeInsurance)` — calcula precio con desglose

### `lib/notifications.ts`
- `sendOrderStatusNotification(order)` — envía email (Resend) y WhatsApp (Twilio) al cambiar estado
- Clientes lazy-initialized (no crashean si API keys no están configuradas)
- Email from: `noreply@theyellowexpress.com`

### `lib/ai-agent.ts`
- Agente IA para WhatsApp usando OpenAI
- Cliente OpenAI lazy-initialized
- Procesa mensajes entrantes de Twilio webhook

### `lib/utils.ts`
- `cn()` — class merge utility (clsx + tailwind-merge)
- `ORDER_STATUSES` — mapa de estados con labels y colores
- `OrderStatus` type

---

## 8. Lógica de Finanzas (cómo funciona el cálculo)

### Ingresos por pedido
```
peso_libras × $5.50/lb = base
si base < $15.00 → base = $15.00 (mínimo)
total_pedido = base + $3.00 (manejo)
```

### Fórmula del viaje
```
INGRESOS = Σ (cada pedido asignado al viaje) = total_pedido
COSTOS = Σ (cada gasto del viaje: vuelo + maletas + gas + taxes + etc.)
GANANCIA_NETA = INGRESOS − COSTOS
```

### Flujo de datos
1. Se crea un **viaje** en `/admin/trips` (ej: "Viaje 28 Feb 2026")
2. Se crean **pedidos** en `/admin` con peso en libras
3. Se **asignan pedidos al viaje** desde `/admin/finances` (botón "Asignar Pedido")
4. El peso es editable inline en la tabla de finanzas (click para editar)
5. Se agregan **costos** al viaje (vuelo, maletas, gasolina, etc.)
6. La página muestra el **resumen automático**: ingresos vs costos = ganancia neta

---

## 9. Chatbot Público (`/cotizar`)

### Flujo conversacional
1. Usuario abre `/cotizar` → ve chat con mensaje de bienvenida
2. Puede preguntar precios, servicios, artículos permitidos
3. Si menciona artículo **prohibido** → alerta roja, no se permite envío
4. Si menciona artículo **restringido** → alerta amarilla con requisitos
5. Si dice "hacer un pedido" → inicia flujo de creación:
   - Pregunta producto → peso → contacto → ciudad → dirección → confirmación
6. Al confirmar → `POST /api/orders/chatbot` → crea pedido real en DB
7. Usa **Gemini AI** para respuestas inteligentes (con fallback entre modelos)
8. Rate limit: 20 mensajes/minuto por IP

### Detección de artículos
- `detectProhibitedItems(text)` — busca keywords normalizadas (sin acentos) contra lista prohibida
- `detectRestrictedItems(text)` — ídem para artículos restringidos
- Se ejecuta ANTES de cualquier cotización

---

## 10. Estructura de Archivos

```
personal-website/
├── app/
│   ├── layout.tsx                    # Layout raíz (fonts, ThemeProvider, Toaster)
│   ├── globals.css                   # Estilos globales + variables CSS dark mode
│   ├── page.tsx                      # Landing page pública
│   ├── login/page.tsx                # Formulario de login
│   ├── cotizar/page.tsx              # Chatbot IA cotizador (744 líneas)
│   ├── pricing/page.tsx              # Página de tarifas
│   ├── track/
│   │   ├── page.tsx                  # Formulario de rastreo
│   │   └── [tracking]/page.tsx       # Resultado de rastreo dinámico
│   ├── admin/
│   │   ├── page.tsx                  # Dashboard pedidos (720+ líneas)
│   │   ├── trips/page.tsx            # Programación de viajes
│   │   ├── finances/page.tsx         # Costos y ganancias por viaje
│   │   └── users/page.tsx            # Gestión de usuarios
│   ├── driver/page.tsx               # Panel motorista
│   └── api/
│       ├── auth/login/route.ts
│       ├── auth/logout/route.ts
│       ├── auth/me/route.ts
│       ├── chat/route.ts             # Gemini AI chat
│       ├── ai-agent/whatsapp/route.ts # OpenAI WhatsApp agent
│       ├── notifications/send/route.ts
│       ├── orders/route.ts           # GET (list) + POST (create)
│       ├── orders/[id]/route.ts      # GET + PATCH + DELETE
│       ├── orders/chatbot/route.ts   # POST desde chatbot
│       ├── orders/track/[tracking]/route.ts  # GET público
│       ├── orders/upload-proof/route.ts      # POST proof image
│       ├── trips/route.ts            # GET + POST
│       ├── trips/[id]/route.ts       # GET + PATCH + DELETE
│       ├── trips/[id]/expenses/route.ts  # GET + POST + DELETE
│       ├── trips/[id]/orders/route.ts    # POST (assign) + PATCH (weight)
│       ├── users/route.ts            # GET + POST
│       └── users/[id]/route.ts       # PATCH + DELETE
├── lib/
│   ├── auth.ts                       # HMAC sessions
│   ├── supabase.ts                   # Supabase clients + types
│   ├── pricing.ts                    # Precios, ciudades, artículos
│   ├── notifications.ts              # Email + WhatsApp
│   ├── ai-agent.ts                   # OpenAI WhatsApp agent
│   └── utils.ts                      # cn(), ORDER_STATUSES
├── components/ui/                    # shadcn/ui components
├── middleware.ts                      # Auth + role-based routing
├── next.config.js                     # Security headers + image domains
├── migration-security.sql             # ✅ Ejecutada
├── migration-trips.sql                # ✅ Ejecutada
├── .env.local                         # Keys reales (gitignored)
├── .env.example                       # Placeholders
└── package.json
```

---

## 11. DNS y Deploy

### Vercel
- Proyecto conectado a GitHub repo `puntocero-dot/Yellow`
- Auto-deploy en cada push a `main`
- Dominio: `theyellowexpress.com` + `www.theyellowexpress.com`

### Bluehost DNS
- **A record** `@` → IP de Vercel (puede ser `76.76.21.21`)
- **CNAME** `www` → `cname.vercel-dns.com`
- **No deben coexistir** un A record y un CNAME para el mismo subdominio `www`

---

## 12. Funcionalidades Completadas ✅

- [x] Landing page responsive con dark mode
- [x] Login con bcrypt + HMAC sessions + roles
- [x] Middleware de protección de rutas por rol
- [x] Security headers (XSS, clickjacking, etc.)
- [x] Dashboard admin: CRUD pedidos completo
- [x] Tabla de pedidos con búsqueda, filtro por estado, columna de peso
- [x] Botón eliminar pedido con popup de confirmación
- [x] Carga masiva CSV (nombre,email,telefono,direccion,ciudad,descripcion,peso)
- [x] Campo peso (libras) en formulario de creación de pedidos
- [x] Panel motorista: ver pedidos asignados, cambiar estado, subir foto entrega
- [x] Rastreo público por número de guía (/track)
- [x] Página de tarifas (/pricing)
- [x] Chatbot IA cotizador (/cotizar) con Gemini AI
- [x] Detección de artículos prohibidos/restringidos en chatbot
- [x] Creación de pedidos desde chatbot
- [x] Notificaciones email (Resend) y WhatsApp (Twilio) al cambiar estado
- [x] Agente IA WhatsApp (OpenAI)
- [x] Rate limiting en chat API
- [x] Gestión de usuarios (admin/driver/customer)
- [x] Programación de viajes (/admin/trips)
- [x] Costos y ganancias por viaje (/admin/finances)
- [x] Asignación de pedidos a viajes
- [x] Registro de gastos por viaje con categorías
- [x] Cálculo automático: ingresos − costos = ganancia neta
- [x] Deploy a Vercel + dominio configurado
- [x] Credenciales demo removidas de login page
- [x] .env.example limpio con placeholders

---

## 13. Pendiente / Ideas Futuras 🔲

### Alta Prioridad
- [ ] **Cronograma anual de vuelos** — el usuario pidió una vista de calendario con todos los viajes programados del año (mencionado pero no implementado aún)
- [ ] **Editar peso desde tabla de pedidos** — actualmente el peso se puede poner al crear; falta poder editarlo inline desde la tabla principal de pedidos (en finanzas sí se puede)
- [ ] **Asignar pedido a viaje desde la tabla de pedidos** — actualmente solo se hace desde finanzas
- [ ] **Notificaciones WhatsApp reales** — Twilio está configurado pero requiere número verificado en producción
- [ ] **Email de confirmación al crear pedido** — actualmente solo notifica al cambiar estado

### Media Prioridad
- [ ] **Dashboard con gráficos** — métricas históricas (pedidos/mes, ingresos/viaje, etc.)
- [ ] **Exportar datos a Excel/PDF** — reportes de finanzas por viaje
- [ ] **Historial de estados (status_history)** — la tabla existe en tipos pero no se implementó la escritura
- [ ] **Búsqueda avanzada de pedidos** — filtrar por fecha, ciudad, motorista
- [ ] **Paginación en tablas** — actualmente se cargan todos los registros
- [ ] **Perfil de usuario** — cambiar contraseña, actualizar datos

### Baja Prioridad
- [ ] **App móvil Flutter** — para motoristas (mencionada en diseño original pero no iniciada)
- [ ] **Tracking en mapa** — integración Mapbox para mostrar ubicación en tiempo real
- [ ] **Webhooks de Supabase** — para notificaciones en tiempo real
- [ ] **Multi-idioma** — inglés/español
- [ ] **PWA** — Progressive Web App para uso offline
- [ ] **Sistema de valoraciones** — que clientes califiquen el servicio
- [ ] **Fix warning zustand** — deprecated default export (si se usa)

### Deuda Técnica
- [ ] Extraer header/nav de admin a un componente compartido (actualmente duplicado en cada página admin)
- [ ] Agregar tests unitarios y e2e
- [ ] Implementar refresh token (actualmente session dura 24h fijas)
- [ ] El campo `customer_email` es required en POST /api/orders pero muchos clientes solo tienen WhatsApp
- [ ] Los `FALLBACK_USERS` en login route deberían eliminarse para producción pura (solo sirven si Supabase no está configurado)
- [ ] Agregar logging estructurado (actualmente solo console.error)

---

## 14. Convenciones y Reglas del Proyecto

1. **Backend primero** — definir endpoints antes de UI
2. **Roles y seguridad** — toda ruta protegida verifica session + role
3. **No borrar datos históricos** — inactivar/desvincular antes de eliminar
4. **IA con fallback** — si no hay datos reales, usar defaults
5. **UI dark mode** — toda la app usa dark mode con paleta amarillo/negro
6. **Microservicios desacoplados** — cada servicio por REST, no DB compartida (diseño original; actualmente es monolito Next.js)
7. **Imports al inicio del archivo** — nunca en medio del código
8. **No agregar comentarios ni emojis** a menos que se pida explícitamente
9. **Ediciones mínimas** — no sobre-ingeniería, resolver lo que se necesita

---

## 15. Cómo continuar el desarrollo

### Setup local
```bash
git clone https://github.com/puntocero-dot/Yellow.git
cd Yellow
npm install
cp .env.example .env.local   # llenar con keys reales
npm run dev                   # http://localhost:3000
```

### Deploy
```bash
git add -A
git commit -m "feat: descripción del cambio"
git push origin main
# Vercel hace auto-deploy
```

### Agregar nueva migración SQL
1. Crear archivo `migration-nombre.sql` en la raíz
2. Ejecutar en Supabase SQL Editor (Dashboard → SQL Editor → New Query)
3. Documentar en este archivo que fue ejecutada

### Agregar nueva página admin
1. Crear `app/admin/nueva-pagina/page.tsx`
2. Agregar `'use client'` al inicio
3. Copiar header/nav de cualquier otra página admin
4. Agregar link en el nav de TODAS las páginas admin existentes
5. El middleware ya protege `/admin/*` automáticamente

### Agregar nueva API route
1. Crear `app/api/recurso/route.ts`
2. Importar `getSession` y `hasRole` de `@/lib/auth`
3. Verificar session y rol al inicio de cada handler
4. Usar `supabaseAdmin` para operaciones de DB
