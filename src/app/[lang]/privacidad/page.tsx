import type { Metadata } from "next";
import { privacyNotice } from "@/content/legal";
import { getDictionary } from "@/i18n/get-dictionary";
import { resolveLocale } from "@/i18n/params";
import { localizedHref } from "@/i18n/routes";
import { buildMetadata } from "@/lib/seo/metadata";
import { PageTransition } from "@/components/motion";
import { LegalDocument } from "@/components/sections/legal";

export async function generateMetadata({ params }: PageProps<"/[lang]/privacidad">): Promise<Metadata> {
    const lang = await resolveLocale(params);
    const dict = await getDictionary(lang, "legal");
    return buildMetadata({ lang, route: "privacy", ...dict.privacy.meta });
}

export default async function PrivacyPage({ params }: PageProps<"/[lang]/privacidad">) {
    const lang = await resolveLocale(params);
    const dict = await getDictionary(lang, "legal");
    return (
        <PageTransition>
            <LegalDocument
                lang={lang}
                doc={privacyNotice[lang]}
                title={dict.privacy.title}
                text={dict.privacy.text}
                ui={dict.ui}
                related={{ label: dict.terms.title, href: localizedHref(lang, "terms") }}
            />
        </PageTransition>
    );
}
