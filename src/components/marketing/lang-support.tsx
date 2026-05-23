"use client";

import { useLanguage } from "@/contexts/language-context";
import Container from "../global/container";

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
                {/* Connector line between step circles */}
                <div className="hidden md:block absolute top-[4rem] left-[calc(16.66%+2.5rem)] right-[calc(16.66%+2.5rem)] h-px z-0 bg-gradient-to-r from-[#FF2400]/30 via-[#FF2400]/15 to-[#FF2400]/30" />

                {t.howItWorks.steps.map((step, idx) => (
                    <Container key={step.number} delay={0.15 + idx * 0.12}>
                        <div className="relative flex flex-col items-center text-center gap-6 p-8 rounded-2xl bg-[#0a0a0a] border border-white/5 hover:border-[#FF2400]/20 transition-all duration-300 z-10 overflow-hidden group">
                            {/* Decorative background number */}
                            <span className="absolute bottom-2 right-4 text-[80px] font-black text-white/[0.035] leading-none select-none pointer-events-none group-hover:text-[#FF2400]/[0.06] transition-colors duration-500">
                                {String(idx + 1).padStart(2, "0")}
                            </span>

                            {/* Step circle */}
                            <div className="relative flex items-center justify-center size-16 rounded-full bg-gradient-to-b from-[#FF2400]/15 to-[#FF2400]/5 border border-[#FF2400]/30 group-hover:border-[#FF2400]/50 transition-colors duration-300 shrink-0 z-10">
                                <span className="text-xl font-black text-white">{idx + 1}</span>
                            </div>

                            {/* Content */}
                            <div className="space-y-2 relative z-10">
                                <h3 className="text-base font-semibold text-white">{step.title}</h3>
                                <p className="text-sm text-white/40 leading-relaxed">{step.desc}</p>
                            </div>
                        </div>
                    </Container>
                ))}
            </div>
        </div>
    );
};

export default LanguageSupport;
