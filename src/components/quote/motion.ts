"use client";

// Reacciones puntuales del cotizador con WAAPI (no dejan nada aplicado al terminar). Mismos tokens
// que el resto del sistema: desplazamientos con resorte, opacidad y color con curvas suaves.
// Movimiento reducido: solo opacidad o color.
import { useLayoutEffect, useRef } from "react";
import { EASE_OUT, SPRING_CSS } from "@/lib/motion";

const easeOut = `cubic-bezier(${EASE_OUT.join(", ")})`;

export function prefersReduced(): boolean {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Un valor que acaba de cambiar entra con fundido y desde `dy` px (resorte ui). */
export function enterValue(node: HTMLElement | null, dy: number) {
    if (!node) return;
    node.animate([{ opacity: 0 }, { opacity: 1 }], { duration: dy > 8 ? 360 : 280, easing: easeOut });
    if (!prefersReduced() && dy !== 0) {
        node.animate([{ translate: `0 ${dy}px` }, { translate: "0 0" }], SPRING_CSS.ui);
    }
}

/** El contorno de la celda late una vez en el color de error (campo que falta al enviar). */
export function pulseOutline(node: HTMLElement | null) {
    if (!node) return;
    const ink = getComputedStyle(document.documentElement).getPropertyValue("--c-brand-ink").trim();
    if (!ink) return;
    node.animate(
        [
            { outlineColor: `rgb(${ink} / 0)` },
            { outlineColor: `rgb(${ink} / 1)`, offset: 0.25 },
            { outlineColor: `rgb(${ink} / 0)` },
        ],
        { duration: 900, easing: easeOut },
    );
}

/** Giro de un icono (invertir, reintentar). Con movimiento reducido, un parpadeo suave de opacidad. */
export function spin(node: Element | null, turn: number) {
    if (!node) return;
    if (prefersReduced()) {
        node.animate([{ opacity: 1 }, { opacity: 0.4, offset: 0.4 }, { opacity: 1 }], { duration: 360, easing: easeOut });
        return;
    }
    node.animate([{ rotate: "0deg" }, { rotate: `${turn}deg` }], SPRING_CSS.ui);
}

/**
 * Cuando `key` cambia, el elemento se desliza desde donde estaba hasta su sitio nuevo (FLIP con el
 * resorte ui), en vez de saltar porque cambió el ancho de lo de al lado. Mide offsetLeft/offsetTop.
 */
export function useSlideOnChange(ref: React.RefObject<HTMLElement | null>, key: string) {
    const last = useRef<{ key: string; x: number; y: number } | null>(null);
    useLayoutEffect(() => {
        const node = ref.current;
        if (!node) {
            last.current = null;
            return;
        }
        const prev = last.current;
        const now = { key, x: node.offsetLeft, y: node.offsetTop };
        last.current = now;
        if (!prev || prev.key === key || prefersReduced()) return;
        const dx = prev.x - now.x;
        const dy = prev.y - now.y;
        if ((dx === 0 && dy === 0) || Math.abs(dx) > 400 || Math.abs(dy) > 120) return;
        node.animate([{ translate: `${dx}px ${dy}px` }, { translate: "0 0" }], SPRING_CSS.ui);
    });
}
