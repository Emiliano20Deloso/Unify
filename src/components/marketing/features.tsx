"use client";

import { useLanguage } from "@/contexts/language-context";
import { cn } from "@/lib";
import Image from "next/image";
import Container from "../global/container";
import { MagicCard } from "../ui/magic-card";

const FEATURES_META = [
    { image: "/images/interior.jpg" },
    { image: "/images/sentinel.jpg" },
    { image: "/images/infoenter.jpg" },
    { image: "/images/tarifa.jpg" },
    { image: "/images/priv2.jpg" },
];

const Features = () => {
    const { t } = useLanguage();

    return (
        <div className="relative flex flex-col items-center justify-center w-full py-24">
            <Container>
                <div className="flex flex-col items-center text-center gap-3 max-w-2xl mx-auto mb-14">
                    <p className="text-xs uppercase tracking-[0.3em] text-[#FF2400]/70 font-medium">
                        {t.features.label}
                    </p>
                    <h2 className="text-3xl lg:text-5xl font-bold !leading-tight text-white">
                        {t.features.title}{" "}
                        <span className="italic font-light text-white/50">{t.features.titleHighlight}</span>{" "}
                        {t.features.titleEnd}
                    </h2>
                </div>
            </Container>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 w-full">
                {t.features.items.map((item, index) => {
                    const meta = FEATURES_META[index];
                    const isWide = index === 3;

                    return (
                        <Container
                            key={item.title}
                            delay={0.1 + index * 0.08}
                            className={cn(
                                "relative flex flex-col rounded-2xl lg:rounded-3xl bg-[#0a0a0a] border border-white/5 hover:border-[#FF2400]/30 transition-all duration-300",
                                isWide && "lg:col-span-2",
                                index === 2 && "md:col-span-2 lg:col-span-1",
                            )}
                        >
                            <MagicCard
                                gradientFrom="#FF2400"
                                gradientTo="#ff3131"
                                className={cn("lg:rounded-3xl", isWide ? "p-0" : "p-5 lg:p-7")}
                                gradientColor="rgba(255,49,49,0.06)"
                            >
                                {isWide ? (
                                    /* Wide card — split: text left / route visual right */
                                    <div className="flex flex-col sm:flex-row min-h-[220px]">

                                        {/* Left: text */}
                                        <div className="flex flex-col justify-between gap-5 p-6 lg:p-8 flex-1">
                                            <div>
                                                <span className="text-[10px] font-bold tracking-[0.25em] text-[#FF2400]/50 uppercase block mb-1.5">
                                                    {String(index + 1).padStart(2, "0")}
                                                </span>
                                                <h3 className="text-base font-semibold text-white">{item.title}</h3>
                                            </div>

                                            <p className="text-2xl lg:text-3xl font-bold text-white leading-snug">
                                                Sabes exactamente{" "}
                                                <span className="text-[#FF2400]">cuánto pagas</span>{" "}
                                                antes de subir.
                                            </p>

                                            <div className="flex flex-wrap gap-2">
                                                {["Sin recargos", "Tarifa fija", "Sin sorpresas"].map((tag) => (
                                                    <span key={tag} className="text-xs font-medium px-3 py-1 rounded-full border border-[#FF2400]/20 text-[#FF2400]/70 bg-[#FF2400]/5">
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Divider */}
                                        <div className="hidden sm:block w-px bg-white/5 my-6" />

                                        {/* Right: route visualization */}
                                        <div className="flex items-center justify-center p-6 lg:p-10 shrink-0 sm:w-[42%]">
                                            <div className="flex flex-col items-start gap-0 w-full max-w-[180px]">

                                                {/* Origin */}
                                                <div className="flex items-center gap-3">
                                                    <div className="size-3 rounded-full bg-white border-2 border-white/60 shrink-0" />
                                                    <div>
                                                        <p className="text-[10px] text-white/30 uppercase tracking-widest">Origen</p>
                                                        <p className="text-sm font-medium text-white/80">Tu ubicación</p>
                                                    </div>
                                                </div>

                                                {/* Dashed route line */}
                                                <div className="ml-[5px] flex flex-col gap-[5px] py-2.5">
                                                    {Array.from({ length: 5 }).map((_, i) => (
                                                        <div key={i} className="w-px h-2 bg-[#FF2400]/40 rounded-full" />
                                                    ))}
                                                </div>

                                                {/* Fare badge on line */}
                                                <div className="ml-6 -mt-1 mb-1 px-2.5 py-1 rounded-lg bg-[#FF2400]/10 border border-[#FF2400]/25 flex items-center gap-1.5">
                                                    <div className="size-1.5 rounded-full bg-[#FF2400] animate-pulse" />
                                                    <span className="text-xs font-semibold text-[#FF2400]">Tarifa confirmada</span>
                                                </div>

                                                {/* More dashes */}
                                                <div className="ml-[5px] flex flex-col gap-[5px] py-2.5">
                                                    {Array.from({ length: 5 }).map((_, i) => (
                                                        <div key={i} className="w-px h-2 bg-[#FF2400]/40 rounded-full" />
                                                    ))}
                                                </div>

                                                {/* Destination */}
                                                <div className="flex items-center gap-3">
                                                    <div className="size-3 rounded-full bg-[#FF2400] shrink-0" />
                                                    <div>
                                                        <p className="text-[10px] text-white/30 uppercase tracking-widest">Destino</p>
                                                        <p className="text-sm font-medium text-white/80">Tu llegada</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    /* Normal card — vertical layout */
                                    <>
                                        <div className="mb-4">
                                            <span className="text-[10px] font-bold tracking-[0.25em] text-[#FF2400]/50 uppercase block mb-2">
                                                {String(index + 1).padStart(2, "0")}
                                            </span>
                                            <h3 className="text-base font-semibold text-white">{item.title}</h3>
                                        </div>
                                        <p className="text-sm text-white/40 leading-relaxed">{item.description}</p>
                                        <div className="mt-6 w-full overflow-hidden rounded-xl">
                                            <Image
                                                src={meta.image}
                                                alt={item.title}
                                                width={500}
                                                height={300}
                                                className="w-full h-48 object-cover opacity-80 hover:opacity-100 transition-opacity duration-300"
                                            />
                                        </div>
                                    </>
                                )}
                            </MagicCard>
                        </Container>
                    );
                })}
            </div>
        </div>
    );
};

export default Features;
