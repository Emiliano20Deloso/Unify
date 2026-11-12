# Unify Luxury

Chofer privado en Tesla en la Ciudad de México y zona metropolitana. Sitio público bilingüe (español e
inglés) con cotizador en línea: el cliente ve el precio fijo de los tres niveles (Práctico, Select,
Premium) y reserva por WhatsApp. Producción: [unifyluxury.com](https://unifyluxury.com).

## Stack

- **Next.js 16** (App Router, `proxy.ts`, `ViewTransition`) + **React 19** + **TypeScript**
- **Tailwind CSS 3** con tokens propios (`src/styles/tokens.css`) y primitivas Radix (diálogo, acordeón)
- **motion** (`motion/react`, con `LazyMotion`) para las apariciones al hacer scroll
- **zod** para validar la config de precios y las peticiones del API
- **Supabase** (admin y tabla `quotes`) y **Resend** (correo), opcionales en local
- **Google Routes API y Places API (New)**, opcionales: sin llave el cotizador sigue funcionando
- **Vitest** para pruebas; **pnpm** como gestor de paquetes

## Estructura

```
config/pricing.json          Tarifas, multiplicadores, ventanas, zona de servicio (fuente única de precios)
design/SISTEMA.md            Sistema visual "Nocturno": tokens, componentes, recetas y lo prohibido
src/app/[lang]/              Páginas públicas, estáticas por idioma (es sin prefijo, en con /en)
  page.tsx · servicios · tarifas · nosotros · privacidad · terminos · not-found
  dev/ui · dev/frame         Muestrario y vista móvil/tableta (solo en desarrollo; 404 en producción)
src/app/api/                 estimate (precio), places/autocomplete y places/details, quote (Supabase)
src/app/admin/ · auth/       Panel del operador y callback de Supabase Auth
src/app/global-not-found.tsx 404 bilingüe para rutas inexistentes
src/components/ui/           Primitivas del sistema (Button, Section, Media, Price, RouteLine…)
src/components/sections/     Secciones por página (home, services, pricing, about, legal, shared)
src/components/quote/        Cotizador: QuoteWidget (barra del hero) y QuoteCalculator (/tarifas)
src/content/                 Contenido compartido ES/EN (niveles, rutas, FAQ, testimonios, textos legales)
src/i18n/                    Idiomas, rutas y diccionarios por página (es define los tipos)
src/lib/pricing/             Motor de precios (puro, sin red) y lectura de config/pricing.json
src/lib/distance · geo · places · google · estimate   Distancia, catálogo de lugares, Google y estimación
src/lib/quote/               Lógica del cotizador en el navegador (borrador, formato, llamadas al API)
src/assets/images/           Fotos optimizadas (generadas por `pnpm images`)
supabase/migrations/         Esquema de la base de datos
tests/                       Pruebas de Vitest
scripts/                     optimize-images, brand-assets, shot (capturas sin cabeza), pruebas manuales del API
```

## Scripts

| Comando           | Qué hace                                                                       |
| ----------------- | ------------------------------------------------------------------------------ |
| `pnpm dev`        | Servidor de desarrollo                                                         |
| `pnpm build`      | Compilación de producción                                                      |
| `pnpm start`      | Sirve la compilación                                                           |
| `pnpm lint`       | ESLint                                                                         |
| `pnpm typecheck`  | `next typegen` + `tsc --noEmit`                                                |
| `pnpm test`       | Vitest                                                                         |
| `pnpm check`      | lint + typecheck + test + build                                                |
| `pnpm images`     | Optimiza las fotos de `design/originals` hacia `src/assets/images`             |
| `node scripts/shot.mjs pasos.json` | Capturas de escritorio y móvil con Chrome sin cabeza (ver su encabezado) |

## Variables de entorno

Copia `.env.example` a `.env.local`. El sitio arranca y compila sin ninguna.

| Variable                                   | Uso                                                                                     |
| ------------------------------------------ | --------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_SITE_URL`                     | URL pública: canonical, hreflang, sitemap, robots, magic link y validación de `Origin`  |
| `NEXT_PUBLIC_SUPABASE_URL` / `_ANON_KEY`   | Supabase (admin y proxy). Sin ellas `/admin` muestra un aviso                           |
| `SUPABASE_SERVICE_ROLE_KEY`                | Solo servidor: inserta en `quotes`. Sin ella `/api/quote` responde 503                  |
| `GOOGLE_MAPS_SERVER_KEY`                   | Solo servidor: Routes y Places. Restringe la llave y fija cuotas en Google Cloud        |
| `GOOGLE_ROUTES_TRAFFIC`                    | `unaware` para Routes sin tráfico (más barato). Por defecto con tráfico                  |
| `RESEND_API_KEY` / `RESEND_FROM` / `ADMIN_EMAIL` | Correos de avisos                                                                 |
| `VERCEL_ENV`                               | La define Vercel: `robots.txt` solo permite indexar con `production`                    |

## Cómo funciona el cotizador

1. El cliente elige origen y destino. Primero se busca en el **catálogo** de lugares frecuentes
   (`src/lib/places/catalog.ts`: aeropuertos, colonias, recintos), gratis e instantáneo. Con llave de
   Google, al seguir escribiendo también se consultan direcciones en Places (`/api/places/*`).
2. `/api/estimate` calcula la distancia de cada tramo:
   - **Con llave:** Google Routes (con tráfico según la hora de salida). Si la respuesta no cuadra con la
     línea recta, tarda o falla, se usa el aproximado.
   - **Sin llave:** aproximado = distancia en línea recta × `approx.road_factor` (mínimo `approx.min_km`),
     con duración según `approx.speed_kmh`. Es `approxKm` en `src/lib/distance/approx.ts`.
3. El motor (`src/lib/pricing`) aplica la fórmula y devuelve el precio de los tres niveles con su desglose:
   `(base + km × per_km, al menos min_fare) × multiplicador de hora × multiplicador de día + extras`.
4. La reserva se envía por WhatsApp con el resumen del viaje. Los viajes fuera de zona, de más de
   `service_area.max_leg_km` por tramo o con más capacidad se cotizan aparte por WhatsApp.

Las rutas frecuentes (`src/content/routes.ts`) y el ejemplo de `/tarifas` calculan su distancia con el mismo
`approxKm` y su precio con el mismo motor, así que muestran lo mismo que el cotizador sin llave de Google.

## Cambiar tarifas

Todo vive en `config/pricing.json` (se valida con zod al arrancar; un valor inválido rompe el build):

- `base`, `per_km`, `min_fare`: por nivel (`practico`, `select`, `premium`), en pesos con IVA.
- `multipliers` y `windows`: recargos de hora pico, noche, fin de semana y festivos, y sus horarios.
- `holidays_mx`: fechas festivas (`YYYY-MM-DD`).
- `extras` y `capacity`: cargos por pasajero o maleta adicional y topes por vehículo.
- `service_area`, `approx`, `waiting`, `booking`: zona, aproximado sin Google, espera y anticipación.

Los precios de las páginas ("Desde $X", tablas, ejemplo) se generan en la compilación: tras cambiar el
archivo hay que volver a desplegar. Corre `pnpm test` antes; las pruebas del motor cubren la fórmula.

## Más documentación

- `design/SISTEMA.md`: cómo construir páginas con el sistema visual.
- `IMPROVEMENTS.md`: qué cambió en el rediseño y el plan del flujo de reservas (admin, pagos).
