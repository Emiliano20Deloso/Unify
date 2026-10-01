"use client";

import { useLanguage } from "@/contexts/language-context";
import { cn } from "@/lib";
import Image from "next/image";
import type { CSSProperties, MouseEvent as ReactMouseEvent } from "react";
import Container from "../global/container";

const FEATURES_META = [
    { image: "/images/Model3_56.jpg" },
    { image: "/images/sentinel.jpg" },
    { image: "/images/infoenter.jpg" },
    { image: "/images/interior.jpg" },
    { image: "/images/priv2.jpg" },
];

const handleGridMouseMove = (e: ReactMouseEvent<HTMLDivElement>) => {
    const cards = e.currentTarget.querySelectorAll<HTMLDivElement>("[data-feature-card]");
    cards.forEach((card) => {
        const rect = card.getBoundingClientRect();
        card.style.setProperty("--mx", `${e.clientX - rect.left}px`);
        card.style.setProperty("--my", `${e.clientY - rect.top}px`);
    });
};

const Features = () => {
    const { t } = useLanguage();

    return (
        <div className="relative flex flex-col items-center justify-center w-full max-w-screen-xl mx-auto py-14">
            <Container>
                <div className="flex flex-col items-center text-center gap-3 mx-auto mb-10">
                    <p className="text-xs uppercase tracking-[0.3em] text-[#FF2400]/70 font-medium">
                        {t.features.label}
                    </p>
                    <h2 className="text-3xl lg:text-5xl font-bold !leading-tight text-white whitespace-nowrap">
                        {t.features.title}{" "}
                        <span className="italic font-light text-white/50">{t.features.titleHighlight}</span>{" "}
                        {t.features.titleEnd}
                    </h2>
                </div>
            </Container>

            <div
                onMouseMove={handleGridMouseMove}
                className="group/grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 lg:grid-rows-2 gap-4 w-full lg:min-h-[620px]"
            >
                {t.features.items.map((item, index) => {
                    const meta = FEATURES_META[index];
                    const isHero = index === 0;

                    return (
                        <Container
                            key={item.title}
                            delay={0.1 + index * 0.08}
                            className={cn(
                                "relative",
                                isHero && "lg:row-span-2",
                            )}
                        >
                            <div
                                data-feature-card
                                style={{ "--mx": "-9999px", "--my": "-9999px" } as CSSProperties}
                                className="relative h-full min-h-[260px] overflow-hidden rounded-2xl lg:rounded-3xl border border-white/10 group/card transition-colors duration-300"
                            >
                                {/* Background image — fills card like hero */}
                                <Image
                                    src={meta.image}
                                    alt={item.title}
                                    fill
                                    className="object-cover object-center brightness-110 saturate-105"
                                    quality={85}
                                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                />

                                {/* Softer overlays to let image glow through */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                                <div className="absolute inset-0 bg-gradient-to-br from-black/20 via-transparent to-transparent" />

                                {/* Content — bottom-left (hero style) */}
                                <div className="relative z-10 flex flex-col justify-end h-full p-6 lg:p-8 gap-3">
                                    <h3 className={cn(
                                        "font-bold text-white leading-tight tracking-tight",
                                        isHero ? "text-2xl lg:text-4xl xl:text-5xl" : "text-lg lg:text-2xl"
                                    )}>
                                        {item.title}
                                    </h3>
                                    <p className={cn(
                                        "text-white/75 leading-relaxed",
                                        isHero ? "text-sm lg:text-base max-w-md" : "text-sm max-w-xs"
                                    )}>
                                        {item.description}
                                    </p>
                                </div>

                                {/* Cursor-following red border glow — illuminates border where cursor is near, spills across adjacent cards */}
                                <div
                                    className="pointer-events-none absolute inset-0 rounded-2xl lg:rounded-3xl opacity-0 group-hover/grid:opacity-100 transition-opacity duration-150 z-20"
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
                        </Container>
                    );
                })}
            </div>
        </div>
    );
};

export default Features;
