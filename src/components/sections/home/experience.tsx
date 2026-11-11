import { interiorAsientosDelanteros, interiorTechoCristal } from "@/assets/images";
import { Media, Section } from "@/components/ui";
import type { HomeDictionary } from "@/i18n/types";

interface ExperienceProps {
    t: HomeDictionary["experience"];
}

/** "La experiencia a bordo": ventajas reales (Nosotros.md) junto a dos fotos de interiores. */
export function Experience({ t }: ExperienceProps) {
    return (
        <Section aria-labelledby="experiencia">
            <div className="grid gap-12 lg:grid-cols-12 lg:items-center lg:gap-16">
                <div className="lg:col-span-5">
                    <h2 id="experiencia" className="type-title">
                        {t.title}
                    </h2>
                    <p className="type-lead mt-5 max-w-[34rem] text-fg-subtle">{t.text}</p>
                    <dl className="mt-10 grid border-t border-line sm:grid-cols-2 sm:gap-x-10 lg:grid-cols-1">
                        {t.items.map((item) => (
                            <div key={item.title} className="border-b border-line py-5">
                                <dt className="font-medium">{item.title}</dt>
                                <dd className="type-small mt-1.5 text-fg-subtle">{item.text}</dd>
                            </div>
                        ))}
                    </dl>
                </div>
                <div className="grid grid-cols-5 items-start gap-4 lg:col-span-7 lg:gap-6">
                    <Media
                        src={interiorAsientosDelanteros}
                        alt={t.images.main}
                        position="28% 50%"
                        sizes="(min-width: 1280px) 440px, (min-width: 1024px) 34vw, 60vw"
                        className="col-span-3 aspect-[3/4]"
                    />
                    <Media
                        src={interiorTechoCristal}
                        alt={t.images.detail}
                        position="50% 40%"
                        sizes="(min-width: 1280px) 290px, (min-width: 1024px) 23vw, 40vw"
                        className="col-span-2 mt-16 aspect-[3/4] lg:mt-32"
                    />
                </div>
            </div>
        </Section>
    );
}
