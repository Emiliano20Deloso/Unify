import type { Metadata } from "next";
import { termsAndConditions } from "@/content/legal";
import { getDictionary } from "@/i18n/get-dictionary";
import { resolveLocale } from "@/i18n/params";
import { localizedHref } from "@/i18n/routes";
import { buildMetadata } from "@/lib/seo/metadata";
import { PageTransition } from "@/components/motion";
import { LegalDocument } from "@/components/sections/legal";

export async function generateMetadata({ params }: PageProps<"/[lang]/terminos">): Promise<Metadata> {
    const lang = await resolveLocale(params);
    const dict = await getDictionary(lang, "legal");
    return buildMetadata({ lang, route: "terms", ...dict.terms.meta });
}

export default async function TermsPage({ params }: PageProps<"/[lang]/terminos">) {
    const lang = await resolveLocale(params);
    const dict = await getDictionary(lang, "legal");
    return (
        <PageTransition>
            <LegalDocument
                lang={lang}
                doc={termsAndConditions[lang]}
                title={dict.terms.title}
                text={dict.terms.text}
                ui={dict.ui}
                related={{ label: dict.privacy.title, href: localizedHref(lang, "privacy") }}
            />
        </PageTransition>
    );
}
