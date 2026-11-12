import { JsonLd } from "@/components/seo/json-ld";
import { TAGLINE } from "@/content";
import { htmlLang, type Locale } from "@/i18n/config";
import { absoluteUrl, site } from "@/lib/site";

/** Datos del negocio para buscadores. Solo lo que está en src/lib/site.ts: sin dirección ni calificaciones. */
export function BusinessJsonLd({ lang, description }: { lang: Locale; description: string }) {
    return (
        <JsonLd
            data={{
                "@context": "https://schema.org",
                "@type": "LocalBusiness",
                "@id": `${site.url}/#negocio`,
                name: site.name,
                description,
                slogan: TAGLINE,
                url: absoluteUrl("/"),
                image: absoluteUrl("/opengraph-image.jpg"),
                email: site.email,
                telephone: site.whatsapp.phone,
                inLanguage: htmlLang[lang],
                currenciesAccepted: "MXN",
                areaServed: { "@type": "City", name: "Ciudad de México" },
                openingHoursSpecification: [
                    {
                        "@type": "OpeningHoursSpecification",
                        dayOfWeek: site.hours.days.map((day) => `https://schema.org/${day}`),
                        opens: site.hours.opens,
                        closes: site.hours.closes,
                    },
                ],
            }}
        />
    );
}
