import { Reveal, RevealGroup } from "@/components/motion";
import { Container, Stat } from "@/components/ui";
import { TAGLINE, statsCopy } from "@/content";
import type { Locale } from "@/i18n/config";
import { cn } from "@/lib";

interface StatsBandProps {
    lang: Locale;
    /** "flush": pegada al bloque anterior (portada, bajo el cotizador). "section": con aire propio. */
    variant?: "flush" | "section";
    className?: string;
}

/** Cifras reales (+1,500 viajes, 98 % de satisfacción) y el lema. Sin título visible. */
export function StatsBand({ lang, variant = "section", className }: StatsBandProps) {
    const t = statsCopy[lang];
    return (
        <section aria-label={t.label} className={cn("bg-bg", variant === "section" ? "py-section-sm" : "pb-section-sm", className)}>
            <Container>
                {/* Un solo momento: el filete se traza de izquierda a derecha, las cifras suben y ruedan de 0 a su
                    valor (escalonadas) y el lema llega al final. */}
                <RevealGroup className="stats-band relative flex flex-col gap-6 pt-8 md:flex-row md:items-end md:justify-between">
                    <Reveal variant="figure" index={0} aria-hidden="true" className="stats-band__rule" />
                    <div className="flex flex-wrap items-baseline gap-x-16 gap-y-6">
                        {t.items.map((item, i) => (
                            <Reveal key={item.label} variant="figure" index={i + 1}>
                                <Stat value={item.value} label={item.label} />
                            </Reveal>
                        ))}
                    </div>
                    <Reveal as="p" variant="text" index={t.items.length + 1} lang="en" className="font-medium text-fg-subtle md:mb-1">
                        {TAGLINE}
                    </Reveal>
                </RevealGroup>
            </Container>
        </section>
    );
}
