"use client";

// Contenedor cuyo alto sigue al contenido con un resorte (sin saltos cuando el contenido cambia).
import { useLayoutEffect, useRef, useState } from "react";
import * as m from "motion/react-m";
import { SPRING } from "@/lib/motion";

interface AutoHeightProps {
    className?: string;
    children: React.ReactNode;
}

/**
 * `<AutoHeight><Swap id={estado}>…</Swap></AutoHeight>`. Mide el interior con ResizeObserver y anima
 * el alto en px con el resorte layout. Hasta la primera medición pinta `height: auto` (el SSR es
 * correcto y nada queda oculto). Recorta el contenido solo mientras anima.
 */
export function AutoHeight({ className, children }: AutoHeightProps) {
    const outer = useRef<HTMLDivElement>(null);
    const inner = useRef<HTMLDivElement>(null);
    const [height, setHeight] = useState<number | "auto">("auto");

    useLayoutEffect(() => {
        const node = inner.current;
        if (!node) return;
        let last = -1;
        const ro = new ResizeObserver(() => {
            const next = node.offsetHeight;
            if (next === last) return;
            // El ResizeObserver corre antes de pintar: se recorta ya, para que el contenido nuevo no
            // asome un cuadro por fuera mientras el alto todavía es el anterior.
            if (last !== -1 && outer.current) outer.current.style.overflow = "clip";
            last = next;
            setHeight(next);
        });
        ro.observe(node);
        return () => ro.disconnect();
    }, []);

    return (
        <m.div
            ref={outer}
            className={className}
            initial={false}
            animate={{ height }}
            transition={SPRING.layout}
            style={{ overflowClipMargin: 6 }}
            onAnimationComplete={() => {
                if (outer.current) outer.current.style.overflow = "";
            }}
        >
            <div ref={inner} className="flow-root">
                {children}
            </div>
        </m.div>
    );
}
