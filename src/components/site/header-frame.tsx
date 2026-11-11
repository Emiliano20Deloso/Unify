"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib";

/**
 * Menú fijo: transparente sobre el hero, carbón sólido con línea inferior en cuanto hay scroll.
 * Un centinela de 8 px arriba del documento + IntersectionObserver (sin escuchar el scroll).
 * No se anima entre páginas (view-transition-name: site-header).
 */
export function HeaderFrame({ children }: { children: React.ReactNode }) {
    const sentinel = useRef<HTMLDivElement>(null);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const node = sentinel.current;
        if (!node) return;
        const io = new IntersectionObserver(([entry]) => setScrolled(!entry?.isIntersecting));
        io.observe(node);
        return () => io.disconnect();
    }, []);

    return (
        <>
            <div ref={sentinel} aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-2" />
            <header
                data-site-chrome
                data-scrolled={scrolled ? "" : undefined}
                style={{ viewTransitionName: "site-header" }}
                className={cn(
                    "fixed inset-x-0 top-0 z-40 border-b transition-[background-color,border-color] duration-base ease",
                    scrolled ? "border-line bg-bg" : "border-transparent bg-transparent",
                )}
            >
                {children}
            </header>
        </>
    );
}
