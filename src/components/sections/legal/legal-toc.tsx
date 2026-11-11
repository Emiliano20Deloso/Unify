"use client";

// Índice lateral (escritorio) con la sección en lectura resaltada: el punto de origen de La línea
// se posa sobre el trazo vertical. Sin JS el índice funciona igual; solo falta el resaltado.
import { useEffect, useRef, useState } from "react";
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

    // Mantiene visible el enlace activo dentro del índice cuando este tiene su propio scroll.
    useEffect(() => {
        const list = listRef.current;
        const container = list?.parentElement;
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
            <div className="max-h-[calc(100dvh-var(--header-h)-7rem)] overflow-y-auto overscroll-contain pr-2 [scrollbar-width:thin]">
                <ol ref={listRef} className="relative ml-1 border-l border-line">
                    {items.map((item, index) => {
                        const isActive = item.id === active;
                        return (
                            <li key={item.id}>
                                <a
                                    href={`#${item.id}`}
                                    data-id={item.id}
                                    aria-current={isActive ? "location" : undefined}
                                    className={cn(
                                        "relative flex min-h-11 items-baseline gap-2.5 rounded-sm py-2.5 pl-5 type-small transition-colors duration-fast ease",
                                        isActive ? "text-fg" : "text-fg-subtle hover:text-fg",
                                    )}
                                >
                                    <span
                                        aria-hidden="true"
                                        className={cn(
                                            "absolute -left-[4.5px] top-[1.15rem] size-2 rounded-full bg-brand-ink transition-[opacity,transform] duration-base ease-out",
                                            isActive ? "scale-100 opacity-100" : "scale-50 opacity-0",
                                        )}
                                    />
                                    <span className="tabular w-5 shrink-0 text-fg-subtle">{index + 1}.</span>
                                    <span>{item.label}</span>
                                </a>
                            </li>
                        );
                    })}
                </ol>
            </div>
        </nav>
    );
}
