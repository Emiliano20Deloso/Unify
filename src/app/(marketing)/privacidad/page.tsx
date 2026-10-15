"use client";

import Container from "@/components/global/container";
import { WHATSAPP_LINK } from "@/constants";
import { useLanguage } from "@/contexts/language-context";
import type { Lang } from "@/translations";
import { ShieldCheckIcon } from "lucide-react";

type Block =
    | { type: "p"; children: React.ReactNode }
    | { type: "ul"; items: React.ReactNode[] }
    | { type: "ol"; items: React.ReactNode[] }
    | { type: "table"; head: string[]; rows: string[][] };

type Section = {
    id: string;
    number: string;
    title: string;
    blocks: Block[];
};

const SECTIONS_ES: Section[] = [
    {
        id: "identificacion",
        number: "01",
        title: "Identificación del prestador",
        blocks: [
            {
                type: "p",
                children: (
                    <>
                        El servicio de transporte privado ofrecido bajo la marca{" "}
                        <strong className="text-white">UNIFY</strong> (en adelante,
                        &ldquo;Unify&rdquo;) con domicilio en Santa Fe, Ciudad de México.
                    </>
                ),
            },
            { type: "p", children: "Para cualquier duda, aclaración o queja, el Cliente puede comunicarse por los siguientes medios:" },
            {
                type: "ul",
                items: [
                    <>Correo electrónico: <a className="text-[#FF2400] hover:text-[#ff3131] transition-colors" href="mailto:unifymx@outlook.com">unifymx@outlook.com</a></>,
                    <>Teléfono / WhatsApp: <a className="text-[#FF2400] hover:text-[#ff3131] transition-colors" href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer">+52 595 107 6664</a></>,
                    "Horario de atención: Lunes a Sábado, de 8am a 10pm",
                    <>Sitio web: <a className="text-[#FF2400] hover:text-[#ff3131] transition-colors" href="https://unifyluxury.com" target="_blank" rel="noopener noreferrer">unifyluxury.com</a></>,
                ],
            },
        ],
    },
    {
        id: "datos",
        number: "02",
        title: "Datos personales que recabamos",
        blocks: [
            { type: "p", children: "Para las finalidades de este Aviso, podemos recabar los siguientes datos, ya sea directamente de usted (en el sitio unifyluxury.com, por WhatsApp, correo o teléfono) o de manera automática al usar nuestro sitio:" },
            {
                type: "ul",
                items: [
                    <><strong className="text-white">Identificación y contacto:</strong> nombre completo, teléfono y correo electrónico.</>,
                    <><strong className="text-white">Datos del servicio:</strong> direcciones de origen y destino, fecha y hora del viaje, número de pasajeros y sus nombres, equipaje, número de vuelo y requerimientos especiales (por ejemplo, silla para bebé).</>,
                    <><strong className="text-white">Datos de pago y facturación:</strong> comprobantes de pago y, en su caso, RFC, razón social, régimen fiscal, código postal y uso de CFDI.</>,
                    <><strong className="text-white">Datos de navegación:</strong> dirección IP, tipo de navegador y dispositivo, y páginas visitadas (ver sección 8).</>,
                ],
            },
            {
                type: "p",
                children: (
                    <>
                        Los pagos con tarjeta se procesan directamente a través de las plataformas Stripe. Unify{" "}
                        <strong className="text-white">no recaba ni almacena</strong> los números completos de sus tarjetas.
                    </>
                ),
            },
            {
                type: "p",
                children: (
                    <>
                        Unify <strong className="text-white">no solicita datos personales sensibles</strong>. Si usted nos comparte voluntariamente información de ese tipo (por ejemplo, una condición de salud que requiera asistencia durante el viaje), la usaremos solo para prestarle el servicio y con su consentimiento expreso.
                    </>
                ),
            },
            { type: "p", children: "Si usted proporciona datos de otros pasajeros, declara contar con su autorización para hacerlo." },
        ],
    },
    {
        id: "finalidades",
        number: "03",
        title: "Finalidades del tratamiento",
        blocks: [
            {
                type: "p",
                children: (
                    <>
                        <strong className="text-white">Finalidades primarias</strong>, necesarias para prestarle el servicio:
                    </>
                ),
            },
            {
                type: "ol",
                items: [
                    "Cotizar, reservar, confirmar y prestar el servicio de transporte.",
                    "Comunicarnos con usted sobre su reserva: confirmaciones, datos del chofer, cambios, retrasos y cancelaciones.",
                    "Procesar pagos, cargos adicionales y reembolsos.",
                    "Emitir facturas (CFDI) cuando las solicite.",
                    "Atender quejas, aclaraciones y objetos olvidados.",
                    "Cumplir obligaciones legales, fiscales y requerimientos de autoridades competentes.",
                    "Gestionar reclamaciones ante aseguradoras en caso de siniestro o daños.",
                ],
            },
            {
                type: "p",
                children: (
                    <>
                        <strong className="text-white">Finalidades secundarias</strong>, no necesarias para el servicio, pero que nos ayudan a brindarle una mejor atención:
                    </>
                ),
            },
            {
                type: "ol",
                items: [
                    "Enviarle promociones, novedades y publicidad de Unify Luxury.",
                    "Realizar encuestas de satisfacción.",
                    "Elaborar estadísticas y análisis para mejorar nuestros servicios y nuestro sitio.",
                ],
            },
            { type: "p", children: "Si no desea que sus datos se usen para las finalidades secundarias, puede indicarlo en cualquier momento escribiendo a unifymx@outlook.com con el asunto \"Finalidades secundarias\". Su negativa no será motivo para negarle el servicio." },
        ],
    },
    {
        id: "transferencias",
        number: "04",
        title: "Remisiones y transferencias de datos",
        blocks: [
            { type: "p", children: "Para prestar el servicio, compartimos datos con proveedores que los tratan por cuenta nuestra y bajo nuestras instrucciones (encargados). Entre ellos están las plataformas de pago (Stripe), los servicios de alojamiento y bases de datos del sitio, los servicios de mapas para calcular rutas y tarifas, y los de mensajería y correo." },
            { type: "p", children: "Además, sus datos podrán transferirse, sin requerir su consentimiento, en los siguientes casos:" },
            {
                type: "table",
                head: ["Destinatario", "Finalidad"],
                rows: [
                    ["Autoridades competentes", "Cumplir requerimientos legales, judiciales o fiscales"],
                    ["Compañías aseguradoras", "Gestionar siniestros o reclamaciones relacionados con el servicio"],
                ],
            },
            { type: "p", children: "No vendemos ni rentamos sus datos personales a terceros." },
        ],
    },
    {
        id: "arco",
        number: "05",
        title: "Derechos ARCO",
        blocks: [
            {
                type: "p",
                children: (
                    <>
                        Usted tiene derecho a <strong className="text-white">Acceder</strong> a sus datos personales,{" "}
                        <strong className="text-white">Rectificarlos</strong> si son inexactos,{" "}
                        <strong className="text-white">Cancelarlos</strong> cuando considere que no se usan conforme a la ley, y{" "}
                        <strong className="text-white">Oponerse</strong> a su uso para fines específicos.
                    </>
                ),
            },
            { type: "p", children: "Para ejercer cualquiera de estos derechos, envíe una solicitud a unifymx@outlook.com que incluya:" },
            {
                type: "ol",
                items: [
                    "Su nombre y un medio para comunicarle la respuesta.",
                    "Una copia de su identificación oficial o, en su caso, la de su representante legal y el documento que acredite la representación.",
                    "La descripción clara del derecho que desea ejercer y de los datos involucrados.",
                    "Cualquier documento o información que ayude a localizar sus datos, como el número de reserva.",
                ],
            },
            { type: "p", children: "Le responderemos en un plazo máximo de 20 días hábiles desde la recepción de su solicitud. Si procede, la haremos efectiva dentro de los 15 días hábiles siguientes a la respuesta." },
        ],
    },
    {
        id: "revocacion",
        number: "06",
        title: "Revocación del consentimiento",
        blocks: [
            { type: "p", children: "Usted puede revocar el consentimiento que nos haya otorgado para el tratamiento de sus datos, siguiendo el mismo procedimiento de la sección 5. Tenga en cuenta que algunos datos deben conservarse por obligación legal, y que la revocación puede impedir que sigamos prestándole el servicio." },
        ],
    },
    {
        id: "limitacion",
        number: "07",
        title: "Limitación del uso y divulgación",
        blocks: [
            { type: "p", children: "Para dejar de recibir publicidad, puede escribir a unifymx@outlook.com, responder \"BAJA\" a nuestros mensajes de WhatsApp o usar el enlace para darse de baja incluido en nuestros correos." },
        ],
    },
    {
        id: "cookies",
        number: "08",
        title: "Cookies y tecnologías de rastreo",
        blocks: [
            { type: "p", children: "Nuestro sitio utiliza cookies y tecnologías similares para que funcione correctamente, recordar sus preferencias y analizar cómo se usa. También usamos herramientas de terceros, como Google Analytics y el píxel de Meta, para medir nuestras campañas publicitarias." },
            { type: "p", children: "Con estas tecnologías se obtienen datos como su dirección IP, el tipo de navegador y dispositivo, las páginas visitadas y el tiempo de navegación. Puede desactivarlas desde la configuración de su navegador, aunque algunas funciones del sitio, como el cotizador, podrían no operar correctamente." },
        ],
    },
    {
        id: "seguridad",
        number: "09",
        title: "Seguridad y conservación",
        blocks: [
            { type: "p", children: "Aplicamos medidas de seguridad administrativas, técnicas y físicas para proteger sus datos contra daño, pérdida, alteración o acceso no autorizado. Conservamos sus datos solo durante el tiempo necesario para las finalidades de este Aviso y para cumplir nuestras obligaciones legales y fiscales." },
        ],
    },
    {
        id: "cambios",
        number: "10",
        title: "Cambios al Aviso de Privacidad",
        blocks: [
            { type: "p", children: "Este Aviso puede modificarse por cambios en la ley, en nuestros servicios o en nuestras prácticas de privacidad. Cualquier cambio se publicará en unifyluxury.com, con su fecha de actualización." },
        ],
    },
    {
        id: "consentimiento",
        number: "11",
        title: "Consentimiento",
        blocks: [
            { type: "p", children: "Al proporcionar sus datos a través de unifyluxury.com o de nuestros medios de contacto, usted reconoce haber leído este Aviso de Privacidad y consiente el tratamiento de sus datos en los términos aquí descritos." },
        ],
    },
];

