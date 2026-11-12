import { Reveal, RevealGroup } from "@/components/motion";
import { Media, Section } from "@/components/ui";
import { photos } from "@/content";
import type { HomeDictionary } from "@/i18n/types";

interface ExperienceProps {
    t: HomeDictionary["experience"];
}

/** "La experiencia a bordo": ventajas reales (Nosotros.md) junto a dos fotos de interiores. */
export function Experience({ t }: ExperienceProps) {
    return (
        <Section aria-labelledby="experiencia">
            <div className="grid gap-12 lg:grid-cols-12 lg:items-center lg:gap-16">
                {/* Texto: el título lidera, el párrafo lo sigue y las ventajas caen en escalonado corto. */}
                <RevealGroup className="lg:col-span-5">
                    <Reveal as="h2" variant="title" index={0} id="experiencia" className="type-title">
                        {t.title}
                    </Reveal>
                    <Reveal as="p" variant="text" index={1} className="type-lead mt-5 max-w-[34rem] text-fg-subtle">
                        {t.text}
                    </Reveal>
                    <dl className="mt-10 grid border-t border-line sm:grid-cols-2 sm:gap-x-10 lg:grid-cols-1">
                        {t.items.map((item, i) => (
                            <Reveal key={item.title} variant="item" index={i + 2} className="border-b border-line py-5">
                                <dt className="font-medium">{item.title}</dt>
                                <dd className="type-small mt-1.5 text-fg-subtle">{item.text}</dd>
                            </Reveal>
                        ))}
                    </dl>
                </RevealGroup>
                {/* Fotos: se funden y su encuadre se asienta dentro del marco; la de detalle llega después. */}
                <RevealGroup className="grid grid-cols-5 items-start gap-4 lg:col-span-7 lg:gap-6">
                    <Reveal variant="media" index={0} className="col-span-3">
                        <Media
                            src={photos.homeExperienceMain}
                            alt={t.images.main}
                            position="28% 50%"
                            sizes="(min-width: 1280px) 440px, (min-width: 1024px) 34vw, 60vw"
                            className="aspect-[3/4]"
                        />
                    </Reveal>
                    <Reveal variant="media" index={2} className="col-span-2 mt-16 lg:mt-32">
                        <Media
                            src={photos.homeExperienceDetail}
                            alt={t.images.detail}
                            position="50% 40%"
                            sizes="(min-width: 1280px) 290px, (min-width: 1024px) 23vw, 40vw"
                            className="aspect-[3/4]"
                        />
                    </Reveal>
                </RevealGroup>
            </div>
        </Section>
    );
}
