import type { StaticImageData } from "next/image";
import { Reveal, RevealGroup } from "@/components/motion";
import { Button, CheckIcon, Media, RouteLine, Section } from "@/components/ui";
import { corporateCopy } from "@/content";
import type { Locale } from "@/i18n/config";
import { buildSpecialQuoteUrl } from "@/lib/whatsapp";

interface CorporateBandProps {
    lang: Locale;
    tone?: "bg" | "surface";
    id?: string;
    /** Foto opcional junto al texto (portada). Sin ella, composición solo tipográfica (servicios). */
    image?: StaticImageData;
}

/** Empresas: puntos reales y cotización personalizada por WhatsApp; con foto a la izquierda o solo con tipografía. */
export function CorporateBand({ lang, tone = "bg", id = "empresas", image }: CorporateBandProps) {
    return (
        <Section tone={tone} aria-labelledby={id}>
            {image ? <WithImage lang={lang} id={id} image={image} /> : <TypeOnly lang={lang} id={id} />}
        </Section>
    );
}

function Cta({ lang }: { lang: Locale }) {
    const t = corporateCopy[lang];
    return (
        <Button asChild size="lg" className="w-full sm:w-auto">
            <a href={buildSpecialQuoteUrl({ kind: "general", context: t.whatsappContext, lang })} target="_blank" rel="noopener noreferrer">
                {t.cta}
            </a>
        </Button>
    );
}

function WithImage({ lang, id, image }: { lang: Locale; id: string; image: StaticImageData }) {
    const t = corporateCopy[lang];
    return (
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center lg:gap-16">
            {/* La foto se funde y se asienta en su marco; el texto la sigue: título, párrafo, puntos y botón. */}
            <Reveal variant="media">
                <Media
                    src={image}
                    alt={t.imageAlt}
                    position="50% 58%"
                    sizes="(min-width: 1280px) 616px, (min-width: 1024px) 50vw, 100vw"
                    className="aspect-[4/3] lg:aspect-[5/4]"
                />
            </Reveal>
            <RevealGroup className="flex flex-col">
                <Reveal as="h2" variant="title" index={1} id={id} className="type-title">
                    {t.title}
                </Reveal>
                <Reveal as="p" variant="text" index={2} className="type-lead mt-5 max-w-[34rem] text-fg-subtle">
                    {t.text}
                </Reveal>
                <ul className="mt-8 flex flex-col gap-3 border-t border-line pt-8">
                    {t.points.map((point, i) => (
                        <Reveal as="li" variant="item" index={3 + i} key={point} className="flex items-start gap-3">
                            <CheckIcon className="mt-[0.2rem] text-brand-ink" />
                            {point}
                        </Reveal>
                    ))}
                </ul>
                <Reveal variant="text" index={3 + t.points.length} className="mt-10 flex flex-col items-start gap-4">
                    <Cta lang={lang} />
                    <p className="type-small text-fg-subtle">{t.note}</p>
                </Reveal>
            </RevealGroup>
        </div>
    );
}

/**
 * Sin foto: el título manda a la izquierda y el texto con el botón responde a la derecha; debajo,
 * La línea cruza todo el ancho y los tres puntos cuelgan de ella como columnas.
 * Piezas con atributo propio: `[data-corporate-line]` y cada punto `[data-corporate-point]`.
 */
function TypeOnly({ lang, id }: { lang: Locale; id: string }) {
    const t = corporateCopy[lang];
    return (
        <div>
            <RevealGroup className="grid gap-8 lg:grid-cols-12 lg:items-end lg:gap-x-8">
                <Reveal as="h2" variant="title" index={0} id={id} className="type-title lg:col-span-6">
                    {t.title}
                </Reveal>
                <Reveal variant="text" index={1} className="flex flex-col items-start lg:col-span-5 lg:col-start-8">
                    <p className="type-lead text-fg-subtle">{t.text}</p>
                </Reveal>
            </RevealGroup>

            {/* La línea se traza de lado a lado y los tres puntos cuelgan de ella conforme pasa el trazo. */}
            <div data-corporate-line="" className="mt-12 flex md:mt-16">
                <RouteLine draw />
            </div>

            <RevealGroup as="ul" className="grid md:grid-cols-3 md:gap-x-8">
                {t.points.map((point, i) => (
                    <Reveal
                        as="li"
                        variant="item"
                        index={i}
                        delay={160}
                        key={point}
                        data-corporate-point=""
                        className="type-subheading border-b border-line py-6 md:border-b-0 md:pb-0 md:pt-8 lg:pr-8"
                    >
                        {point}
                    </Reveal>
                ))}
            </RevealGroup>

            <Reveal variant="text" className="mt-10 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:gap-8 md:mt-16">
                <Cta lang={lang} />
                <p className="type-small text-fg-subtle">{t.note}</p>
            </Reveal>
        </div>
    );
}
