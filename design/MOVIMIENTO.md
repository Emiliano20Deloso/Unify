<!-- Arquitectura del sistema de movimiento v2 (plan técnico verificado, nov-2026). Las reglas de uso diario viven en SISTEMA.md. -->

# Plan técnico de movimiento para Unify Luxury (rama `rediseno-2026`)

**Resumen de lo que corrijo de tu propuesta:**
- **No conviene pasar a `domMax`.** Cuesta unos 13.5 KB gzip y el plan rediseñado no necesita `layout` ni `layoutId`.
- **`Reveal` debe dejar de depender de motion.** Propongo atributos `data-*` que puede escribir un Server Component, un IntersectionObserver en un script en línea que corre antes de hidratar y transiciones CSS. Así desaparece el contenido que se queda invisible mientras carga motion.
- **El morph del cotizador debe dispararse solo con el tipo `quote-panel`.**
- **Falta `data-scroll-behavior="smooth"` en `<html>`.** Hoy el regreso al inicio de página al navegar se anima.
- **`design/SISTEMA.md` contradice la regla del dueño.** Dice "solo transform/opacity" y "nunca animar el H1 ni la foto del hero". Hay que actualizarlo.

---

## A. Verificación con fuente

### A1. motion 12.43.0 (`framer-motion@12.43.0`, `motion-dom@12.43.0`)

| Tema | Lo que encontré | Fuente |
|---|---|---|
| `LazyMotion` | `features: FeatureBundle \| LazyFeatureBundle` y `strict?: boolean` (lanza error si se usa `motion.*` en vez de `m.*`). La carga diferida es `() => import("./features").then(r => r.default)`, que es justo lo que hay hoy. | `node_modules/.pnpm/framer-motion@12.43.0…/dist/index.d.ts` l. 520–604; motion.dev/docs/react-lazy-motion |
| Qué trae cada paquete | `domAnimation` = animaciones + `exit` + gestos (hover, tap, focus, inView). `domMax` = lo anterior + `drag` + `layout` (`layout`, `layoutId`, `LayoutGroup`). `AnimatePresence`, incluido `popLayout`, funciona con `domAnimation`. | `dist/es/render/dom/features-animation.mjs`, `features-max.mjs` |
| Peso | `size-rollup-dom-animation.js` pesa 14.0 KB gzip; `size-rollup-dom-max.js`, 27.6 KB gzip. Diferencia: unos 13.5 KB (los medí con `gzip -c`). | `dist/size-rollup-*.js` |
| `AnimatePresence` | `mode: "sync" \| "popLayout" \| "wait"`, `initial`, `custom`, `onExitComplete`, `propagate`, `anchorX`, `root`. `initial={false}` desactiva la entrada de los hijos ya presentes en el primer render. `popLayout` necesita que el padre tenga `position` distinta de static y que los hijos que sean componentes reenvíen `ref`. Cada hijo necesita `key` estable y `AnimatePresence` no debe estar dentro del condicional. | `index.d.ts` (AnimatePresenceProps); motion.dev/docs/react-animate-presence |
| `layout` / `layoutId` / `LayoutGroup` | Documentados (la escala deforma a los hijos; se corrige con `layout` en los hijos o `layout="position"`; `borderRadius` vía `style`). Requieren `domMax`. | motion.dev/docs/react-layout-animations |
| Alto `auto` | Sigue siendo lo recomendado: `initial={{height:0}} animate={{height:"auto"}}`. Advertencia: un elemento con `display:none` no se puede medir; hay que usar `visibility`. La salida a `height:0` en `exit` no aparece en esa página; es inferencia, aunque el mecanismo de `exit` es el mismo. | motion.dev/docs/react-animation |
| Resortes por duración | `visualDuration` sustituye a `duration`. `bounce` vale 0.25 por defecto si se pasa una duración, así que **hay que poner `bounce: 0` explícitamente**. `stiffness`, `damping` o `mass` anulan ambos. | `motion-dom/dist/index.d.ts` l. 2005–2036 |
| Resorte a CSS | `spring(visualDuration, bounce).toString()` devuelve `"<ms> linear(…)"`. Con eso generé los valores CSS de B. | `motion-dom/dist/es/animation/generators/spring.mjs` l. 311–315 |
| `MotionConfig reducedMotion="user"` | Con movimiento reducido vuelve instantáneas las claves de posición (`width`, `height`, `top`, `left`, `right`, `bottom` y todas las transformaciones) y también las animaciones de layout (`type:false`). La opacidad sigue animándose. **Consecuencia:** con movimiento reducido, `Collapse` y `AutoHeight` cambian el alto al instante y solo hacen el fundido. | `motion-dom/dist/es/animation/interfaces/visual-element-target.mjs` l. 84–87; `render/utils/keys-position.mjs`; `projection/node/create-projection-node.mjs` l. 329–333 |
| Contenido invisible si motion tarda | El SSR pinta `initial` como estilo en línea y nada lo anima hasta que llegan las features. **Regla:** dentro de los componentes `m.*`, solo usar `initial` oculto en contenido que aparece por una interacción del usuario. Para estados presentes al cargar, `AnimatePresence initial={false}` (el SSR pinta el estado `animate`). Las apariciones al hacer scroll se pasan a CSS (ver B). | Inferido del comportamiento anterior; el estado actual de `reveal.tsx` lo confirma |

### A2. React 19.3 `ViewTransition` en Next 16.4.6

| Tema | Lo que encontré | Fuente |
|---|---|---|
| Props | `name` ("auto" por defecto), `default`, `enter`, `exit`, `update`, `share`, `onEnter`, `onExit`, `onShare`, `onUpdate`, `ref`. Cada prop de clase acepta un texto o un objeto por tipo `{ [tipo]: clase, default: … }`; `"none"` desactiva. `@types` no incluye una prop `className`. | `@types/react@19.3.0/index.d.ts` l. 2024–2101 |
| Cuándo se activa | Solo en Transitions, `Suspense` o `useDeferredValue`; un `setState` normal no la dispara. En Next, la navegación ya es una Transition y no hace falta configurar nada. | `node_modules/next/dist/docs/01-app/02-guides/view-transitions.md` |
| Clases y CSS | La prop asigna `view-transition-class`; se estiliza con `::view-transition-old(.clase)`, `::view-transition-new(.clase)` y `::view-transition-group(.clase)`. Con `name` + `default="none"` hay que dejar `share` explícito o el morph deja de funcionar. | misma guía (pasos 1 y 3) |
| Dónde se pone | En cada `page.tsx`, no en el layout: el layout persiste y ahí nunca hay `enter` ni `exit`. | misma guía |
| Elemento persistente con nombre | Se le pone `style={{viewTransitionName:"…"}}` y se controla con CSS (patrón `site-header`: `group{animation:none}`, `old{display:none}`, `new{animation:none}`). Un descendiente con nombre propio, como el punto rojo dentro del menú, se captura aparte y su grupo anima la posición del enlace viejo al nuevo. Esto último es comportamiento estándar de la API; no está escrito en la guía de Next. | guía (Anchoring the header) |
| Pie | Vive en el layout: hoy es parte de `root` (`animation:none`) y cambia de golpe. Para incluirlo hay que darle `view-transition-name: site-footer` y estilos propios (B). | `globals.css` l. 160–166 y `layout.tsx` |
| Dirección | `<Link transitionTypes={[…]}>` (desde v16.2) y `router.push(url,{transitionTypes})`. El atrás del navegador no lleva tipo. | `docs/…/02-components/link.md` l. 505–533 y 1375 |
| Clics durante la transición | Usar `::view-transition{pointer-events:none}` (ya está). Aun así, los elementos con nombre no reciben clics mientras dura la transición: hay que mantenerla corta. | guía (Keeping the page interactive) |
| Scroll | Next 16 **ya no** pone `scroll-behavior` en `auto` durante la navegación, salvo que `<html data-scroll-behavior="smooth">`. Como existe `html:focus-within{scroll-behavior:smooth}` y el enlace pulsado tiene el foco, la subida al inicio puede animarse. **Hace falta el atributo.** | `docs/…/upgrading/version-16.md` l. 951–975 |
| `/x` ↔ `/en/x` con `Link` | **Es navegación suave**: `isNavigatingToNewRootLayout` compara los segmentos del layout raíz "ignorando los valores de los parámetros dinámicos", así que `[lang]=es` y `[lang]=en` cuentan como el mismo layout raíz. | `next/dist/client/components/router-reducer/is-navigating-to-new-root-layout.js` |
| `<html lang>` al cambiar de idioma | Muy probablemente se actualiza: React 19 trata `<html>` como singleton y al soltar la instancia quita sus props (`releaseSingletonInstance`). **No lo verifiqué en ejecución.** Tampoco verifiqué que todo el subárbol de `[lang]` se vuelva a montar; creo que sí, porque cambia la clave del segmento. El escenario N8 de la herramienta lo comprueba. | `react-dom/cjs/react-dom-client.production.js` l. 16877 |

