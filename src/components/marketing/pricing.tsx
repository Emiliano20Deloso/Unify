"use client";

import { useLanguage } from "@/contexts/language-context";
import { cn } from "@/lib";
import { CheckIcon, ZapIcon, CupSodaIcon, CandyIcon, NutIcon } from "lucide-react";
import Container from "../global/container";
import { Button } from "../ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../ui/accordion";
import { QuoteDialog } from "./quote-form";

const TIER_KEYS = ["practico", "select", "premium"] as const;

const Pricing = () => {
    const { t } = useLanguage();

    return (
        <div id="servicios" className="relative flex flex-col items-center justify-center w-full py-24">
            <Container>
                <div className="flex flex-col items-center text-center gap-3 max-w-2xl mx-auto mb-14">
                    <p className="text-xs uppercase tracking-[0.3em] text-[#FF2400]/70 font-medium">
                        {t.pricing.label}
                    </p>
                    <h2 className="text-3xl lg:text-5xl font-bold !leading-tight text-white">
                        {t.pricing.title}{" "}
                        <span className="italic font-light text-white/50">{t.pricing.titleHighlight}</span>
                    </h2>
                    <p className="text-white/40 text-base max-w-lg">{t.pricing.subtitle}</p>
                </div>
            </Container>

            <div className="grid w-full grid-cols-1 lg:grid-cols-3 gap-5 max-w-5xl mx-auto">
                {t.pricing.tiers.map((tier, idx) => (
                    <Container key={tier.id} delay={0.1 * idx + 0.1}>
                        <div
                            className={cn(
                                "relative flex flex-col rounded-2xl border overflow-hidden h-full transition-all duration-300",
                                tier.badge
                                    ? "border-[#FF2400]/50 bg-[#0f0000]"
                                    : "border-white/8 bg-[#0a0a0a] hover:border-white/15"
                            )}
                        >
                            {tier.badge && (
                                <>
                                    <div className="absolute inset-0 bg-[#FF2400]/5 pointer-events-none" />
                                    <div className="absolute -top-px inset-x-0 h-px bg-gradient-to-r from-transparent via-[#FF2400] to-transparent" />
                                </>
                            )}

                            <div className="p-7 flex-1 flex flex-col">
                                {/* Header */}
                                <div className="flex items-start justify-between mb-2">
                                    <h3 className="text-xl font-bold text-white">{tier.title}</h3>
                                    {tier.badge && (
                                        <span className="flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-[#FF2400]/15 text-[#FF2400] border border-[#FF2400]/25 whitespace-nowrap">
                                            <ZapIcon className="size-3" />
                                            {t.pricing.mostPopular}
                                        </span>
                                    )}
                                </div>

                                {/* Price */}
                                <div className="mb-4">
                                    <span className="text-3xl font-bold text-white">{tier.fromPrice}</span>
                                    <span className="ml-1.5 text-xs text-white/30">MXN</span>
                                    <p className="text-xs text-white/25 mt-0.5">{t.pricing.fromPriceNote}</p>
                                </div>

                                {/* Description */}
                                <p className="text-sm text-white/40 leading-relaxed mb-5">
                                    {tier.desc}
                                </p>

                                {/* Features */}
                                <div className="space-y-2.5 flex-1">
                                    {tier.features.map((f, i) => (
                                        <div key={i} className="flex items-center gap-2.5">
                                            <div className={cn(
                                                "flex items-center justify-center size-4 rounded-full shrink-0",
                                                tier.badge ? "bg-[#FF2400]/20" : "bg-white/5"
                                            )}>
                                                <CheckIcon className={cn(
                                                    "size-2.5",
                                                    tier.badge ? "text-[#FF2400]" : "text-white/50"
                                                )} />
                                            </div>
                                            <span className="text-sm text-white/60">{f}</span>
                                        </div>
                                    ))}
                                </div>

                                {/* Snacks accordion */}
                                <Accordion type="single" collapsible className="mt-4">
                                    <AccordionItem
                                        value="snacks"
                                        className={cn(
                                            "border-t",
                                            tier.badge ? "border-[#FF2400]/15" : "border-white/8"
                                        )}
                                    >
                                        <AccordionTrigger className="text-xs text-white/35 hover:text-white/60 py-3 hover:no-underline transition-colors">
                                            {t.pricing.snacksLabel}
                                        </AccordionTrigger>
                                        <AccordionContent className="pb-1">
                                            <div className="space-y-2">
                                                <SnackRow icon={<CupSodaIcon className="size-3 text-white/30" />} value={tier.snacks.drink} />
                                                <SnackRow icon={<CandyIcon className="size-3 text-white/30" />} value={tier.snacks.sweet} />
                                                <SnackRow icon={<NutIcon className="size-3 text-white/30" />} value={tier.snacks.savory} />
                                                <p className="text-[10px] text-white/20 pt-1">{t.pricing.snacksDisclaimer}</p>
                                            </div>
                                        </AccordionContent>
                                    </AccordionItem>
                                </Accordion>
                            </div>

                            {/* CTA */}
                            <div className="p-7 pt-0">
                                <QuoteDialog
                                    initialTier={TIER_KEYS[idx]}
                                    trigger={
                                        <Button
                                            size="lg"
                                            className={cn(
                                                "w-full h-12 rounded-xl font-medium transition-all duration-300",
                                                tier.badge
                                                    ? "bg-[#ff3131] hover:bg-[#ff3131]/90 text-white shadow-[0_0_30px_rgba(255,49,49,0.35)] hover:shadow-[0_0_50px_rgba(255,49,49,0.5)]"
                                                    : "bg-white/5 hover:bg-white/10 text-white border border-white/10"
                                            )}
                                        >
                                            {t.pricing.cta}
                                        </Button>
                                    }
                                />
                            </div>
                        </div>
                    </Container>
                ))}
            </div>
        </div>
    );
};

const SnackRow = ({ icon, value }: { icon: React.ReactNode; value: string }) => (
    <div className="flex items-center gap-2">
        {icon}
        <span className="text-xs text-white/45">{value}</span>
    </div>
);

export default Pricing;
