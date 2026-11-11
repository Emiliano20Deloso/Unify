# IMPROVEMENTS.md · Unify — Digital Booking Infrastructure

Plan de modernización de la plataforma. Léelo antes de tocar código.

---

## Rediseño 2026 (rama `rediseno-2026`) · qué cambió

- **Sitio nuevo** con el sistema visual "Nocturno" (`design/SISTEMA.md`): portada, `/servicios`, `/tarifas`,
  `/nosotros`, `/privacidad`, `/terminos` y 404, todas estáticas, en español (sin prefijo) e inglés (`/en`).
- **Cotizador en línea** (`src/components/quote`): barra en el hero y calculadora completa en `/tarifas#cotizar`.
  Muestra al momento el precio de los tres niveles con desglose y reserva por WhatsApp con el resumen.
  - API: `POST /api/estimate` (precio) y `POST /api/places/autocomplete|details` (lugares). `POST /api/quote`
    sigue existiendo (inserta en Supabase) pero el sitio público ya no lo llama.
  - Distancia: Google Routes con `GOOGLE_MAPS_SERVER_KEY`; sin llave, aproximado por línea recta
    (`src/lib/distance/approx.ts`). Lugares: catálogo propio (`src/lib/places/catalog.ts`) + Google Places.
  - Motor de precios puro en `src/lib/pricing` (base + km, tarifa mínima, multiplicadores, extras) leyendo
    `config/pricing.json`. Las rutas frecuentes y el ejemplo de `/tarifas` usan el mismo motor y la misma distancia.
- **Contenido** en `src/content` (compartido) y `src/i18n/dictionaries` (por página). Textos legales en
  `src/content/legal`. El sitio anterior (`legacy/`) se migró y se borró.
- **Herramientas**: `/dev/ui` (muestrario) y `/dev/frame` (vista móvil/tableta) solo en desarrollo;
  `scripts/shot.mjs` para capturas sin cabeza.

### Pendiente del flujo de reservas

- La reserva termina en WhatsApp: no se guarda la cotización del cotizador nuevo en Supabase ni hay
  referencia `UF-…`. Decidir si `/api/estimate` (o un endpoint nuevo) registra la solicitud.
- Etapas 3 a 11 de abajo (revisión en admin, envío de propuesta, aprobación, pago, reserva, recordatorios)
  siguen pendientes. El panel `/admin` solo tiene login y tablero base.

---

## Overview

Unify es un servicio premium de transporte privado eléctrico. El objetivo de este proyecto es modernizar la infraestructura de reservas, que hoy se gestiona principalmente por WhatsApp, y migrarla a una plataforma digital centralizada.

**Principio central:** WhatsApp sigue siendo un canal de comunicación importante, pero **deja de ser la fuente de verdad** para cotizaciones, pagos y reservas. El **Unify Backend + Database** es la única source of truth.

---

## Booking Flow (canónico)

```text
Landing Page
      ↓
Quote Request
      ↓
Admin Review  ──(reject)──→ Notify Customer (cancelled)
      ↓
Quote Sent
      ↓
Customer Approval  ──(decline)──→ Notify Operator (cancelled)
      ↓
Login / Authentication
      ↓
Payment
      ↓
Payment Verification
      ↓
Reservation
      ↓
Confirmation
      ↓
Automated Reminders
```

---

## Flow stages — detalle e implementación

### 1. Landing Page

- **Status:** ✅ Done (UI only, mobile + desktop)
- **Qué:** Landing con hero del Tesla, propuesta de valor, tres niveles de servicio, testimonios, CTA corporativo.
- **Owner:** Frontend
- **Notas:** El CTA inline del hero (formulario de cotización) se cablea en la etapa 2.

### 2. Quote Request

- **Status:** ✅ Cotizador público hecho (rediseño 2026) · ⏳ guardar la solicitud pendiente
- **Qué:** El cliente cotiza en el hero o en `/tarifas#cotizar` y ve al momento el precio de los tres niveles; reserva por WhatsApp.
- **Implementado:**
  - `POST /api/estimate` — valida con zod (`src/lib/estimate/schema.ts`), resuelve distancia (`src/lib/distance`: Google Routes o aproximado) y precio (`src/lib/pricing`).
  - `POST /api/places/autocomplete` y `/details` — Google Places (New), con catálogo propio primero (`src/lib/places/catalog.ts`).
  - `POST /api/quote` — inserta en Supabase (`src/lib/validation.ts`, `src/lib/supabase.ts`); hoy el sitio no lo llama.
  - `config/pricing.json` — tarifas editables sin tocar código
  - `supabase/migrations/0001_quotes.sql` — tabla `quotes` + RLS
