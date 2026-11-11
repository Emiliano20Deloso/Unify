import { Stagger, StaggerItem } from "@/components/motion";
import { Section, SectionHeader } from "@/components/ui";
import { fill, testimonials, testimonialsCopy } from "@/content";
import type { Locale } from "@/i18n/config";

interface TestimonialsProps {
    lang: Locale;
    tone?: "bg" | "surface";
    id?: string;
}

/** Los cuatro testimonios, sobrios: cita, nombre y la calificación que dio cada cliente (sin estrellas). */
export function Testimonials({ lang, tone = "surface", id = "testimonios" }: TestimonialsProps) {
    const t = testimonialsCopy[lang];
    const numberFormat = new Intl.NumberFormat(lang === "es" ? "es-MX" : "en-US", { maximumFractionDigits: 1 });

    return (
        <Section tone={tone} aria-labelledby={id}>
            <SectionHeader id={id} title={t.title} />
            <Stagger className="grid gap-x-16 md:grid-cols-2">
                {testimonials[lang].map((item) => {
                    const rating = numberFormat.format(item.rating);
                    return (
                        <StaggerItem key={item.id} className="border-t border-line py-8 md:py-10">
                            <figure className="flex h-full flex-col gap-6">
                                <blockquote className="type-lead text-fg-soft lg:text-xl lg:leading-relaxed">
                                    <p>{item.text}</p>
                                </blockquote>
                                <figcaption className="mt-auto flex items-baseline justify-between gap-4 type-small">
                                    <span className="font-medium text-fg">{item.name}</span>
                                    <span className="tabular text-fg-subtle">
                                        <span aria-hidden="true">{fill(t.rating, { rating })}</span>
                                        <span className="sr-only">{fill(t.ratingLabel, { rating })}</span>
                                    </span>
                                </figcaption>
                            </figure>
                        </StaggerItem>
                    );
                })}
            </Stagger>
        </Section>
    );
}