### A3. Soporte de CSS (caniuse, consultado hoy)

| Función | Chrome | Safari | Firefox | Uso recomendado |
|---|---|---|---|---|
| `interpolate-size` / `calc-size()` | 129 | **no** (hasta 27.3) | **no** | No depender de ellas; como mucho, mejora extra |
| `@starting-style` | 117 | 17.5 | 129 | Sí, con respaldo |
| `transition-behavior: allow-discrete` | — | — | — | **No verificado** (la tabla de MDN venía cortada). Lo evito: uso el truco de `visibility` con retraso, que funciona en todos |
| `linear()` | 113 | 17.2 | 112 | **Sí**, con `@supports` y `cubic-bezier` de respaldo |
| View Transitions en el mismo documento | 111 | 18.0 | 144 | Sí; sin soporte, se navega normal |
| `view-transition-class` (la usa React) | 125 | 18.2 | 144 | Sí |
| `animation-timeline: scroll()` | 115 | 26.0 | 159 | Solo como mejora para el fondo del menú |

### A4. Radix (accordion 1.2.2, dialog 1.1.4, presence 1.1.2)

- **Variables CSS:** `--radix-accordion-content-height/width` (también `--radix-collapsible-*`).
- **`Presence` espera a `animationend` de una animación CSS con `@keyframes`, no de una transición** (lee `animationName`). Por eso el acordeón se desmonta al instante: hoy no tiene animación de cierre.
- **`forceMount`** existe en `Content`; cerrado lleva `hidden`. Fuente: `@radix-ui/react-presence/dist/index.mjs` l. 47–104 y `react-collapsible/dist/index.mjs` l. 79–127.
- **Recomendación:** acordeón y diálogos con **keyframes CSS**, no con motion. No hacen falta `forceMount` ni JS y funcionan antes de hidratar.

### A5. NumberFlow 0.6.2

- **Props:** `value`, `format`, `locales`, `prefix`, `suffix`, `transformTiming`, `spinTiming`, `opacityTiming`, `animated`, `respectMotionPreference` (true por defecto: con movimiento reducido no anima), `trend`, `digits`, `willChange`, `isolate`, `onAnimationsStart/Finish`.
- **Cuándo anima:** solo si el navegador soporta CSS `mod()`, `linear()` y `@property`; además, el elemento debe estar visible y la pestaña activa.
- **Accesibilidad:** pone `role="img"` y `ariaLabel` por `ElementInternals`.
- Fuente: `number-flow/dist/lite.d.ts`, `lite.js` (defaultProps), `@number-flow/react/dist/index.d.ts`.
- **Uso en `Stepper`:** `<NumberFlow value={value} aria-hidden trend={0} …/>` dentro del `span role="spinbutton"`, que conserva `aria-valuenow` y añade `aria-valuetext`.

### A6. `next/font`

- `display` vale `'swap'` por defecto (opciones: `auto`, `block`, `swap`, `fallback`, `optional`).
- `preload` es `true` por defecto.
- `adjustFontFallback` es `true` para Google y `'Arial'` para fuentes locales.
- Fuente: `docs/01-app/03-api-reference/02-components/font.md` l. 172–222.
- **Problema detectado:** los títulos usan `font-stretch:122%`. El respaldo (Arial) no tiene eje de ancho, así que al llegar Archivo los títulos se reacomodan.
- **Solución:** en D.

### A7. CDP en Chrome headless

- **Screencast** (experimental), según `devtools-protocol/pdl/domains/Page.pdl`:
  - `Page.startScreencast {format, quality, maxWidth, maxHeight, everyNthFrame, maxFramesInFlight (3 por defecto), sendLastFrame}`.
  - `Page.screencastFrame {data, metadata{…, timestamp}, sessionId}`.
  - `Page.screencastFrameAck {sessionId}` es obligatorio.
- **Cadencia en `--headless=new`: no verificada.** Solo emite cuadros cuando hay cambios en pantalla. La herramienta mide los fps reales con `metadata.timestamp` y marca el resultado como "cadencia baja" por debajo de 30 fps.
- **`HeadlessExperimental.beginFrame`:** exige que el target se cree con BeginFrameControl y está pensado para `--run-all-compositor-stages-before-draw`. Que solo funcione con chrome-headless-shell es una sospecha mía, **no verificada**. Lo descarto.
- **Alternativas:**
  - `Emulation.setVirtualTimePolicy` (experimental) para avanzar de 16 en 16 ms con `captureScreenshot`.
  - `Animation.setPlaybackRate` (experimental), que solo afecta a la línea de tiempo del documento: CSS y WAAPI, no lo que motion anima por rAF.
  - **La base fiable: un muestreador dentro de la página**, que no depende de los cuadros (E).
- **Emulación:** `Emulation.setEmulatedMedia({features:[{name:"prefers-reduced-motion",value:"reduce"}]})`, y para móvil `setDeviceMetricsOverride{width,height,deviceScaleFactor,mobile}` + `setTouchEmulationEnabled` (no son experimentales; ya los usa `shot.mjs`).

---

## B. Tokens y primitivas

### B1. Tokens

Los resortes son sin rebote y los generé con motion. CSS usa como duración el tiempo de asentamiento, que es mayor que el visual.

| Token | Duración visual | Asentamiento (duración CSS) | `linear()` |
|---|---|---|---|
| `spring-micro` | 0.16 s | 350 ms | `linear(0,.2794,.6159,.8186,.9198,.966,.986,.9943,.9977,.9991,.9997,1)` |
| `spring-ui` | 0.28 s | 550 ms | `linear(0,.1236,.341,.5416,.6959,.8046,.8772,.9242,.9538,.9722,.9834,.9901,.9942,.9966,.998,.9988,.9993,1)` |
| `spring-layout` | 0.45 s | 800 ms | `linear(0,.0507,.1614,.2915,.4192,.5342,.6326,.714,.7796,.8317,.8723,.9038,.9279,.9462,.96,.9704,.9781,.9839,.9882,.9913,.9937,.9954,.9966,.9975,.9982,.9987,1)` |
| `spring-page` | 0.55 s | 1000 ms | `linear(0,.0364,.1203,.2248,.3338,.438,.5327,.6159,.6872,.7472,.7971,.838,.8713,.8982,.9198,.937,.9507,.9615,.97,.9767,.9819,.986,.9892,.9916,.9935,.995,.9962,.9971,.9977,.9983,.9987,1,1)` |

