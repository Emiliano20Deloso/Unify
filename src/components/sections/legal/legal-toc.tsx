"use client";

// Índice lateral (escritorio) con la sección en lectura resaltada: un solo punto de origen de La línea
// se desliza por el trazo vertical hasta el enlace activo (SlidingIndicator vertical, resorte ui).
// Sin JS el índice funciona igual; solo falta el resaltado.
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { slideIndicatorTo } from "@/components/motion/sliding-indicator";
import { cn } from "@/lib";

export interface TocItem {
    id: string;
    label: string;
}

interface LegalTocProps {
    items: readonly TocItem[];
    label: string;
    /** Id del encabezado visible del índice (para aria-labelledby). */
    headingId: string;
}

export function LegalToc({ items, label, headingId }: LegalTocProps) {
    const [active, setActive] = useState<string | null>(null);
    const listRef = useRef<HTMLOListElement>(null);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const sections = items
            .map((item) => document.getElementById(item.id))
            .filter((el): el is HTMLElement => el !== null);
        if (sections.length === 0) return;

        let frame = 0;
        const update = () => {
            frame = 0;
            // Línea de lectura: un tercio de la ventana bajo el menú fijo.
            const header = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--header-h")) || 0;
            const line = header + (window.innerHeight - header) / 3;
            // Antes de llegar a la primera sección se marca la primera (es la que se va a leer).
            let current: string | null = sections[0]!.id;
            for (const section of sections) {
                if (section.getBoundingClientRect().top <= line) current = section.id;
                else break;
            }
            // Al final de la página la última sección cuenta aunque no alcance la línea.
            if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2) {
                current = sections[sections.length - 1]!.id;
            }
            setActive(current);
        };
        const schedule = () => {
            if (!frame) frame = requestAnimationFrame(update);
        };

        update();
        window.addEventListener("scroll", schedule, { passive: true });
        window.addEventListener("resize", schedule);
        return () => {
            window.removeEventListener("scroll", schedule);
            window.removeEventListener("resize", schedule);
            if (frame) cancelAnimationFrame(frame);
        };
    }, [items]);

    // El punto viaja al enlace activo. La primera vez aparece ya en su sitio, con un fundido.
    const dotRef = useRef<HTMLSpanElement>(null);
    useLayoutEffect(() => {
        const list = listRef.current;
        const dot = dotRef.current;
        if (!list || !dot || !active) return;
        const link = list.querySelector<HTMLElement>(`[data-id="${CSS.escape(active)}"]`);
        if (link) slideIndicatorTo(dot, link, "y");
    }, [active]);

    // Mantiene visible el enlace activo dentro del índice cuando este tiene su propio scroll.
    useEffect(() => {
        const list = listRef.current;
        const container = scrollRef.current;
        if (!list || !container || !active) return;
        const link = list.querySelector<HTMLElement>(`[data-id="${CSS.escape(active)}"]`);
        if (!link) return;
        const box = container.getBoundingClientRect();
        const rect = link.getBoundingClientRect();
        // Deja un enlace de aire arriba y abajo para que se vea el contexto.
        const margin = rect.height;
        if (rect.top < box.top + margin) container.scrollTop -= box.top + margin - rect.top;
        else if (rect.bottom > box.bottom - margin) container.scrollTop += rect.bottom - (box.bottom - margin);
    }, [active]);

    return (
        <nav aria-labelledby={headingId}>
            <p id={headingId} className="type-label mb-4 text-fg-subtle">
                {label}
            </p>
            <div ref={scrollRef} className="max-h-[calc(100dvh-var(--header-h)-7rem)] overflow-y-auto overscroll-contain pr-2 [scrollbar-width:thin]">
                {/* Un solo punto para todo el índice: --y es el offsetTop del enlace activo (relativo a este div). */}
                <div className="relative ml-1">
                    <span ref={dotRef} aria-hidden="true" data-toc-dot="" className="toc-dot sliding-indicator" />
                    <ol ref={listRef} className="border-l border-line">
                        {items.map((item, index) => {
                            const isActive = item.id === active;
                            return (
                                <li key={item.id}>
                                    <a
                                        href={`#${item.id}`}
                                        data-id={item.id}
                                        aria-current={isActive ? "location" : undefined}
                                        className={cn(
                                            "toc-link relative flex min-h-11 items-baseline gap-2.5 rounded-sm py-2.5 pl-5 type-small",
                                            isActive ? "text-fg" : "text-fg-subtle hover:text-fg",
                                        )}
                                    >
                                        <span className="tabular w-5 shrink-0 text-fg-subtle">{index + 1}.</span>
                                        <span>{item.label}</span>
                                    </a>
                                </li>
                            );
                        })}
                    </ol>
                </div>
            </div>
        </nav>
    );
}
