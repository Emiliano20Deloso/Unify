import { RouteLine, Section, SectionHeader } from "@/components/ui";
import { howItWorksCopy } from "@/content";
import type { Locale } from "@/i18n/config";
import { cn } from "@/lib";

interface HowItWorksProps {
    lang: Locale;
    tone?: "bg" | "surface";
}

// La línea une los tres pasos: en escritorio corre del paso 1 (● origen) al paso 3 (○ destino);
// en móvil baja por la izquierda y termina después del último paso. Columnas con gap-x-10 (2.5rem):
// el inicio de la columna n es (n-1)·(100% + 2.5rem)/3.
const STEP_MARK = "absolute size-2 rounded-full bg-fg-subtle";

/** Cotiza → Confirma → Viaja. La línea que se dibuja es el único momento coreografiado de la portada. */
export function HowItWorks({ lang, tone = "surface" }: HowItWorksProps) {
    const t = howItWorksCopy[lang];
    const last = t.steps.length - 1;
    return (
        <Section tone={tone} aria-labelledby="como-funciona">
            <SectionHeader id="como-funciona" title={t.title} text={t.text} />
            <div className="relative">
                {/* Escritorio: horizontal, del paso 1 al paso 3. */}
                <RouteLine draw className="absolute left-0 top-0 hidden w-[calc((200%+5rem)/3+0.5rem)] md:flex" />
                {/* Móvil: vertical, a lo largo de toda la lista. */}
                <RouteLine draw orientation="vertical" className="absolute bottom-0 left-0 top-1.5 md:hidden" />
                <ol className="grid gap-10 pb-10 pl-10 md:grid-cols-3 md:gap-x-10 md:pb-0 md:pl-0 md:pt-12">
                    {t.steps.map((step, i) => (
                        <li key={step.title} className="relative flex flex-col gap-3">
                            {i > 0 ? (
                                <span
                                    aria-hidden="true"
                                    className={cn(STEP_MARK, "-left-10 top-1.5 md:-top-12 md:left-0", i === last && "md:hidden")}
                                />
                            ) : null}
                            <h3 className="type-subheading">{step.title}</h3>
                            <p className="max-w-[22rem] text-fg-subtle">{step.text}</p>
                        </li>
                    ))}
                </ol>
            </div>
        </Section>
    );
}
