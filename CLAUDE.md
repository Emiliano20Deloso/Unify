# CLAUDE.md — Unify Luxury · Contexto de proyecto

Este archivo le da contexto a Claude Code sobre el proyecto, arquitectura y objetivos actuales.
Lee este archivo antes de tocar cualquier código.

---

## ¿Qué es Unify?

Servicio de transporte privado premium en Ciudad de México con flota exclusiva de vehículos Tesla.
Sitio actual: https://unifyluxury.com

**Tres pilares de valor:**
- Vehículos Tesla eléctricos premium
- Conductores certificados y puntuales
- Precio fijo sin sorpresas

**Stack actual:**
- Frontend: Next.js + React (ya en producción)
- Estilos: Tailwind CSS
- Dominio: unifyluxury.com

---

## Problema a resolver

Hoy TODOS los CTAs del sitio redirigen a WhatsApp. El operador cotiza manualmente y coordina por chat.
Esto genera tres problemas:
1. Si el operador tarda en responder, el cliente pide un Uber
2. Clientes ejecutivos perciben WhatsApp como canal informal
3. No escala sin contratar más operadores

**El objetivo es automatizar el flujo de reserva de extremo a extremo.**

---

## Nuevo flujo completo (6 fases)

### Fase 1 — Landing page
- Eliminar logo bar de Didi/Uber/Waze (genera confusión de posicionamiento)
- Reemplazar CTA "Reserva → WhatsApp" por formulario de cotización inline en el hero
- Agregar precio referencial "Desde $X" en cada tarjeta de plan
- Mover snacks dentro de cada tarjeta como acordeón expandible
- Agregar sección de testimonios reales
- Agregar CTA corporativo separado

### Fase 2 — Formulario de cotización (stepper 3 pasos)
**Paso 1 — Detalles del viaje:**
- Origen (autocomplete Google Maps)
- Destino (autocomplete Google Maps)
- Fecha (date picker)
- Hora de recogida (time picker)

**Paso 2 — Preferencias:**
- Número de pasajeros (1–10)
- Número de maletas
- Nivel de servicio: Práctico / Select / Premium (preseleccionado si viene de una tarjeta)
- Notas adicionales (opcional)

**Paso 3 — Datos de contacto:**
- Nombre completo
- Correo electrónico
- Teléfono (opcional)
- ¿Es viaje corporativo? (checkbox)

### Fase 3 — Algoritmo de cotización automática
Al enviar el formulario, el backend:
1. Llama a Google Maps Distance Matrix API para obtener distancia (km) y duración (min)
2. Calcula el precio preliminar con esta fórmula:

```
precio = (tarifa_base_servicio + (km × tarifa_km)) × mult_hora × mult_dia + cargos_adicionales
```

Variables configurables en `config/pricing.json` (sin tocar código):
- `base_practico`, `base_select`, `base_premium` — tarifa base por nivel
- `tarifa_km` — precio por kilómetro
- `mult_pico` (7–9am, 6–8pm), `mult_nocturno` (10pm–6am), `mult_normal`
- `mult_fin_semana`, `mult_festivo`
- `cargo_pasajero_extra` — aplica a partir del 4to pasajero
- `cargo_maleta_extra` — aplica a partir de la 3ra maleta

3. Guarda la solicitud en DB con status `pending_review`
4. Muestra el precio preliminar al cliente en pantalla
5. Envía notificación por email al operador

### Fase 4 — Panel del operador
- Vista de solicitudes pendientes
- Detalle de cada solicitud (ruta, pasajeros, precio preliminar, contacto)
- Campo para ajustar precio final con nota opcional
- Botón "Confirmar y enviar" → dispara email con cotización final al cliente

### Fase 5 — Pago en línea
- Email al cliente con botón "Aceptar y pagar"
- Página de pago con detalle del viaje
- Integración con pasarela (Conekta o MercadoPago — TBD)
- Webhook de pago exitoso → dispara confirmación automática

### Fase 6 — Confirmación y alertas periódicas
Secuencia de emails automáticos tras el pago:
| Trigger | Destinatario | Contenido |
|---|---|---|
| Pago confirmado | Cliente + Operador | Confirmación, datos del conductor y vehículo |
| 48h antes | Cliente | Recordatorio + opción de modificar |
| 24h antes | Cliente | Recordatorio final + teléfono del conductor |
| 2h antes | Cliente | Conductor en camino |
| Viaje completado | Cliente | Solicitud de reseña |
| 7 días después (sin reseña) | Cliente | Recordatorio de reseña |

---

## Arquitectura técnica

### Backend: Node.js + Express
Endpoints principales:

