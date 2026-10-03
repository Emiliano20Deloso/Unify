"use client";

import { useLanguage } from "@/contexts/language-context";
import { cn } from "@/lib";
import { CheckIcon, ZapIcon, CupSodaIcon, CandyIcon, NutIcon } from "lucide-react";
import Container from "../global/container";
import { Button } from "../ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../ui/accordion";
import { QuoteDialog } from "./quote-form";

const TIER_KEYS = ["practico", "select", "premium"] as const;
type TierKey = typeof TIER_KEYS[number];

const TIER_THEMES: Record<TierKey, {
    container: string;
    glow: React.ReactNode;
    checkBg: string;
    checkIcon: string;
    accordionBorder: string;
    popularPill: string;
    cta: string;
}> = {
    practico: {
        container: "group border-white/30 bg-[#0a0a0a] hover:border-white/60",
        glow: null,
        checkBg: "bg-white/5",
        checkIcon: "text-white/70",
        accordionBorder: "border-white/8",
        popularPill: "bg-white/10 text-white/80 border-white/20",
        cta: "bg-white/5 hover:bg-white/10 text-white border border-white/10",
    },
    select: {
        container: "group border-white/30 bg-[#0a0a0a] hover:border-[#D4AF37]",
        glow: (
            <>
                <div className="absolute inset-0 bg-[#D4AF37]/[0.04] pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute -top-px inset-x-0 h-px bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </>
        ),
        checkBg: "bg-[#D4AF37]/20",
        checkIcon: "text-[#D4AF37]",
        accordionBorder: "border-[#D4AF37]/60",
        popularPill: "bg-[#D4AF37]/15 text-[#D4AF37] border-[#D4AF37]/30",
        cta: "bg-white/5 text-white border border-[#D4AF37]/30 hover:bg-[#D4AF37] hover:text-[#1a1206] hover:border-[#D4AF37] hover:shadow-[0_0_40px_rgba(212,175,55,0.45)]",
    },
    premium: {
        container: "group border-white/30 bg-[#0a0a0a] hover:border-[#FF2400]",
        glow: (
            <>
                <div className="absolute inset-0 bg-[#FF2400]/5 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute -top-px inset-x-0 h-px bg-gradient-to-r from-transparent via-[#FF2400] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </>
        ),
        checkBg: "bg-[#FF2400]/20",
        checkIcon: "text-[#FF2400]",
        accordionBorder: "border-[#FF2400]/60",
        popularPill: "bg-[#FF2400]/15 text-[#FF2400] border-[#FF2400]/25",
        cta: "bg-white/5 text-white border border-[#FF2400]/30 hover:bg-[#ff3131] hover:text-white hover:border-[#ff3131] hover:shadow-[0_0_40px_rgba(255,49,49,0.45)]",
    },
};

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
                    <p className="text-white/70 text-base max-w-lg">{t.pricing.subtitle}</p>
                </div>
            </Container>

            <div
                className="flex lg:grid items-stretch overflow-x-auto overflow-y-hidden lg:overflow-visible snap-x snap-mandatory lg:snap-none lg:grid-cols-3 gap-5 w-full lg:max-w-5xl lg:mx-auto px-4 lg:px-0 pb-4 lg:pb-0 [&::-webkit-scrollbar]:hidden touch-pan-x lg:touch-auto"
                style={{ scrollbarWidth: "none" }}
            >
                {t.pricing.tiers.map((tier, idx) => {
                    const tierKey = TIER_KEYS[idx];
                    const theme = TIER_THEMES[tierKey];
                    return (
                        <Container key={tier.id} delay={0.1 * idx + 0.1} className="snap-center shrink-0 w-[85%] lg:w-auto">
                            <div
                                className={cn(
                                    "relative flex flex-col rounded-2xl border overflow-hidden h-full min-h-[620px] lg:min-h-0 transition-all duration-300",
                                    theme.container
                                )}
                            >
                                {theme.glow}

                                <div className="p-7 flex-1 flex flex-col">
                                    {/* Header */}
                                    <div className="flex items-start justify-between mb-2">
                                        <h3 className="text-xl font-bold text-white">{tier.title}</h3>
                                        {tier.badge && (
                                            <span className={cn(
                                                "flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full border whitespace-nowrap",
                                                theme.popularPill
                                            )}>
                                                <ZapIcon className="size-3" />
                                                {t.pricing.mostPopular}
                                            </span>
                                        )}
                                    </div>

                                    {/* Price */}
                                    <div className="mb-4">
                                        <span className="text-3xl font-bold text-white">{tier.fromPrice}</span>
                                        <span className="ml-1.5 text-xs text-white/50">MXN</span>
                                        <p className="text-xs text-white/50 mt-0.5">{t.pricing.fromPriceNote}</p>
                                    </div>

                                    {/* Description */}
                                    <p className="text-sm text-white/70 leading-relaxed mb-5">
                                        {tier.desc}
                                    </p>

                                    {/* Features */}
                                    <div className="space-y-2.5 flex-1">
                                        {tier.features.map((f, i) => (
                                            <div key={i} className="flex items-center gap-2.5">
                                                <div className={cn(
                                                    "flex items-center justify-center size-4 rounded-full shrink-0",
                                                    theme.checkBg
                                                )}>
                                                    <CheckIcon className={cn("size-2.5", theme.checkIcon)} />
                                                </div>
                                                <span className="text-sm text-white/85">{f}</span>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Snacks accordion */}
                                    <Accordion type="single" collapsible className="mt-4">
                                        <AccordionItem
                                            value="snacks"
                                            className={cn("border-t", theme.accordionBorder)}
                                        >
                                            <AccordionTrigger className="text-xs text-white/60 hover:text-white/85 py-3 hover:no-underline transition-colors">
                                                {t.pricing.snacksLabel}
                                            </AccordionTrigger>
                                            <AccordionContent className="pb-1">
                                                <div className="space-y-2">
                                                    <SnackRow icon={<CupSodaIcon className="size-3 text-white/50" />} value={tier.snacks.drink} />
                                                    <SnackRow icon={<CandyIcon className="size-3 text-white/50" />} value={tier.snacks.sweet} />
                                                    <SnackRow icon={<NutIcon className="size-3 text-white/50" />} value={tier.snacks.savory} />
                                                    <p className="text-xs text-white/80 pt-1.5">{t.pricing.snacksDisclaimer}</p>
                                                </div>
                                            </AccordionContent>
                                        </AccordionItem>
                                    </Accordion>
                                </div>

                                {/* CTA */}
                                <div className="p-7 pt-0">
                                    <QuoteDialog
                                        initialTier={tierKey}
                                        trigger={
                                            <Button
                                                size="lg"
                                                className={cn(
                                                    "w-full h-12 rounded-xl font-medium transition-all duration-300",
                                                    theme.cta
                                                )}
                                            >
                                                {t.pricing.cta}
                                            </Button>
                                        }
                                    />
                                </div>
                            </div>
                        </Container>
                    );
                })}
            </div>
        </div>
    );
};

const SnackRow = ({ icon, value }: { icon: React.ReactNode; value: string }) => (
    <div className="flex items-center gap-2">
        {icon}
        <span className="text-xs text-white/75">{value}</span>
    </div>
);

export default Pricing;
