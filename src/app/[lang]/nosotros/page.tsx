import type { Metadata } from "next";
import { getDictionary } from "@/i18n/get-dictionary";
import { resolveLocale } from "@/i18n/params";
import { buildMetadata } from "@/lib/seo/metadata";
import { PageTransition } from "@/components/motion";
import { AboutCare, AboutCta, AboutEnvironment, AboutHero, AboutStory, AboutTesla } from "@/components/sections/about";

export async function generateMetadata({ params }: PageProps<"/[lang]/nosotros">): Promise<Metadata> {
    const lang = await resolveLocale(params);
    const dict = await getDictionary(lang, "about");
    return buildMetadata({ lang, route: "about", ...dict.meta });
}

export default async function AboutPage({ params }: PageProps<"/[lang]/nosotros">) {
    const lang = await resolveLocale(params);
    const t = await getDictionary(lang, "about");
    return (
        <PageTransition>
            <AboutHero t={t} />
            <AboutStory t={t} />
            <AboutTesla t={t} />
            <AboutCare t={t} />
            <AboutEnvironment t={t} />
            <AboutCta t={t} lang={lang} />
        </PageTransition>
    );
}
