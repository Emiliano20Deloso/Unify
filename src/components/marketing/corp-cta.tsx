"use client";

import { useLanguage } from "@/contexts/language-context";
import { CheckIcon, ArrowRightIcon, BuildingIcon } from "lucide-react";
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
                    {/* Grid pattern overlay */}
                    <div
                        className="absolute inset-0 opacity-[0.025] pointer-events-none"
                        style={{
                            backgroundImage: "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
                            backgroundSize: "48px 48px",
                        }}
                    />

                    {/* Subtle glow */}
                    <div className="absolute -top-1/2 left-1/4 w-64 h-64 bg-[#FF2400]/8 blur-[100px] rounded-full pointer-events-none" />

                    <div className="relative z-10 flex flex-col lg:flex-row items-start gap-10 lg:gap-16 p-8 lg:p-12">

                        {/* Left: text */}
                        <div className="flex-1 flex flex-col gap-5">
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

                            <p className="text-sm text-white/45 leading-relaxed max-w-lg">
                                {c.desc}
                            </p>

                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mt-2">
                                <QuoteDialog
                                    initialTier="premium"
                                    trigger={
                                        <Button className="group bg-[#FF2400] hover:bg-[#FF2400]/90 text-white rounded-full px-8 h-12 text-sm font-medium shadow-[0_0_30px_rgba(255,49,49,0.3)] hover:shadow-[0_0_50px_rgba(255,49,49,0.45)] transition-all duration-300">
                                            {c.cta}
                                            <ArrowRightIcon className="ml-2 size-4 group-hover:translate-x-0.5 transition-transform" />
                                        </Button>
                                    }
                                />
                                <p className="text-xs text-white/30">{c.ctaSub}</p>
                            </div>
                        </div>

                        {/* Right: bullet points */}
                        <div className="flex-1 grid grid-cols-1 gap-3 w-full lg:max-w-xs lg:pt-2">
                            {c.points.map((point, i) => (
                                <div key={i} className="flex items-start gap-3 p-4 rounded-xl bg-white/[0.03] border border-white/5">
                                    <div className="flex items-center justify-center size-5 rounded-full bg-[#FF2400]/15 border border-[#FF2400]/25 shrink-0 mt-0.5">
                                        <CheckIcon className="size-3 text-[#FF2400]" />
                                    </div>
                                    <span className="text-sm text-white/60 leading-snug">{point}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </Container>
        </div>
    );
};

export default CorpCta;
