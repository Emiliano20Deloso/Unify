// Aviso de privacidad. Español: copia literal de aviso_privacidad.md (fuente de verdad).
// Inglés: traducción del sitio anterior; lo que cambió en el español se tradujo fielmente.
// No reescribir: cualquier cambio de texto lo decide el dueño en el .md.
import type { Locale } from "@/i18n/config";
import { EMAIL, SITE, WHATSAPP, type LegalDocument } from "./types";

const UPDATED = "2026-10-14";

const es: LegalDocument = {
    updated: UPDATED,
    sections: [
        {
            id: "identificacion",
            title: "Identificación del prestador",
            blocks: [
                {
                    type: "p",
                    content: [
                        "El servicio de transporte privado ofrecido bajo la marca ",
                        { strong: "Forza Code & Consulting S.A de C.V" },
                        " (en adelante, “Unify”) con domicilio en Santa Fe, Ciudad de México.",
                    ],
                },
                { type: "p", content: "Para cualquier duda, aclaración o queja, el Cliente puede comunicarse por los siguientes medios:" },
                {
                    type: "ul",
                    items: [
                        ["Correo electrónico: ", EMAIL],
                        ["Teléfono / WhatsApp: ", WHATSAPP],
                        "Horario de atención: Lunes a Sábado, de 8am a 10pm",
                        ["Sitio web: ", SITE],
                    ],
                },
            ],
        },
        {
            id: "datos",
            title: "Datos personales que recabamos",
            blocks: [
                {
                    type: "p",
                    content:
                        "Para las finalidades de este Aviso, podemos recabar los siguientes datos, ya sea directamente de usted (en el sitio unifyluxury.com, por WhatsApp, correo o teléfono) o de manera automática al usar nuestro sitio:",
                },
                {
                    type: "ul",
                    items: [
                        [{ strong: "Identificación y contacto:" }, " nombre completo, teléfono y correo electrónico."],
                        [
                            { strong: "Datos del servicio:" },
                            " direcciones de origen y destino, fecha y hora del viaje, número de pasajeros y sus nombres, equipaje, número de vuelo y requerimientos especiales (por ejemplo, silla para bebé).",
                        ],
                        [
                            { strong: "Datos de pago y facturación:" },
                            " comprobantes de pago y, en su caso, RFC, razón social, régimen fiscal, código postal y uso de CFDI.",
                        ],
                        [{ strong: "Datos de navegación:" }, " dirección IP, tipo de navegador y dispositivo, y páginas visitadas (ver sección 8)."],
                    ],
                },
                {
                    type: "p",
                    content: [
                        "Los pagos con tarjeta se procesan directamente a través de las plataformas Stripe. Unify ",
                        { strong: "no recaba ni almacena" },
                        " los números completos de sus tarjetas.",
                    ],
                },
                {
                    type: "p",
                    content: [
                        "Unify ",
                        { strong: "no solicita datos personales sensibles" },
                        ". Si usted nos comparte voluntariamente información de ese tipo (por ejemplo, una condición de salud que requiera asistencia durante el viaje), la usaremos solo para prestarle el servicio y con su consentimiento expreso.",
                    ],
                },
                { type: "p", content: "Si usted proporciona datos de otros pasajeros, declara contar con su autorización para hacerlo." },
            ],
        },
        {
            id: "finalidades",
            title: "Finalidades del tratamiento",
            blocks: [
                { type: "p", content: [{ strong: "Finalidades primarias" }, ", necesarias para prestarle el servicio:"] },
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
                    content: [
                        { strong: "Finalidades secundarias" },
                        ", no necesarias para el servicio, pero que nos ayudan a brindarle una mejor atención:",
                    ],
                },
                {
                    type: "ol",
                    items: [
                        "Enviarle promociones, novedades y publicidad de Unify Luxury.",
                        "Realizar encuestas de satisfacción.",
                        "Elaborar estadísticas y análisis para mejorar nuestros servicios y nuestro sitio.",
                    ],
                },
                {
                    type: "p",
                    content: [
                        "Si no desea que sus datos se usen para las finalidades secundarias, puede indicarlo en cualquier momento escribiendo a ",
                        EMAIL,
                        " con el asunto “Finalidades secundarias”. Su negativa no será motivo para negarle el servicio.",
                    ],
                },
            ],
        },
        {
            id: "transferencias",
            title: "Remisiones y transferencias de datos",
            blocks: [
                {
                    type: "p",
                    content:
                        "Para prestar el servicio, compartimos datos con proveedores que los tratan por cuenta nuestra y bajo nuestras instrucciones (encargados). Entre ellos están las plataformas de pago (Stripe), los servicios de alojamiento y bases de datos del sitio, los servicios de mapas para calcular rutas y tarifas, y los de mensajería y correo.",
                },
                { type: "p", content: "Además, sus datos podrán transferirse, sin requerir su consentimiento, en los siguientes casos:" },
                {
                    type: "table",
                    caption: "Transferencias de datos sin consentimiento",
                    head: ["Destinatario", "Finalidad"],
                    rows: [
                        ["Autoridades competentes", "Cumplir requerimientos legales, judiciales o fiscales"],
                        ["Compañías aseguradoras", "Gestionar siniestros o reclamaciones relacionados con el servicio"],
                    ],
                },
                { type: "p", content: "No vendemos ni rentamos sus datos personales a terceros." },
            ],
        },
        {
            id: "arco",
            title: "Derechos ARCO",
            blocks: [
                {
                    type: "p",
                    content: [
                        "Usted tiene derecho a ",
                        { strong: "Acceder" },
                        " a sus datos personales, ",
                        { strong: "Rectificarlos" },
                        " si son inexactos, ",
                        { strong: "Cancelarlos" },
                        " cuando considere que no se usan conforme a la ley, y ",
                        { strong: "Oponerse" },
                        " a su uso para fines específicos.",
                    ],
                },
                { type: "p", content: ["Para ejercer cualquiera de estos derechos, envíe una solicitud a ", EMAIL, " que incluya:"] },
                {
                    type: "ol",
                    items: [
                        "Su nombre y un medio para comunicarle la respuesta.",
                        "Una copia de su identificación oficial o, en su caso, la de su representante legal y el documento que acredite la representación.",
                        "La descripción clara del derecho que desea ejercer y de los datos involucrados.",
                        "Cualquier documento o información que ayude a localizar sus datos, como el número de reserva.",
                    ],
                },
                {
                    type: "p",
                    content:
                        "Le responderemos en un plazo máximo de 20 días hábiles desde la recepción de su solicitud. Si procede, la haremos efectiva dentro de los 15 días hábiles siguientes a la respuesta.",
                },
            ],
        },
        {
            id: "revocacion",
            title: "Revocación del consentimiento",
            blocks: [
                {
                    type: "p",
                    content:
                        "Usted puede revocar el consentimiento que nos haya otorgado para el tratamiento de sus datos, siguiendo el mismo procedimiento de la sección 5. Tenga en cuenta que algunos datos deben conservarse por obligación legal, y que la revocación puede impedir que sigamos prestándole el servicio.",
                },
            ],
        },
        {
            id: "limitacion",
            title: "Limitación del uso y divulgación",
            blocks: [
                {
                    type: "p",
                    content: [
                        "Para dejar de recibir publicidad, puede escribir a ",
                        EMAIL,
                        ", responder “BAJA” a nuestros mensajes de WhatsApp o usar el enlace para darse de baja incluido en nuestros correos.",
                    ],
                },
            ],
        },
        {
            id: "cookies",
            title: "Cookies y tecnologías de rastreo",
            blocks: [
                {
                    type: "p",
                    content:
                        "Nuestro sitio utiliza cookies y tecnologías similares para que funcione correctamente, recordar sus preferencias y analizar cómo se usa. También usamos herramientas de terceros, como Google Analytics y el píxel de Meta, para medir nuestras campañas publicitarias.",
                },
                {
                    type: "p",
                    content:
                        "Con estas tecnologías se obtienen datos como su dirección IP, el tipo de navegador y dispositivo, las páginas visitadas y el tiempo de navegación. Puede desactivarlas desde la configuración de su navegador, aunque algunas funciones del sitio, como el cotizador, podrían no operar correctamente.",
                },
            ],
        },
        {
            id: "seguridad",
            title: "Seguridad y conservación",
            blocks: [
                {
                    type: "p",
                    content:
                        "Aplicamos medidas de seguridad administrativas, técnicas y físicas para proteger sus datos contra daño, pérdida, alteración o acceso no autorizado. Conservamos sus datos solo durante el tiempo necesario para las finalidades de este Aviso y para cumplir nuestras obligaciones legales y fiscales.",
                },
            ],
        },
        {
            id: "cambios",
            title: "Cambios al Aviso de Privacidad",
            blocks: [
                {
                    type: "p",
                    content:
                        "Este Aviso puede modificarse por cambios en la ley, en nuestros servicios o en nuestras prácticas de privacidad. Cualquier cambio se publicará en unifyluxury.com, con su fecha de actualización.",
                },
            ],
        },
        {
            id: "consentimiento",
            title: "Consentimiento",
            blocks: [
                {
                    type: "p",
                    content:
                        "Al proporcionar sus datos a través de unifyluxury.com o de nuestros medios de contacto, usted reconoce haber leído este Aviso de Privacidad y consiente el tratamiento de sus datos en los términos aquí descritos.",
                },
            ],
        },
    ],
};

