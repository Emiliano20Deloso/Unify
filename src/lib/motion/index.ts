// Constantes de movimiento para JS (motion, WAAPI). Espejo de los tokens CSS de src/styles/tokens.css.
// Diseño completo: design/MOVIMIENTO.md §B.

/** Curva de entrada: cubic-bezier(0.22, 1, 0.36, 1). */
export const EASE_OUT = [0.22, 1, 0.36, 1] as const;

/** Curva de salida (acelera): cubic-bezier(0.4, 0, 1, 1). */
export const EASE_EXIT = [0.4, 0, 1, 1] as const;

/**
 * Resortes sin rebote. `bounce: 0` va explícito: con `visualDuration`, motion pone 0.25 por defecto.
 * Transform y alto usan resortes; la opacidad usa FADE_IN / FADE_OUT.
 */
export const SPRING = {
    micro: { type: "spring", visualDuration: 0.16, bounce: 0 },
    ui: { type: "spring", visualDuration: 0.28, bounce: 0 },
    layout: { type: "spring", visualDuration: 0.45, bounce: 0 },
    page: { type: "spring", visualDuration: 0.55, bounce: 0 },
} as const;

/** Opacidad al entrar (--dur-ui + --ease-out). */
export const FADE_IN = { duration: 0.28, ease: EASE_OUT } as const;

/** Opacidad al salir (--dur-exit + --ease-exit). */
export const FADE_OUT = { duration: 0.2, ease: EASE_EXIT } as const;

/**
 * (Para el lote del cotizador: invertir origen y destino con WAAPI, NumberFlow.)
 * Los mismos resortes como curva CSS `linear()` con su duración de asentamiento (ms), para WAAPI y
 * NumberFlow: `el.animate(frames, { duration: SPRING_CSS.ui.duration, easing: SPRING_CSS.ui.easing })`.
 */
export const SPRING_CSS = {
    micro: {
        duration: 350,
        easing: "linear(0, 0.2794, 0.6159, 0.8186, 0.9198, 0.966, 0.986, 0.9943, 0.9977, 0.9991, 0.9997, 1)",
    },
    ui: {
        duration: 550,
        easing: "linear(0, 0.1236, 0.341, 0.5416, 0.6959, 0.8046, 0.8772, 0.9242, 0.9538, 0.9722, 0.9834, 0.9901, 0.9942, 0.9966, 0.998, 0.9988, 0.9993, 1)",
    },
    layout: {
        duration: 800,
        easing: "linear(0, 0.0507, 0.1614, 0.2915, 0.4192, 0.5342, 0.6326, 0.714, 0.7796, 0.8317, 0.8723, 0.9038, 0.9279, 0.9462, 0.96, 0.9704, 0.9781, 0.9839, 0.9882, 0.9913, 0.9937, 0.9954, 0.9966, 0.9975, 0.9982, 0.9987, 1)",
    },
} as const;

/**
 * Nombre de ViewTransition compartido por el panel del cotizador en el hero y en /tarifas, y el tipo
 * de transición que lo activa. El morph solo ocurre cuando la navegación lleva ese tipo (enviar el
 * formulario del hero); en cualquier otra navegación el panel sigue la transición de página.
 */
export const QUOTE_PANEL_VT = "quote-panel";
export const QUOTE_PANEL_TYPE = "quote-panel";
/** Prop `share` de los dos paneles: morph solo con QUOTE_PANEL_TYPE; en otra navegación, ninguno. */
export const QUOTE_PANEL_SHARE = { [QUOTE_PANEL_TYPE]: "morph", default: "none" };

/** Tipo de transición del cambio de idioma: fundido cruzado sin desplazamiento. */
export const LOCALE_TYPE = "locale";
