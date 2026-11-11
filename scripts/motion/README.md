# Auditoría de movimiento (`scripts/motion-audit.mjs`)

Mide cuadro por cuadro si una interacción del sitio tiene **cortes** (algo aparece, desaparece o cambia de golpe), **brincos** (el layout salta) o **flashazos** (destellos), en vez de juzgarlo a ojo. Diseño completo: `design/MOVIMIENTO.md` §E.

## Cómo correrla

Con `pnpm dev --port 3100` corriendo:

```sh
node scripts/motion-audit.mjs --selftest --repeat 3                 # autoprueba con páginas sintéticas (no usa el sitio)
node scripts/motion-audit.mjs scripts/motion/escenarios.json        # todos los escenarios
node scripts/motion-audit.mjs scripts/motion/escenarios.json --only N1,T6 --vp d
node scripts/motion-audit.mjs scripts/motion/escenarios.json --rm   # agrega la pasada con movimiento reducido a todos
node scripts/motion-audit.mjs scripts/motion/escenarios.json --check  # solo verifica que los selectores existan
```

- `--only` acepta prefijos separados por coma (`N`, `T6`, `Q5-morph`).
- `--out <carpeta>` cambia la salida (por defecto `.shots/motion/<fecha_hora>/`).
- Cada corrida lanza un Chrome sin cabeza nuevo (perfil temporal, puerto libre): no choca con `shot.mjs`.
- Código de salida: **1** si algo da `CORTE`, `FLASHAZO`, `SIN REACCIÓN`, `RM-MOVIMIENTO` o `POST FALLÓ`; **2** si nada de eso pero algún escenario no se pudo medir (`ERROR`); **0** si todo pasó. Un `ERROR` nunca cuenta como aprobado.

**Antes de aceptar trabajo de animación, corre primero la autoprueba.** Si no pasa, la herramienta no es de fiar en esa máquina.

## Cómo leer el informe

`report.md` trae el resumen, una tabla por corrida y el detalle de cada problema. `report.json` trae lo mismo y además la serie por cuadro (`series`: `t` ms desde la acción, `d` diferencia media, `c` fracción de píxeles que cambió, `Y` luminancia) y las animaciones vistas.

| veredicto | qué significa |
|---|---|
| `OK` | Hubo cambio y todo fue animado. |
| `CORTE` | Un cambio visible ocurrió en un solo cuadro. Por píxeles (`global`: el peor cuadro concentra ≥ 60 % de todo el cambio del ROI y toca ≥ 0.5 % del ROI; `bloque`: en una zona de ~90 px el cambio se concentra en un cuadro, aunque en otra parte haya un fundido largo) o por DOM (un elemento se insertó, se quitó, se mostró, se ocultó o cambió su texto sin animación en él ni en sus ancestros, confirmado con los píxeles de su rect). La columna *culpable* da el selector. |
| `CORTE?` | Solo los píxeles ven un corte y la cadencia fue baja (mediana > 34 ms): revisar la tira. |
| `BRINCO` | `layout-shift` > 0.01 en un cuadro, o un selector de `track` saltó > 8 px en un cuadro sin animación. |
| `FLASHAZO` | Luminancia que sube/baja > 0.06 y regresa en ≤ 4 cuadros (≤ 150 ms), patrón A→B→A, o un cuadro claro (Y > 0.6) sobre una página oscura. |
| `SIN REACCIÓN` | Se esperaba animación (`expect.animated`) y no cambió nada en el ROI. |
| `SIN CAMBIO` | No cambió nada y tampoco se esperaba. |
| `RM-MOVIMIENTO` | Pasada con `prefers-reduced-motion: reduce`: hubo transform/desplazamiento/alto animado (solo se permite opacidad). |
| `POST FALLÓ` | Una comprobación `post` no dio lo esperado (p. ej. N8: el cambio de idioma recargó la página). |
| `ERROR` | No se pudo medir (selector inexistente, página caída…). |

Columnas: *cuadros* (del screencast después de la acción), *fps* (por la mediana del intervalo entre cuadros activos), *inicio ms* (primer cuadro con cambio), *duración ms* (del primer al último cuadro con cambio), *salto máx %* (mayor fracción del ROI que cambió en un solo cuadro).

La tira `<id>-<vp>[-rm].jpg` muestra hasta 32 cuadros (8 por fila) con su tiempo y una barra de `d_t`; el cuadro del corte va con borde **rojo** y el de mayor cambio, si no es corte, con borde **naranja**. `sc` marca cuadros de scroll (no cuentan para cortes).

Notas que aparecen en el detalle:
- `parcial`: el elemento apareció con opacidad 1 pero solo sus descendientes animan (p. ej. un contenedor de escalonado); decide el píxel.
- `DOM sin efecto visible (descartado)`: el DOM cambió pero los píxeles de su rect no (contenedor vacío, algo tapado).
- `posible recarga del servidor de desarrollo`: hubo una navegación completa inesperada o Fast Refresh durante la grabación; la corrida se repite una vez sola y, si vuelve a pasar, se marca.

## Cómo agregar un escenario

En `escenarios.json`, dentro de `scenarios`:

