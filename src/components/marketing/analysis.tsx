import { DownloadIcon, FilterIcon, TrendingUpIcon } from "lucide-react";
import Container from "../global/container";
import { Button } from "../ui/button";
import { MagicCard } from "../ui/magic-card";

const Analysis = () => {
    return (
        <div className="relative flex flex-col items-center justify-center w-full py-20">
            <Container>
                <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-16">
                    <h2 className="text-2xl md:text-4xl lg:text-5xl font-heading font-medium !leading-snug text-foreground">
                    Traslados premium con energía limpia <br /><span className="font-subheading italic text-[#08fefe]">Viaja con innovación y sin impacto ambiental.
                        </span>
                    </h2>
                </div>
            </Container>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative w-full">

                <Container delay={0.2}>
                    <div className="rounded-2xl bg-[#0A0F0F]/60 relative border border-[#08fefe]/20">
                        <MagicCard
                            gradientFrom="#08fefe"
                            gradientTo="#08fefe"
                            gradientColor="rgba(8,254,254,0.08)"
                            className="p-4 lg:p-8 w-full overflow-hidden"
                        >
                            <div className="absolute bottom-0 right-0 bg-[#08fefe] w-1/4 h-1/4 blur-[8rem] z-20 opacity-30"></div>
                            <div className="space-y-4">
                                <h3 className="text-xl font-semibold">
                                    +1000 de Viajes realizados sin impacto ambiental.
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                    La energía que ocupamos proviene de las mejores fuentes.
                                </p>

                                <div className="space-y-4">
                                    <div className="flex justify-between items-baseline">
                                        <div>
                                            <div className="text-3xl font-semibold">
                                                $12,834
                                            </div>
                                            <div className="text-sm text-green-500 flex items-center gap-1 mt-2">
                                                <TrendingUpIcon className="w-4 h-4" />
                                                +25% from last month
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button size="icon" variant="ghost">
                                                <FilterIcon className="w-5 h-5" />
                                            </Button>
                                            <Button size="icon" variant="ghost">
                                                <DownloadIcon className="w-5 h-5" />
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="grid grid-cols-4 text-sm text-muted-foreground py-2">
                                            <div>Campaign</div>
                                            <div>Status</div>
                                            <div>Reach</div>
                                            <div>ROI</div>
                                        </div>
                                        {[
                                            { name: "Sales", status: "Active", reach: "45K", roi: "+32%" },
                                            { name: "Emails", status: "Done", reach: "28K", roi: "+18%" },
                                            { name: "Ads", status: "Active", reach: "62K", roi: "+45%" },
                                        ].map((campaign) => (
                                            <div key={campaign.name} className="grid grid-cols-4 text-sm py-2 border-t border-border/50">
                                                <div>{campaign.name}</div>
                                                <div>{campaign.status}</div>
                                                <div>{campaign.reach}</div>
                                                <div className="font-semibold">{campaign.roi}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </MagicCard>
                    </div>
                </Container>

                <Container delay={0.2}>
                    <div className="rounded-2xl bg-[#0A0F0F]/60 relative border border-[#08fefe]/20">
                        <MagicCard
                            gradientFrom="#08fefe"
                            gradientTo="#08fefe"
                            gradientColor="rgba(8,254,254,0.08)"
                            className="p-4 lg:p-8 w-full overflow-hidden"
                        >
                            <div className="absolute bottom-0 right-0 bg-[#08fefe] w-1/4 h-1/4 blur-[8rem] z-20 opacity-30"></div>
                            <div className="space-y-4">
                                <h3 className="text-xl font-semibold">
                                    Audience Metrics
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                    Understand your audience behavior and engagement patterns.
                                </p>

                                <div className="space-y-4">
                                    <div className="flex justify-between items-baseline">
                                        <div>
                                            <div className="text-3xl font-semibold">84,392</div>
                                            <div className="text-sm text-green-500 flex items-center gap-1 mt-2">
                                                <TrendingUpIcon className="w-4 h-4" />
                                                +12% engagement rate
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button size="icon" variant="ghost">
                                                <FilterIcon className="w-5 h-5" />
                                            </Button>
                                            <Button size="icon" variant="ghost">
                                                <DownloadIcon className="w-5 h-5" />
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Audience Table */}
                                    <div className="space-y-2">
                                        <div className="grid grid-cols-4 text-sm text-muted-foreground py-2">
                                            <div>Channel</div>
                                            <div>Users</div>
                                            <div>Sessions</div>
                                            <div>Conv. Rate</div>
                                        </div>
                                        {[
                                            { channel: "Social", users: "32K", sessions: "45K", rate: "3.2%" },
                                            { channel: "Email", users: "28K", sessions: "36K", rate: "4.5%" },
                                            { channel: "Direct", users: "15K", sessions: "22K", rate: "5.1%" },
                                        ].map((metric) => (
                                            <div key={metric.channel} className="grid grid-cols-4 text-sm py-2 border-t border-border/50">
                                                <div>{metric.channel}</div>
                                                <div>{metric.users}</div>
                                                <div>{metric.sessions}</div>
                                                <div className="font-semibold">{metric.rate}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </MagicCard>
                    </div>
                </Container>
            </div>
        </div>
    )
};

export default Analysis;