```css
/* tokens.css — se suman a los actuales (no se borran: los usan RouteLine, etc.) */
--dur-micro:160ms; --dur-ui:280ms; --dur-exit:200ms; --dur-layout:450ms;
--dur-page-out:240ms; --dur-page-in:320ms; --stagger:60ms; --stagger-tight:40ms;
--ease-exit:cubic-bezier(.4,0,1,1);             /* salidas: aceleran */
--spring-micro:var(--ease-out); --spring-micro-dur:var(--dur-micro);  /* respaldo */
--spring-ui:var(--ease-out);    --spring-ui-dur:var(--dur-ui);
--spring-layout:var(--ease-out);--spring-layout-dur:var(--dur-layout);
--spring-page:var(--ease-out);  --spring-page-dur:550ms;
@supports (transition-timing-function: linear(0, 1)) { :root {
  --spring-micro:linear(…); --spring-micro-dur:350ms;   /* valores de la tabla */
  --spring-ui:linear(…);    --spring-ui-dur:550ms;
  --spring-layout:linear(…);--spring-layout-dur:800ms;
  --spring-page:linear(…);  --spring-page-dur:1000ms; } }
```

**Regla de uso:** `transform` (y `height` en CSS) usan `spring-*`. La opacidad entra con `--dur-ui` + `--ease-out` y sale con `--dur-exit` + `--ease-exit`. El color usa `--dur-micro` + `--ease`.

```ts
// lib/motion/index.ts
export const SPRING = {
  micro:  { type: "spring", visualDuration: 0.16, bounce: 0 },
  ui:     { type: "spring", visualDuration: 0.28, bounce: 0 },
  layout: { type: "spring", visualDuration: 0.45, bounce: 0 },
  page:   { type: "spring", visualDuration: 0.55, bounce: 0 },
} as const;
export const FADE_IN  = { duration: 0.28, ease: [0.22, 1, 0.36, 1] } as const;
export const FADE_OUT = { duration: 0.2,  ease: [0.4, 0, 1, 1] } as const;
export const SPRING_CSS = { ui: "linear(…)", layout: "linear(…)" } as const; // para NumberFlow/WAAPI
export const STAGGER = 0.06;
```

Añadir a Tailwind:
- `transitionDuration`: micro, ui, exit, layout.
- `transitionTimingFunction`: spring-micro, spring-ui, spring-layout, exit.
- Una utilidad `transition-interactive` con `background-color, border-color, color, opacity, transform, outline-color, outline-offset`. Así el foco anima aunque el componente sobrescriba `transition-property`.

### B2. Primitivas (`src/components/motion/`)

| Primitiva | Firma | Comportamiento | Accesibilidad y movimiento reducido | Desde Server Components |
|---|---|---|---|---|
| `Reveal` (servidor, sin `"use client"`) | `<Reveal as? variant="title\|text\|media\|item\|figure" index? delay?>` | Pinta `data-reveal={variant}`, `style={{"--i":index}}` y `suppressHydrationWarning`. Un script en línea en `<head>` crea un IntersectionObserver y un MutationObserver sobre `documentElement`. Funciona antes de hidratar y en cada navegación suave (el documento persiste); al entrar el elemento pone `data-shown`. CSS: oculto `opacity:0; translateY(14px)` (`media`: `scale(1.03)`). Visible: opacidad `--dur-ui` + `--ease-out`, transform `--spring-layout`, retraso `calc(var(--i)*var(--stagger))`. | Sin JS: `<noscript><style>[data-reveal]{opacity:1!important;transform:none!important}</style></noscript>`. Movimiento reducido: solo opacidad. Un elemento que ya está en pantalla al analizarse queda visible sin animar (sin parpadeo). | Se usa tal cual; los hijos siguen siendo de servidor |
| `RevealGroup` | `<RevealGroup>` + hijos `<Reveal index={i}>` | El script marca el grupo; CSS `[data-reveal-group][data-shown] [data-reveal]`. | igual | igual |
| Entrada de página (`data-enter`, solo CSS) | `<h1 data-enter="1">` | Keyframes desde la primera pintura, sin JS: `enter-fade` (opacidad 450 ms ease-out) + `enter-rise` (16 px, `spring-page`) con retraso `40ms + n·70ms`. Paso 0 = foto: fundido + `scale(1.03→1)` con `spring-layout`. El título espera a las fuentes: `html:not([data-fonts]) [data-enter="1"]{animation-play-state:paused}` (D). En navegación suave corre dentro de la instantánea viva `::view-transition-new`. | Movimiento reducido: solo fundido de 280 ms | Atributo en servidor |
| `Collapse` (cliente) | `<Collapse open id? className>` | `AnimatePresence initial={false}` + `m.div` alto 0↔`auto` y opacidad. Entrada: alto `SPRING.layout`, opacidad `FADE_IN` con 60 ms de retraso. Salida: opacidad `FADE_OUT` y alto `SPRING.ui`. `overflow:hidden` solo mientras anima; al terminar, `visible` para no cortar el anillo de foco. | Desmontado cuando está cerrado (no recibe Tab). Al salir: `inert`. Movimiento reducido: alto instantáneo, fundido. | Archivo cliente; acepta hijos de servidor |
| `AutoHeight` (cliente) | `<AutoHeight>` | ResizeObserver en el interior y `m.div animate={{height:px}}` con `SPRING.layout`. Hasta la primera medición, `height:auto` (SSR correcto, nada oculto). | igual | igual |
| `Swap` (cliente) | `<Swap id={clave} inline?>` | `AnimatePresence mode="popLayout" initial={false}`. Entra: opacidad 0→1 + `y:6→0` (`SPRING.ui`). Sale: opacidad `FADE_OUT`, sin moverse. Normalmente va dentro de `AutoHeight`; en modo `inline` es fundido cruzado de texto. | El que sale lleva `aria-hidden` + `inert`; las regiones vivas siguen fuera | igual |
| `Presence` (cliente) | `<Presence show preset="fade\|rise\|drop\|sheet-bottom">` | `AnimatePresence` + presets de tokens. Para la barra móvil y avisos sueltos. | igual | igual |
| `SlidingIndicator` (CSS, sin motion) | `--x/--w` o `--y` puestos por JS o calculados | Un elemento con `transform: translateX(var(--x))`, `width: var(--w)` y transición `--spring-ui`. Lo usan `Segmented` (columnas iguales: `--x = índice·(100% + gap)`, sin medir), la pastilla de hover del menú (mide `offsetLeft/Width`) y el punto del índice legal (`offsetTop`). | Movimiento reducido: transición de 0 en transform, fundido de opacidad | — |
| `PageTransition` | igual que hoy, envolviendo en un `<div>` | Un solo nodo y una sola instantánea por página: hoy cada `<section>` hija recibe su propio nombre. `enter={{locale:"page-fade",default:"page"}}`, `exit={{locale:"page-fade",default:"page"}}`. | B3 | servidor |

