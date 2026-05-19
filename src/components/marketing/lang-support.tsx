"use client";

import { useLanguage } from "@/contexts/language-context";
import { MessageCircleIcon, CarIcon, SparklesIcon } from "lucide-react";
import Container from "../global/container";

const STEP_ICONS = [MessageCircleIcon, CarIcon, SparklesIcon];

const LanguageSupport = () => {
    const { t } = useLanguage();

    return (
        <div className="relative flex flex-col items-center justify-center w-full py-24">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-[#FF2400]/5 blur-[100px] rounded-full pointer-events-none" />

            <Container>
                <div className="flex flex-col items-center text-center gap-3 max-w-2xl mx-auto mb-16">
                    <p className="text-xs uppercase tracking-[0.3em] text-[#FF2400]/70 font-medium">
                        {t.howItWorks.label}
                    </p>
                    <h2 className="text-3xl lg:text-5xl font-bold !leading-tight text-white">
                        {t.howItWorks.title}{" "}
                        <span className="italic font-light text-white/50">{t.howItWorks.titleHighlight}</span>
                    </h2>
                </div>
            </Container>

            <div className="relative grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl mx-auto">
                <div className="hidden md:block absolute top-12 left-[calc(16.66%+1rem)] right-[calc(16.66%+1rem)] h-px bg-gradient-to-r from-[#FF2400]/30 via-[#FF2400]/15 to-[#FF2400]/30 z-0" />

                {t.howItWorks.steps.map((step, idx) => {
                    const Icon = STEP_ICONS[idx];
                    return (
                        <Container key={step.number} delay={0.15 + idx * 0.12}>
                            <div className="relative flex flex-col items-center text-center gap-5 p-8 rounded-2xl bg-[#0a0a0a] border border-white/5 hover:border-[#FF2400]/20 transition-all duration-300 z-10">
                                <div className="relative">
                                    <div className="flex items-center justify-center size-14 rounded-2xl bg-[#FF2400]/10 border border-[#FF2400]/20">
                                        <Icon className="size-6 text-[#FF2400]" />
                                    </div>
                                    <span className="absolute -top-2 -right-2 text-xs font-bold text-[#FF2400]/60 bg-black px-1">
                                        {step.number}
                                    </span>
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-base font-semibold text-white">{step.title}</h3>
                                    <p className="text-sm text-white/40 leading-relaxed">{step.desc}</p>
                                </div>
                            </div>
                        </Container>
                    );
                })}
            </div>
        </div>
    );
};

export default LanguageSupport;
