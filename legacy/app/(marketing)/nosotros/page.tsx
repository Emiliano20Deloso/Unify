"use client";

import Container from "@/components/global/container";
import { useLanguage } from "@/contexts/language-context";
import type { Lang } from "@/translations";
import Image from "next/image";
import type { CSSProperties, MouseEvent as ReactMouseEvent } from "react";

type Block =
    | { type: "p"; children: React.ReactNode }
    | { type: "ul"; items: React.ReactNode[] };

type Section = {
    id: string;
    title: string;
    blocks: Block[];
};

const SECTION_IMAGES: Record<string, { src: string; alt: string; side: "left" | "right" }> = {
    "por-que-tesla": { src: "/images/qs2.jpg", alt: "Tesla eléctrico — flota Unify", side: "right" },
    "como-te-cuidamos": { src: "/images/qs1.jpg", alt: "Cuidado del servicio Unify", side: "left" },
    "medio-ambiente": { src: "/images/qsoms.jpg", alt: "Compromiso con el medio ambiente", side: "right" },
};

const SECTIONS_ES: Section[] = [
    {
        id: "quienes-somos",
        title: "Quiénes somos",
        blocks: [
            { type: "p", children: "Somos dos hermanos que nos cansamos de lo mismo: cada vez que necesitábamos un traslado rápido y cómodo, nos recibían autos en pésimas condiciones y choferes poco capacitados. Un día nos preguntamos: ¿por qué tendríamos que conformarnos con un servicio cada vez peor y cada vez más caro?" },
            { type: "p", children: "No teníamos por qué. Así nació Unify: autos impecables, choferes profesionales y un servicio pensado para que tu tiempo en el camino valga la pena. Llevamos a viajeros, ejecutivos y a cualquiera que valore su tiempo, con la misma atención en un traslado al aeropuerto que en una noche especial." },
        ],
    },
    {
        id: "por-que-tesla",
        title: "Por qué Tesla",
        blocks: [
            { type: "p", children: "Elegimos operar exclusivamente con vehículos Tesla porque creemos que el lujo del futuro es silencioso, limpio e inteligente." },
            {
                type: "ul",
                items: [
                    <><strong className="text-white">Silencio a bordo.</strong> Sin motor de combustión, la cabina es un espacio tranquilo para conversar, hacer una llamada o descansar.</>,
                    <><strong className="text-white">Cero emisiones.</strong> Cada trayecto eléctrico es una forma de movernos por la ciudad sin contaminar el aire que todos respiramos.</>,
                    <><strong className="text-white">Confort y tecnología.</strong> Interiores amplios, clima personalizado y un andar suave, aun en el tráfico de la ciudad.</>,
                    <><strong className="text-white">Seguridad.</strong> Vehículos diseñados con altos estándares de seguridad y sistemas de asistencia al conductor.</>,
                ],
            },
        ],
    },
    {
        id: "como-te-cuidamos",
        title: "Cómo te cuidamos",
        blocks: [
            { type: "p", children: "El vehículo es solo una parte. Lo que hace diferente a Unify es la forma en que cuidamos cada detalle de tu viaje." },
            {
                type: "ul",
                items: [
                    <><strong className="text-white">Choferes profesionales.</strong> Seleccionados y capacitados por Unify, con verificación de antecedentes. Discretos, puntuales y atentos.</>,
                    <><strong className="text-white">Puntualidad.</strong> Llegamos antes de la hora acordada, para que tu agenda no dependa del tráfico.</>,
                    <><strong className="text-white">Vehículos impecables.</strong> Limpios y revisados antes de cada servicio.</>,
                    <><strong className="text-white">Privacidad.</strong> Lo que pasa en el vehículo se queda en el vehículo.</>,
                    <><strong className="text-white">Precio claro.</strong> Cotizas y reservas en línea, y sabes cuánto pagarás desde el inicio.</>,
                    <><strong className="text-white">Atención directa.</strong> Una persona real monitorea cada viaje, priorizando tu comodidad y seguridad en todo momento.</>,
                ],
            },
        ],
    },
    {
        id: "medio-ambiente",
        title: "Nuestro compromiso con el medio ambiente",
        blocks: [
            { type: "p", children: "Moverse por la ciudad no debería costarle al planeta. Por eso nuestra flota es 100 % eléctrica: ninguno de nuestros vehículos emite gases contaminantes por el escape, en una ciudad donde la calidad del aire nos afecta a todos." },
            { type: "p", children: "Con Unify no tienes que elegir entre viajar con lujo y cuidar el medio ambiente: cada viaje con nosotros es una forma más limpia de moverte por la Ciudad de México." },
        ],
    },
];

