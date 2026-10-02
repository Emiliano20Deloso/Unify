"use client";

import { useLanguage } from "@/contexts/language-context";
import { CheckIcon, ArrowRightIcon, BuildingIcon } from "lucide-react";
import Image from "next/image";
import { Button } from "../ui/button";
import { QuoteDialog } from "./quote-form";

const CorpCta = () => {
    const { t } = useLanguage();
    const c = t.corpCta;

    return (
        <section className="relative w-full min-h-screen flex items-end overflow-hidden">

            {/* Background image */}
            <div className="absolute inset-0 -z-10">
                <Image
                    src="/images/ejecutivo.jpg"
                    alt="UNIFY Corporate"
                    fill
                    className="object-cover object-center"
                    quality={90}
                />
                {/* Dark overlays — match hero (lighter on mobile so image shows) */}
                <div className="absolute inset-0 bg-gradient-to-r from-black/50 sm:from-black/70 via-black/20 sm:via-black/30 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/55 sm:from-black/70 via-black/5 sm:via-black/10 to-transparent" />
                {/* Subtle red glow accent */}
                <div className="absolute -top-20 -right-20 w-96 h-96 bg-[#FF2400]/10 blur-[120px] rounded-full pointer-events-none" />
            </div>

            {/* Content — bottom-left, hero style */}
            <div className="relative z-10 w-full px-5 sm:px-6 lg:px-20 xl:px-28 pb-8 sm:pb-28 lg:pb-40">
                <div className="max-w-3xl flex flex-col gap-2.5 sm:gap-6">

                    <div className="flex items-center gap-2 sm:gap-2.5">
                        <div className="flex items-center justify-center size-8 sm:size-10 rounded-lg bg-[#FF2400]/15 border border-[#FF2400]/25 backdrop-blur-sm">
                            <BuildingIcon className="size-4 sm:size-5 text-[#FF2400]" />
                        </div>
                        <p className="text-[10px] sm:text-sm uppercase tracking-[0.25em] sm:tracking-[0.3em] text-[#FF2400]/80 font-medium">
                            {c.label}
                        </p>
                    </div>

                    <h2 className="text-xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold !leading-[1.15] sm:!leading-[1.05] text-white tracking-tight">
                        {c.title}{" "}
                        <span className="italic font-light text-white/50">{c.titleHighlight}</span>
                    </h2>

                    <p className="max-w-xl text-xs sm:text-base lg:text-lg text-white/70 sm:text-white/60 leading-relaxed">
                        {c.desc}
                    </p>

                    {/* Points — compact 2-col grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5 sm:gap-y-3 mt-0 sm:mt-1 max-w-2xl">
                        {c.points.map((point, i) => (
                            <div key={i} className="flex items-start gap-2 sm:gap-2.5">
                                <div className="flex items-center justify-center size-4 sm:size-5 rounded-full bg-[#FF2400]/20 border border-[#FF2400]/30 shrink-0 mt-0.5 backdrop-blur-sm">
                                    <CheckIcon className="size-2.5 sm:size-3 text-[#FF2400]" />
                                </div>
                                <span className="text-xs sm:text-sm lg:text-base text-white/85 leading-snug">{point}</span>
                            </div>
                        ))}
                    </div>

                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-5 mt-1 sm:mt-3">
                        <QuoteDialog
                            initialTier="premium"
                            trigger={
                                <Button
                                    size="lg"
                                    className="group bg-[#ff3131] hover:bg-[#ff3131]/90 text-white border-0 text-sm sm:text-base px-6 sm:px-10 h-11 sm:h-14 rounded-full shadow-[0_0_50px_rgba(255,49,49,0.45)] hover:shadow-[0_0_70px_rgba(255,49,49,0.65)] transition-all duration-300"
                                >
                                    {c.cta}
                                    <ArrowRightIcon className="ml-2 size-4 sm:size-5 group-hover:translate-x-0.5 transition-transform duration-300" />
                                </Button>
                            }
                        />
                        <p className="text-[11px] sm:text-xs lg:text-sm text-white/60">{c.ctaSub}</p>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default CorpCta;