- **Pendiente:** capturar contacto y registrar la solicitud (`pending_review`) desde el cotizador nuevo.
- **Owner:** Frontend + Backend

#### Algoritmo de precio

```
precio = (base_servicio + km × tarifa_km) × mult_hora × mult_dia + extras
```

Variables en `config/pricing.json` (editables sin deploy):
- `base.{practico|select|premium}` — tarifa base por nivel
- `per_km.{practico|select|premium}` — precio por km
- `multipliers.{normal|peak_hour|nighttime|weekend|holiday}` — multiplicadores
- `windows.{peak_morning|peak_evening|nighttime}` — ventanas horarias
- `extras.{passenger_fee_from|passenger_fee_amount|luggage_fee_from|luggage_fee_amount}` — cargos por pasajero/maleta extra
- `holidays_mx` — array de fechas festivas (YYYY-MM-DD)

Timezone fijo: `America/Mexico_City`.

### 3. Admin Review

- **Status:** ⏳ Pendiente
- **Qué:** Al crearse una quote nueva (`pending_review`), el admin recibe notificación por **email transaccional** (Resend) + **toast en vivo** si tiene el panel abierto. En el panel, abre el detalle y ve la propuesta renderizada con el formato oficial del documento (componente `src/components/propuesta.tsx` ya extraído).
- **Dos acciones:**
  - **Aceptar y enviar** (puede ajustar `price_final` antes de enviar) → status `sent` → dispara email al cliente con la propuesta oficial + link firmado
  - **Rechazar** (con nota opcional) → status `cancelled` → email de aviso al cliente
- **Backend requerido:**
  - `GET /api/admin/quotes?status=pending_review` — lista paginada
  - `GET /api/admin/quotes/:id` — detalle (incluye customer info + propuesta data)
  - `PATCH /api/admin/quotes/:id/approve` — body: `{ priceFinal?: number, note?: string }` → envía email al cliente
  - `PATCH /api/admin/quotes/:id/reject` — body: `{ reason: string }` → envía email de aviso
- **Frontend requerido:** Dashboard protegido en `/admin` con tabla + detalle (sheet o route) + dialogs de confirmación.
- **Auth operador:** Supabase Auth con rol `admin` (TBD).
- **Notificación de nueva solicitud al admin:** disparar Resend desde el endpoint `POST /api/quote` después del insert exitoso.

### 4. Quote Sent

- **Status:** ⏳ Pendiente
- **Qué:** Email transaccional al cliente con la propuesta renderizada (mismo layout del documento oficial) + botón **Aceptar propuesta** y **Rechazar** (links firmados con token HMAC que incluye `quote_id` + `action` + `exp`).
- **Backend:** El endpoint `PATCH /api/admin/quotes/:id/approve` dispara Resend. Status → `sent`.
- **Template:** `emails/QuoteSent.tsx` (React Email) — reutiliza `propuesta.tsx` renderizando a HTML.

### 5. Customer Approval

- **Status:** ⏳ Pendiente
- **Qué:** El cliente abre el link del email → página pública `/cotizacion/[token]` con la propuesta renderizada y botones:
  - **Aceptar** → dispara **magic link** vía Supabase Auth al email del cliente → al abrir, cuenta se crea/vincula → redirige a `/pago/[quote_id]`
  - **Rechazar** → status `cancelled` + notificar admin
- **Página pública** (sin login): valida token firmado antes de mostrar datos; link expira en 24h (vigencia de la propuesta).
- **Status transitions:** `sent → accepted` (al confirmar) → luego `accepted` persiste mientras se completa el login + pago.

### 6. Login / Authentication

- **Status:** ✅ Decidido · ⏳ Pendiente de implementar
- **Decisión:** Supabase Auth con **magic link** (email). Auto-crea/vincula la cuenta al `customer_email` ya capturado en la quote. Cero password.
- **Flujo:** Al aceptar propuesta → `supabase.auth.signInWithOtp({ email })` → cliente recibe email → clic en magic link → sesión creada → redirige a `/pago/[quote_id]`.
- **Importante:** El `customer_email` del paso 2 debe matchear el email del magic link para prevenir que alguien con el token acepte una propuesta ajena.

### 7. Payment

- **Status:** ⏳ Pendiente
- **Pasarela:** Conekta o MercadoPago (TBD — definir por fees, UX y soporte 3DS).
- **Flujo:**
  - Página `/pago/[quote_id]` autenticada
  - Crea PaymentIntent/Preference en la pasarela con el precio final
  - Redirige al checkout de la pasarela

### 8. Payment Verification