```json
{ "id": "X1-mi-caso", "vp": ["d", "m"], "reduced": "no|both|only",
  "setup":  [{"op":"goto","url":"/tarifas"}, {"op":"storage","area":"session","key":"unify.quote.v1","value":{…}}, {"op":"goto","url":"/tarifas"}],
  "action": [{"op":"click","selector":"button[aria-label=\"Agregar un pasajero\"]"}],
  "roi": "article[aria-labelledby=\"quote-result-title\"]",
  "track": ["fieldset:has(input[name=\"quote-level\"]) [data-indicator]"],
  "mask": [".mi-spinner"],
  "expect": { "animated": true, "minMs": 150, "maxMs": 900, "load": false },
  "settleMs": 350, "maxMs": 1600,
  "post": [{"op":"eval","expr":"…","equals":"false"}] }
```

- **Selectores semánticos**: roles, `aria-label`, `aria-labelledby`, ids de sección, `href`. Nada de clases de Tailwind ni ids generados por React (`_R_…`, `radix-…`). Verifica con `--check`.
- `setup` deja la página lista y **todo lo que desplaza va aquí**; si el primer objetivo de la acción está fuera de pantalla, la herramienta lo centra antes de grabar. Dentro de `action`, `click`/`hover`/`press` no desplazan ni esperan.
- `roi`: zona donde se miden los píxeles (por defecto, el viewport). Los cortes por bloques y por DOM se buscan en todo el viewport de todos modos.
- `expect.load: true` para escenarios con navegación completa: se ignora el cuadro en que el documento nuevo reemplaza al anterior (y lo que pasa antes de su first-contentful-paint), pero sigue contando todo lo que salte después y cualquier destello.
- `maxMs` es cuánto se graba como máximo después de la acción; la grabación termina antes si pasan `settleMs` sin cuadros nuevos ni actividad del muestreador.

Operaciones (`scripts/lib/cdp.mjs`): `viewport`, `media {reducedMotion}`, `goto {url, wait?}`, `reload`, `wait {ms}`, `waitFor {selector}`, `scroll {y|by|selector, block?, smooth?}`, `sweep`, `click {selector|text, nth?}`, `hover`, `unhover`, `press {selector, ms}`, `type {text, delay?}`, `key {key, times?}`, `clear {selector}`, `focus {selector}`, `eval {expr, equals?}`, `storage {key, value, area: "local"|"session"} | {clear:true}`, `intercept {pattern, mode:"fail"|"429"|"delay", ms?} | {off:true}`, `throttle {latency, down, up} | {off:true}`, `nocache`.

El borrador del cotizador vive en **sessionStorage** (`unify.quote.v1`), no en localStorage: usa `"area": "session"`.

## Cómo funciona (y cambios respecto al diseño)

1. Chrome `--headless=new` **con `--disable-gpu`**: con GPU el screencast se atora (pausas de ~430 ms en una animación de 1 s); sin GPU entrega cuadros cada 16.7 ms estables.
2. Screencast JPEG (calidad 80) con ack inmediato y `metadata.timestamp`; el cuadro base es el último anterior a la acción. El screencast solo manda cuadros cuando algo cambia.
3. Muestreador dentro de la página (`scripts/lib/sampler.mjs`) por `requestAnimationFrame`: mutaciones, `getAnimations()`, `layout-shift`, rects seguidos. Envía todo por un binding de CDP, así que sobrevive a navegaciones completas (se reinyecta y arranca solo en el documento nuevo).
4. Análisis (`scripts/lib/analyze.mjs`): grises a 192 px de ancho (móvil 128), máscaras en negro, reglas de §E más:
   - **regla por bloques** (no estaba en el diseño): la regla global `max d / Σd ≥ 0.6` no ve un corte pequeño si a la vez corre un fundido largo en otra zona;
   - **confirmación con píxeles** de cada corte DOM, para descartar inserciones que no pintan nada;
   - los cuadros con scroll se excluyen (el desplazamiento no es un corte), y la cadencia baja degrada a `CORTE?`.
5. Se evaluó la alternativa de **tiempo virtual** (`Emulation.setVirtualTimePolicy` avanzando de 16 ms + `captureScreenshot`): funciona (transform exacto cada paso, ~68 ms reales por cuadro), pero congela temporizadores, red y el WebSocket del servidor de desarrollo y falsea `performance.now()`. Con el screencast a 60 fps reales no hace falta; no se implementó.
6. Lo que no es fiable está en el informe final de la herramienta y en «Limitaciones» abajo.

## Limitaciones

- Una animación en un **ancestro** cuenta como animación del elemento: si un panel aparece de golpe dentro de un contenedor que está haciendo fundido, el DOM no lo marca (los píxeles sí, si el cambio se concentra en un cuadro).
- Los cambios de **color/sombra/transform** sin mutación del DOM (hover, `:focus`) solo se ven por píxeles: si afectan menos de ~0.4 % del viewport (o del ROI con la regla global), pasan como `SIN CAMBIO`/`OK`. Para esos casos usa un `roi` ajustado al elemento.
- Una transición **muy rápida** (≤ 50 ms) o con curva que concentra ≥ 60 % del cambio en el primer cuadro se marca `CORTE` aunque técnicamente sea una transición: a 60 fps eso se percibe como corte.
- Las **animaciones infinitas** (spinners, pulsos) no cuentan como animación; enmascáralas con `mask` si están dentro del ROI o la grabación no se asienta.
- Contenido dentro de **shadow DOM** (p. ej. NumberFlow) no genera mutaciones observables: sus cambios solo se ven por píxeles.
- En escenarios de **carga** se ignora el cuadro del cambio de documento; un sitio que pinta primero un esqueleto y luego cambia de golpe sí se marca.
- El screencast puede saltarse cuadros si Chrome está muy cargado: revisa la columna fps (si baja de 30, los cortes por píxeles quedan como `CORTE?`).