const SECTIONS_EN: Section[] = [
    {
        id: "identificacion",
        number: "01",
        title: "Service provider identification",
        blocks: [
            {
                type: "p",
                children: (
                    <>
                        The private transport service offered under the brand{" "}
                        <strong className="text-white">UNIFY</strong> (hereinafter,
                        &ldquo;Unify&rdquo;), with address in Santa Fe, Mexico City.
                    </>
                ),
            },
            { type: "p", children: "For any inquiries, clarifications or complaints, the Client may reach us through the following channels:" },
            {
                type: "ul",
                items: [
                    <>Email: <a className="text-[#FF2400] hover:text-[#ff3131] transition-colors" href="mailto:unifymx@outlook.com">unifymx@outlook.com</a></>,
                    <>Phone / WhatsApp: <a className="text-[#FF2400] hover:text-[#ff3131] transition-colors" href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer">+52 595 107 6664</a></>,
                    "Business hours: Monday to Saturday, 8am to 10pm",
                    <>Website: <a className="text-[#FF2400] hover:text-[#ff3131] transition-colors" href="https://unifyluxury.com" target="_blank" rel="noopener noreferrer">unifyluxury.com</a></>,
                ],
            },
        ],
    },
    {
        id: "datos",
        number: "02",
        title: "Personal data we collect",
        blocks: [
            { type: "p", children: "For the purposes of this Notice, we may collect the following data, either directly from you (on unifyluxury.com, via WhatsApp, email or phone) or automatically when using our site:" },
            {
                type: "ul",
                items: [
                    <><strong className="text-white">Identification and contact:</strong> full name, phone and email.</>,
                    <><strong className="text-white">Service data:</strong> origin and destination addresses, trip date and time, number of passengers and their names, luggage, flight number and special requirements (e.g., baby seat).</>,
                    <><strong className="text-white">Payment and billing data:</strong> payment receipts and, if applicable, RFC, business name, tax regime, zip code and CFDI use.</>,
                    <><strong className="text-white">Browsing data:</strong> IP address, browser and device type, and pages visited (see section 8).</>,
                ],
            },
            {
                type: "p",
                children: (
                    <>
                        Card payments are processed directly through Stripe platforms. Unify{" "}
                        <strong className="text-white">does not collect or store</strong> your full card numbers.
                    </>
                ),
            },
            {
                type: "p",
                children: (
                    <>
                        Unify <strong className="text-white">does not request sensitive personal data</strong>. If you voluntarily share such information with us (e.g., a health condition requiring assistance during the trip), we will use it only to provide you the service and with your express consent.
                    </>
                ),
            },
            { type: "p", children: "If you provide data of other passengers, you declare that you have their authorization to do so." },
        ],
    },
    {
        id: "finalidades",
        number: "03",
        title: "Purposes of processing",
        blocks: [
            {
                type: "p",
                children: (
                    <>
                        <strong className="text-white">Primary purposes</strong>, necessary to provide the service:
                    </>
                ),
            },
            {
                type: "ol",
                items: [
                    "Quote, book, confirm and deliver the transport service.",
                    "Communicate with you about your reservation: confirmations, chauffeur details, changes, delays and cancellations.",
                    "Process payments, additional charges and refunds.",
                    "Issue invoices (CFDI) when requested.",
                    "Handle complaints, clarifications and lost items.",
                    "Comply with legal and tax obligations and requirements of competent authorities.",
                    "Manage claims with insurance companies in case of accident or damage.",
                ],
            },
            {
                type: "p",
                children: (
                    <>
                        <strong className="text-white">Secondary purposes</strong>, not necessary for the service, but that help us provide better care:
                    </>
                ),
            },
            {
                type: "ol",
                items: [
                    "Send you promotions, news and advertising from Unify Luxury.",
                    "Conduct satisfaction surveys.",
                    "Produce statistics and analytics to improve our services and site.",
                ],
            },
            { type: "p", children: "If you do not want your data to be used for secondary purposes, you can indicate this at any time by writing to unifymx@outlook.com with the subject \"Secondary purposes\". Your refusal will not be grounds for denying you the service." },
        ],
    },
    {
        id: "transferencias",
        number: "04",
        title: "Data remittances and transfers",
        blocks: [
            { type: "p", children: "To provide the service, we share data with providers who process it on our behalf and under our instructions (data processors). These include payment platforms (Stripe), site hosting and database services, mapping services to calculate routes and fares, and messaging and email services." },
            { type: "p", children: "In addition, your data may be transferred, without requiring your consent, in the following cases:" },
            {
                type: "table",
                head: ["Recipient", "Purpose"],
                rows: [
                    ["Competent authorities", "Comply with legal, judicial or tax requirements"],
                    ["Insurance companies", "Manage accidents or claims related to the service"],
                ],
            },
            { type: "p", children: "We do not sell or rent your personal data to third parties." },
        ],
    },
    {
        id: "arco",
        number: "05",
        title: "ARCO rights",
        blocks: [
            {
                type: "p",
                children: (
                    <>
                        You have the right to <strong className="text-white">Access</strong> your personal data,{" "}
                        <strong className="text-white">Rectify</strong> them if inaccurate,{" "}
                        <strong className="text-white">Cancel</strong> them when you believe they are not used in accordance with the law, and{" "}
                        <strong className="text-white">Object</strong> to their use for specific purposes.
                    </>
                ),
            },
            { type: "p", children: "To exercise any of these rights, send a request to unifymx@outlook.com including:" },
            {
                type: "ol",
                items: [
                    "Your name and a means to communicate the response to you.",
                    "A copy of your official ID or, if applicable, that of your legal representative and the document evidencing representation.",
                    "A clear description of the right you wish to exercise and of the data involved.",
                    "Any document or information that helps locate your data, such as the reservation number.",
                ],
            },
            { type: "p", children: "We will respond within a maximum of 20 business days from the receipt of your request. If applicable, we will make it effective within the 15 business days following the response." },
        ],
    },
    {
        id: "revocacion",
        number: "06",
        title: "Revocation of consent",
        blocks: [
            { type: "p", children: "You may revoke the consent you have given us for the processing of your data, following the same procedure in section 5. Please note that some data must be retained by legal obligation, and that revocation may prevent us from continuing to provide you with the service." },
        ],
    },
    {
        id: "limitacion",
        number: "07",
        title: "Limitation of use and disclosure",
        blocks: [
            { type: "p", children: "To stop receiving advertising, you can write to unifymx@outlook.com, reply \"UNSUBSCRIBE\" to our WhatsApp messages or use the unsubscribe link included in our emails." },
        ],
    },
    {
        id: "cookies",
        number: "08",
        title: "Cookies and tracking technologies",
        blocks: [
            { type: "p", children: "Our site uses cookies and similar technologies to make it work properly, remember your preferences and analyze how it is used. We also use third-party tools, such as Google Analytics and the Meta pixel, to measure our advertising campaigns." },
            { type: "p", children: "These technologies collect data such as your IP address, browser and device type, pages visited and browsing time. You can disable them from your browser settings, although some site features, such as the quote tool, may not operate correctly." },
        ],
    },
    {
        id: "seguridad",
        number: "09",
        title: "Security and retention",
        blocks: [
            { type: "p", children: "We apply administrative, technical and physical security measures to protect your data against damage, loss, alteration or unauthorized access. We retain your data only for the time necessary for the purposes of this Notice and to comply with our legal and tax obligations." },
        ],
    },
    {
        id: "cambios",
        number: "10",
        title: "Changes to the Privacy Notice",
        blocks: [
            { type: "p", children: "This Notice may be modified due to changes in the law, our services or our privacy practices. Any change will be published at unifyluxury.com, with its update date." },
        ],
    },
    {
        id: "consentimiento",
        number: "11",
        title: "Consent",
        blocks: [
            { type: "p", children: "By providing your data through unifyluxury.com or our contact channels, you acknowledge that you have read this Privacy Notice and consent to the processing of your data on the terms described herein." },
        ],
    },
];

