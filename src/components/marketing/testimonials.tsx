"use client";

import { useLanguage } from "@/contexts/language-context";
import { StarIcon } from "lucide-react";
import Container from "../global/container";

const AVATAR_COLORS = [
    "from-[#FF2400]/30 to-[#7f0000]/20",
    "from-white/10 to-white/5",
    "from-[#FF2400]/20 to-[#FF2400]/5",
    "from-white/8 to-white/3",
];

const Testimonials = () => {
    const { t } = useLanguage();

    return (
        <div className="relative flex flex-col items-center justify-center w-full py-24">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[300px] bg-[#FF2400]/4 blur-[120px] rounded-full pointer-events-none" />

            <Container>
                <div className="flex flex-col items-center text-center gap-3 max-w-2xl mx-auto mb-14">
                    <p className="text-xs uppercase tracking-[0.3em] text-[#FF2400]/70 font-medium">
                        {t.testimonials.label}
                    </p>
                    <h2 className="text-3xl lg:text-5xl font-bold !leading-tight text-white">
                        {t.testimonials.title}{" "}
                        <span className="italic font-light text-white/50">{t.testimonials.titleHighlight}</span>
                    </h2>
                </div>
            </Container>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 w-full">
                {t.testimonials.items.map((item, idx) => (
                    <Container key={item.name} delay={0.1 + idx * 0.08}>
                        <div className="relative flex flex-col gap-4 p-6 rounded-2xl bg-[#0a0a0a] border border-white/5 hover:border-white/10 transition-all duration-300 h-full group">
                            {/* Subtle corner glow */}
                            <div className="absolute top-0 right-0 w-20 h-20 bg-[#FF2400]/5 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                            {/* Stars */}
                            <div className="flex items-center gap-0.5">
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <StarIcon key={i} className="size-3.5 text-[#FF2400] fill-[#FF2400]" />
                                ))}
                            </div>

                            {/* Quote */}
                            <p className="text-sm text-white/55 leading-relaxed flex-1">
                                &ldquo;{item.text}&rdquo;
                            </p>

                            {/* Author */}
                            <div className="flex items-center gap-3 pt-2 border-t border-white/5">
                                <div className={`size-9 rounded-full bg-gradient-to-br ${AVATAR_COLORS[idx]} flex items-center justify-center shrink-0`}>
                                    <span className="text-xs font-bold text-white/70">
                                        {item.name.split(" ").map(w => w[0]).join("")}
                                    </span>
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-white">{item.name}</p>
                                    <p className="text-xs text-white/35">{item.role}</p>
                                </div>
                            </div>
                        </div>
                    </Container>
                ))}
            </div>
        </div>
    );
};

export default Testimonials;
