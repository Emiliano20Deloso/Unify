// STUB de la Fase 1a: solo estructura. El contenido lo construye su dueño en la Fase 2.
import type { Metadata } from "next";
import { getDictionary } from "@/i18n/get-dictionary";
import { resolveLocale } from "@/i18n/params";
import { buildMetadata } from "@/lib/seo/metadata";

export async function generateMetadata({ params }: PageProps<"/[lang]/privacidad">): Promise<Metadata> {
    const lang = await resolveLocale(params);
    const dict = await getDictionary(lang, "legal");
    return buildMetadata({ lang, route: "privacy", ...dict.privacy.meta });
}

export default async function PrivacyPage({ params }: PageProps<"/[lang]/privacidad">) {
    const lang = await resolveLocale(params);
    const dict = await getDictionary(lang, "legal");
    return (
        <section className="px-6 py-16">
            <h1 className="text-4xl font-bold">{dict.privacy.title}</h1>
        </section>
    );
}
