import {Sparkles, CupSoda, BatteryCharging, CarFront, SmilePlus } from "lucide-react";
import Container from "../global/container";
import { Button } from "../ui/button";
import { MagicCard } from "../ui/magic-card";

const Analysis = () => {
    return (
        <div className="relative flex flex-col items-center justify-center w-full py-20">
            <Container>
                <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-16">
                    <h2 className="text-2xl md:text-4xl lg:text-5xl font-heading font-medium !leading-snug text-foreground">
                    Expertos en crear viajes impecables…<br/><span className="font-subheading italic text-[#08fefe]"> y en redefinir lo que significa viajar bien.
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
                                Excelencia que Acompaña Cada Trayecto
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                Un servicio diseñado para los más altos estándares: puntual, seguro y cuidadosamente administrado para asegurar tranquilidad en cada viaje.
                                </p>

                                <div className="space-y-4">
                                    <div className="flex justify-between items-baseline">
                                        <div>
                                            <div className="text-3xl font-semibold">
                                            +1,500 viajes ejecutivos
                                            </div>
                                            <div className="text-sm text-green-500 flex items-center gap-1 mt-2">
                                                <SmilePlus className="w-4 h-4" />
                                                98% satisfacción
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button size="icon" variant="ghost">
                                                <CarFront className="w-5 h-5" />
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="grid grid-cols-4 text-sm text-center text-muted-foreground py-2">
                                            <div>Confort</div>
                                            <div>Seguridad</div>
                                            <div>Atención</div>
                                            <div>Confiabilidad</div>
                                        </div>
                                        {[
                                            { name: "Asientos Premium", Confort: "Estructura 5★", Seguridad: "Soporte 24/7", Confiabilidad: "Alta Disponibilidad"},
                                            { name: "Streaming sin límites", Confort: "Tracking tiempo real", Seguridad: "White-glove service", Confiabilidad: "Puntualidad garantizada" },
                                            { name: "Silencio Total", Confort: "Frenado autómatico", Seguridad: "Personal VIP", Confiabilidad: "0 accidentes reportados" },
                                        ].map((campaign) => (
                                            <div key={campaign.name} className="grid grid-cols-4 text-sm py-2 border-t border-border/50">
                                                <div className="font-semibold">{campaign.name}</div>
                                                <div className="font-semibold">{campaign.Confort}</div>
                                                <div className="font-semibold">{campaign.Seguridad}</div>
                                                <div className="font-semibold">{campaign.Confiabilidad}</div>
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
                                Disfruta el Camino
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                Haz más placenteros tus traslados con una selección ligera de bebidas y snacks, pensados para cualquier ocasión.
                                </p>

                                <div className="space-y-4">
                                    <div className="flex justify-between items-baseline">
                                        <div>
                                            <div className="text-3xl font-semibold">Máxima comodidad a bordo</div>
                                            <div className="text-sm text-green-500 flex items-center gap-1 mt-2">
                                                <CupSoda className="w-4 h-4" />
                                                Selección adaptable a tus gustos
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button size="icon" variant="ghost">
                                                <Sparkles className="w-5 h-5" />
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Audience Table */}
                                    <div className="space-y-2">
                                        <div className="grid grid-cols-4 text-sm text-muted-foreground py-2">
                                            <div>Plan</div>
                                            <div>Bebida</div>
                                            <div>Snack Dulce</div>
                                            <div>Snack Salado</div>
                                        </div>
                                        {[
                                            { Plan: "Práctico", Bebida: "Agua natural", Snack: "—", Snack2: "Mix nueces " },
                                            { Plan: "Select", Bebida: "Agua mineral", Snack: "Galletas", Snack2: "Frutos secos / Chips" },
                                            { Plan: "Premium", Bebida: "Bebidas premium", Snack: "Alta confitería", Snack2: "Frutos secos selectos / Chips" },
                                        ].map((metric) => (
                                            <div key={metric.Plan} className="grid grid-cols-4 text-sm py-2 border-t border-border/50">
                                                <div className="font-semibold">{metric.Plan}</div>
                                                <div className="font-semibold">{metric.Bebida}</div>
                                                <div className="font-semibold">{metric.Snack}</div>
                                                <div className="font-semibold">{metric.Snack2}</div>
                                            </div>
                                        ))}
                                        <p className="text-xs text-muted-foreground">
                                            *Variedades sujetas a disponibilidad.
                                        </p>
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