const SECTIONS_EN: Section[] = [
    {
        id: "quienes-somos",
        title: "Who we are",
        blocks: [
            { type: "p", children: "We are two brothers who got tired of the same thing: every time we needed a fast, comfortable ride, we were met with cars in terrible condition and poorly trained drivers. One day we asked ourselves: why should we settle for a worse and more expensive service?" },
            { type: "p", children: "We shouldn't. That's how Unify was born: impeccable cars, professional chauffeurs and a service designed so your time on the road is worth it. We transport travelers, executives and anyone who values their time, with the same attention on an airport transfer as on a special night out." },
        ],
    },
    {
        id: "por-que-tesla",
        title: "Why Tesla",
        blocks: [
            { type: "p", children: "We chose to operate exclusively with Tesla vehicles because we believe the luxury of the future is silent, clean and intelligent." },
            {
                type: "ul",
                items: [
                    <><strong className="text-white">Silence on board.</strong> Without a combustion engine, the cabin is a quiet space to talk, take a call or rest.</>,
                    <><strong className="text-white">Zero emissions.</strong> Every electric trip is a way to move around the city without polluting the air we all breathe.</>,
                    <><strong className="text-white">Comfort and technology.</strong> Spacious interiors, personalized climate control and smooth driving, even in city traffic.</>,
                    <><strong className="text-white">Safety.</strong> Vehicles designed with high safety standards and driver assistance systems.</>,
                ],
            },
        ],
    },
    {
        id: "como-te-cuidamos",
        title: "How we take care of you",
        blocks: [
            { type: "p", children: "The vehicle is only one part. What makes Unify different is how we take care of every detail of your trip." },
            {
                type: "ul",
                items: [
                    <><strong className="text-white">Professional chauffeurs.</strong> Selected and trained by Unify, with background checks. Discreet, punctual and attentive.</>,
                    <><strong className="text-white">Punctuality.</strong> We arrive before the agreed time, so your schedule doesn't depend on traffic.</>,
                    <><strong className="text-white">Impeccable vehicles.</strong> Clean and checked before every service.</>,
                    <><strong className="text-white">Privacy.</strong> What happens in the vehicle stays in the vehicle.</>,
                    <><strong className="text-white">Clear pricing.</strong> You quote and book online, and you know what you'll pay from the start.</>,
                    <><strong className="text-white">Direct attention.</strong> A real person monitors every trip, prioritizing your comfort and safety at all times.</>,
                ],
            },
        ],
    },
    {
        id: "medio-ambiente",
        title: "Our commitment to the environment",
        blocks: [
            { type: "p", children: "Moving around the city shouldn't cost the planet. That's why our fleet is 100% electric: none of our vehicles emit polluting exhaust gases, in a city where air quality affects us all." },
            { type: "p", children: "With Unify you don't have to choose between traveling with luxury and taking care of the environment: every trip with us is a cleaner way to move around Mexico City." },
        ],
    },
];

const COPY: Record<Lang, { title: string; subtitle: string }> = {
    es: {
        title: "Nosotros",
        subtitle: "El lujo del futuro: silencioso, limpio e inteligente.",
    },
    en: {
        title: "About",
        subtitle: "The luxury of the future: silent, clean and intelligent.",
    },
};

