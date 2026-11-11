import Link from "next/link";
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
                <div className="flex flex-col items-start gap-4 lg:sticky lg:top-[calc(var(--header-h)+2.5rem)] lg:self-start">
                    <h2 id={id} className="type-title">
                        {t.title}
                    </h2>
                    <p className="type-lead max-w-[28rem] text-fg-subtle">{t.text}</p>
                    <Button asChild variant="link" className="mt-2">
                        <Link href={localizedHref(lang, "terms")}>{t.terms}</Link>
                    </Button>
                </div>
                <Accordion type="single" collapsible>
                    {items.map((item) => (
                        <AccordionItem key={item.id} value={item.id}>
                            <AccordionTrigger>{item.question}</AccordionTrigger>
                            <AccordionContent>{item.answer}</AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </div>
        </Section>
    );
}
