"use client";

import { useLanguage } from "@/contexts/language-context";
import { useMobileMenu } from "@/contexts/mobile-menu-context";
import { cn } from "@/lib";
import { CheckIcon, ArrowRightIcon, BuildingIcon } from "lucide-react";
import { motion, type PanInfo } from "motion/react";
import Image from "next/image";
import { useState } from "react";
import { Button } from "../ui/button";
import { QuoteDialog } from "./quote-form";

const CorpCta = () => {
    const { t } = useLanguage();
    const { openMenu } = useMobileMenu();
    const c = t.corpCta;
    const [cardOpen, setCardOpen] = useState(false);

    return (
        <section className="relative w-full min-h-screen flex items-end overflow-hidden">

            {/* Background image */}
            <div className="absolute inset-0 -z-10">
                <Image
                    src="/images/ejecutivo.jpg"
                    alt="UNIFY Corporate"
                    fill
                    className="object-cover object-[54%_center] sm:object-center"
                    quality={90}
                />
                {/* Dark overlays — match hero (lighter on mobile so image shows) */}
                <div className="absolute inset-0 bg-gradient-to-r from-black/50 sm:from-black/70 via-black/20 sm:via-black/30 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/55 sm:from-black/70 via-black/5 sm:via-black/10 to-transparent" />
                {/* Subtle red glow accent */}
                <div className="absolute -top-20 -right-20 w-96 h-96 bg-[#FF2400]/10 blur-[120px] rounded-full pointer-events-none" />
            </div>

            {/* MOBILE — Title block at top, centered (matches other sections' format) */}
            <div className="sm:hidden absolute top-24 inset-x-0 px-5 z-10 text-center">
                <div
                    className="inline-flex items-center px-4 py-1.5 bg-white/10 backdrop-blur-md border border-white/25 rounded-full shadow-[0_4px_20px_rgba(0,0,0,0.15)]"
                    style={{ WebkitBackdropFilter: "blur(12px)" }}
                >
                    <p className="text-xs uppercase tracking-[0.3em] text-[#FF2400] font-semibold">
                        {c.label}
                    </p>
                </div>
                <h2 className="mt-4 text-3xl font-bold !leading-tight text-white">
                    {c.title} {c.titleHighlight}
                </h2>
            </div>

            {/* MOBILE — Slide card at bottom half with light liquid glass */}
            <motion.div
                initial={false}
                animate={{ y: cardOpen ? 0 : "82%" }}
                transition={{ type: "spring", stiffness: 200, damping: 32 }}
                onPanEnd={(_, info: PanInfo) => {
                    if (info.offset.y > 60) setCardOpen(false);
                    else if (info.offset.y < -60) setCardOpen(true);
                }}
                className="sm:hidden absolute inset-x-0 bottom-0 h-[45vh] bg-white/10 backdrop-blur-sm border-t border-white/20 rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.3)] z-10 touch-pan-y flex flex-col"
                style={{ WebkitBackdropFilter: "blur(8px)" }}
            >
                {/* Line handle (swipe up to open) */}
                <button
                    onClick={() => setCardOpen(!cardOpen)}
                    aria-label={cardOpen ? "Ocultar detalles" : "Mostrar detalles"}
                    className="w-full flex justify-center items-center pt-3 pb-2 active:scale-95 transition-transform"
                >
                    <span className={cn(
                        "w-10 h-1 rounded-full transition-colors duration-300",
                        cardOpen ? "bg-white/50" : "bg-white/70"
                    )} />
                </button>

                {/* Content — hidden when closed, organized when open */}
                <div className={cn(
                    "flex-1 min-h-0 px-6 pb-7 pt-2 flex flex-col transition-opacity duration-300 overflow-y-auto",
                    cardOpen ? "opacity-100" : "opacity-0"
                )}>
                    {/* Description */}
                    <p className="text-base text-white/90 leading-relaxed">
                        {c.desc}
                    </p>

                    {/* Points list */}
                    <div className="mt-5 flex flex-col gap-2.5">
                        {c.points.map((point, i) => (
                            <div key={i} className="flex items-start gap-2.5">
                                <div className="flex items-center justify-center size-4 rounded-full bg-[#FF2400]/25 border border-[#FF2400]/40 shrink-0 mt-0.5">
                                    <CheckIcon className="size-2.5 text-[#FF2400]" />
                                </div>
                                <span className="text-sm text-white/90 leading-snug">{point}</span>
                            </div>
                        ))}
                    </div>

                    {/* CTA centered, lifted off bottom — opens mobile quote menu */}
                    <div className="mt-auto pt-6 pb-6 flex flex-col items-center gap-2">
                        <Button
                            size="lg"
                            onClick={openMenu}
                            className="group bg-[#ff3131] hover:bg-[#ff3131]/90 text-white border-0 text-sm px-7 h-11 rounded-full shadow-[0_0_30px_rgba(255,49,49,0.45)]"
                        >
                            {c.cta}
                            <ArrowRightIcon className="ml-2 size-4" />
                        </Button>
                        <p className="text-[11px] text-white/70 text-center">{c.ctaSub}</p>
                    </div>
                </div>
            </motion.div>

            {/* DESKTOP — original content layout (unchanged) */}
            <div className="hidden sm:block relative z-10 w-full sm:px-6 lg:px-20 xl:px-28 sm:pb-28 lg:pb-40">
                <div className="max-w-3xl flex flex-col gap-6">

                    <div className="flex items-center gap-2.5">
                        <div className="flex items-center justify-center size-10 rounded-lg bg-[#FF2400]/15 border border-[#FF2400]/25 backdrop-blur-sm">
                            <BuildingIcon className="size-5 text-[#FF2400]" />
                        </div>
                        <p className="text-sm uppercase tracking-[0.3em] text-[#FF2400]/80 font-medium">
                            {c.label}
                        </p>
                    </div>

                    <h2 className="text-5xl lg:text-6xl xl:text-7xl font-bold !leading-[1.05] text-white tracking-tight">
                        {c.title}{" "}
                        <span className="italic font-light text-white/50">{c.titleHighlight}</span>
                    </h2>

                    <p className="max-w-xl text-base lg:text-lg text-white/60 leading-relaxed">
                        {c.desc}
                    </p>

                    <div className="grid grid-cols-2 gap-x-6 gap-y-3 mt-1 max-w-2xl">
                        {c.points.map((point, i) => (
                            <div key={i} className="flex items-start gap-2.5">
                                <div className="flex items-center justify-center size-5 rounded-full bg-[#FF2400]/20 border border-[#FF2400]/30 shrink-0 mt-0.5 backdrop-blur-sm">
                                    <CheckIcon className="size-3 text-[#FF2400]" />
                                </div>
                                <span className="text-sm lg:text-base text-white/85 leading-snug">{point}</span>
                            </div>
                        ))}
                    </div>

                    <div className="flex flex-row items-center gap-5 mt-3">
                        <QuoteDialog
                            initialTier="premium"
                            trigger={
                                <Button
                                    size="lg"
                                    className="group bg-[#ff3131] hover:bg-[#ff3131]/90 text-white border-0 text-base px-10 h-14 rounded-full shadow-[0_0_50px_rgba(255,49,49,0.45)] hover:shadow-[0_0_70px_rgba(255,49,49,0.65)] transition-all duration-300"
                                >
                                    {c.cta}
                                    <ArrowRightIcon className="ml-2 size-5 group-hover:translate-x-0.5 transition-transform duration-300" />
                                </Button>
                            }
                        />
                        <p className="text-xs lg:text-sm text-white/60">{c.ctaSub}</p>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default CorpCta;
