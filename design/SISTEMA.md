# Sistema Nocturno · guía para construir páginas

Para VER tu trabajo sin depender de un navegador abierto: `node scripts/shot.mjs pasos.json` (Chrome sin cabeza; capturas de escritorio y de móvil real a 390 px, clics, tecleo y errores de consola; instrucciones en el encabezado del script; guarda las capturas en `.shots/`).

Revisa siempre en **`/dev/ui`** (muestrario de todo) y **`/dev/frame?path=/tu-ruta`** (la ruta en 390×844 y 768×1024 lado a lado). Maqueta: `design/referencia/B-Nocturno-*.dc.html`.

## Tokens y clases (`src/styles/tokens.css` → `tailwind.config.ts`)
- **Color**: `bg` fondo · `surface` superficie · `elevated` elevada · `fg` texto · `fg-soft` / `fg-muted` texto suave · `fg-subtle` secundario y etiquetas · `line` / `line-strong` líneas · `brand` rojo de botón (texto blanco, hover `brand-hover`) · `brand-ink` acento de texto pequeño y punto de origen · `route` trazo de La línea. Opacidad solo en sólidos (`bg-bg/80`). **Nunca hex fuera de tokens.css.**
- **Tipografía** (una clase hace familia+tamaño+interlineado): `type-display` (H1, 30→76) · `type-title` (H2 de sección, 32→52) · `type-heading` (tarjeta, 24→34) · `type-subheading` (20→26) · `type-figure` (precio grande) · `type-lead` · `type-body` · `type-small` (15) · `type-label` (13/500). Cifras: `tabular`. Los títulos ya llevan `text-wrap: balance`.
- **Espacio**: `px-gutter` (20→80), `py-section-sm|md|lg`, `pt-header` / `var(--header-h)` (64 / 88). Contenido máx. 1280 px.
- **Radios**: `rounded-inner` 12 · `rounded-control` 14 (botones, campos) · `rounded-card` 18 (tarjetas, barra) · `rounded-media` 24 (fotos). **Sombra**: solo `shadow-bar` (barra del cotizador sobre la foto).
- **Movimiento**: ver § Movimiento (`duration-micro|ui|exit|layout`, `ease-spring-*`, `ease-out`, `ease-exit`, `ease`; los antiguos `duration-fast|base|slow|slower` siguen existiendo pero no los uses en código nuevo).

