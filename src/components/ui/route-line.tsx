"use client";

// La línea: ● origen (punto lleno rojo) —— ○ destino (anillo). Motivo gráfico del sitio.
import { useEffect, useRef } from "react";
import { cn } from "@/lib";
import { EASE_EXIT, EASE_OUT, SPRING_CSS } from "@/lib/motion";
import { InView } from "./in-view";

interface RouteLineProps {
    orientation?: "horizontal" | "vertical";
    /** Se dibuja de origen a destino al entrar en pantalla (resorte layout, una vez). */
    draw?: boolean;
    /**
     * Clave de redibujo: cuando cambia (p. ej. la ruta), el trazo se recoge hacia el origen y se vuelve
     * a dibujar desde donde esté, sin desaparecer de golpe. No hace falta `key`: no se vuelve a montar.
     */
    redraw?: string | number;
    /** Clave de latido: cuando cambia, el punto de destino late una vez (escala 1 → 1.6 → 1). */
    pulse?: string | number;
    /**
     * Nombre accesible cuando la línea significa algo entre dos textos (p. ej. "a" en
     * "Polanco ●——○ AICM"). Sin label es decorativa.
     */
    label?: string;
    /** El largo lo da el contenedor: w-24, flex-1, h-16… (por defecto ocupa todo el eje). */
    className?: string;
}

const bezier = (curve: readonly number[]) => `cubic-bezier(${curve.join(", ")})`;
const reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Lanza `run` cuando `key` cambia después del primer render (no al montar). */
function useOnChange(key: string | number | undefined, run: () => (() => void) | void) {
    const prev = useRef(key);
    useEffect(() => {
        if (prev.current === key) return;
        prev.current = key;
        return run();
        // run se recrea en cada render; solo importa el cambio de clave.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [key]);
}

export function RouteLine({ orientation = "horizontal", draw = false, redraw, pulse, label, className }: RouteLineProps) {
    const vertical = orientation === "vertical";
    const track = useRef<HTMLSpanElement>(null);
    const end = useRef<HTMLSpanElement>(null);

    useOnChange(redraw, () => {
        const node = track.current;
        if (!node) return;
        node.getAnimations().forEach((a) => a.cancel());
        if (reduced()) {
            node.animate([{ opacity: 1 }, { opacity: 0.25, offset: 0.35 }, { opacity: 1 }], { duration: 600, easing: bezier(EASE_OUT) });
            return;
        }
        // Se recoge desde donde esté (también a media animación) y se vuelve a dibujar con el resorte.
        const axis = vertical ? "scaleY" : "scaleX";
        const from = getComputedStyle(node).transform;
        const retract = node.animate([{ transform: from === "none" ? `${axis}(1)` : from }, { transform: `${axis}(0)` }], {
            duration: 180,
            easing: bezier(EASE_EXIT),
            fill: "forwards",
        });
        let cancelled = false;
        retract.finished
            .then(() => {
                if (cancelled) return;
                node.animate([{ transform: `${axis}(0)` }, { transform: `${axis}(1)` }], SPRING_CSS.layout);
                retract.cancel();
            })
            .catch(() => {});
        return () => {
            cancelled = true;
        };
    });

    useOnChange(pulse, () => {
        const node = end.current;
        if (!node) return;
        const frames = reduced()
            ? [{ opacity: 1 }, { opacity: 0.4, offset: 0.35 }, { opacity: 1 }]
            : [{ transform: "scale(1)" }, { transform: "scale(1.6)", offset: 0.35 }, { transform: "scale(1)" }];
        node.animate(frames, { duration: 600, easing: bezier(EASE_OUT) });
    });

    const content = (
        <>
            <span className="route-line__start size-2 shrink-0 rounded-full bg-brand-ink" />
            <span ref={track} className={cn("route-line__track flex-1 bg-route", vertical ? "w-px" : "h-px")} />
            <span ref={end} className="route-line__end size-2 shrink-0 rounded-full border-[1.5px] border-fg" />
        </>
    );
    const shared = {
        "data-orientation": orientation,
        className: cn("route-line flex items-center", vertical ? "h-full w-2 flex-col" : "w-full", className),
        ...(label ? { role: "img", "aria-label": label } : { "aria-hidden": true as const }),
    };

    return draw ? (
        <InView data-draw="" {...shared}>
            {content}
        </InView>
    ) : (
        <span {...shared}>{content}</span>
    );
}
