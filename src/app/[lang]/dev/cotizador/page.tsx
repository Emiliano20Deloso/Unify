// Banco de pruebas del cotizador (solo revisión): el widget del hero sobre la foto y, debajo, el
// cotizador completo de /tarifas. Fuera del sitemap, noindex y bloqueado en robots.
import type { Metadata } from "next";
import { teslaGrisAnochecer } from "@/assets/images";
import { PageTransition } from "@/components/motion";
import { QuoteCalculator, QuoteWidget } from "@/components/quote";
import { Container, Media, Section } from "@/components/ui";
import { getDictionary } from "@/i18n/get-dictionary";
import { resolveLocale } from "@/i18n/params";
import { buildMetadata } from "@/lib/seo/metadata";

export async function generateMetadata({ params }: PageProps<"/[lang]/dev/cotizador">): Promise<Metadata> {
    const lang = await resolveLocale(params);
    const dict = await getDictionary(lang, "quote");
    return buildMetadata({ lang, route: "pricing", title: dict.meta.title, description: dict.meta.description, noIndex: true });
}

export default async function QuoteDevPage({ params }: PageProps<"/[lang]/dev/cotizador">) {
    const lang = await resolveLocale(params);
    const dict = await getDictionary(lang, "quote");
    return (
        <PageTransition>
            <section className="relative flex min-h-[640px] flex-col justify-end lg:h-[760px]">
                <Media src={teslaGrisAnochecer} alt="" fill radius="none" veil="both" sizes="100vw" position="50% 60%" preload />
                <Container className="relative pb-section-sm pt-header">
                    <h1 className="type-display mb-10 max-w-4xl">{dict.meta.title}</h1>
                    <QuoteWidget lang={lang} dict={dict} />
                </Container>
            </section>
            <Section space="md" aria-label={dict.calculator.label}>
                <QuoteCalculator lang={lang} dict={dict} />
            </Section>
        </PageTransition>
    );
}
