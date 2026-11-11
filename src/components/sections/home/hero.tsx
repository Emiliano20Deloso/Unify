import { Fragment } from "react";
import { teslaGrisAnochecer } from "@/assets/images";
import { QuoteWidget } from "@/components/quote";
import { Container, Media } from "@/components/ui";
import type { Locale } from "@/i18n/config";
import type { HomeDictionary, QuoteDictionary } from "@/i18n/types";

interface HomeHeroProps {
    lang: Locale;
    t: HomeDictionary["hero"];
    quote: QuoteDictionary;
}

/**
 * Hero a sangre de la portada (maqueta B-Nocturno). Escritorio: texto arriba, bajo el menú, y el
 * cotizador montado sobre el borde inferior de la foto. Móvil: texto al pie de la foto y el
 * cotizador debajo. Sin animaciones de entrada: el contenido arriba del pliegue ya se ve.
 */
export function HomeHero({ lang, t, quote }: HomeHeroProps) {
    return (
        <section aria-labelledby="inicio-titulo" className="relative">
            <div className="relative lg:h-[880px]">
                {/* Móvil y tableta: la foto ocupa la parte de arriba y el texto de apoyo cae sobre el fondo. */}
                <div className="absolute inset-x-0 top-0 h-[26.5rem] sm:h-[38rem] lg:h-full">
                    <Media
                        src={teslaGrisAnochecer}
                        alt={t.imageAlt}
                        fill
                        radius="none"
                        veil="both"
                        fade="mobile"
                        sizes="100vw"
                        position="64% 60%"
                        className="lg:[&_img]:![object-position:50%_60%]"
                        preload
                    />
                </div>
                <Container className="relative pt-[22rem] sm:pt-[30.5rem] lg:pt-[calc(var(--header-h)+4rem)]">
                    <p className="type-label lg:text-[0.9375rem]">{t.eyebrow}</p>
                    <h1 id="inicio-titulo" className="type-display mt-3 max-w-4xl lg:mt-5">
                        {t.title.map((line, i) => (
                            <Fragment key={line}>
                                {i > 0 ? <br /> : null}
                                {line}
                            </Fragment>
                        ))}
                    </h1>
                    <p className="type-lead mt-5 max-w-[34rem] text-fg-subtle lg:text-fg-soft">{t.text}</p>
                </Container>
            </div>
            <Container className="relative z-10 mt-6 sm:mt-8 lg:-mt-[60px]">
                <QuoteWidget lang={lang} dict={quote} />
                <p className="type-label mt-4 text-center text-fg-subtle lg:mt-6 lg:pl-8 lg:text-left lg:text-sm">
                    {t.trust.map((item, i) => (
                        <Fragment key={item}>
                            {i > 0 ? <span aria-hidden="true"> · </span> : null}
                            <span className="whitespace-nowrap">{item}</span>
                        </Fragment>
                    ))}
                </p>
            </Container>
        </section>
    );
}