**Por qué no `domMax`:** con columnas iguales, posiciones medidas, `height:auto` y `popLayout` cubro todo sin `layout` ni `layoutId`. Si más adelante hiciera falta, basta cambiar `features.ts`.

### B3. CSS de la transición de página

```css
::view-transition-old(.page){animation:var(--dur-page-out) var(--ease-exit) both vt-out}
::view-transition-new(.page){animation:var(--dur-page-in) var(--ease-out) 80ms both vt-in}
@keyframes vt-out{to{opacity:0;transform:translateY(-10px)}}
@keyframes vt-in{from{opacity:0}}            /* el "sube desde abajo" lo hace data-enter */
::view-transition-group(nav-dot){animation-duration:var(--spring-layout-dur);animation-timing-function:var(--spring-layout);z-index:101}
::view-transition-group(site-footer){animation:none}
::view-transition-old(site-footer){animation:var(--dur-page-out) var(--ease-exit) both vt-out}
::view-transition-new(site-footer){animation:var(--dur-page-in) var(--ease-out) 80ms both vt-in}
::view-transition-group(site-sheet){animation:none;z-index:90}
::view-transition-old(site-sheet){display:none} ::view-transition-new(site-sheet){animation:none}
::view-transition-old(.page-fade){animation:var(--dur-exit) var(--ease-exit) both vt-fade-out}
::view-transition-new(.page-fade){animation:var(--dur-ui) var(--ease-out) both vt-in}
@media (prefers-reduced-motion:reduce){ ::view-transition-old(.page){animation-name:vt-fade-out}
  ::view-transition-group(nav-dot){animation-duration:0s} }
```

---

## C. Acción → reacción objetivo

Marca **[R]** = hay que reestructurar el componente.

### Navegación y menú

| Acción | Reacción | Primitiva | Tiempo y curva |
|---|---|---|---|
| Clic en un enlace del menú, el pie, el logo o un CTA interno | La página que sale se desvanece y sube 10 px; el menú queda quieto; la nueva entra con fundido y su hero en secuencia; el pie se desvanece y aparece | `PageTransition` + `data-enter` + nombre `site-footer` | 240 ms ease-exit / 320 ms ease-out con 80 ms de retraso; hero 0/70/140/210 ms |
| Cambio de página actual | El punto rojo viaja de un enlace al otro **[R]**: un solo `<span>` en el enlace activo con `view-transition-name:nav-dot` | VT con nombre | `spring-layout` |
| Ir a la portada (sin enlace activo) | El punto se desvanece y encoge | VT exit del nombre | 200 ms |
| Hover en el menú de escritorio | Una pastilla `bg-elevated` se desliza bajo el enlace y se desvanece al salir del `ul` | `SlidingIndicator` (mide) | `spring-ui` / opacidad 160 ms |
| Scroll > 8 px | El menú pasa de transparente a sólido | `animation-timeline:scroll()` con respaldo IO, que pone un atributo en `<header>` sin estado de React | 240 ms |
| Cambio de idioma **[R]** | `<a>` → `<Link transitionTypes={["locale"]}>`: fundido cruzado sin desplazamiento, sin recarga; `html lang` se actualiza | VT `.page-fade` | 200 / 280 ms |
| Abrir el menú móvil | El icono de hamburguesa se convierte en X (dos trazos rotan 45°/−45° y el central se desvanece). La hoja entra con fundido + 16 px desde arriba y los enlaces en escalonado de 40 ms | `data-state` del Trigger + keyframes + `--i` | `spring-ui`; enlaces 280 ms |
| Cerrar el menú (X, Escape) | Sale con fundido y sube 8 px; la X vuelve a hamburguesa | `tailwindcss-animate` `slide-out-to-top-2` | 200 ms ease-exit |
| Navegar desde el menú | La hoja se cierra encima mientras la página cambia debajo **[R]**: `viewTransitionName:"site-sheet"` en `SheetContent` | VT con nombre | 200 ms en paralelo |
| Atrás del navegador | Misma transición que un clic (las clases no dependen del tipo) | VT | igual |

### Botones y enlaces

| Acción | Reacción | Tiempo |
|---|---|---|
| Hover en un botón | Color de fondo y borde | 160 ms `--ease` |
| Presionar / soltar | `scale(.97)` al presionar, regreso con resorte | presión 100 ms ease-out; regreso `spring-micro` |
| Foco con teclado | El contorno pasa de transparente a `fg` y `outline-offset` de 6 a 3 px (base: `outline:2px solid transparent`) | 160 ms |
| Deshabilitar o habilitar | Transición de opacidad (se añade `opacity` a `transition-interactive`) | 200 ms |
| Hover en un enlace con flecha | La flecha se desplaza 2 px (ya existe) y el subrayado crece con `background-size` en vez de `underline` | `spring-micro` |
| Interruptor ida y vuelta | La perilla con `spring-ui` y el color en 160 ms | |

### Carga de página y fotos

| Elemento | Reacción | Primitiva |
|---|---|---|
| Hero de portada, `PageHero`, `PricingHero`, `AboutHero`, cabecera de legales, 404 | Foto (0) → antetítulo y título (1) → texto (2) → botones o cotizador (3) | `data-enter` (CSS, sin JS) |
| Foto con placeholder **[R] `Media`** | Pasa a `placeholder="empty"` + capa propia `absolute inset-0 scale-110 blur-2xl` con `src.blurDataURL`. La foto nítida se funde encima cuando el contenedor recibe `data-loaded` | Script en `<head>`: `addEventListener("load", …, true)` sobre los `img` dentro de `[data-media]` (contenedor con `suppressHydrationWarning`). Fundido 500 ms ease-out |
| Títulos y cambio de fuente | El título espera a las fuentes (máx. 700 ms) en su estado inicial oculto | D |

### Aparición al hacer scroll, por página

Todas con `Reveal` y `RevealGroup`. Un solo momento coreografiado por sección.

| Página | Secciones y variante |
|---|---|
| Portada | Cifras (`figure`: NumberFlow de 0 al valor al revelarse, solo si no estaba en pantalla al hidratar), `#como-funciona` (`RevealGroup` de pasos), `#experiencia` (`media` + `text`), `#niveles` (grupo de tarjetas, sustituye los `delay` manuales), `#rutas` (`item` en grupo), `#empresas` (`media` + `text`), `#testimonios` (grupo), `#preguntas` (título + lista), `#cierre` (`media` + `title`) |
| Servicios | `#tipos-de-servicio`: cada fila con `media` y luego `text` (+60 ms); bandas compartidas igual que en portada |
| Tarifas | `#como-se-calcula`: pasos en grupo y tarjeta de ejemplo `item`; `#que-incluye` (grupo); `#rutas`; `#preguntas`; `#a-la-medida` |
| Nosotros (hoy sin nada) | `#quienes-somos` (título `title` + `RouteLine draw`, que ya existe), `#por-que-tesla` (`media` + rejilla 2×2 en grupo), `#como-te-cuidamos`, `#medio-ambiente`, `#cotiza` |
| Legales (hoy sin nada) | Cada `section` del artículo `text` (sin escalonar, solo la primera vez); índice: ver más abajo |
| Pie | La `RouteLine` ya existente; columnas en `RevealGroup` (40 ms) |

### Acordeón, diálogos y hojas

