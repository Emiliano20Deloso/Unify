# Sistema Nocturno · guía para construir páginas

Para VER tu trabajo sin depender de un navegador abierto: `node scripts/shot.mjs pasos.json` (Chrome sin cabeza; capturas de escritorio y de móvil real a 390 px, clics, tecleo y errores de consola; instrucciones en el encabezado del script; guarda las capturas en `.shots/`).

Revisa siempre en **`/dev/ui`** (muestrario de todo) y **`/dev/frame?path=/tu-ruta`** (la ruta en 390×844 y 768×1024 lado a lado). Maqueta: `design/referencia/B-Nocturno-*.dc.html`.

## Tokens y clases (`src/styles/tokens.css` → `tailwind.config.ts`)
- **Color**: `bg` fondo · `surface` superficie · `elevated` elevada · `fg` texto · `fg-soft` / `fg-muted` texto suave · `fg-subtle` secundario y etiquetas · `line` / `line-strong` líneas · `brand` rojo de botón (texto blanco, hover `brand-hover`) · `brand-ink` acento de texto pequeño y punto de origen · `route` trazo de La línea. Opacidad solo en sólidos (`bg-bg/80`). **Nunca hex fuera de tokens.css.**
- **Tipografía** (una clase hace familia+tamaño+interlineado): `type-display` (H1, 30→76) · `type-title` (H2 de sección, 32→52) · `type-heading` (tarjeta, 24→34) · `type-subheading` (20→26) · `type-figure` (precio grande) · `type-lead` · `type-body` · `type-small` (15) · `type-label` (13/500). Cifras: `tabular`. Los títulos ya llevan `text-wrap: balance`.
- **Espacio**: `px-gutter` (20→80), `py-section-sm|md|lg`, `pt-header` / `var(--header-h)` (64 / 88). Contenido máx. 1280 px.
- **Radios**: `rounded-inner` 12 · `rounded-control` 14 (botones, campos) · `rounded-card` 18 (tarjetas, barra) · `rounded-media` 24 (fotos). **Sombra**: solo `shadow-bar` (barra del cotizador sobre la foto).
- **Movimiento**: `duration-fast|base|slow|slower` (150/250/450/800) · `ease-out` (entradas) · `ease` (color en hover).

## Componentes
```tsx
import { Button, Container, Section, SectionHeader, PageHero, Card, CardBody, Chip, Stat, Field, Input, Textarea,
  Stepper, Segmented, Accordion, AccordionItem, AccordionTrigger, AccordionContent, Dialog, DialogTrigger,
  DialogContent, DialogTitle, Sheet, SheetTrigger, SheetContent, Divider, Media, Price, RouteLine, CheckIcon,
  ArrowIcon, WhatsAppIcon } from "@/components/ui";
import { PageTransition, Reveal, Stagger, StaggerItem, QUOTE_PANEL_VT } from "@/components/motion";
import { Logo, LogoMark } from "@/components/brand";
import { QuoteWidget, QuoteCalculator } from "@/components/quote"; // ({ lang, dict: Dictionary<"quote"> })
```
- `<Button variant="primary|secondary|ghost|link" size="sm|md|lg|icon" asChild><Link href=…>Cotizar</Link></Button>` — una primaria por vista; `link` añade la flecha sola. Alto 44/52/56.
- `<Section tone="bg|surface" space="sm|md|lg" aria-labelledby="x">` ya trae `Container` (`contained={false}` para foto a sangre).
- `<SectionHeader id="x" title="…" text="…" align="start|center" action={<Button variant="link">…</Button>} />`
- `<PageHero title text media={{ src, alt, position }}>{botones}</PageHero>` — cabecera de páginas interiores; compensa el menú.
- `<Card as="article" tone="surface|elevated" padding="md|none">` + `<CardBody>` si empieza con foto.
- `<Chip tone="neutral|dot">Aeropuerto</Chip>` · `<Stat value="+1,500" label="viajes" />` · `<Divider orientation strong />`
- `<Field label hint error><Input /></Field>` — conecta id, `aria-describedby` y `aria-invalid` solo. `Textarea` igual.
- `<Stepper value onValueChange min max labelledBy decrementLabel incrementLabel />` (cliente).
- `<Segmented name legend options={[{ value, label, detail: <Price value={450} /> }]} value onValueChange selectedLabel="Elegido" />` (radios nativos).
- `<Accordion type="single" collapsible>` → `AccordionItem value` → `AccordionTrigger` (es h3) + `AccordionContent`.
- `<DialogContent closeLabel={t.a11y.close}>` con `DialogTitle`; `<SheetContent variant="side|full" header={…} closeLabel>`.
- `<Media src={foto} alt="…" sizes="(min-width: 1024px) 50vw, 100vw" className="aspect-[4/3]" radius="media|card|none" veil="top|bottom|both" fade position="50% 60%" preload />` — `fade` (o `fade="mobile"`) funde el borde inferior con el fondo; `sizes` siempre pensado; `preload` solo en la foto LCP; `fill` para ocupar un padre `relative`.
- `<Price value={450} currency className="type-figure" />` — rueda al cambiar; formatea con `formatMXN`.
- `<RouteLine className="w-24" label="a" />` horizontal · `orientation="vertical"` · `draw` (se dibuja al entrar). Sin `label` es decorativa.
- `<Logo className="h-8" title={null} />` dentro de un enlace con `aria-label`.