const en: LegalDocument = {
    updated: UPDATED,
    sections: [
        {
            id: "identificacion",
            title: "Service provider identification",
            blocks: [
                {
                    type: "p",
                    content: [
                        "The private transport service offered under the brand ",
                        { strong: "Forza Code & Consulting S.A de C.V" },
                        " (hereinafter, “Unify”), with address in Santa Fe, Mexico City.",
                    ],
                },
                { type: "p", content: "For any inquiries, clarifications or complaints, the Client may reach us through the following channels:" },
                {
                    type: "ul",
                    items: [
                        ["Email: ", EMAIL],
                        ["Phone / WhatsApp: ", WHATSAPP],
                        "Business hours: Monday to Saturday, 8am to 10pm",
                        ["Website: ", SITE],
                    ],
                },
            ],
        },
        {
            id: "datos",
            title: "Personal data we collect",
            blocks: [
                {
                    type: "p",
                    content:
                        "For the purposes of this Notice, we may collect the following data, either directly from you (on unifyluxury.com, via WhatsApp, email or phone) or automatically when using our site:",
                },
                {
                    type: "ul",
                    items: [
                        [{ strong: "Identification and contact:" }, " full name, phone and email."],
                        [
                            { strong: "Service data:" },
                            " origin and destination addresses, trip date and time, number of passengers and their names, luggage, flight number and special requirements (e.g., baby seat).",
                        ],
                        [
                            { strong: "Payment and billing data:" },
                            " payment receipts and, if applicable, RFC, business name, tax regime, zip code and CFDI use.",
                        ],
                        [{ strong: "Browsing data:" }, " IP address, browser and device type, and pages visited (see section 8)."],
                    ],
                },
                {
                    type: "p",
                    content: [
                        "Card payments are processed directly through Stripe platforms. Unify ",
                        { strong: "does not collect or store" },
                        " your full card numbers.",
                    ],
                },
                {
                    type: "p",
                    content: [
                        "Unify ",
                        { strong: "does not request sensitive personal data" },
                        ". If you voluntarily share such information with us (e.g., a health condition requiring assistance during the trip), we will use it only to provide you the service and with your express consent.",
                    ],
                },
                { type: "p", content: "If you provide data of other passengers, you declare that you have their authorization to do so." },
            ],
        },
        {
            id: "finalidades",
            title: "Purposes of processing",
            blocks: [
                { type: "p", content: [{ strong: "Primary purposes" }, ", necessary to provide the service:"] },
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
                    content: [{ strong: "Secondary purposes" }, ", not necessary for the service, but that help us provide better care:"],
                },
                {
                    type: "ol",
                    items: [
                        "Send you promotions, news and advertising from Unify Luxury.",
                        "Conduct satisfaction surveys.",
                        "Produce statistics and analytics to improve our services and site.",
                    ],
                },
                {
                    type: "p",
                    content: [
                        "If you do not want your data to be used for secondary purposes, you can indicate this at any time by writing to ",
                        EMAIL,
                        " with the subject “Secondary purposes”. Your refusal will not be grounds for denying you the service.",
                    ],
                },
            ],
        },
        {
            id: "transferencias",
            title: "Data remittances and transfers",
            blocks: [
                {
                    type: "p",
                    content:
                        "To provide the service, we share data with providers who process it on our behalf and under our instructions (data processors). These include payment platforms (Stripe), site hosting and database services, mapping services to calculate routes and fares, and messaging and email services.",
                },
                { type: "p", content: "In addition, your data may be transferred, without requiring your consent, in the following cases:" },
                {
                    type: "table",
                    caption: "Data transfers without consent",
                    head: ["Recipient", "Purpose"],
                    rows: [
                        ["Competent authorities", "Comply with legal, judicial or tax requirements"],
                        ["Insurance companies", "Manage accidents or claims related to the service"],
                    ],
                },
                { type: "p", content: "We do not sell or rent your personal data to third parties." },
            ],
        },
        {
            id: "arco",
            title: "ARCO rights",
            blocks: [
                {
                    type: "p",
                    content: [
                        "You have the right to ",
                        { strong: "Access" },
                        " your personal data, ",
                        { strong: "Rectify" },
                        " them if inaccurate, ",
                        { strong: "Cancel" },
                        " them when you believe they are not used in accordance with the law, and ",
                        { strong: "Object" },
                        " to their use for specific purposes.",
                    ],
                },
                { type: "p", content: ["To exercise any of these rights, send a request to ", EMAIL, " including:"] },
                {
                    type: "ol",
                    items: [
                        "Your name and a means to communicate the response to you.",
                        "A copy of your official ID or, if applicable, that of your legal representative and the document evidencing representation.",
                        "A clear description of the right you wish to exercise and of the data involved.",
                        "Any document or information that helps locate your data, such as the reservation number.",
                    ],
                },
                {
                    type: "p",
                    content:
                        "We will respond within a maximum of 20 business days from the receipt of your request. If applicable, we will make it effective within the 15 business days following the response.",
                },
            ],
        },
        {
            id: "revocacion",
            title: "Revocation of consent",
            blocks: [
                {
                    type: "p",
                    content:
                        "You may revoke the consent you have given us for the processing of your data, following the same procedure in section 5. Please note that some data must be retained by legal obligation, and that revocation may prevent us from continuing to provide you with the service.",
                },
            ],
        },
        {
            id: "limitacion",
            title: "Limitation of use and disclosure",
            blocks: [
                {
                    type: "p",
                    content: [
                        "To stop receiving advertising, you can write to ",
                        EMAIL,
                        ", reply “UNSUBSCRIBE” to our WhatsApp messages or use the unsubscribe link included in our emails.",
                    ],
                },
            ],
        },
        {
            id: "cookies",
            title: "Cookies and tracking technologies",
            blocks: [
                {
                    type: "p",
                    content:
                        "Our site uses cookies and similar technologies to make it work properly, remember your preferences and analyze how it is used. We also use third-party tools, such as Google Analytics and the Meta pixel, to measure our advertising campaigns.",
                },
                {
                    type: "p",
                    content:
                        "These technologies collect data such as your IP address, browser and device type, pages visited and browsing time. You can disable them from your browser settings, although some site features, such as the quote tool, may not operate correctly.",
                },
            ],
        },
        {
            id: "seguridad",
            title: "Security and retention",
            blocks: [
                {
                    type: "p",
                    content:
                        "We apply administrative, technical and physical security measures to protect your data against damage, loss, alteration or unauthorized access. We retain your data only for the time necessary for the purposes of this Notice and to comply with our legal and tax obligations.",
                },
            ],
        },
        {
            id: "cambios",
            title: "Changes to the Privacy Notice",
            blocks: [
                {
                    type: "p",
                    content:
                        "This Notice may be modified due to changes in the law, our services or our privacy practices. Any change will be published at unifyluxury.com, with its update date.",
                },
            ],
        },
        {
            id: "consentimiento",
            title: "Consent",
            blocks: [
                {
                    type: "p",
                    content:
                        "By providing your data through unifyluxury.com or our contact channels, you acknowledge that you have read this Privacy Notice and consent to the processing of your data on the terms described herein.",
                },
            ],
        },
    ],
};

export const privacyNotice: Record<Locale, LegalDocument> = { es, en };
