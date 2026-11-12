// Portada. Estática: no lee searchParams, cookies() ni headers().
import type { Metadata } from "next";
import { getDictionary } from "@/i18n/get-dictionary";
import { resolveLocale } from "@/i18n/params";
import { finalCtaCopy, photos } from "@/content";
import { buildMetadata } from "@/lib/seo/metadata";
import { PageTransition } from "@/components/motion";
import { BusinessJsonLd, Experience, HomeHero } from "@/components/sections/home";
import {
    CorporateBand,
    Faq,
    FinalCta,
    HowItWorks,
    PopularRoutes,
    ServiceLevels,
    StatsBand,
} from "@/components/sections/shared";

export async function generateMetadata({ params }: PageProps<"/[lang]">): Promise<Metadata> {
    const lang = await resolveLocale(params);
    const dict = await getDictionary(lang, "home");
    return buildMetadata({ lang, route: "home", ...dict.meta });
}

export default async function HomePage({ params }: PageProps<"/[lang]">) {
    const lang = await resolveLocale(params);
    const [dict, quote] = await Promise.all([getDictionary(lang, "home"), getDictionary(lang, "quote")]);

    return (
        <PageTransition>
            <BusinessJsonLd lang={lang} description={dict.meta.description} />
            <HomeHero lang={lang} t={dict.hero} quote={quote} />
            <StatsBand lang={lang} variant="flush" className="pt-12 lg:pt-12" />
            <HowItWorks lang={lang} tone="surface" />
            <Experience t={dict.experience} />
            <ServiceLevels lang={lang} variant="summary" tone="surface" />
            <PopularRoutes lang={lang} variant="teaser" tone="bg" />
            <CorporateBand lang={lang} tone="surface" image={photos.homeCorporate} />
            {/* Sin testimonios (decisión del dueño; el componente sigue en sections/shared). La banda de
                empresas va en surface y el cierre en bg: preguntas en bg y una línea que las separa. */}
            <Faq lang={lang} topic="general" tone="bg" />
            <FinalCta
                lang={lang}
                offset
                separated
                image={{ src: photos.homeFinalCta, alt: finalCtaCopy[lang].imageAlt, position: "62% 50%" }}
            />
        </PageTransition>
    );
}
