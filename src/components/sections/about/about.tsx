// Secciones de /nosotros. Todo de servidor; el único movimiento es La línea de "Quiénes somos".
import Link from "next/link";
import { aboutImages } from "@/content/about";
import { Button, Container, Media, RouteLine, Section, SectionHeader } from "@/components/ui";
import type { Locale } from "@/i18n/config";
import { localizedHref } from "@/i18n/routes";
import type { AboutDictionary } from "@/i18n/types";

interface Props {
    t: AboutDictionary;
}

/** Portada a sangre (pedido de Nosotros.md): el menú transparente encima, texto al pie. */
export function AboutHero({ t }: Props) {
    return (
        <header className="relative flex min-h-[560px] flex-col justify-end md:h-[min(820px,92svh)] md:min-h-[640px]">
            <Media
                src={aboutImages.hero.src}
                alt={t.heroAlt}
                position={aboutImages.hero.position}
                fill
                radius="none"
                veil="both"
                sizes="100vw"
                preload
            />
            <Container className="relative pb-section-md pt-header">
                <h1 className="type-display">{t.title}</h1>
                <p className="type-lead mt-5 max-w-[34rem] text-fg-soft">{t.lead}</p>
            </Container>
        </header>
    );
}

/**
 * Quiénes somos: el problema ● —— ○ lo que hicimos al respecto. La línea vertical une los dos
 * párrafos (origen y destino) y se dibuja al entrar: el momento coreografiado de la página.
 */
export function AboutStory({ t }: Props) {
    const [problem, answer] = t.story.paragraphs;
    return (
        <Section aria-labelledby="quienes-somos" space="lg">
            <div className="grid gap-10 lg:grid-cols-12 lg:gap-8">
                <h2 id="quienes-somos" className="type-title lg:col-span-4">
                    {t.story.title}
                </h2>
                <div className="flex gap-6 sm:gap-8 lg:col-span-7 lg:col-start-6">
                    <RouteLine orientation="vertical" draw className="mt-[0.55em] h-auto self-stretch" />
                    <div className="flex flex-col gap-10 md:gap-14">
                        <p className="type-lead max-w-[38rem] text-fg-muted">{problem}</p>
                        <p className="type-lead max-w-[38rem] text-fg">{answer}</p>
                    </div>
                </div>
            </div>
        </Section>
    );
}

/** Por qué Tesla: foto vertical y las cuatro razones en rejilla de 2 × 2. */
export function AboutTesla({ t }: Props) {
    return (
        <Section tone="surface" aria-labelledby="por-que-tesla">
            <div className="grid gap-10 lg:grid-cols-12 lg:items-center lg:gap-8">
                <Media
                    src={aboutImages.tesla.src}
                    alt={t.tesla.imageAlt}
                    position={aboutImages.tesla.position}
                    sizes="(min-width: 1440px) 520px, (min-width: 1024px) 40vw, 100vw"
                    className="aspect-[4/3] sm:aspect-[16/10] lg:col-span-5 lg:aspect-[4/5]"
                />
                <div className="lg:col-span-6 lg:col-start-7">
                    <SectionHeader id="por-que-tesla" title={t.tesla.title} text={t.tesla.text} className="md:mb-12" />
                    <ul className="grid gap-x-8 gap-y-8 sm:grid-cols-2 sm:gap-y-10">
                        {t.tesla.reasons.map((reason) => (
                            <li key={reason.title} className="border-t border-line-strong pt-5">
                                <h3 className="type-subheading">{reason.title}</h3>
                                <p className="type-small mt-3 text-fg-subtle">{reason.text}</p>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </Section>
    );
}

/** Cómo te cuidamos: panorámica de cabina y los seis compromisos en tres columnas. */
export function AboutCare({ t }: Props) {
    return (
        <Section aria-labelledby="como-te-cuidamos">
            <SectionHeader id="como-te-cuidamos" title={t.care.title} text={t.care.text} />
            <Media
                src={aboutImages.care.src}
                alt={t.care.imageAlt}
                position={aboutImages.care.position}
                sizes="(min-width: 1440px) 1280px, 92vw"
                className="aspect-[4/3] md:aspect-[21/9]"
            />
            <ul className="mt-12 grid gap-x-8 gap-y-8 sm:grid-cols-2 md:mt-16 lg:grid-cols-3 lg:gap-y-12">
                {t.care.items.map((item) => (
                    <li key={item.title} className="border-t border-line-strong pt-5">
                        <h3 className="type-subheading">{item.title}</h3>
                        <p className="type-small mt-3 max-w-[22rem] text-fg-subtle">{item.text}</p>
                    </li>
                ))}
            </ul>
        </Section>
    );
}

/** Compromiso con el medio ambiente: texto y foto de carga lado a lado. */
export function AboutEnvironment({ t }: Props) {
    const [first, second] = t.environment.paragraphs;
    return (
        <Section tone="surface" aria-labelledby="medio-ambiente">
            <div className="grid gap-10 lg:grid-cols-12 lg:items-center lg:gap-8">
                <div className="lg:col-span-5">
                    <h2 id="medio-ambiente" className="type-title">
                        {t.environment.title}
                    </h2>
                    <p className="type-lead mt-6 text-fg-muted">{first}</p>
                    <p className="type-lead mt-5 text-fg-muted">{second}</p>
                </div>
                <Media
                    src={aboutImages.environment.src}
                    alt={t.environment.imageAlt}
                    position={aboutImages.environment.position}
                    sizes="(min-width: 1440px) 640px, (min-width: 1024px) 50vw, 100vw"
                    className="aspect-[4/3] lg:col-span-6 lg:col-start-7"
                />
            </div>
        </Section>
    );
}

/** Cierre: un solo llamado a cotizar (lleva al cotizador de /tarifas). */
export function AboutCta({ t, lang }: Props & { lang: Locale }) {
    return (
        <Section aria-labelledby="cotiza" space="lg">
            <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between md:gap-12">
                <div className="flex max-w-2xl flex-col gap-4">
                    <h2 id="cotiza" className="type-title">
                        {t.cta.title}
                    </h2>
                    <p className="type-lead text-fg-subtle">{t.cta.text}</p>
                </div>
                <Button size="lg" asChild className="self-start md:self-auto">
                    <Link href={localizedHref(lang, "pricing", "cotizar")}>{t.cta.action}</Link>
                </Button>
            </div>
        </Section>
    );
}