const COPY: Record<Lang, {
    title: string;
    titleHighlight: string;
    subtitle: string;
    updatedLabel: string;
    updatedDate: string;
}> = {
    es: {
        title: "Aviso de",
        titleHighlight: "Privacidad",
        subtitle: "Cómo tratamos, protegemos y resguardamos sus datos personales en Unify Luxury.",
        updatedLabel: "Última actualización",
        updatedDate: "14 de Octubre, 2026",
    },
    en: {
        title: "Privacy",
        titleHighlight: "Notice",
        subtitle: "How we process, protect and safeguard your personal data at Unify Luxury.",
        updatedLabel: "Last updated",
        updatedDate: "October 14, 2026",
    },
};

export default function PrivacidadPage() {
    const { lang } = useLanguage();
    const sections = lang === "en" ? SECTIONS_EN : SECTIONS_ES;
    const copy = COPY[lang];

    return (
        <div className="min-h-screen bg-black">
            {/* Header */}
            <div className="w-full px-6 md:px-12 lg:px-20 pt-36 pb-16">
                <Container>
                    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-8">
                        <div className="flex flex-col gap-4 max-w-2xl">
                            <h1 className="text-4xl lg:text-6xl font-bold text-white leading-tight">
                                {copy.title}{" "}
                                <span className="italic font-light text-white/50">{copy.titleHighlight}</span>
                            </h1>
                            <p className="text-white/45 text-base lg:text-lg max-w-lg leading-relaxed">
                                {copy.subtitle}
                            </p>
                        </div>
                        <div className="shrink-0 flex items-center gap-3 px-5 py-4 rounded-2xl bg-white/[0.03] border border-white/8">
                            <ShieldCheckIcon className="size-5 text-[#FF2400]/70" />
                            <div className="flex flex-col">
                                <p className="text-[10px] uppercase tracking-[0.25em] text-[#FF2400]/60 font-medium">
                                    {copy.updatedLabel}
                                </p>
                                <p className="text-sm text-white/80 font-medium">{copy.updatedDate}</p>
                            </div>
                        </div>
                    </div>
                </Container>
            </div>

            {/* Content */}
            <div className="px-6 md:px-12 lg:px-20 pb-24">
                <article className="max-w-3xl mx-auto flex flex-col gap-14">
                    {sections.map((section) => (
                        <section key={section.id} id={section.id} className="scroll-mt-28">
                            <div className="flex items-baseline gap-4 mb-5">
                                <span className="text-[11px] font-medium tracking-[0.3em] text-[#FF2400]/70 tabular-nums">
                                    {section.number}
                                </span>
                                <h2 className="text-2xl lg:text-3xl font-bold text-white leading-tight">
                                    {section.title}
                                </h2>
                            </div>
                            <div className="flex flex-col gap-4 text-white/70 text-[15px] leading-relaxed">
                                {section.blocks.map((block, i) => (
                                    <BlockRenderer key={i} block={block} />
                                ))}
                            </div>
                        </section>
                    ))}
                </article>
            </div>
        </div>
    );
}