| Acción | Reacción | Cómo |
|---|---|---|
| Abrir una pregunta | Alto 0 → `--radix-accordion-content-height` + fundido; el + gira 45° | Keyframes `acc-down` (`spring-layout`, 800 ms) + `fade` 280 ms; el giro con `spring-ui` |
| Cerrar una pregunta | Alto → 0 + fundido; Radix espera a `animationend` | `acc-up` (450 ms ease-exit) |
| Cambiar de pregunta | Una se cierra y otra se abre al mismo tiempo (lo de abajo se desliza porque el alto se anima) | igual |
| Índice legal en móvil **[R]** | El `<details>` pasa a `Accordion type="single" collapsible` (consistente y animado en todos los navegadores) | igual |
| `Dialog` | Entrada: fundido + `zoom-in .97` (`spring-ui`). Salida: fundido + `zoom-out .97` + 4 px hacia abajo, 200 ms ease-exit | `tailwindcss-animate` |
| `Sheet` lateral | Entra desde la derecha 32 px; sale a la derecha | igual |
| Hoja de lugares (móvil) | Entra desde abajo 24 px y sale hacia abajo | variante `sheet-bottom` |

### Cotizador del hero

| Acción | Reacción | Primitiva / **[R]** |
|---|---|---|
| Foco en Origen o Destino | La lista aparece con fundido, `translateY(-4px)` y `scale(.98→1)` desde arriba **[R]**: deja de alternar `hidden`; siempre montada con `data-state` y `visibility` con retraso | CSS 180 ms `spring-ui`, salida 140 ms |
| Escribir: las opciones cambian | El alto de la lista se anima; las opciones hacen fundido cruzado rápido sin escalonar | `AutoHeight` + `Swap` de 120 ms |
| Mover con flechas o hover | El resaltado se desliza entre opciones | `SlidingIndicator` (`--y`), `spring-micro` |
| Mensajes "Buscando…" o "Sin resultados" | El alto y el texto cambian con animación (sin `empty:hidden`) | `Collapse` |
| Elegir | La lista se cierra con fundido; el valor del campo entra con fundido y 4 px | 140 ms + `Swap inline` |
| Enviar con campos vacíos | `#quote-widget-error` (con `role="alert"`, siempre montado) se despliega; el campo con error late una vez (borde) | `Collapse` dentro del `<p>` |
| Enviar con todo completo | Morph del panel hacia `/tarifas` solo con el tipo `quote-panel` **[R]**: `share={{"quote-panel":"morph",default:"none"}}`. En cualquier otra navegación portada ↔ tarifas, el panel sigue la transición de página | VT `.morph` con `spring-page` |
| En móvil, tocar un campo | Hoja inferior | `Sheet` `sheet-bottom` |

### Cotizador de `/tarifas`

| Acción | Reacción | **[R]** |
|---|---|---|
| Invertir origen y destino | Los dos valores intercambian posición: Origen entra desde +58 px y Destino desde −58 px, con fundido; el icono gira 180° | WAAPI en el handler con `SPRING_CSS.ui` |
| Activar ida y vuelta | Los campos de regreso se despliegan; lo de abajo baja con el alto | `Collapse` |
| Desactivar ida y vuelta | Los campos se pliegan | `Collapse` |
| Aparece o desaparece el campo de vuelo (origen aeropuerto) | Se despliega o se pliega | `Collapse` |
| Errores por campo (`ErrorText`) | Despliegue + fundido (hoy se montan de golpe) | `Collapse` siempre montado, con `id` estable |
| Pasajeros o maletas ± | El número rueda; los botones de los límites se atenúan con transición | NumberFlow en `Stepper` |
| Elegir nivel | La pastilla se desliza a la opción elegida; "Elegido" está montado en las 3 opciones y solo cambia opacidad + 4 px **[R]** | `SlidingIndicator` (columnas iguales) |
| Tarjeta: vacío → cargando → precio | `Segmented` se mantiene montado; en cada opción, "Desde $X" → barra → `Price` con fundido cruzado; el desglose pasa de esqueleto a filas | `Swap inline` + `AutoHeight` |
| Precio → precio (cambia hora o pasajeros) | Las cifras ruedan (precio en `Segmented`, total, montos del desglose **[R]**: `formatMXN` → NumberFlow); las filas que entran o salen se despliegan o pliegan | NumberFlow + `AnimatePresence` de filas (`Collapse`) |
| Precio → especial / error y viceversa | Fundido cruzado del bloque con el alto animado | `Swap` + `AutoHeight` |
| Cambia el título de la ruta | Fundido de etiquetas; `RouteLine` sin `key` (no se vuelve a montar) **[R]**; el punto destino late una vez | `Swap inline` |
| Distancia y duración, atribución | Fundido cruzado | `Swap inline` |
| Avisos | Entran y salen con despliegue | `Collapse` por `li` |
| Botón de WhatsApp **[R]** | Un único `<a>`: sin `href` y con `aria-disabled` cuando no hay precio. La opacidad baja a .4 con 300 ms de retraso (las actualizaciones rápidas no parpadean) y vuelve sin retraso. Nada de alternar `<button>`/`<a>` | CSS |
| Barra fija móvil | Entra desde abajo y **sale** hacia abajo (hoy se desmonta de golpe) | `Presence preset="drop"` |
| Reintentar tras un error | El icono gira una vez; el panel de error se funde al esqueleto | CSS + `Swap` |

### Legales, pie y 404

| Acción | Reacción |
|---|---|
| Scroll en el índice de escritorio | Un solo punto rojo se desliza por el trazo (`--y` = `offsetTop` del activo, `spring-ui`) **[R]**: hoy es un punto por enlace |
| Clic en el índice | Scroll suave (se conserva) y el punto se desliza |
| Pie | Hover de color en 160 ms; `RouteLine` se dibuja; columnas reveladas |
| 404 (`not-found.tsx` y `global-not-found.tsx`) | `BrokenRoute` → título → texto → botón con `data-enter`. Volver al inicio desde `global-not-found` es carga completa (otro layout raíz): solo verá la entrada CSS |

---

## D. Anti-flash de hidratación (las páginas siguen siendo estáticas)

Patrón base: la guía "Preventing flash before hydration" de Next (`docs/01-app/02-guides/preventing-flash-before-hydration.md`). Script en línea que corre antes de la primera pintura + `suppressHydrationWarning` en el elemento que modifica. React 19 en desarrollo avisa de atributos extra **salvo** que el elemento lleve `suppressHydrationWarning` (`react-dom-client.development.js` l. 23078–23727).

1. **`<html>`:** añadir `suppressHydrationWarning` y `data-scroll-behavior="smooth"`. En `<head>`, un script único en `lib/motion/boot.ts` como texto:
   - Observadores de `[data-reveal]` y `[data-reveal-group]`.
   - Escucha de carga de imágenes para `[data-media]`.
   - `document.fonts.ready.then(() => html.dataset.fonts = "")` + `setTimeout(…, 700)`.
   - `data-quote-restore` si existe `sessionStorage["unify.quote.v1"]` o la URL trae `o`/`d`.
   - Si un cambio de idioma vuelve a montar `<html>` y borra estos atributos, no se rompe nada: las fuentes ya cargaron, `quote-restore` ya se consumió y los observadores viven en `document`.
