# IMPROVEMENTS.md · Unify — Digital Booking Infrastructure

Plan de modernización de la plataforma. Léelo antes de tocar código.

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

- **Status:** 🔄 Backend done · Frontend pendiente (rama `pricing_algo`)
- **Qué:** El cliente completa un stepper de 3 pasos; el backend calcula distancia (Google Maps Distance Matrix), aplica el algoritmo de precio y guarda la solicitud con status `pending_review`.
- **Backend implementado:**
  - `POST /api/quote` — valida con zod, llama a Google Distance Matrix, calcula precio, inserta en Supabase. Fallback: si Maps falla, guarda sin precio con `needsManualQuote: true`.
  - `src/lib/pricing.ts` — algoritmo configurable
  - `src/lib/maps.ts` — wrapper Distance Matrix (server-only)
  - `src/lib/validation.ts` — schema zod del request
  - `src/lib/supabase.ts` — cliente service_role
  - `config/pricing.json` — tarifas editables sin tocar código
  - `supabase/migrations/0001_quotes.sql` — tabla `quotes` + RLS
- **Frontend pendiente:**
  - `QuoteFormStepper.tsx` con 3 pasos (viaje / preferencias / contacto)
  - Google Places Autocomplete en origen y destino
  - Pantalla de confirmación mostrando precio preliminar o mensaje "cotización en revisión" si Maps falló
  - Integración inline en el hero (reemplaza CTA WhatsApp)
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

- **Frontend:** Next.js 15 (App Router) + React + TailwindCSS + Shadcn UI + Framer Motion
- **Backend:** Next.js API Routes (Node runtime)
- **DB:** PostgreSQL en Supabase
- **Emails:** Resend + React Email templates
- **Maps:** Google Maps Distance Matrix API (server-side) + Places Autocomplete (client-side)
- **Payments:** Conekta o MercadoPago (TBD)
- **Scheduling:** node-cron o Trigger.dev (TBD)
- **Auth:** Supabase Auth (TBD magic link vs password)

### Endpoints

```
POST   /api/quote                       → Quote Request (público)
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
├── src/
│   ├── app/
│   │   ├── page.tsx                             # Landing [done]
│   │   ├── api/
│   │   │   ├── quote/route.ts                   # POST /api/quote [done]
│   │   │   ├── admin/quotes/route.ts            # GET lista [pending]
│   │   │   ├── admin/quotes/[id]/approve/route.ts  # PATCH aprobar [pending]
│   │   │   ├── admin/quotes/[id]/reject/route.ts   # PATCH rechazar [pending]
│   │   │   ├── quote/public/[token]/route.ts    # GET/PATCH público [pending]
│   │   │   └── webhook/payment/route.ts         # Webhook pasarela [pending]
│   │   ├── cotizacion/[token]/page.tsx          # Customer Approval [pending]
│   │   ├── pago/[quoteId]/page.tsx              # Payment [pending]
│   │   └── admin/page.tsx                       # Admin Review [pending]
│   ├── components/
│   │   ├── propuesta.tsx                        # [done] Documento oficial reutilizable
│   │   ├── marketing/
│   │   │   ├── quote-form.tsx                   # [done] QuoteDialog + API wiring
│   │   │   ├── place-autocomplete.tsx           # [done]
│   │   │   └── (…resto landing)                 # [done]
│   │   └── admin/                               # [pending]
│   │       ├── QuoteList.tsx
│   │       ├── QuoteDetail.tsx
│   │       └── hooks/useAdminQuotesPolling.ts
│   └── lib/
│       ├── pricing.ts         [done]
│       ├── maps.ts            [done]
│       ├── maps-loader.ts     [done]
│       ├── validation.ts      [done]
│       ├── supabase.ts        [done]
│       ├── db-types.ts        [done]
│       ├── email.ts           [pending]
│       └── sign-token.ts      [pending]        # HMAC para links firmados
├── config/
│   └── pricing.json           [done]
├── supabase/migrations/
│   ├── 0001_quotes.sql        [done]
│   └── 0002_bookings.sql      [pending]
├── scripts/
│   ├── test-pricing.ts        [done]
│   ├── test-api-quote.ts      [done]
│   └── test-supabase.ts       [done]
└── emails/                    [pending]
    ├── NewQuoteAdmin.tsx                       # Notif admin de nueva solicitud
    ├── QuoteSent.tsx                           # Propuesta al cliente (reusa propuesta.tsx)
    ├── QuoteRejected.tsx                       # Cliente, admin rechazó
    ├── PaymentReceipt.tsx                      # Cliente, recibo
    ├── BookingConfirmed.tsx                    # Cliente, ride confirmado
    ├── OperatorBookingAlert.tsx                # Admin, pago confirmado
    ├── Reminder48h.tsx
    └── ReviewRequest.tsx
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

**✅ Fase 2 (Quote Request) terminada:**
- Form `QuoteDialog` cableado al endpoint `POST /api/quote`
- Success state simple ("gracias, un operador revisará") con referencia `UF-{YEAR}-{SHORTCODE}`
- Translations ES+EN completas
- Componente `propuesta.tsx` extraído, listo para admin + email
- **Pendiente de config:** `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` está vacía en `.env.local` → mientras tanto todo cae en `needsManualQuote: true` (fallback diseñado funciona bien)

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
