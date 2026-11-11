// Constantes de movimiento para JS (motion). Espejo de los tokens CSS de src/styles/tokens.css.

/** Curva de entrada: cubic-bezier(0.22, 1, 0.36, 1). */
export const EASE_OUT = [0.22, 1, 0.36, 1] as const;

/** Duraciones en segundos (motion) — fast 150 · base 250 · slow 450 · slower 800 ms. */
export const DURATION = { fast: 0.15, base: 0.25, slow: 0.45, slower: 0.8 } as const;

/** Desplazamiento de las apariciones al hacer scroll (px). */
export const REVEAL_OFFSET = 12;

/** Pausa entre hijos de Stagger (s). */
export const STAGGER_STEP = 0.06;

/**
 * Nombre de ViewTransition compartido por el panel del cotizador en el hero y en /tarifas.
 * Usar en ambos lados: <ViewTransition name={QUOTE_PANEL_VT} share="morph" default="none">.
 */
export const QUOTE_PANEL_VT = "quote-panel";