- **Status:** ⏳ Pendiente
- **Qué:** Webhook `POST /api/webhook/payment` recibe la confirmación de la pasarela, verifica firma, valida monto vs `price_final`, actualiza status → `paid`.
- **Idempotente:** debe tolerar reintentos del webhook sin duplicar reservations.
- **Side effects on `paid`:**
  - Insert en `bookings` (Reservation, paso 9)
  - Email al cliente #1: **recibo de pago** (`emails/PaymentReceipt.tsx`)
  - Email al cliente #2: **confirmación del ride** (`emails/BookingConfirmed.tsx`)
  - Notificación al admin (email + toast en el panel vía polling)

### 9. Reservation

- **Status:** ⏳ Pendiente
- **Qué:** Al confirmarse el pago, crear registro en tabla `bookings` con `quote_id`, `payment_id`, `amount_paid`. Driver y vehículo se asignan después (manual por operador o auto si hay disponibilidad).
- **Schema:**
  ```sql
  id              uuid PK
  quote_id        uuid references quotes(id)
  payment_id      text
  payment_gateway text
  amount_paid     decimal
  driver_name     text
  driver_phone    text
  vehicle_plate   text
  confirmed_at    timestamptz
  ```

### 10. Confirmation

- **Status:** ⏳ Pendiente
- **Qué:** Tras verificación del pago, **dos emails al cliente** (disparados desde el webhook `/api/webhook/payment`):
  - **Email #1 — Recibo de pago** (`emails/PaymentReceipt.tsx`): monto, fecha, método, referencia de la pasarela, folio fiscal si aplica
  - **Email #2 — Confirmación del ride** (`emails/BookingConfirmed.tsx`): datos del viaje, info del conductor y vehículo (si ya asignado — si no, se envía update después)
- Email al operador: `emails/OperatorBookingAlert.tsx` + toast en vivo si tiene el panel abierto.

### 11. Automated Reminders

- **Status:** ⏳ Pendiente
- **Qué:** Secuencia de emails automáticos post-pago.

| Trigger                     | Destinatario       | Contenido                                    |
| --------------------------- | ------------------ | -------------------------------------------- |
| 48h antes                   | Cliente            | Recordatorio + opción de modificar           |
| 24h antes                   | Cliente            | Recordatorio final + teléfono del conductor  |
| 2h antes                    | Cliente            | Conductor en camino                          |
| Viaje completado            | Cliente            | Solicitud de reseña                          |
| 7 días después (sin reseña) | Cliente            | Recordatorio de reseña                       |

- **Scheduling:** `node-cron` o Trigger.dev (TBD).

---

## Notificaciones al admin

El admin debe estar al tanto de dos eventos clave sin tener que refrescar: **nueva solicitud** (status `pending_review`) y **pago confirmado** (status `paid`). Dos canales en paralelo:

1. **Email transaccional (Resend)** → siempre. Llega al operador aunque no tenga el panel abierto. Push nativo de email funciona como "notification" en móvil.
2. **Toast en el panel abierto** → vía polling. Si el operador tiene `/admin` abierto, le aparece un toast en vivo cuando el status cambia.

### Realtime del panel admin — polling

- **Decisión:** polling cada **10 segundos** (no Supabase Realtime por ahora, no SSE).
- **Implementación:** hook `useAdminQuotesPolling(intervalMs = 10000)` que llama a `GET /api/admin/quotes?since={lastUpdate}` y:
  - Mergea los cambios con el estado local
  - Compara contra el snapshot previo para detectar transiciones (ej. `sent → accepted`)
  - Si hay transiciones nuevas, dispara `toast()` con el detalle
- **Trade-off:** peor latencia (hasta 10s de retraso) que Realtime, pero cero infra extra y suficiente para el volumen esperado.
- **Migración futura:** si el volumen crece, cambiar a Supabase Realtime es swap del hook sin tocar la UI.

---

## Decisiones resueltas

- ✅ **Auth method:** Supabase Auth con **magic link**, auto-vinculado al `customer_email` de la quote.
- ✅ **Admin notifications:** email transaccional (Resend) + toast en vivo (polling 10s).
- ✅ **Realtime panel admin:** polling 10s.
- ✅ **Propuesta UI:** solo admin + email (cliente ve "gracias" simple al enviar).
- ✅ **Reference format:** `UF-{YEAR}-{8CHARS}` (hash corto del UUID). Formato sequential queda para después.

## Decisiones pendientes