```
POST   /api/quote              → Recibe formulario, corre algoritmo, guarda en DB, notifica operador
GET    /api/quote/:id          → Detalle de solicitud (panel operador)
PATCH  /api/quote/:id/confirm  → Operador ajusta precio y envía cotización final
POST   /api/booking            → Crea reserva tras webhook de pago exitoso
GET    /api/admin/quotes       → Lista solicitudes para el panel
POST   /api/webhook/payment    → Webhook de Stripe/Conekta/MercadoPago
```

### Base de datos: PostgreSQL (Supabase recomendado)

**Tabla: quotes**
```sql
id                UUID PRIMARY KEY
status            ENUM('pending_review','sent','accepted','paid','completed','cancelled')
origin            TEXT
origin_lat        DECIMAL
origin_lng        DECIMAL
destination       TEXT
destination_lat   DECIMAL
destination_lng   DECIMAL
pickup_at         TIMESTAMP
passengers        INT
luggage           INT
service_level     ENUM('practico','select','premium')
distance_km       DECIMAL
duration_min      INT
price_preliminary DECIMAL
price_final       DECIMAL
customer_name     TEXT
customer_email    TEXT
customer_phone    TEXT
is_corporate      BOOLEAN DEFAULT false
notes             TEXT
created_at        TIMESTAMP DEFAULT NOW()
```

**Tabla: bookings**
```sql
id               UUID PRIMARY KEY
quote_id         UUID REFERENCES quotes(id)
payment_id       TEXT
payment_gateway  TEXT
amount_paid      DECIMAL
driver_name      TEXT
driver_phone     TEXT
vehicle_plate    TEXT
confirmed_at     TIMESTAMP
```

### Emails: Resend
- SDK para Node.js
- Plantillas en React (compatible con Next.js)

### Scheduling: node-cron o Trigger.dev
- Para las alertas periódicas (48h, 24h, 2h antes del viaje)

### Rutas: Google Maps Distance Matrix API
- Para calcular distancia y duración entre origen y destino

---

## Estructura de carpetas sugerida

```
/
├── app/                        # Next.js App Router
│   ├── page.tsx                # Landing page principal
│   ├── cotizar/
│   │   └── page.tsx            # Formulario de cotización
│   ├── pago/
│   │   └── [quoteId]/page.tsx  # Página de pago
│   └── admin/
│       └── page.tsx            # Panel del operador (protegido)
├── components/
│   ├── QuoteForm/
│   │   ├── Step1Travel.tsx
│   │   ├── Step2Preferences.tsx
│   │   ├── Step3Contact.tsx
│   │   └── QuoteFormStepper.tsx
│   ├── landing/
│   │   ├── Hero.tsx
│   │   ├── Differentiators.tsx
│   │   ├── Plans.tsx
│   │   ├── HowItWorks.tsx
│   │   ├── Testimonials.tsx
│   │   └── CorpCTA.tsx
│   └── admin/
│       ├── QuoteList.tsx
│       └── QuoteDetail.tsx
├── api/                        # o /app/api si usas Next.js API routes
│   ├── quote/
│   ├── booking/
│   └── webhook/
├── lib/
│   ├── pricing.ts              # Lógica del algoritmo de precio
│   ├── maps.ts                 # Wrapper de Google Maps API
│   ├── email.ts                # Wrapper de Resend
│   └── db.ts                   # Cliente de Supabase/PostgreSQL
├── config/
│   └── pricing.json            # Parámetros editables del algoritmo
└── emails/                     # Plantillas de email en React
    ├── QuoteConfirmation.tsx
    ├── BookingConfirmed.tsx
    ├── Reminder48h.tsx
    └── ReviewRequest.tsx
```

---

## Lo que NO se debe cambiar

Estos elementos ya funcionan bien en la landing actual y no deben tocarse:
- Fotografía hero del Tesla Model 3
- Tagline: "The luxury of travelling green"
- Estadísticas: +1,500 viajes · 98% satisfacción
- Los tres niveles de servicio: Práctico / Select / Premium
- La tabla de snacks por plan (solo moverla dentro de las tarjetas)
- El número de WhatsApp — se mantiene en footer como soporte, NO como canal de ventas

---

## Tarea activa al iniciar

El primer componente a construir es `QuoteFormStepper.tsx` — el formulario de cotización
en 3 pasos que reemplaza el CTA de WhatsApp en el hero.

Criterios de aceptación:
- Stepper visual con indicador de progreso (Paso 1/3, 2/3, 3/3)
- Validación de campos en cada paso antes de avanzar
- Integración con Google Maps Places Autocomplete en origen y destino
- Al enviar el Paso 3, hace POST a /api/quote y muestra el precio preliminar
- Diseño consistente con el estilo actual de unifyluxury.com (fondo oscuro, tipografía limpia)
- Responsive: funciona correctamente en móvil
