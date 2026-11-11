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
                <div className="flex flex-col gap-6 border-t border-line pt-8 md:flex-row md:items-end md:justify-between">
                    <div className="flex flex-wrap items-baseline gap-x-16 gap-y-6">
                        {t.items.map((item) => (
                            <Stat key={item.label} value={item.value} label={item.label} />
                        ))}
                    </div>
                    <p lang="en" className="font-medium text-fg-subtle md:mb-1">
                        {TAGLINE}
                    </p>
                </div>
            </Container>
        </section>
    );
}