1. **Pasarela de pago:** Conekta vs MercadoPago. Afecta etapas 7 y 8.
2. **Asignación de driver:** manual (operador asigna) vs auto (según disponibilidad). Afecta etapa 9 y el panel admin.
3. **WhatsApp paralelo:** ¿además del email, enviar recordatorios por WhatsApp (Twilio / WhatsApp Business API)? Costo adicional pero mayor engagement.
4. **Modificaciones/cancelaciones post-reservación:** política de cancelación (ventana de tiempo), reembolsos (parciales / totales), reagendar.
5. **Copy de rechazo (admin + customer):** confirmar texto de email y si permitimos re-solicitar cotización.
6. **Admin auth:** Supabase Auth con rol `admin` custom, o lista blanca por email, o Supabase Auth + policy por rol.

---

## Arquitectura técnica

### Stack

- **Frontend:** Next.js 16 (App Router) + React 19 + Tailwind CSS 3 + Radix + motion
- **Backend:** Next.js API Routes (Node runtime)
- **DB:** PostgreSQL en Supabase
- **Emails:** Resend + React Email templates
- **Maps:** Google Routes API + Places API (New), ambas desde el servidor (`GOOGLE_MAPS_SERVER_KEY`)
- **Payments:** Conekta o MercadoPago (TBD)
- **Scheduling:** node-cron o Trigger.dev (TBD)
- **Auth:** Supabase Auth (TBD magic link vs password)

### Endpoints

```
POST   /api/estimate                    → Precio de los tres niveles (público) [done]
POST   /api/places/autocomplete|details → Lugares (público) [done]
POST   /api/quote                       → Quote Request en Supabase (público) [done, sin uso en el sitio]
GET    /api/admin/quotes                → Lista para panel operador (admin)
GET    /api/admin/quotes/:id            → Detalle (admin)
PATCH  /api/admin/quotes/:id/approve    → Aprueba + ajusta precio + envía email (admin)
PATCH  /api/admin/quotes/:id/reject     → Rechaza con nota (admin)
GET    /api/quote/public/:token         → Página pública de aprobación (sin auth)
PATCH  /api/quote/public/:token/accept  → Customer accept
PATCH  /api/quote/public/:token/decline → Customer decline
POST   /api/booking                     → Crea reservation tras webhook (interno)
POST   /api/webhook/payment             → Webhook de pasarela (verifica firma)
```

### Base de datos

**Tabla `quotes`** (ya migrada):

```sql
id                UUID PRIMARY KEY
status            quote_status  -- enum
origin            TEXT
origin_lat        DECIMAL(9,6)
origin_lng        DECIMAL(9,6)
destination       TEXT
destination_lat   DECIMAL(9,6)
destination_lng   DECIMAL(9,6)
pickup_at         TIMESTAMPTZ
passengers        INT  check(1..10)
luggage           INT  check(>=0) default 0
service_level     service_level  -- enum: practico|select|premium
distance_km       DECIMAL(8,2)
duration_min      INT
price_preliminary DECIMAL(10,2)
price_final       DECIMAL(10,2)
customer_name     TEXT
customer_email    TEXT
customer_phone    TEXT
is_corporate      BOOLEAN default false
notes             TEXT
created_at        TIMESTAMPTZ default now()
updated_at        TIMESTAMPTZ default now()  -- trigger auto-update
```

Enums:
- `quote_status`: `pending_review | sent | accepted | paid | completed | cancelled`
- `service_level`: `practico | select | premium`

Índices: `status`, `pickup_at`, `customer_email`.

**Tabla `bookings`** (pendiente de migrar): ver schema en etapa 9.

### Seguridad: Row Level Security (RLS)

Supabase expone la DB a internet. Sin RLS, cualquiera con la URL del proyecto podría leer todas las cotizaciones.

| Rol                                 | Permisos                                                               | Uso                                                               |
| ----------------------------------- | ---------------------------------------------------------------------- | ----------------------------------------------------------------- |
| `anon`                              | Solo `INSERT` en `quotes`                                              | Red de seguridad; nunca se usa directo desde el cliente           |
| `service_role` (secreto, server)    | Full access                                                            | Backend API — procesa requests y alimenta el panel                |
| `authenticated` (customer, futuro)  | `SELECT` solo sus propias quotes/bookings                              | Portal del cliente (etapas 6+)                                    |
| `authenticated` (admin, futuro)     | Full access vía policy por rol                                         | Panel del operador                                                |

**El cliente nunca habla directo con la DB.** Flujo:

```
Formulario (browser)
    ↓ POST con JSON
API Route (Next.js server, service_role_key)
    ↓ zod → price calc → INSERT
Supabase (Postgres con RLS)
```

- La service_role_key **nunca viaja al browser**
- Los precios no se pueden manipular desde el frontend
- Clientes no pueden espiar solicitudes ajenas

