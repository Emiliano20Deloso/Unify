// Secciones de /nosotros. Todo de servidor. Cada sección aparece al entrar en pantalla con un solo
// momento: el título lidera, las fotos se asientan en su marco y las listas caen escalonadas.
import Link from "next/link";
import { aboutImages } from "@/content";
import { Reveal, RevealGroup } from "@/components/motion";
import { Button, Container, Media, RouteLine, Section, SectionHeader } from "@/components/ui";
import type { Locale } from "@/i18n/config";
import { localizedHref } from "@/i18n/routes";
import type { AboutDictionary } from "@/i18n/types";

interface Props {
    t: AboutDictionary;
}

/** Portada a sangre (pedido de Nosotros.md): el menú transparente encima, texto al pie. Entra con data-enter. */
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
                fade
                sizes="100vw"
                preload
                enter
            />
            <Container className="relative pb-section-md pt-header">
                <h1 data-enter="1" className="type-display">
                    {t.title}
                </h1>
                <p data-enter="2" className="type-lead mt-5 max-w-[34rem] text-fg-soft">
                    {t.lead}
                </p>
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
            {/* El título lidera; el problema sube con el origen (●) y la respuesta llega con el destino (○). */}
            <RevealGroup className="grid gap-10 lg:grid-cols-12 lg:gap-8">
                <Reveal as="h2" variant="title" index={0} id="quienes-somos" className="type-title lg:col-span-4">
                    {t.story.title}
                </Reveal>
                <div className="flex gap-6 sm:gap-8 lg:col-span-7 lg:col-start-6">
                    <RouteLine orientation="vertical" draw className="mt-[0.55em] h-auto self-stretch" />
                    <div className="flex flex-col gap-10 md:gap-14">
                        <Reveal as="p" variant="text" index={1} className="type-lead max-w-[38rem] text-fg-muted">
                            {problem}
                        </Reveal>
                        <Reveal as="p" variant="text" index={1} delay={300} className="type-lead max-w-[38rem] text-fg">
                            {answer}
                        </Reveal>
                    </div>
                </div>
            </RevealGroup>
        </Section>
    );
}

/** Por qué Tesla: foto vertical y las cuatro razones en rejilla de 2 × 2. */
export function AboutTesla({ t }: Props) {
    return (
        <Section tone="surface" aria-labelledby="por-que-tesla">
            <div className="grid gap-10 lg:grid-cols-12 lg:items-center lg:gap-8">
                <Reveal variant="media" className="lg:col-span-5">
                    <Media
                        src={aboutImages.tesla.src}
                        alt={t.tesla.imageAlt}
                        position={aboutImages.tesla.position}
                        sizes="(min-width: 1440px) 520px, (min-width: 1024px) 40vw, 100vw"
                        className="aspect-[4/3] sm:aspect-[16/10] lg:aspect-[4/5]"
                    />
                </Reveal>
                <div className="lg:col-span-6 lg:col-start-7">
                    <SectionHeader id="por-que-tesla" title={t.tesla.title} text={t.tesla.text} className="md:mb-12" />
                    {/* Rejilla de 2 × 2: las razones entran en escalonado, con su filete. */}
                    <RevealGroup as="ul" className="grid gap-x-8 gap-y-8 sm:grid-cols-2 sm:gap-y-10">
                        {t.tesla.reasons.map((reason, i) => (
                            <Reveal as="li" variant="item" index={i} key={reason.title} className="border-t border-line-strong pt-5">
                                <h3 className="type-subheading">{reason.title}</h3>
                                <p className="type-small mt-3 text-fg-subtle">{reason.text}</p>
                            </Reveal>
                        ))}
                    </RevealGroup>
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
            <Reveal variant="media">
                <Media
                    src={aboutImages.care.src}
                    alt={t.care.imageAlt}
                    position={aboutImages.care.position}
                    sizes="(min-width: 1440px) 1280px, 92vw"
                    className="aspect-[4/3] md:aspect-[2/1]"
                />
            </Reveal>
            {/* Seis compromisos: escalonado corto (40 ms) para que la lista no haga esperar. */}
            <RevealGroup as="ul" className="mt-12 grid gap-x-8 gap-y-8 [--stagger:var(--stagger-tight)] sm:grid-cols-2 md:mt-16 lg:grid-cols-3 lg:gap-y-12">
                {t.care.items.map((item, i) => (
                    <Reveal as="li" variant="item" index={i} key={item.title} className="border-t border-line-strong pt-5">
                        <h3 className="type-subheading">{item.title}</h3>
                        <p className="type-small mt-3 max-w-[22rem] text-fg-subtle">{item.text}</p>
                    </Reveal>
                ))}
            </RevealGroup>
        </Section>
    );
}

/** Compromiso con el medio ambiente: texto y foto de carga lado a lado. */
export function AboutEnvironment({ t }: Props) {
    const [first, second] = t.environment.paragraphs;
    return (
        <Section tone="surface" aria-labelledby="medio-ambiente">
            <div className="grid gap-10 lg:grid-cols-12 lg:items-center lg:gap-8">
                <RevealGroup className="lg:col-span-5">
                    <Reveal as="h2" variant="title" index={0} id="medio-ambiente" className="type-title">
                        {t.environment.title}
                    </Reveal>
                    <Reveal as="p" variant="text" index={1} className="type-lead mt-6 text-fg-muted">
                        {first}
                    </Reveal>
                    <Reveal as="p" variant="text" index={2} className="type-lead mt-5 text-fg-muted">
                        {second}
                    </Reveal>
                </RevealGroup>
                <Reveal variant="media" index={1} className="lg:col-span-6 lg:col-start-7">
                    <Media
                        src={aboutImages.environment.src}
                        alt={t.environment.imageAlt}
                        position={aboutImages.environment.position}
                        sizes="(min-width: 1440px) 640px, (min-width: 1024px) 50vw, 100vw"
                        className="aspect-[4/3]"
                    />
                </Reveal>
            </div>
        </Section>
    );
}

/** Cierre: un solo llamado a cotizar (lleva al cotizador de /tarifas). */
export function AboutCta({ t, lang }: Props & { lang: Locale }) {
    return (
        <Section aria-labelledby="cotiza" space="lg">
            <RevealGroup className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between md:gap-12">
                <div className="flex max-w-2xl flex-col gap-4">
                    <Reveal as="h2" variant="title" index={0} id="cotiza" className="type-title">
                        {t.cta.title}
                    </Reveal>
                    <Reveal as="p" variant="text" index={1} className="type-lead text-fg-subtle">
                        {t.cta.text}
                    </Reveal>
                </div>
                {/* El botón (transición propia) va envuelto. */}
                <Reveal variant="text" index={2} className="self-start md:self-auto">
                    <Button size="lg" asChild>
                        <Link href={localizedHref(lang, "pricing", "cotizar")}>{t.cta.action}</Link>
                    </Button>
                </Reveal>
            </RevealGroup>
        </Section>
    );
}
