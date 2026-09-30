"use client";

import { useLanguage } from "@/contexts/language-context";
import { CheckIcon, ArrowRightIcon, BuildingIcon } from "lucide-react";
import Image from "next/image";
import Container from "../global/container";
import { Button } from "../ui/button";
import { QuoteDialog } from "./quote-form";

const CorpCta = () => {
    const { t } = useLanguage();
    const c = t.corpCta;

    return (
        <div className="relative flex flex-col items-center justify-center w-full py-24">
            <Container className="w-full">
                <div className="relative rounded-2xl lg:rounded-3xl border border-white/8 bg-[#0a0a0a] overflow-hidden">
                    <div className="grid lg:grid-cols-2 min-h-[520px]">

                        {/* Left: content */}
                        <div className="relative z-10 flex flex-col gap-5 p-8 lg:p-12 order-2 lg:order-1">
                            <div className="flex items-center gap-2.5">
                                <div className="flex items-center justify-center size-8 rounded-lg bg-[#FF2400]/10 border border-[#FF2400]/20">
                                    <BuildingIcon className="size-4 text-[#FF2400]" />
                                </div>
                                <p className="text-xs uppercase tracking-[0.3em] text-[#FF2400]/70 font-medium">
                                    {c.label}
                                </p>
                            </div>

                            <h2 className="text-3xl lg:text-4xl font-bold !leading-tight text-white">
                                {c.title}{" "}
                                <span className="italic font-light text-white/50">{c.titleHighlight}</span>
                            </h2>

                            <p className="text-sm text-white/75 leading-relaxed max-w-lg">
                                {c.desc}
                            </p>

                            {/* Points — compact 2-col grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-2.5 mt-1">
                                {c.points.map((point, i) => (
                                    <div key={i} className="flex items-start gap-2.5">
                                        <div className="flex items-center justify-center size-5 rounded-full bg-[#FF2400]/15 border border-[#FF2400]/25 shrink-0 mt-0.5">
                                            <CheckIcon className="size-3 text-[#FF2400]" />
                                        </div>
                                        <span className="text-sm text-white/85 leading-snug">{point}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mt-3">
                                <QuoteDialog
                                    initialTier="premium"
                                    trigger={
                                        <Button className="group bg-[#FF2400] hover:bg-[#FF2400]/90 text-white rounded-full px-8 h-12 text-sm font-medium shadow-[0_0_30px_rgba(255,49,49,0.3)] hover:shadow-[0_0_50px_rgba(255,49,49,0.45)] transition-all duration-300">
                                            {c.cta}
                                            <ArrowRightIcon className="ml-2 size-4 group-hover:translate-x-0.5 transition-transform" />
                                        </Button>
                                    }
                                />
                                <p className="text-xs text-white/55">{c.ctaSub}</p>
                            </div>
                        </div>

                        {/* Right: image with gradient fade into card */}
                        <div className="relative min-h-[280px] lg:min-h-full order-1 lg:order-2">
                            <Image
                                src="/images/ejecutivo.jpg"
                                alt="UNIFY Corporate"
                                fill
                                className="object-cover object-center"
                                quality={85}
                                sizes="(max-width: 1024px) 100vw, 50vw"
                            />
                            {/* Gradient overlay — fades into card bg from left (desktop) and bottom (mobile) */}
                            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#0a0a0a] lg:bg-gradient-to-r lg:from-[#0a0a0a] lg:via-[#0a0a0a]/30 lg:to-transparent pointer-events-none" />
                            {/* Subtle red glow accent */}
                            <div className="absolute -top-20 -right-20 w-80 h-80 bg-[#FF2400]/10 blur-[100px] rounded-full pointer-events-none" />
                        </div>

                    </div>
                </div>
            </Container>
        </div>
    );
};

export default CorpCta;
