"use client";

import { useLanguage } from "@/contexts/language-context";
import { Sparkles, CupSoda, CarFront, SmilePlus } from "lucide-react";
import Container from "../global/container";
import { Button } from "../ui/button";
import { MagicCard } from "../ui/magic-card";

const Analysis = () => {
    const { t } = useLanguage();
    const { card1, card2 } = t.analysis;

    return (
        <div id="servicios" className="relative flex flex-col items-center justify-center w-full py-24">
            <Container>
                <div className="flex flex-col items-center text-center gap-3 max-w-3xl mx-auto mb-14">
                    <p className="text-xs uppercase tracking-[0.3em] text-[#FF2400]/70 font-medium">
                        {t.analysis.label}
                    </p>
                    <h2 className="text-3xl md:text-5xl font-bold !leading-tight text-white">
                        {t.analysis.title}{" "}
                        <span className="italic font-light text-white/50">{t.analysis.titleHighlight}</span>{" "}
                        {t.analysis.titleEnd}
                    </h2>
                </div>
            </Container>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 w-full">

                {/* Card 1 */}
                <Container delay={0.15}>
                    <div className="rounded-2xl bg-[#0a0a0a] border border-[#FF2400]/15 h-full">
                        <MagicCard
                            gradientFrom="#FF2400"
                            gradientTo="#ff3131"
                            gradientColor="rgba(255,49,49,0.07)"
                            className="p-6 lg:p-8 w-full overflow-hidden rounded-2xl"
                        >
                            <div className="absolute bottom-0 right-0 bg-[#FF2400] w-1/4 h-1/4 blur-[8rem] opacity-20 pointer-events-none" />
                            <div className="space-y-5">
                                <h3 className="text-lg font-semibold text-white">{card1.title}</h3>
                                <p className="text-sm text-white/40 leading-relaxed">{card1.desc}</p>
                                <div className="flex items-start justify-between">
                                    <div>
                                        <div className="text-3xl font-bold text-white">{card1.metric}</div>
                                        <div className="text-sm text-green-400 flex items-center gap-1.5 mt-1.5">
                                            <SmilePlus className="size-4" />
                                            {card1.metricSub}
                                        </div>
                                    </div>
                                    <Button size="icon" variant="ghost" className="text-white/30">
                                        <CarFront className="size-5" />
                                    </Button>
                                </div>
                                <div className="space-y-1 pt-2">
                                    <div className="grid grid-cols-4 text-xs text-center text-white/30 py-2 border-b border-white/5">
                                        {card1.cols.map((c) => <div key={c}>{c}</div>)}
                                    </div>
                                    {card1.rows.map((row, i) => (
                                        <div key={i} className="grid grid-cols-4 text-xs py-2.5 border-b border-white/5 last:border-0 text-white/60">
                                            {row.map((cell, j) => (
                                                <div key={j} className={j === 0 ? "font-medium" : "text-center"}>{cell}</div>
                                            ))}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </MagicCard>
                    </div>
                </Container>

                {/* Card 2 */}
                <Container delay={0.25}>
                    <div className="rounded-2xl bg-[#0a0a0a] border border-[#FF2400]/15 h-full">
                        <MagicCard
                            gradientFrom="#FF2400"
                            gradientTo="#ff3131"
                            gradientColor="rgba(255,49,49,0.07)"
                            className="p-6 lg:p-8 w-full overflow-hidden rounded-2xl"
                        >
                            <div className="absolute bottom-0 right-0 bg-[#FF2400] w-1/4 h-1/4 blur-[8rem] opacity-20 pointer-events-none" />
                            <div className="space-y-5">
                                <h3 className="text-lg font-semibold text-white">{card2.title}</h3>
                                <p className="text-sm text-white/40 leading-relaxed">{card2.desc}</p>
                                <div className="flex items-start justify-between">
                                    <div>
                                        <div className="text-3xl font-bold text-white">{card2.metric}</div>
                                        <div className="text-sm text-green-400 flex items-center gap-1.5 mt-1.5">
                                            <CupSoda className="size-4" />
                                            {card2.metricSub}
                                        </div>
                                    </div>
                                    <Button size="icon" variant="ghost" className="text-white/30">
                                        <Sparkles className="size-5" />
                                    </Button>
                                </div>
                                <div className="space-y-1 pt-2">
                                    <div className="grid grid-cols-4 text-xs text-white/30 py-2 border-b border-white/5">
                                        {card2.cols.map((c) => <div key={c}>{c}</div>)}
                                    </div>
                                    {card2.rows.map((row, i) => (
                                        <div key={i} className="grid grid-cols-4 text-xs py-2.5 border-b border-white/5 last:border-0 text-white/60">
                                            <div className="font-semibold text-[#FF2400]/80">{row[0]}</div>
                                            <div>{row[1]}</div>
                                            <div>{row[2]}</div>
                                            <div>{row[3]}</div>
                                        </div>
                                    ))}
                                    <p className="text-xs text-white/20 pt-2">{card2.disclaimer}</p>
                                </div>
                            </div>
                        </MagicCard>
                    </div>
                </Container>
            </div>
        </div>
    );
};

export default Analysis;