export default function NosotrosPage() {
    const { lang } = useLanguage();
    const sections = lang === "en" ? SECTIONS_EN : SECTIONS_ES;
    const copy = COPY[lang];

    return (
        <div className="min-h-screen bg-black">
            {/* Hero */}
            <section className="relative w-full min-h-screen flex items-end overflow-hidden">
                <Image
                    src="/images/qsms4.jpg"
                    alt="Flota Tesla — Unify"
                    fill
                    priority
                    quality={90}
                    className="object-cover object-center brightness-110 sm:brightness-150 saturate-110"
                    sizes="100vw"
                />
                {/* Gradient overlays for legibility */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />

                <div className="relative z-10 w-full px-6 md:px-12 lg:px-20 pb-10 md:pb-14">
                    <Container>
                        <div className="flex flex-col gap-3 max-w-2xl">
                            <h1 className="text-4xl lg:text-6xl font-bold text-white leading-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]">
                                {copy.title}
                            </h1>
                            <p className="text-white/90 text-base lg:text-lg max-w-lg leading-relaxed drop-shadow-[0_1px_4px_rgba(0,0,0,0.5)]">
                                {copy.subtitle}
                            </p>
                        </div>
                    </Container>
                </div>
            </section>

            {/* Content */}
            <div className="px-6 md:px-12 lg:px-20 py-20">
                <article className="max-w-5xl mx-auto flex flex-col gap-20">
                    {sections.map((section) => {
                        const image = SECTION_IMAGES[section.id];
                        const textBlock = (
                            <div>
                                <h2 className="text-2xl lg:text-3xl font-bold text-white leading-tight mb-5">
                                    {section.title}
                                </h2>
                                <div className="flex flex-col gap-4 text-white/70 text-[15px] leading-relaxed">
                                    {section.blocks.map((block, i) => (
                                        <BlockRenderer key={i} block={block} />
                                    ))}
                                </div>
                            </div>
                        );
                        return (
                            <section key={section.id} id={section.id} className="scroll-mt-28">
                                {image ? (
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
                                        <div className={image.side === "right" ? "lg:order-1" : "lg:order-2"}>
                                            {textBlock}
                                        </div>
                                        <div className={image.side === "right" ? "lg:order-2" : "lg:order-1"}>
                                            <ImageCard src={image.src} alt={image.alt} />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="max-w-3xl mx-auto text-center">{textBlock}</div>
                                )}
                            </section>
                        );
                    })}
                </article>
            </div>
        </div>
    );
}

function ImageCard({ src, alt }: { src: string; alt: string }) {
    const handleMouseMove = (e: ReactMouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        e.currentTarget.style.setProperty("--mx", `${e.clientX - rect.left}px`);
        e.currentTarget.style.setProperty("--my", `${e.clientY - rect.top}px`);
    };

    return (
        <div
            onMouseMove={handleMouseMove}
            style={{ "--mx": "-9999px", "--my": "-9999px" } as CSSProperties}
            className="group relative aspect-[4/3] w-full overflow-hidden rounded-2xl lg:rounded-3xl bg-[#0a0a0a] border border-white/10"
        >
            <Image
                src={src}
                alt={alt}
                fill
                quality={85}
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover brightness-110 saturate-105 transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

            {/* Cursor-following red border glow */}
            <div
                className="pointer-events-none absolute inset-0 rounded-2xl lg:rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-150 z-20"
                style={{
                    background: "radial-gradient(450px circle at var(--mx) var(--my), rgba(255, 36, 0, 1), transparent 70%)",
                    padding: "2px",
                    WebkitMask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
                    WebkitMaskComposite: "xor",
                    mask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
                    maskComposite: "exclude",
                }}
            />
        </div>
    );
}

function BlockRenderer({ block }: { block: Block }) {
    if (block.type === "p") {
        return <p>{block.children}</p>;
    }
    if (block.type === "ul") {
        return (
            <ul className="flex flex-col gap-2.5 pl-1">
                {block.items.map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                        <span className="mt-2 size-1 shrink-0 rounded-full bg-[#FF2400]" />
                        <span className="flex-1">{item}</span>
                    </li>
                ))}
            </ul>
        );
    }
    return null;
}
