// Servicios. Estática: no lee searchParams, cookies() ni headers().
import type { Metadata } from "next";
import { getDictionary } from "@/i18n/get-dictionary";
import { resolveLocale } from "@/i18n/params";
import { buildMetadata } from "@/lib/seo/metadata";
import { PageTransition } from "@/components/motion";
import { ServiceTypes } from "@/components/sections/services";
import { CorporateBand, FinalCta, HowItWorks, ServiceLevels } from "@/components/sections/shared";
import { PageHero } from "@/components/ui";
import { servicesImages } from "@/content/services";

export async function generateMetadata({ params }: PageProps<"/[lang]/servicios">): Promise<Metadata> {
    const lang = await resolveLocale(params);
    const dict = await getDictionary(lang, "services");
    return buildMetadata({ lang, route: "services", ...dict.meta });
}

export default async function ServicesPage({ params }: PageProps<"/[lang]/servicios">) {
    const lang = await resolveLocale(params);
    const dict = await getDictionary(lang, "services");
    return (
        <PageTransition>
            <PageHero
                title={dict.hero.title}
                text={dict.hero.text}
                media={{ src: servicesImages.hero.src, alt: dict.hero.imageAlt, position: servicesImages.hero.position }}
            />
            <ServiceTypes lang={lang} t={dict.types} tone="surface" />
            <ServiceLevels lang={lang} variant="full" tone="bg" />
            <HowItWorks lang={lang} tone="surface" />
            <CorporateBand lang={lang} tone="bg" />
            <FinalCta lang={lang} />
        </PageTransition>
    );
}
