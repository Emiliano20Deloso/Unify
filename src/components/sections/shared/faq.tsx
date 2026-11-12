import Link from "next/link";
import { Reveal, RevealGroup } from "@/components/motion";
import { JsonLd } from "@/components/seo/json-ld";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger, Button, Section } from "@/components/ui";
import { faq, faqCopy, type FaqTopic } from "@/content";
import type { Locale } from "@/i18n/config";
import { localizedHref } from "@/i18n/routes";

interface FaqProps {
    lang: Locale;
    /** Filtra por tema; "all" muestra todas. */
    topic?: FaqTopic | "all";
    tone?: "bg" | "surface";
    id?: string;
    /** false si otra sección de la misma página ya emite el FAQPage. */
    jsonLd?: boolean;
}

/** Preguntas frecuentes (fuente: términos y condiciones) con su JSON-LD FAQPage. */
export function Faq({ lang, topic = "all", tone = "bg", id = "preguntas", jsonLd = true }: FaqProps) {
    const t = faqCopy[lang];
    const items = topic === "all" ? faq[lang] : faq[lang].filter((item) => item.topic === topic);

    return (
        <Section tone={tone} aria-labelledby={id}>
            {jsonLd ? (
                <JsonLd
                    data={{
                        "@context": "https://schema.org",
                        "@type": "FAQPage",
                        inLanguage: lang === "es" ? "es-MX" : "en",
                        mainEntity: items.map((item) => ({
                            "@type": "Question",
                            name: item.question,
                            acceptedAnswer: { "@type": "Answer", text: item.answer },
                        })),
                    }}
                />
            ) : null}
            <div className="grid gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
                <RevealGroup className="flex flex-col items-start gap-4 lg:sticky lg:top-[calc(var(--header-h)+2.5rem)] lg:self-start">
                    <Reveal as="h2" variant="title" index={0} id={id} className="type-title">
                        {t.title}
                    </Reveal>
                    <Reveal as="p" variant="text" index={1} className="type-lead max-w-[28rem] text-fg-subtle">
                        {t.text}
                    </Reveal>
                    {/* El enlace tiene transición propia: Reveal va en un envoltorio. */}
                    <Reveal variant="text" index={2} className="mt-2">
                        <Button asChild variant="link">
                            <Link href={localizedHref(lang, "terms")}>{t.terms}</Link>
                        </Button>
                    </Reveal>
                </RevealGroup>
                {/* Las preguntas caen en escalonado corto (40 ms): es una lista, no tarjetas. */}
                <RevealGroup className="[--stagger:var(--stagger-tight)]">
                    <Accordion type="single" collapsible>
                        {items.map((item, i) => (
                            <Reveal key={item.id} variant="item" index={i}>
                                <AccordionItem value={item.id}>
                                    <AccordionTrigger>{item.question}</AccordionTrigger>
                                    <AccordionContent>{item.answer}</AccordionContent>
                                </AccordionItem>
                            </Reveal>
                        ))}
                    </Accordion>
                </RevealGroup>
            </div>
        </Section>
    );
}
