// Tarifas. Estática: no lee searchParams, cookies() ni headers(); el cotizador lee ?o=&d=&n= en el cliente.
import type { Metadata } from "next";
import { getDictionary } from "@/i18n/get-dictionary";
import { resolveLocale } from "@/i18n/params";
import { buildMetadata } from "@/lib/seo/metadata";
import { PageTransition } from "@/components/motion";
import { CustomQuote, Formula, Includes, PricingHero } from "@/components/sections/pricing";
import { Faq, PopularRoutes } from "@/components/sections/shared";

export async function generateMetadata({ params }: PageProps<"/[lang]/tarifas">): Promise<Metadata> {
    const lang = await resolveLocale(params);
    const dict = await getDictionary(lang, "pricing");
    return buildMetadata({ lang, route: "pricing", ...dict.meta });
}

export default async function PricingPage({ params }: PageProps<"/[lang]/tarifas">) {
    const lang = await resolveLocale(params);
    const [dict, quote] = await Promise.all([getDictionary(lang, "pricing"), getDictionary(lang, "quote")]);
    return (
        <PageTransition>
            <PricingHero lang={lang} t={dict.hero} quote={quote} />
            <Formula lang={lang} t={dict.formula} tone="surface" />
            <Includes lang={lang} t={dict.includes} tone="bg" />
            <PopularRoutes lang={lang} variant="full" tone="surface" />
            <Faq lang={lang} topic="pricing" tone="bg" />
            <CustomQuote lang={lang} t={dict.custom} tone="surface" />
        </PageTransition>
    );
}
