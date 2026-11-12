// Patrón SlidingIndicator: un solo elemento con la clase `sliding-indicator` que se desliza entre
// opciones con transiciones CSS (resorte ui). Se mueve con variables: --x/--w (horizontal) o --y
// (vertical). Con columnas iguales no hace falta medir (p. ej. --x: calc(i * (100% + gap))); para
// posiciones libres, este ayudante las mide. Sin motion ni estado de React.

/**
 * Lleva `indicator` hasta `target` (offsetLeft/offsetWidth u offsetTop/offsetHeight, relativos a su
 * offsetParent común). Si el indicador está oculto (`data-visible` ausente), aparece ya en su sitio
 * con un fundido, sin deslizarse desde la posición anterior.
 */
export function slideIndicatorTo(indicator: HTMLElement, target: HTMLElement, axis: "x" | "y" = "x", pad = 0) {
    const appearing = !indicator.hasAttribute("data-visible");
    if (appearing) {
        indicator.setAttribute("data-snap", "");
    }
    if (axis === "x") {
        indicator.style.setProperty("--x", `${target.offsetLeft - pad}px`);
        indicator.style.setProperty("--w", `${target.offsetWidth + pad * 2}px`);
    } else {
        indicator.style.setProperty("--y", `${target.offsetTop - pad}px`);
    }
    indicator.setAttribute("data-visible", "");
    if (appearing) {
        // Aplica la posición sin transición y vuelve a activar el deslizamiento para el siguiente cambio.
        void indicator.offsetWidth;
        indicator.removeAttribute("data-snap");
    }
}

/** Oculta el indicador con un fundido (se queda donde estaba). */
export function hideIndicator(indicator: HTMLElement) {
    indicator.removeAttribute("data-visible");
}