2. **`useToday` / fecha:** `DateCell` recibe `fill="today|tomorrow"`. Siguiendo el patrón `LocalDate` + `InlineScript` de la guía, un script tras la celda escribe el texto formateado (`Intl.DateTimeFormat(lang, {timeZone:"America/Mexico_City", weekday:"short", day:"numeric", month:"short"})`, idéntico a `formatShortDate`), además de `input.value` y `min`. El `span` y el `input` llevan `suppressHydrationWarning`. Al hidratarse con el valor del cliente, React escribe el mismo texto: cero cambio visible. **Prueba unitaria obligatoria:** que el formateador del script y `formatShortDate` den la misma salida.
3. **`useQuoteDraft` y parámetros de URL:**
   - Con `html[data-quote-restore]`, los valores dependientes del borrador (`[data-draft-value]`: inputs de lugar, `Stepper`, nivel, interruptor) se pintan con `opacity:0`.
   - La isla, en `useLayoutEffect` y ya con el snapshot del cliente, aplica `parseQuoteParams` (de `useEffect` pasa a `useLayoutEffect`) y quita el atributo. Los valores aparecen con un fundido de 240 ms en vez de saltar.
   - Si no hay borrador, el atributo no existe y no hay ninguna espera.
4. **`useSmallScreen`** **[R]:** se elimina la bifurcación del render. Siempre se pinta el mismo `<input role="combobox">`. En `onPointerDown` táctil o `onFocus`, si `matchMedia("(max-width: 767px)").matches`, se hace `preventDefault`, se abre la hoja y se llama a `blur()`. La `Sheet` queda montada pero cerrada (Radix no pinta su contenido). Sin cambio de DOM al hidratar.
5. **`HeaderFrame`:** el fondo pasa a CSS con `@supports (animation-timeline: scroll())` (keyframe de 0 a 8 px de scroll). Como respaldo, el IO actual pero escribiendo `data-scrolled` directamente en el `<header>`, sin `useState`. Si la página se recarga a media altura, en Firefox o Safari antiguos el fondo se *funde* al hidratar (240 ms), sin salto.
6. **Fuentes:** sin cambios en `fonts.ts` (`swap` + `preload` por defecto + fallback ajustado). El título del hero espera `data-fonts` en su estado inicial oculto (máximo 700 ms), así el reacomodo por `font-stretch` nunca se ve. En el resto del texto, Satoshi con fallback ajustado.

---

## E. `scripts/motion-audit.mjs`

**Arquitectura:**
- Extraer de `shot.mjs` un motor común en `scripts/lib/cdp.mjs`: lanzar Chrome, `send`, `evaluate` y las operaciones `viewport`, `media`, `goto`, `wait`, `scroll`, `click`, `type`, `key`, `eval`, `clear`. `shot.mjs` queda como CLI con el mismo comportamiento.
- Nuevas operaciones: `hover`, `press {ms}`, `storage {key,value}`, `intercept {pattern, mode:"fail"|"429"|"delay", ms?}` (con `Fetch.enable`), `throttle` (`Network.emulateNetworkConditions`), `nocache`.
- Importante: el `click` de la acción **no** hace el `scrollIntoView` + 700 ms dentro de la ventana grabada; el scroll va a `setup`.

### Formato del JSON

```json
{ "base": "http://localhost:3100",
  "viewports": { "d": {"width":1440,"height":900}, "m": {"width":390,"height":844,"mobile":true,"dpr":2} },
  "defaults": { "maxMs": 1600, "settleMs": 350, "mask": [".animate-spin", ".animate-pulse"] },
  "scenarios": [
    { "id": "T6-nivel", "vp": ["d","m"], "reduced": "both",
      "setup":  [{"op":"goto","url":"/tarifas"}, {"op":"storage","key":"unify.quote.v1","value":{…}}, {"op":"goto","url":"/tarifas"}, {"op":"scroll","selector":"#cotizar"}],
      "action": [{"op":"click","selector":"#cotizar label:has(input[name=\"quote-level\"][value=\"select\"])"}],
      "roi": "article[aria-labelledby=\"quote-result-title\"]",
      "track": ["fieldset:has(input[name=\"quote-level\"]) [data-indicator]"],
      "expect": { "animated": true, "minMs": 150, "maxMs": 900 },
      "post": [{"op":"eval","expr":"document.querySelector('[aria-labelledby=quote-result-title]').getAttribute('aria-busy')","equals":"false"}] } ] }
```

### Grabación por escenario

1. `Page.addScriptToEvaluateOnNewDocument`: inyecta el muestreador `__ma` y el estilo `*{caret-color:transparent!important}`.
2. `setup`, `__ma.start(track, roi)` y `Page.startScreencast {format:"jpeg", quality:80, maxWidth: ancho del viewport, everyNthFrame:1}`. Cada cuadro se confirma con ack inmediato y se guarda junto con `metadata.timestamp`.
3. `action` (t₀) y grabación hasta `settleMs` sin cambios o `maxMs`.
4. `__ma.stop()`. Se toman `document.getAnimations()` a +50 y +250 ms (`{type, target, property, duration, easing}`) y los eventos `Animation.animationStarted` (dominio `Animation` activo).
5. Solo si `reduced` vale `"both"`: se repite con movimiento reducido.

**Muestreador dentro de la página** (base fiable, no depende de los fps):
- Bucle rAF que registra por cada selector de `track`: rect, opacidad, transform y `visibility`.
- `MutationObserver` (`childList`, `subtree`, atributos `class`, `style`, `hidden`, `disabled`, `data-state`, `aria-expanded`).
- `PerformanceObserver("layout-shift")` con sus fuentes.

### Detección

**Píxeles:** cada cuadro en escala de grises a 192 px de ancho (móvil: 128). Se recorta al ROI y las máscaras se rellenan de negro con los rects muestreados.

- `d_t` = |Δ| medio / 255.
- `c_t` = fracción de píxeles con |Δ| > 10.
- `Y_t` = luminancia media.

| Veredicto | Regla | Para evitar falsos positivos |
|---|---|---|
| SIN CAMBIO | `d(f₀, f_fin) < 0.002` y `max c_t < 0.003`. Si `expect.animated`, es **SIN REACCIÓN** | cursor de texto oculto; máscaras |
| Duración | Del primer al último cuadro con `c_t > 0.001` | — |
| **CORTE** (píxeles) | `max d_t / Σd_t ≥ 0.6` **y** `c_t` de ese cuadro ≥ 0.005 (≥ 0.5 % del ROI) | Cambios pequeños legítimos (un carácter tecleado, un spinner) no llegan al 0.5 %. Con cadencia baja (mediana del intervalo > 34 ms) el veredicto baja a "posible" y manda el DOM |
| **CORTE** (DOM) | Una mutación inserta, quita o muestra un elemento visible (área ≥ 0.2 % del ROI, opacidad > 0) y en los 2 cuadros siguientes ni él ni sus ancestros hasta el ROI tienen animación en `getAnimations()` ni `style` cambiando en ≥ 3 cuadros seguidos (motion por rAF). El informe da el selector culpable | Excluidos: `.sr-only` (área de 1 px), regiones `aria-live` invisibles, texto de inputs |
| **BRINCO** | Un rect seguido se mueve > 8 px en un solo cuadro sin animación, o un `layout-shift` > 0.01 en un solo cuadro | Las transformaciones no generan `layout-shift` |
| **FLASHAZO** | `\|Y_t − Y_{t−1}\| > 0.06` y para algún k ≤ 4, `\|Y_{t+k} − Y_{t−1}\| < 0.015`; **o** patrón A→B→A: `d(f_{t−1}, f_t) > 0.01` y `d(f_{t−1}, f_{t+k}) < 0.3·d(f_{t−1}, f_t)` con k ≤ 4; **o** un cuadro con `Y > 0.6` cuando la base está por debajo de 0.2 | Se ignoran ROI con animaciones en bucle enmascaradas |
| Movimiento reducido | En la pasada `reduce`: ningún transform en `getAnimations()` ni en el muestreo (solo opacidad); cero CORTE en lo que debe hacer fundido | — |

