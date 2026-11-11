import { teslaNegroArquitectura } from "@/assets/images";
import { Button, CheckIcon, Media, Section, WhatsAppIcon } from "@/components/ui";
import { corporateCopy } from "@/content";
import type { Locale } from "@/i18n/config";
import { buildSpecialQuoteUrl } from "@/lib/whatsapp";

interface CorporateBandProps {
    lang: Locale;
    tone?: "bg" | "surface";
    id?: string;
}

/** Empresas: foto a la izquierda, puntos reales y cotización personalizada por WhatsApp. */
export function CorporateBand({ lang, tone = "bg", id = "empresas" }: CorporateBandProps) {
    const t = corporateCopy[lang];
    return (
        <Section tone={tone} aria-labelledby={id}>
            <div className="grid gap-10 lg:grid-cols-2 lg:items-center lg:gap-16">
                <Media
                    src={teslaNegroArquitectura}
                    alt={t.imageAlt}
                    position="50% 62%"
                    sizes="(min-width: 1280px) 616px, (min-width: 1024px) 50vw, 100vw"
                    className="aspect-[4/3] lg:aspect-[5/4]"
                />
                <div className="flex flex-col">
                    <h2 id={id} className="type-title">
                        {t.title}
                    </h2>
                    <p className="type-lead mt-5 max-w-[34rem] text-fg-subtle">{t.text}</p>
                    <ul className="mt-8 flex flex-col gap-3 border-t border-line pt-8">
                        {t.points.map((point) => (
                            <li key={point} className="flex items-start gap-3">
                                <CheckIcon className="mt-[0.2rem] text-brand-ink" />
                                {point}
                            </li>
                        ))}
                    </ul>
                    <div className="mt-10 flex flex-col items-start gap-4">
                        <Button asChild size="lg" className="w-full sm:w-auto">
                            <a
                                href={buildSpecialQuoteUrl({ kind: "general", context: t.whatsappContext, lang })}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <WhatsAppIcon />
                                {t.cta}
                            </a>
                        </Button>
                        <p className="type-small text-fg-subtle">{t.note}</p>
                    </div>
                </div>
            </div>
        </Section>
    );
}
