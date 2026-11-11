// STUB de la Fase 1a: solo estructura. El contenido lo construye su dueño en la Fase 2.
import type { Metadata } from "next";
import { getDictionary } from "@/i18n/get-dictionary";
import { resolveLocale } from "@/i18n/params";
import { buildMetadata } from "@/lib/seo/metadata";

export async function generateMetadata({ params }: PageProps<"/[lang]/servicios">): Promise<Metadata> {
    const lang = await resolveLocale(params);
    const dict = await getDictionary(lang, "services");
    return buildMetadata({ lang, route: "services", ...dict.meta });
}

export default async function ServicesPage({ params }: PageProps<"/[lang]/servicios">) {
    const lang = await resolveLocale(params);
    const dict = await getDictionary(lang, "services");
    return (
        <section className="px-6 py-16">
            <h1 className="text-4xl font-bold">{dict.title}</h1>
        </section>
    );
}