---

## Estructura de carpetas (actual + sugerida)

```
/
├── config/pricing.json                          # [done] tarifas
├── design/SISTEMA.md                            # [done] sistema visual
├── src/
│   ├── app/
│   │   ├── [lang]/                              # [done] sitio público ES/EN (estático)
│   │   ├── api/estimate/route.ts                # [done] precio
│   │   ├── api/places/{autocomplete,details}/   # [done] lugares
│   │   ├── api/quote/route.ts                   # [done] inserta en Supabase
│   │   ├── api/admin/quotes/…                   # [pending] lista, detalle, aprobar, rechazar
│   │   ├── api/quote/public/[token]/route.ts    # [pending]
│   │   ├── api/webhook/payment/route.ts         # [pending]
│   │   ├── cotizacion/[token]/page.tsx          # [pending] Customer Approval
│   │   ├── pago/[quoteId]/page.tsx              # [pending] Payment
│   │   ├── admin/                               # [parcial] login + tablero base
│   │   └── auth/callback/route.ts               # [done]
│   ├── components/
│   │   ├── propuesta.tsx                        # [done] documento oficial reutilizable
│   │   ├── quote/                               # [done] cotizador
│   │   ├── sections/ · site/ · ui/ · motion/    # [done] sitio público
│   │   └── admin/                               # [pending] QuoteList, QuoteDetail, useAdminQuotesPolling
│   ├── content/ · i18n/                         # [done] textos ES/EN
│   └── lib/
│       ├── pricing/ · distance/ · geo/ · places/ · google/ · estimate/ · quote/   # [done]
│       ├── validation.ts · supabase*.ts · db-types.ts                             # [done]
│       ├── email.ts                             # [parcial]
│       └── sign-token.ts                        # [pending] HMAC para links firmados
├── supabase/migrations/
│   ├── 0001_quotes.sql        [done]
│   └── 0002_bookings.sql      [pending]
├── scripts/
│   ├── test-api-quote.ts · test-supabase.ts     [done]
│   └── optimize-images.mjs · brand-assets.mjs · shot.mjs   [done]
├── tests/                                       # [done] Vitest
└── emails/                    [pending]
    ├── NewQuoteAdmin.tsx · QuoteSent.tsx · QuoteRejected.tsx · PaymentReceipt.tsx
    └── BookingConfirmed.tsx · OperatorBookingAlert.tsx · Reminder48h.tsx · ReviewRequest.tsx
```

---

## Lo que NO se debe cambiar

- Fotografía hero del Tesla Model 3
- Tagline: "The luxury of travelling green"
- Estadísticas: +1,500 viajes · 98% satisfacción
- Los tres niveles de servicio: Práctico / Select / Premium
- La tabla de snacks por plan (solo mover dentro de las tarjetas)
- El número de WhatsApp — se mantiene en footer como soporte, NO como canal de ventas

---

## Tarea activa

**✅ Rediseño 2026 terminado** (ver sección inicial): sitio público nuevo y cotizador con precio al momento.
- Componente `propuesta.tsx` extraído, listo para admin + email.
- **Pendiente de config:** `GOOGLE_MAPS_SERVER_KEY` (solo servidor). Sin ella el cotizador usa distancia aproximada y solo el catálogo de lugares.
- **Pendiente de decisión:** si el cotizador nuevo debe registrar la solicitud en Supabase antes de abrir WhatsApp.

**Siguiente — Fase 3 (Admin Review).** En orden sugerido:

1. **Notificación de nueva solicitud al admin** (email vía Resend) — se dispara desde `POST /api/quote` tras insert exitoso. Email simple con link a `/admin/quotes/[id]`.
2. **Protección de `/admin`** — auth del operador (decidir mecanismo: Supabase Auth con rol admin, o lista blanca por email + magic link).
3. **Endpoints admin:**
   - `GET /api/admin/quotes` (filtros por status, orden por created_at desc)
   - `GET /api/admin/quotes/[id]`
   - `PATCH /api/admin/quotes/[id]/approve`
   - `PATCH /api/admin/quotes/[id]/reject`
4. **UI admin:** `/admin/page.tsx` con tabla + detalle (sheet lateral). El detalle usa `<QuotePropuesta />` + info del cliente.
5. **Polling 10s** vía hook `useAdminQuotesPolling` para toasts en vivo.

Prerequisitos antes de empezar Fase 3:
- Confirmar mecanismo de auth del admin
- Confirmar email del operador para notificaciones (`ADMIN_EMAIL` en `.env.local`)
- Confirmar que Resend esté setup (API key en `.env.local`)