### Salida

`.shots/motion/<fecha>/`:
- `report.md`: tabla con escenario, vp, rm, cuadros, fps, duración, salto máx. %, cortes píxel/DOM, brincos, flash, animaciones (n y tipos), veredicto.
- `report.json`.
- `<id>-<vp>[-rm].jpg`: tira de cuadros hecha con `sharp` (8 por fila, 240 px cada uno, rótulo SVG con `t` y una barra de `d_t`, el peor cuadro con borde rojo).

Código de salida 1 si hay algún CORTE, FLASHAZO o SIN REACCIÓN.

**CLI:** `node scripts/motion-audit.mjs scripts/motion/escenarios.json [--only T] [--vp m] [--rm]`.

### Escenarios iniciales (66)

Selectores sacados del código y de los diccionarios en español. D = escritorio, M = móvil.

| # | id | vp | Preparación → acción |
|---|---|---|---|
| 1 | N1 inicio→servicios | D | `/` → click `header nav a[href="/servicios"]`; track `header nav a[aria-current="page"]` |
| 2 | N2 servicios→tarifas | D | click `header nav a[href="/tarifas"]` |
| 3 | N3 tarifas→nosotros | D | click `header nav a[href="/nosotros"]` |
| 4 | N4 logo→inicio | D | `/nosotros` → click `header a[href="/"]` |
| 5 | N5 CTA Cotizar | D | `/` → click `header a[href="/tarifas#cotizar"]` |
| 6 | N6 pie→términos | D | scroll `footer` → click `footer a[href="/terminos"]` |
| 7 | N7 atrás | D | tras N2: eval `history.back()` |
| 8 | N8 idioma ES→EN | D | `/tarifas`, eval `window.__boot=1` → click `header a[hreflang="en"]`; post `[document.documentElement.lang, window.__boot]` debe dar `["en",1]` |
| 9 | N9 idioma desde el menú | M | `/en/tarifas`, abrir menú → click `[role="dialog"] a[hreflang="es"]` |
| 10 | N10 hover del menú | D | hover `header nav a[href="/servicios"]` y luego `a[href="/nosotros"]` |
| 11 | N11 menú sólido | D | scroll y=0→160 |
| 12 | N12 abrir menú | M | click `header button[aria-label="Abrir menú"]` |
| 13 | N13 cerrar menú | M | click `[role="dialog"] button[aria-label="Cerrar menú"]` |
| 14 | N14 Escape | M | key Escape con el menú abierto |
| 15 | N15 navegar desde el menú | M | click `[role="dialog"] a[href="/tarifas"]` |
| 16 | B1 presión | D | press 150 ms en `form[aria-label] button[type="submit"]` (portada) |
| 17 | B2 foco | D | key Tab ×2 |
| 18 | B3 enlace con flecha | D | hover `section[aria-labelledby="preguntas"] a[href="/terminos"]` |
| 19 | B4 interruptor | D | `/tarifas` → click `#cotizar label:has(input[role="switch"])` |
| 20–21 | L1/L2 carga de portada | D, M | `nocache`, goto `/` grabando desde la navegación; ROI viewport |
| 22 | L3 carga de servicios | D | goto `/servicios` |
| 23 | L4 carga de nosotros | M | goto `/nosotros` |
| 24 | L5 carga de tarifas | D | goto `/tarifas`; track `#cotizar input[type="date"]` (sin flash de fecha) |
| 25 | L6 tarifas con borrador | D | `storage` borrador Polanco→AICM T1 → goto `/tarifas` |
| 26 | L7 tarifas con URL | M | goto `/tarifas?o=cat:polanco&d=cat:aicm-t1&n=select&p=2` |
| 27 | L8 foto lenta | D | `throttle` (400 ms, 1.5 Mb/s) → goto `/servicios`; ROI `[data-media]` |
| 28 | L9 404 | D | goto `/no-existe` |
| 29 | L10 404 en inglés | M | goto `/en/no-existe` |
| 30 | S1 niveles | D | scroll `#niveles` |
| 31 | S2 rutas | D | scroll `#rutas` |
| 32 | S3 testimonios | M | scroll `#testimonios` |
| 33 | S4 cifras | D | scroll `main section:nth-of-type(2)` |
| 34 | S5 tipos de servicio | D | `/servicios`, scroll `#tipos-de-servicio` |
| 35 | S6 fórmula | D | `/tarifas`, scroll `#como-se-calcula` |
| 36 | S7 qué incluye | M | scroll `#que-incluye` |
| 37 | S8 quiénes somos | D | `/nosotros`, scroll `#quienes-somos` |
| 38 | S9 por qué Tesla | M | scroll `#por-que-tesla` |
| 39 | S10 índice legal | D | `/privacidad`, scroll `article section:nth-of-type(3)`; track `nav a[aria-current="location"]` |
| 40 | A1 abrir FAQ | D | click `section[aria-labelledby="preguntas"] h3 button` (primero) |
| 41 | A2 cambiar de FAQ | D | con la 1 abierta → click `… h3 button` (2.º) |
| 42 | A3 cerrar FAQ | M | click en la abierta |
| 43 | A4 índice legal móvil | M | `/privacidad` → click `details > summary` (luego el disparador del acordeón) |
| 44 | Q1 lista abre | D | `/` → click `form input[role="combobox"]` |
| 45 | Q2 escribir | D | type "pol"; ROI `[role="listbox"]` |
| 46 | Q3 elegir con teclado | D | key ArrowDown, Enter |
| 47 | Q4 validación | D | sin datos → click `form button[type="submit"]`; ROI `#quote-widget-error` |
| 48 | Q5 morph | D | borrador completo → click submit; track `form[aria-label]` |
| 49 | Q6 hoja móvil | M | click el primer `form input` del hero |
| 50 | Q7 elegir en la hoja | M | click `[role="dialog"] [role="option"]` |
| 51 | T1 invertir | D | borrador → click `button[aria-label="Invertir origen y destino"]` |
| 52 | T2 ida y vuelta on | D | click `#cotizar label:has(input[role="switch"])` |
| 53 | T3 ida y vuelta off | D | otra vez |
| 54 | T4 pasajero + | D | click `button[aria-label="Agregar un pasajero"]` |
| 55 | T5 maleta − | M | click `button[aria-label="Quitar una maleta"]` |
| 56 | T6 nivel Select | D, M | click `#cotizar label:has(input[name="quote-level"][value="select"])` |
| 57 | T7 vacío→precio | D | borrador solo con origen → click 2.º `#cotizar input[role="combobox"]` → click `[role="option"]` |
| 58 | T8 cambio de hora | D | eval `s=document.querySelector('#cotizar select');s.value='12:00';s.dispatchEvent(new Event('change',{bubbles:true}))` |
| 59 | T9 especial | D | `storage` con destino Guadalajara (20.67, −103.35) → reload |
| 60 | T10 error de red y reintento | D | `intercept fail */api/estimate*` → click en `+` pasajero; luego quitar intercept y click `article button:has(.lucide-rotate-cw)` |
| 61 | T11 campo de vuelo | D | elegir origen "AICM" → aparece `#cotizar input[maxlength="10"]` |
| 62 | T12 error de fecha | D | ida y vuelta + eval: fecha de regreso anterior a la ida → `[id^="quote-err-"]` |
| 63 | T13 barra móvil | M | con precio, scroll hasta ocultar el CTA → entra; scroll de regreso → sale |
| 64 | T14 WhatsApp sin parpadeo | D | con precio → `+` pasajero; track `article a[href^="https://wa.me"], article [aria-disabled]` |
| 65 | T15 reducido | D | N1 + T6 + A1 con `reduced: "only"` |
| 66 | E1 404 → inicio | D | `/x` → click `a[href="/"]` (carga completa esperada) |