## Recetas
**Hero con foto a sangre (portada)** — el menú es transparente encima; el velo superior lo hace legible.
```tsx
<section className="relative flex min-h-[640px] flex-col justify-end md:h-[880px]">
  <Media src={teslaGrisAnochecer} alt="…" fill radius="none" veil="both" sizes="100vw" position="50% 60%" preload />
  <Container className="relative pb-section-md pt-header">
    <h1 className="type-display max-w-4xl">Viaja en silencio.<br />Llega a tiempo.</h1>
    <p className="type-lead mt-5 max-w-[34rem] text-fg-soft">…</p>
  </Container>
</section>
```
**Sección estándar**: `<Section aria-labelledby="t"><SectionHeader id="t" title … />{contenido}</Section>`. Alterna `tone` para ritmo; no pongas líneas y cambio de tono a la vez.
**Rejilla de tarjetas**: `<Stagger className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">{items.map(i => <StaggerItem key><Card as="article">…</Card></StaggerItem>)}</Stagger>`. Gap 24 (`gap-6`); en tarjeta: título `type-heading`, texto `type-small text-fg-subtle`, lista con `CheckIcon text-brand-ink`, botón al pie con `mt-auto`.
**Sección con foto**: `grid gap-10 lg:grid-cols-2 lg:items-center` con `<Media className="aspect-[4/5] lg:aspect-[4/3]" sizes="(min-width:1024px) 50vw, 100vw" />` y texto al lado. Texto encima de foto: solo con `veil` y en `text-fg` / `text-fg-soft`.
**Cifras**: fila `flex flex-wrap items-baseline gap-x-16 gap-y-6 border-t border-line pt-8` con `Stat`.
**Toda page.tsx** envuelve su contenido en `<PageTransition>`; el hero de portada y `/tarifas` envuelven el panel del cotizador en `<ViewTransition name={QUOTE_PANEL_VT} share="morph" default="none">` (ya lo hacen los stubs de `@/components/quote`).

## Movimiento
- Solo `transform` y `opacity`. Entradas 450 ms `ease-out`, desplazamiento 12 px, una vez. Hover 150 ms. Presión `scale(0.97)` (ya en Button).
- `Reveal` / `Stagger` para contenido bajo el pliegue. **Nunca** en el H1, la foto del hero ni el cotizador del hero.
- Un momento coreografiado por página como mucho (p. ej. La línea `draw` del cotizador). No animes cada sección.
- `prefers-reduced-motion`: motion quita desplazamientos y deja fundidos (MotionConfig), CSS igual. No hace falta nada extra.
- Servidor por defecto; `"use client"` solo en islas. Los textos llegan por props desde el diccionario (nada de cadenas en componentes).

## Prohibido
Glows y brillos · bordes con brillo o degradado · vidrio esmerilado / `backdrop-blur` · degradados de adorno (solo los velos de `Media`) · cursivas decorativas o una palabra resaltada en un título · etiquetas en MAYÚSCULAS con tracking sobre los títulos (`uppercase tracking-*`) · texto con poca opacidad sobre fotos (`text-white/60`) · numeraciones 01/02/03 que no sean secuencia · sombras salvo `shadow-bar` · hex o colores de Tailwind (`red-500`, `zinc-*`) · `transition-all` · alturas táctiles < 44 px · leer `searchParams`/`cookies()`/`headers()` en páginas de `[lang]` (deben salir estáticas).
