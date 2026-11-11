// STUB de la Fase 1a: solo estructura. El contenido lo construye su dueño en la Fase 2.
import type { Metadata } from "next";
import { getDictionary } from "@/i18n/get-dictionary";
import { resolveLocale } from "@/i18n/params";
import { buildMetadata } from "@/lib/seo/metadata";
import { PageTransition } from "@/components/motion";
import { PageHero } from "@/components/ui";

export async function generateMetadata({ params }: PageProps<"/[lang]">): Promise<Metadata> {
    const lang = await resolveLocale(params);
    const dict = await getDictionary(lang, "home");
    return buildMetadata({ lang, route: "home", ...dict.meta });
}

export default async function HomePage({ params }: PageProps<"/[lang]">) {
    const lang = await resolveLocale(params);
    const dict = await getDictionary(lang, "home");
    return (
        <PageTransition>
            <PageHero title={dict.title} />
        </PageTransition>
    );
}