---

## F. Orden de implementación

### Lote 1: infraestructura, primitivas, UI base, menú, transición de página y herramienta

- **Tokens y estilos:** `src/styles/tokens.css`, `tailwind.config.ts`, `src/styles/globals.css` (VT, `reveal`, `data-enter`, keyframes del acordeón, foco animado).
- **Constantes de movimiento:** `src/lib/motion/index.ts`. Nuevo `src/lib/motion/boot.ts` (texto del script en línea). `features.ts` sin cambios.
- **Primitivas en `src/components/motion/`:**
  - `reveal.tsx` reescrito como Server Component (se elimina `Stagger`/`StaggerItem` → `RevealGroup`).
  - Nuevos: `collapse.tsx`, `auto-height.tsx`, `swap.tsx`, `presence.tsx`, `inline-script.tsx`.
  - Se modifican: `page-transition.tsx` (`div` + tipos), `providers.tsx`, `index.ts`.
- **Layout:** `src/app/[lang]/layout.tsx`: `<head>` con el script, `suppressHydrationWarning`, `data-scroll-behavior` y `<noscript>`.
- **UI base:** `ui/accordion.tsx`, `ui/dialog.tsx`, `ui/button.tsx`, `ui/segmented.tsx`, `ui/stepper.tsx`, `ui/media.tsx`, `ui/icons.tsx` (icono de menú que se transforma).
- **Menú, pie e idioma:** `site/main-nav.tsx`, `site/mobile-menu.tsx`, `site/header-frame.tsx`, `site/site-footer.tsx`, `i18n/locale-switch.tsx`.
- **Morph del cotizador:** `quote/index.tsx` y el `ViewTransition` de `quote-calculator-client.tsx` (solo el `share` por tipo).
- **Herramienta:** `scripts/lib/cdp.mjs`, `scripts/shot.mjs` (adelgazado), `scripts/motion-audit.mjs`, `scripts/motion/escenarios.json`.
- **Guía:** `design/SISTEMA.md` (nuevas reglas de movimiento).
- **Al cerrar el lote:** auditoría completa como línea base. Se esperan fallos en Q* y T*.

### Lote 2: cotizador

- `quote/place-field.tsx`: lista siempre montada, una sola rama de input, hoja inferior.
- `quote/quote-widget-form.tsx`: error con `Collapse`.
- `quote/quote-calculator-client.tsx`: invertir con WAAPI, `Collapse` en regreso, vuelo y errores, `useLayoutEffect` para la URL.
- `quote/quote-result.tsx`: `Swap` + `AutoHeight`, botón de WhatsApp único, filas y avisos con presencia, barra con `Presence`, `RouteLine` sin `key`.
- `quote/when-fields.tsx` (relleno por script) y `quote/hooks.ts` (se elimina `useSmallScreen` o queda para eventos).
- `lib/quote/store.ts` (quitar `data-quote-restore`), `ui/price.tsx` (tiempos con tokens), `ui/route-line.tsx`.
- **Pruebas:** vitest de paridad entre el script de fecha y `formatShortDate`.

### Lote 3: secciones y páginas

- Heroes: `sections/home/hero.tsx`, `ui/page-hero.tsx`, `sections/pricing/pricing-hero.tsx`, `sections/about/about.tsx`.
- Legales: `sections/legal/legal-document.tsx` (`<details>` → `Accordion`, `data-enter`, `Reveal`) y `legal-toc.tsx` (punto deslizante).
- Secciones compartidas: `sections/shared/*.tsx` (`service-levels`, `popular-routes`, `testimonials`, `how-it-works`, `stats-band` + `ui/stat.tsx`, `corporate-band`, `final-cta`, `faq`).
- Tarifas y servicios: `sections/pricing/{formula,includes,custom-quote}.tsx`, `sections/services/service-types.tsx`, `sections/home/experience.tsx`.
- 404: `app/[lang]/not-found.tsx`, `app/global-not-found.tsx`. Además, `app/[lang]/dev/ui/page.tsx` (vitrina).

### Riesgos

| Riesgo | Mitigación |
|---|---|
| Rendimiento de la VT: una instantánea por sección y páginas muy altas | `PageTransition` con un solo `div`; nombres solo en menú, pie, punto, hoja y panel; transición ≤ 600 ms, porque los elementos con nombre no reciben clics mientras dura |
| Animar `height` provoca reflujo | Solo en contenedores pequeños (acordeón, campos, tarjeta); nunca en listas largas; transform y opacidad en todo lo demás |
| Bundle | Se queda en `domAnimation` (sin los +13.5 KB gzip de `domMax`). NumberFlow ya existe. Los observadores son unos 1.5 KB de script en línea |
| Accesibilidad | Contenido que sale con `inert`; regiones vivas sin cambios; foco animado visible; con movimiento reducido solo fundidos (motion y CSS); en `Collapse` el alto es instantáneo con movimiento reducido (documentado) |
| Safari | VT desde 18.0; clases desde 18.2: en versiones anteriores la navegación es normal y sin animación. `linear()` desde 17.2, con respaldo. Probar en un iPhone real: gesto de atrás + VT (posible doble animación), menú fijo dentro de VT y `animation-timeline` (solo Safari 26+) |
| Cambio de idioma | Si se confirma que vuelve a montar el layout: el estado del menú se reinicia (aceptable). Si N8 muestra que `lang` no cambia, se vuelve a `<a>` y se añade una entrada CSS de página |
| Hoja del menú + navegación | El nombre `site-sheet` es una propuesta sin probar. Lo valida N15 |
| Cadencia del screencast en headless | Sin verificar. El muestreador DOM es la referencia y el informe marca la cadencia baja |

### Lo que no pude verificar

- Cadencia real del screencast en `--headless=new`.
- Si `beginFrame` funciona en headless nuevo.
- Las versiones de soporte de `transition-behavior: allow-discrete`.
- En ejecución: que `html lang` se actualice y que el layout se vuelva a montar al cambiar de idioma (en código, todo apunta a que sí).
- Que `exit: {height: 0}` esté documentado explícitamente en motion.dev.

Todo eso lo cubren los escenarios N8, N15 y el control de cadencia de la herramienta.

### Archivos clave
- /Users/leonardorodriguez/Desktop/Unify/src/components/motion/reveal.tsx
- /Users/leonardorodriguez/Desktop/Unify/src/styles/globals.css
- /Users/leonardorodriguez/Desktop/Unify/src/app/[lang]/layout.tsx
- /Users/leonardorodriguez/Desktop/Unify/src/components/quote/quote-result.tsx
- /Users/leonardorodriguez/Desktop/Unify/scripts/shot.mjs
