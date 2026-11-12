"use client";

// Índice de los textos legales en pantallas chicas: un acordeón de Radix con el alto animado (mismas
// transiciones que el acordeón del sitio, globals.css § Acordeón) en vez de un <details> que abre de golpe.
// El contenido siempre está montado: cerrado queda con visibility hidden (sin Tab ni lector). La
// cabecera no es un encabezado (no hay h2 antes de las secciones del documento), igual que el <summary>.
import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { PlusIcon } from "@/components/ui/icons";
import type { TocItem } from "./legal-toc";

interface LegalTocMobileProps {
    items: readonly TocItem[];
    label: string;
}

export function LegalTocMobile({ items, label }: LegalTocMobileProps) {
    return (
        <AccordionPrimitive.Root type="single" collapsible data-toc-mobile="" className="rounded-card border border-line bg-surface">
            <AccordionPrimitive.Item value="toc">
                <AccordionPrimitive.Header asChild>
                    <div>
                        <AccordionPrimitive.Trigger className="ctl flex min-h-14 w-full items-center justify-between gap-4 rounded-card px-5 text-left font-medium [--ring-offset:-2px]">
                            <span>
                                {label}
                                <span className="tabular ml-2 font-normal text-fg-subtle">({items.length})</span>
                            </span>
                            <PlusIcon className="accordion-icon" />
                        </AccordionPrimitive.Trigger>
                    </div>
                </AccordionPrimitive.Header>
                <AccordionPrimitive.Content forceMount className="accordion-content">
                    <div className="accordion-panel">
                        <div>
                            <nav aria-label={label} className="accordion-content__inner border-t border-line px-2 pb-2 pt-1">
                                <ol>
                                    {items.map((item, index) => (
                                        <li key={item.id}>
                                            <a
                                                href={`#${item.id}`}
                                                className="toc-link flex min-h-11 items-baseline gap-2.5 rounded-inner px-3 py-2.5 type-small text-fg-muted hover:bg-elevated hover:text-fg"
                                            >
                                                <span className="tabular w-6 shrink-0 text-fg-subtle">{index + 1}.</span>
                                                <span>{item.label}</span>
                                            </a>
                                        </li>
                                    ))}
                                </ol>
                            </nav>
                        </div>
                    </div>
                </AccordionPrimitive.Content>
            </AccordionPrimitive.Item>
        </AccordionPrimitive.Root>
    );
}