## Componentes
```tsx
import { Button, Container, Section, SectionHeader, PageHero, Card, CardBody, Chip, Stat, Field, Input, Textarea,
  Stepper, Switch, Segmented, Accordion, AccordionItem, AccordionTrigger, AccordionContent, Dialog, DialogTrigger,
  DialogContent, DialogTitle, Sheet, SheetTrigger, SheetContent, Divider, Media, Price, RouteLine, CheckIcon,
  ArrowIcon, PlusIcon, MinusIcon, CloseIcon, MenuIcon } from "@/components/ui";
// Servidor (o cualquier archivo): por el índice.
import { PageTransition, Reveal, RevealGroup, QUOTE_PANEL_VT } from "@/components/motion";
// Islas cliente: cada primitiva por su archivo (no arrastra el barril).
import { Collapse } from "@/components/motion/collapse";        // también AutoHeight, Swap, Presence
import { slideIndicatorTo, hideIndicator } from "@/components/motion/sliding-indicator";
import { SPRING, FADE_IN, FADE_OUT, SPRING_CSS } from "@/lib/motion";
import { Logo, LogoMark } from "@/components/brand";
import { QuoteWidget, QuoteCalculator } from "@/components/quote"; // ({ lang, dict: Dictionary<"quote"> })
```
- `<Button variant="primary|secondary|ghost|link" size="sm|md|lg|icon" asChild><Link href=…>Cotizar</Link></Button>` — una primaria por vista; `link` añade la flecha sola. Alto 44/52/56.
- `<Section tone="bg|surface" space="sm|md|lg" aria-labelledby="x">` ya trae `Container` (`contained={false}` para foto a sangre).
- `<SectionHeader id="x" title="…" text="…" align="start|center" action={<Button variant="link">…</Button>} />`
- `<PageHero title text media={{ src, alt, position }}>{botones}</PageHero>` — cabecera de páginas interiores; compensa el menú.
- `<Card as="article" tone="surface|elevated" padding="md|none">` + `<CardBody>` si empieza con foto.
- `<Chip tone="neutral|dot">Aeropuerto</Chip>` · `<Stat value="+1,500" label="viajes" />` · `<Divider orientation strong />`
- `<Field label hint error><Input /></Field>` — conecta id, `aria-describedby` y `aria-invalid` solo; ayuda y error se despliegan con `Collapse` (ids estables `<id>-hint` / `<id>-error`). `Textarea` igual.
- `<Stepper value onValueChange min max labelledBy decrementLabel incrementLabel />` (cliente). El número rueda; en el tope el botón queda `aria-disabled` y se atenúa.
- `<Switch checked onCheckedChange>{etiqueta}</Switch>` (o `defaultChecked`; acepta las props del input: `id`, `name`, `disabled`). Checkbox nativo con `role="switch"`.
- `<Segmented name legend options={[{ value, label, detail: <Price value={450} /> }]} value onValueChange selectedLabel="Elegido" />` (radios nativos; la pastilla `[data-indicator]` se desliza).
- `<Accordion type="single" collapsible>` → `AccordionItem value` → `AccordionTrigger` (es h3) + `AccordionContent`. Alto animado y redirigible a media animación.
- `<DialogContent closeLabel={t.a11y.close}>` con `DialogTitle`; `<SheetContent variant="side|full" header={…} closeLabel>`.
- `<Media src={foto} alt="…" sizes="(min-width: 1024px) 50vw, 100vw" className="aspect-[4/3]" radius="media|card|none" veil="top|bottom|both" fade position="50% 60%" preload />` — `fade` (o `fade="mobile"`) funde el borde inferior con el fondo; `sizes` siempre pensado; `preload` solo en la foto LCP; `fill` para ocupar un padre `relative`.
- `<Price value={450} currency className="type-figure" />` — rueda al cambiar; formatea con `formatMXN`.
- `<RouteLine className="w-24" label="a" />` horizontal · `orientation="vertical"` · `draw` (se dibuja al entrar) · `redraw={clave}` (se recoge y se vuelve a dibujar cuando cambia, sin `key`) · `pulse={clave}` (el punto de destino late una vez). Sin `label` es decorativa.
- `<Logo className="h-8" title={null} />` dentro de un enlace con `aria-label`.
- **La línea como progreso** (`site/route-progress.tsx`, en el layout de `[lang]`): ● origen —— ○ destino fija a medio margen a la izquierda del contenido; el trazo claro sigue el scroll y el destino se rellena al final. Solo CSS (`animation-timeline: scroll()`), solo ≥ 1280 px y donde hay soporte; decorativa, fuera de impresión.
  Transición de página propia (`route-progress`, fundido sin desplazamiento); con movimiento reducido queda fija, sin trazo. No pongas nada en ese margen ni le pongas un ancestro con `transform`.

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
**Rejilla de tarjetas**: `<RevealGroup className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">{items.map((i, n) => <Reveal key variant="item" index={n}><Card as="article">…</Card></Reveal>)}</RevealGroup>`. Gap 24 (`gap-6`); en tarjeta: título `type-heading`, texto `type-small text-fg-subtle`, lista con `CheckIcon text-brand-ink`, botón al pie con `mt-auto`.
**Sección con foto**: `grid gap-10 lg:grid-cols-2 lg:items-center` con `<Media className="aspect-[4/5] lg:aspect-[4/3]" sizes="(min-width:1024px) 50vw, 100vw" />` y texto al lado. Texto encima de foto: solo con `veil` y en `text-fg` / `text-fg-soft`.
**Cifras**: fila `flex flex-wrap items-baseline gap-x-16 gap-y-6 border-t border-line pt-8` con `Stat`.
**Toda page.tsx** envuelve su contenido en `<PageTransition>`; el hero de portada y `/tarifas` envuelven el panel del cotizador en `<ViewTransition name={QUOTE_PANEL_VT} share="morph" default="none">` (ya lo hacen los stubs de `@/components/quote`).

## Movimiento
Regla del dueño: **cada acción tiene su reacción animada**, sin cortes, brincos ni flashazos; fluido tipo Apple (resortes sin rebote, 0.2–0.6 s), nunca estorba. Arquitectura y por qué: `design/MOVIMIENTO.md` (donde difiera del código, manda el código).

**Tokens** (`tokens.css` → Tailwind). Lo que se mueve o cambia de tamaño (transform, alto): resortes `--spring-micro|ui|layout|page` con su duración `--spring-*-dur` (clases `ease-spring-*` + `[transition-duration:var(--spring-ui-dur)]`). Opacidad: entra con `--dur-ui` + `--ease-out`, sale con `--dur-exit` + `--ease-exit`. Color y borde: `--dur-micro` + `--ease`. En JS: `SPRING`, `FADE_IN`, `FADE_OUT` (motion) y `SPRING_CSS` (WAAPI, NumberFlow). Nunca `linear`, nunca `transition-all`.