function BlockRenderer({ block }: { block: Block }) {
    if (block.type === "p") {
        return <p>{block.children}</p>;
    }
    if (block.type === "ul") {
        return (
            <ul className="flex flex-col gap-2.5 pl-1">
                {block.items.map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                        <span className="mt-2 size-1 shrink-0 rounded-full bg-[#FF2400]" />
                        <span className="flex-1">{item}</span>
                    </li>
                ))}
            </ul>
        );
    }
    if (block.type === "ol") {
        return (
            <ol className="flex flex-col gap-2.5 list-decimal pl-5 marker:text-[#FF2400]/70">
                {block.items.map((item, i) => (
                    <li key={i} className="pl-1">{item}</li>
                ))}
            </ol>
        );
    }
    if (block.type === "table") {
        return (
            <div className="my-2 overflow-hidden rounded-2xl border border-white/10 bg-[#0a0a0a]">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-white/10 bg-white/[0.03]">
                            {block.head.map((h, i) => (
                                <th
                                    key={i}
                                    className="text-left px-5 py-3.5 text-[11px] uppercase tracking-[0.2em] font-medium text-[#FF2400]/80"
                                >
                                    {h}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {block.rows.map((row, i) => (
                            <tr key={i} className={i < block.rows.length - 1 ? "border-b border-white/5" : ""}>
                                {row.map((cell, j) => (
                                    <td key={j} className="px-5 py-3.5 text-white/75">
                                        {cell}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    }
    return null;
}