**Qué usar en cada caso**
- Contenido bajo el pliegue: `Reveal` / `RevealGroup` (servidor, CSS). Cabecera de página: `data-enter="0|1|2|3"`. Página entera: `PageTransition`.
- Algo que aparece y desaparece: `Collapse` si empuja lo de abajo (alto + fundido), `Presence preset="fade|rise|drop|sheet-bottom"` si flota. Contenido que cambia en el mismo sitio: `Swap` dentro de `AutoHeight` (`Swap inline` para texto).
- Elegir entre opciones o resaltar una: un solo elemento `sliding-indicator` (columnas iguales: `--x` por índice; posiciones libres: `slideIndicatorTo`).
- Secciones: un solo momento por sección y la variante según el contenido (`SectionHeader` ya revela título → texto → acción; fotos en `Reveal variant="media"`, que además asienta el encuadre dentro del marco; listas y rejillas en `RevealGroup`, `[--stagger:var(--stagger-tight)]` si son largas; `Stat` dentro de `Reveal variant="figure"` rueda de 0 a su valor una vez). Una lista con subgrid: el `Reveal` es la propia columna (`as="article"`).
- Reacciones al cursor sin mover el layout (globals.css § Secciones): `data-react-card` en una `Card` con foto (la foto se acerca en su marco, el borde se aclara), filas con `[data-route-row]` / `[data-quote-kind]` (La línea o el filete se recorren en claro, la flecha avanza) y `footer-link` (subrayado que se traza). Siempre con hover real **y** su equivalente con `:focus-visible`; con movimiento reducido, solo fundidos. Demo en `/dev/ui` § Movimiento.
- Cifras: `Price` / NumberFlow con `SPRING_CSS.ui`. Diálogos y hojas: keyframes CSS (Radix desmonta al terminar la animación, no la transición). Acordeón: contenido siempre montado y transiciones (alto con `grid-template-rows`), para poder interrumpirlo.
- Controles nuevos: clase `ctl` (color, borde, opacidad y anillo de foco con transición) y `ctl-press` (`scale .97` al presionar, regreso con resorte; `[--press-scale:…]` para otro valor). El anillo de foco entra animado en todo el sitio sin hacer nada.
- Deshabilitar algo que se pulsa en serie (topes): `aria-disabled` en vez de `disabled`, así no pierde el foco.
- Cambios rápidos seguidos: transiciones (se redirigen desde donde van), no keyframes; si tiene que ser keyframe, parte del estado actual (ver `Accordion`).

**Tres reglas que ya costaron un error**
1. Entrada cuyo estado final es el natural: `animation-fill-mode: backwards`, nunca `both`. Un `translate`/`transform` que queda aplicado convierte al elemento en bloque contenedor de sus descendientes `position: fixed`.
2. `Reveal` pisa la propiedad `transition` del elemento: no lo pongas en algo con transición propia (un botón, una tarjeta con hover); envuélvelo.
3. No dejes procesos colgados en segundo plano (servidores, auditorías) al terminar.

**Movimiento reducido**: quedan los fundidos y se quitan los desplazamientos (motion lo hace solo con `MotionConfig reducedMotion="user"`; en CSS, `@media (prefers-reduced-motion: reduce)` sin transform ni alto animado). Nada queda oculto.

**Servidor por defecto**; `"use client"` solo en islas, y en ellas importa cada primitiva por su archivo. Los textos llegan por props desde el diccionario.

**Cómo medir** (`scripts/motion/README.md`): con `pnpm dev --port 3100`, `node scripts/motion-audit.mjs --selftest` y luego `node scripts/motion-audit.mjs scripts/motion/escenarios.json --only C,A1`. Cada control nuevo lleva su demo en `/dev/ui` y un escenario con `post` que compruebe el estado final (y `"reduced":"both"` si desplaza algo). Meta: 0 CORTE, BRINCO, FLASHAZO, SIN REACCIÓN, RM-MOVIMIENTO y POST FALLÓ.

## Prohibido
Glows y brillos · bordes con brillo o degradado · vidrio esmerilado / `backdrop-blur` · degradados de adorno (solo los velos de `Media`) · cursivas decorativas o una palabra resaltada en un título · etiquetas en MAYÚSCULAS con tracking sobre los títulos (`uppercase tracking-*`) · texto con poca opacidad sobre fotos (`text-white/60`) · numeraciones 01/02/03 que no sean secuencia · sombras salvo `shadow-bar` · hex o colores de Tailwind (`red-500`, `zinc-*`) · `transition-all` · alturas táctiles < 44 px · leer `searchParams`/`cookies()`/`headers()` en páginas de `[lang]` (deben salir estáticas).
