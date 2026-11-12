// Términos y condiciones. Español: copia literal de terminos-condiciones.md (fuente de verdad,
// actualizado el 14 de octubre de 2026). Inglés: traducción del sitio anterior; lo que cambió en el
// español se tradujo fielmente. No reescribir: cualquier cambio de texto lo decide el dueño en el .md.
// Nota para el dueño: "(propuesta)" en la sección 8 viene del original y se deja tal cual.
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
            id: "aceptacion",
            title: "Aceptación de los Términos",
            blocks: [
                {
                    type: "p",
                    content:
                        "Estos Términos y Condiciones regulan el uso del sitio unifyluxury.com y la contratación de los servicios de Unify. Al solicitar una cotización, realizar una reserva o efectuar un pago, el Cliente declara haber leído y aceptado estos Términos.",
                },
                {
                    type: "p",
                    content:
                        "Si el Cliente no está de acuerdo con ellos, deberá abstenerse de usar el sitio y de contratar los servicios. Quien realiza una reserva en nombre de otras personas es responsable de que los pasajeros conozcan y respeten estos Términos.",
                },
            ],
        },
        {
            id: "definiciones",
            title: "Definiciones",
            blocks: [
                {
                    type: "ul",
                    items: [
                        [{ strong: "Cliente:" }, " persona física o moral que contrata el servicio."],
                        [{ strong: "Pasajero:" }, " cada persona que viaja en el vehículo, sea o no el Cliente."],
                        [{ strong: "Servicio:" }, " el traslado en vehículo de lujo con chofer contratado a través de Unify."],
                        [{ strong: "Reserva:" }, " la solicitud de Servicio confirmada por Unify conforme a la sección 5."],
                        [{ strong: "Chofer:" }, " el conductor asignado por Unify para prestar el Servicio."],
                        [{ strong: "Tarifa:" }, " el precio del Servicio cotizado y confirmado al Cliente."],
                    ],
                },
            ],
        },
        {
            id: "servicios",
            title: "Descripción de los servicios",
            blocks: [
                {
                    type: "p",
                    content: "Unify ofrece transporte privado de lujo con chofer en vehículos eléctricos Tesla. Los servicios disponibles son:",
                },
                {
                    type: "ul",
                    items: [
                        "Traslados punto a punto.",
                        "Traslados desde y hacia el aeropuerto.",
                        "Servicio por horas, con el chofer a disposición del Cliente.",
                        "Servicios para eventos y empresas.",
                        "Viajes fuera de la Ciudad de México, si aplica.",
                    ],
                },
                {
                    type: "p",
                    content:
                        "El Servicio se presta en la Ciudad de México y área metropolitana. Los traslados fuera de esta zona se cotizan mediante otros métodos y están sujetos a disponibilidad.",
                },
                {
                    type: "p",
                    content:
                        "Cada vehículo admite un máximo de 4 pasajeros y 2 maletas de tamaño estándar. Unify asigna el vehículo según disponibilidad. Si se reservó un modelo específico y no está disponible, Unify podrá sustituirlo por uno de categoría igual o superior sin costo adicional.",
                },
                { type: "p", content: "Unify presta el Servicio conforme a la normatividad de movilidad aplicable en la Ciudad de México." },
            ],
        },
        {
            id: "reservas",
            title: "Reservas y confirmación",
            blocks: [
                {
                    type: "p",
                    content:
                        "Las reservas se realizan a través de unifyluxury.com o por los medios de contacto oficiales, con una anticipación mínima de 12 horas. Las solicitudes con menos anticipación se atienden según disponibilidad.",
                },
                {
                    type: "p",
                    content: [
                        "Una reserva queda confirmada cuando el Cliente recibe la confirmación por correo electrónico o WhatsApp ",
                        { strong: "y" },
                        " el pago se ha procesado conforme a la sección 7. Una cotización por sí sola no garantiza la disponibilidad del vehículo.",
                    ],
                },
                {
                    type: "p",
                    content:
                        "El Cliente debe proporcionar información veraz y completa: nombre, teléfono, direcciones de origen y destino, fecha, hora, número de pasajeros y equipaje. Para traslados desde el aeropuerto, también debe indicar el número de vuelo. Unify no se hace responsable de fallas en el Servicio causadas por datos incorrectos o incompletos.",
                },
                {
                    type: "p",
                    content:
                        "Si Unify no puede prestar un Servicio ya confirmado, lo notificará al Cliente lo antes posible y le reembolsará el 100 % del monto pagado.",
                },
            ],
        },
        {
            id: "tarifas",
            title: "Tarifas",
            blocks: [
                {
                    type: "p",
                    content:
                        "La Tarifa se calcula con base en la distancia y el tiempo estimado del recorrido, el tipo de servicio, la fecha y el horario. El precio cotizado y confirmado es el que se cobra, salvo por los cargos adicionales de esta sección. Todas las tarifas están en pesos mexicanos e incluyen IVA.",
                },
                { type: "p", content: "Podrán generarse cargos adicionales, siempre informados al Cliente, por:" },
                {
                    type: "ul",
                    items: [
                        "Tiempo de espera excedente (sección 9).",
                        "Paradas o desvíos no incluidos en la reserva original.",
                        "Extensión del tiempo contratado en servicios por horas.",
                        "Casetas y estacionamientos, cuando no estén incluidos en la cotización.",
                        "Servicios en horario nocturno o en días festivos, si aplica.",
                        "Limpieza o daños al vehículo (sección 11).",
                    ],
                },
                {
                    type: "p",
                    content: "Los cambios de ruta solicitados durante el trayecto quedan sujetos a aceptación del Chofer y a la tarifa correspondiente.",
                },
            ],
        },
        {
            id: "pagos",
            title: "Pagos y facturación",
            blocks: [
                {
                    type: "p",
                    content:
                        "El pago se realiza por adelantado al confirmar la reserva mediante tarjeta de crédito o débito, transferencia bancaria u otros medios aceptados. Unify no almacena los datos completos de las tarjetas: los procesa directamente la plataforma de pago.",
                },
                { type: "p", content: "Los cargos adicionales generados durante el Servicio se cobran al término del mismo por los medios indicados." },
                {
                    type: "p",
                    content: [
                        "Si el Cliente requiere factura (CFDI), debe solicitarla dentro de las 48 horas posteriores al Servicio y dentro del mismo mes a ",
                        EMAIL,
                        ", con sus datos fiscales completos.",
                    ],
                },
            ],
        },
        {
            id: "cancelaciones",
            title: "Cancelaciones, cambios y reembolsos",
            blocks: [
                { type: "p", content: "El Cliente puede cancelar una reserva confirmada con los siguientes cargos (propuesta):" },
                {
                    type: "table",
                    caption: "Reembolso según la anticipación del aviso de cancelación",
                    head: ["Aviso de cancelación", "Reembolso"],
                    rows: [
                        ["Con 24 horas o más de anticipación", "100 %"],
                        ["Entre 24 y 6 horas antes", "50 %"],
                        ["Con menos de 6 horas, o no-show", "Sin reembolso"],
                    ],
                },
                {
                    type: "p",
                    content:
                        "Las cancelaciones deben hacerse por correo o WhatsApp; la hora que cuenta es la de recepción del aviso. Los cambios de fecha, hora o ruta pueden solicitarse sin costo con al menos 12 horas de anticipación, sujetos a disponibilidad y al ajuste de la Tarifa que corresponda.",
                },
                {
                    type: "p",
                    content:
                        "Los reembolsos se hacen por el mismo medio de pago utilizado, dentro de 10 días hábiles. El tiempo en que se reflejan en la cuenta del Cliente depende de su banco.",
                },
            ],
        },
        {
            id: "espera",
            title: "Tiempo de espera y no presentación",
            blocks: [
                {
                    type: "p",
                    content:
                        "El Chofer llega al punto de recogida a la hora acordada. Después de esa hora se incluyen sin costo los siguientes tiempos de espera:",
                },
                {
                    type: "ul",
                    items: [
                        "Recogidas en la ciudad: 15 minutos de tolerancia.",
                        "Recogidas en el aeropuerto: 30 minutos desde el aterrizaje real del vuelo. Unify no da seguimiento al vuelo, por lo que los retrasos de la aerolínea pueden generar cargos extra.",
                        // En el .md esta viñeta está partida en dos líneas ("…M.N.)" / "- por cada fracción…"):
                        // se une en una sola, como en el sitio anterior, sin cambiar palabras.
                        "El tiempo de espera excedente se cobra a $60.00 M.N. (sesenta pesos 00/100 M.N.) por cada fracción de 15 minutos.",
                    ],
                },
                {
                    type: "p",
                    content: [
                        "Si el Pasajero no se presenta ni se comunica dentro de 45 minutos posteriores a la hora acordada (o del tiempo de espera de aeropuerto), el Servicio se considera ",
                        { strong: "no-show" },
                        ". En ese caso, el Chofer puede retirarse y el Servicio se cobra completo.",
                    ],
                },
            ],
        },
        {
            id: "obligaciones",
            title: "Obligaciones del pasajero",
            blocks: [
                { type: "p", content: "Para garantizar la seguridad y la calidad del Servicio, los Pasajeros se comprometen a:" },
                {
                    type: "ul",
                    items: [
                        "Usar el cinturón de seguridad durante todo el trayecto.",
                        "No exceder el número máximo de pasajeros ni la capacidad de equipaje del vehículo.",
                        "No fumar ni vapear dentro del vehículo.",
                        "No consumir bebidas alcohólicas, ni transportar o consumir sustancias ilícitas.",
                        "No transportar objetos peligrosos, armas ni mercancía ilegal.",
                        "Viajar con menores de edad solo bajo la supervisión de un adulto responsable. Si se requiere silla para bebé, debe solicitarse al reservar (sujeto a disponibilidad).",
                        "No viajar con mascotas.",
                        "Tratar al Chofer con respeto y no pedirle que infrinja las leyes de tránsito.",
                    ],
                },
                {
                    type: "p",
                    content:
                        "El Chofer puede negarse a iniciar el Servicio, o darlo por terminado, si un Pasajero incumple estas reglas o pone en riesgo su seguridad, la del Chofer o la de terceros. En ese caso no habrá reembolso.",
                },
            ],
        },
        {
            id: "limpieza",
            title: "Limpieza y daños al vehículo",
            blocks: [
                {
                    type: "p",
                    content:
                        "El Cliente es responsable de los daños que los Pasajeros causen al vehículo por uso indebido o negligencia. Los daños se documentarán con fotografías al terminar el Servicio y se notificarán al Cliente.",
                },
                {
                    type: "ul",
                    items: [
                        "Limpieza extraordinaria (por ejemplo, vómito, derrames o manchas): cargo fijo de $1000.00 M.N (mil pesos 00/100 M.N).",
                        "Daños materiales: el costo real de reparación, acreditado con cotización o factura del taller, más los días en que el vehículo quede fuera de servicio (si aplica).",
                    ],
                },
            ],
        },
        {
            id: "responsabilidad",
            title: "Responsabilidad y seguros",
            blocks: [
                {
                    type: "p",
                    content: "Los vehículos de Unify cuentan con seguro vigente que incluye responsabilidad civil y gastos médicos para ocupantes.",
                },
                {
                    type: "p",
                    content:
                        "Unify hará lo razonablemente posible por cumplir con los horarios acordados. Sin embargo, no es responsable de retrasos causados por tráfico, cierres viales, manifestaciones, condiciones climatológicas, accidentes de terceros u otras causas ajenas a su control. Tampoco responde por pérdidas indirectas, como vuelos perdidos o reuniones canceladas, cuando el retraso se deba a esas causas. Se recomienda al Cliente reservar con margen suficiente, sobre todo para traslados al aeropuerto.",
                },
                {
                    type: "p",
                    content:
                        "Los Pasajeros son responsables de sus pertenencias. Unify resguardará los objetos olvidados que encuentre durante 30 días, y el Cliente podrá recogerlos o solicitar su envío a su costa.",
                },
            ],
        },
        {
            id: "fuerza-mayor",
            title: "Caso fortuito o fuerza mayor",
            blocks: [
                {
                    type: "p",
                    content:
                        "Ninguna de las partes será responsable por el incumplimiento causado por caso fortuito o fuerza mayor, como desastres naturales, contingencias ambientales, disposiciones de autoridad o disturbios. Si por esa causa no puede prestarse el Servicio, Unify ofrecerá reprogramarlo sin costo o reembolsar el monto pagado.",
                },
            ],
        },
        {
            id: "propiedad",
            title: "Uso del sitio web y propiedad intelectual",
            blocks: [
                {
                    type: "p",
                    content:
                        "La marca Unify Luxury, el logotipo, el lema y los contenidos de unifyluxury.com (textos, diseño y software) son propiedad de Unify o se usan con autorización. No pueden reproducirse ni utilizarse sin consentimiento por escrito.",
                },
                {
                    type: "p",
                    content:
                        "El Usuario se compromete a usar el sitio solo para fines lícitos y a no interferir con su funcionamiento. Las cotizaciones del sitio son estimaciones y pueden contener errores; en ese caso, Unify informará al Cliente la Tarifa correcta antes de confirmar la reserva.",
                },
            ],
        },
        {
            id: "datos",
            title: "Datos personales",
            blocks: [
                {
                    type: "p",
                    content: [
                        "Unify trata los datos personales de los Clientes conforme a la legislación mexicana en materia de protección de datos personales. Los fines del tratamiento, la forma de ejercer los derechos ARCO y demás detalles se describen en el ",
                        { strong: "Aviso de Privacidad" },
                        ", disponible en ",
                        // "[enlace al Aviso de Privacidad]" del .md: se sustituye por el enlace real.
                        { link: "route", route: "privacy" },
                        ".",
                    ],
                },
            ],
        },
        {
            id: "quejas",
            title: "Quejas y aclaraciones",
            blocks: [
                {
                    type: "p",
                    content: [
                        "Las quejas o aclaraciones deben enviarse a ",
                        EMAIL,
                        " dentro de los 15 días naturales posteriores al Servicio, con el número de reserva y una descripción de lo ocurrido. Unify responderá en un plazo máximo de 10 días hábiles.",
                    ],
                },
            ],
        },
        {
            id: "modificaciones",
            title: "Modificaciones",
            blocks: [
                {
                    type: "p",
                    content:
                        "Unify puede modificar estos Términos en cualquier momento. Los cambios se publicarán en unifyluxury.com con su fecha de actualización y aplicarán únicamente a las reservas hechas después de su publicación.",
                },
            ],
        },
        {
            id: "legislacion",
            title: "Legislación aplicable y jurisdicción",
            blocks: [
                {
                    type: "p",
                    content:
                        "Estos Términos se rigen por las leyes de los Estados Unidos Mexicanos, en particular por la Ley Federal de Protección al Consumidor. Para cualquier controversia, las partes se someten a los tribunales competentes de la Ciudad de México, sin perjuicio de la competencia de Profeco en sede administrativa.",
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
            id: "aceptacion",
            title: "Acceptance of the Terms",
            blocks: [
                {
                    type: "p",
                    content:
                        "These Terms and Conditions govern the use of the unifyluxury.com website and the contracting of Unify services. By requesting a quote, making a reservation or completing a payment, the Client declares that they have read and accepted these Terms.",
                },
                {
                    type: "p",
                    content:
                        "If the Client does not agree with them, they must refrain from using the site and from contracting the services. Anyone who makes a reservation on behalf of other people is responsible for ensuring that the passengers know and respect these Terms.",
                },
            ],
        },
        {
            id: "definiciones",
            title: "Definitions",
            blocks: [
                {
                    type: "ul",
                    items: [
                        [{ strong: "Client:" }, " individual or legal entity contracting the service."],
                        [{ strong: "Passenger:" }, " each person traveling in the vehicle, whether or not the Client."],
                        [{ strong: "Service:" }, " the chauffeured luxury vehicle transfer contracted through Unify."],
                        [{ strong: "Reservation:" }, " the Service request confirmed by Unify in accordance with section 5."],
                        [{ strong: "Chauffeur:" }, " the driver assigned by Unify to provide the Service."],
                        [{ strong: "Fare:" }, " the price of the Service quoted and confirmed to the Client."],
                    ],
                },
            ],
        },
        {
            id: "servicios",
            title: "Service description",
            blocks: [
                { type: "p", content: "Unify offers private chauffeured luxury transport in Tesla electric vehicles. The services available are:" },
                {
                    type: "ul",
                    items: [
                        "Point-to-point transfers.",
                        "Transfers to and from the airport.",
                        "Hourly service, with the chauffeur at the Client's disposal.",
                        "Services for events and corporate clients.",
                        "Trips outside Mexico City, if applicable.",
                    ],
                },
                {
                    type: "p",
                    content:
                        "The Service is provided in Mexico City and its metropolitan area. Transfers outside this zone are quoted through other channels and are subject to availability.",
                },
                {
                    type: "p",
                    content:
                        "Each vehicle accommodates a maximum of 4 passengers and 2 standard-size suitcases. Unify assigns the vehicle according to availability. If a specific model was reserved and is not available, Unify may replace it with one of equal or higher category at no additional cost.",
                },
                { type: "p", content: "Unify provides the Service in accordance with the mobility regulations applicable in Mexico City." },
            ],
        },
        {
            id: "reservas",
            title: "Reservations and confirmation",
            blocks: [
                {
                    type: "p",
                    content:
                        "Reservations are made through unifyluxury.com or official contact channels, with a minimum of 12 hours in advance. Requests with less lead time are handled subject to availability.",
                },
                {
                    type: "p",
                    content: [
                        "A reservation is confirmed once the Client receives confirmation via email or WhatsApp ",
                        { strong: "and" },
                        " payment has been processed in accordance with section 7. A quote alone does not guarantee vehicle availability.",
                    ],
                },
                {
                    type: "p",
                    content:
                        "The Client must provide truthful and complete information: name, phone, origin and destination addresses, date, time, number of passengers and luggage. For airport transfers, the flight number must also be indicated. Unify is not responsible for Service failures caused by incorrect or incomplete information.",
                },
                {
                    type: "p",
                    content:
                        "If Unify is unable to provide a confirmed Service, it will notify the Client as soon as possible and refund 100% of the amount paid.",
                },
            ],
        },
        {
            id: "tarifas",
            title: "Fares",
            blocks: [
                {
                    type: "p",
                    content:
                        "The Fare is calculated based on the distance and estimated travel time, type of service, date and time. The quoted and confirmed price is the one charged, except for the additional charges in this section. All fares are in Mexican pesos and include VAT.",
                },
                { type: "p", content: "Additional charges may be generated, always disclosed to the Client, for:" },
                {
                    type: "ul",
                    items: [
                        "Excess waiting time (section 9).",
                        "Stops or detours not included in the original reservation.",
                        "Extension of contracted time for hourly services.",
                        "Tolls and parking, when not included in the quote.",
                        "Services during nighttime or on holidays, if applicable.",
                        "Vehicle cleaning or damages (section 11).",
                    ],
                },
                { type: "p", content: "Route changes requested during the trip are subject to the Chauffeur's acceptance and the corresponding fare." },
            ],
        },
        {
            id: "pagos",
            title: "Payments and invoicing",
            blocks: [
                {
                    type: "p",
                    content:
                        "Payment is made in advance when confirming the reservation by credit or debit card, bank transfer or other accepted means. Unify does not store full card data: it is processed directly by the payment platform.",
                },
                { type: "p", content: "Additional charges generated during the Service are collected at the end of the Service through the indicated means." },
                {
                    type: "p",
                    content: [
                        "If the Client requires an invoice (CFDI), they must request it within 48 hours after the Service and within the same month at ",
                        EMAIL,
                        ", providing complete tax information.",
                    ],
                },
            ],
        },
        {
            id: "cancelaciones",
            title: "Cancellations, changes and refunds",
            blocks: [
                { type: "p", content: "The Client may cancel a confirmed reservation with the following charges (proposed):" },
                {
                    type: "table",
                    caption: "Refund by how far in advance the cancellation notice is given",
                    head: ["Cancellation notice", "Refund"],
                    rows: [
                        ["24 hours or more in advance", "100%"],
                        ["Between 24 and 6 hours before", "50%"],
                        ["Less than 6 hours, or no-show", "No refund"],
                    ],
                },
                {
                    type: "p",
                    content:
                        "Cancellations must be made by email or WhatsApp; the time that counts is when the notice is received. Changes of date, time or route may be requested at no cost with at least 12 hours notice, subject to availability and the corresponding Fare adjustment.",
                },
                {
                    type: "p",
                    content:
                        "Refunds are issued through the same payment method used, within 10 business days. The time it takes to reflect in the Client's account depends on their bank.",
                },
            ],
        },
        {
            id: "espera",
            title: "Waiting time and no-show",
            blocks: [
                {
                    type: "p",
                    content:
                        "The Chauffeur arrives at the pick-up point at the agreed time. After that time, the following waiting periods are included at no cost:",
                },
                {
                    type: "ul",
                    items: [
                        "City pick-ups: 15 minutes grace period.",
                        "Airport pick-ups: 30 minutes from the actual flight landing. Unify does not track flights, so airline delays may generate extra charges.",
                        "Excess waiting time is charged at $60.00 MXN (sixty pesos 00/100 MXN) per each 15-minute fraction.",
                    ],
                },
                {
                    type: "p",
                    content: [
                        "If the Passenger does not show up or communicate within 45 minutes after the agreed time (or the airport waiting period), the Service is considered ",
                        { strong: "no-show" },
                        ". In that case, the Chauffeur may leave and the Service is charged in full.",
                    ],
                },
            ],
        },
        {
            id: "obligaciones",
            title: "Passenger obligations",
            blocks: [
                { type: "p", content: "To ensure the safety and quality of the Service, Passengers commit to:" },
                {
                    type: "ul",
                    items: [
                        "Wear the seatbelt throughout the trip.",
                        "Not exceed the maximum number of passengers or vehicle luggage capacity.",
                        "Not smoke or vape inside the vehicle.",
                        "Not consume alcoholic beverages, nor transport or consume illicit substances.",
                        "Not transport dangerous objects, weapons or illegal merchandise.",
                        "Travel with minors only under the supervision of a responsible adult. If a baby seat is required, it must be requested at booking (subject to availability).",
                        "Not travel with pets.",
                        "Treat the Chauffeur with respect and not ask them to break traffic laws.",
                    ],
                },
                {
                    type: "p",
                    content:
                        "The Chauffeur may refuse to start the Service, or terminate it, if a Passenger breaches these rules or endangers their own safety, the Chauffeur's or third parties'. In that case there will be no refund.",
                },
            ],
        },
        {
            id: "limpieza",
            title: "Vehicle cleaning and damages",
            blocks: [
                {
                    type: "p",
                    content:
                        "The Client is responsible for damages caused to the vehicle by Passengers through misuse or negligence. Damages will be documented with photographs at the end of the Service and reported to the Client.",
                },
                {
                    type: "ul",
                    items: [
                        "Extraordinary cleaning (e.g., vomit, spills or stains): fixed charge of $1,000.00 MXN (one thousand pesos 00/100 MXN).",
                        "Material damages: the actual cost of repair, supported by a workshop quote or invoice, plus the days the vehicle is out of service (if applicable).",
                    ],
                },
            ],
        },
        {
            id: "responsabilidad",
            title: "Liability and insurance",
            blocks: [
                { type: "p", content: "Unify vehicles carry valid insurance that includes civil liability and medical expenses for occupants." },
                {
                    type: "p",
                    content:
                        "Unify will make all reasonable efforts to meet the agreed schedules. However, it is not responsible for delays caused by traffic, road closures, protests, weather conditions, third-party accidents or other causes beyond its control. It is also not liable for indirect losses, such as missed flights or canceled meetings, when the delay is due to such causes. The Client is advised to book with sufficient margin, especially for airport transfers.",
                },
                {
                    type: "p",
                    content:
                        "Passengers are responsible for their belongings. Unify will hold any forgotten items found for 30 days, and the Client may pick them up or request shipment at their own cost.",
                },
            ],
        },
        {
            id: "fuerza-mayor",
            title: "Force majeure",
            blocks: [
                {
                    type: "p",
                    content:
                        "Neither party will be liable for non-performance caused by force majeure, such as natural disasters, environmental contingencies, authority rulings or disturbances. If the Service cannot be provided for this reason, Unify will offer to reschedule it at no cost or refund the amount paid.",
                },
            ],
        },
        {
            id: "propiedad",
            title: "Website use and intellectual property",
            blocks: [
                {
                    type: "p",
                    content:
                        "The Unify Luxury brand, logo, slogan and the contents of unifyluxury.com (text, design and software) are the property of Unify or used under authorization. They may not be reproduced or used without written consent.",
                },
                {
                    type: "p",
                    content:
                        "The User commits to use the site only for lawful purposes and not to interfere with its operation. Site quotes are estimates and may contain errors; in that case, Unify will inform the Client of the correct Fare before confirming the reservation.",
                },
            ],
        },
        {
            id: "datos",
            title: "Personal data",
            blocks: [
                {
                    type: "p",
                    content: [
                        "Unify processes Client personal data in accordance with Mexican data protection legislation. The processing purposes, the way to exercise ARCO rights and other details are described in the ",
                        { strong: "Privacy Notice" },
                        ", available at ",
                        { link: "route", route: "privacy" },
                        ".",
                    ],
                },
            ],
        },
        {
            id: "quejas",
            title: "Complaints and clarifications",
            blocks: [
                {
                    type: "p",
                    content: [
                        "Complaints or clarifications must be sent to ",
                        EMAIL,
                        " within 15 calendar days after the Service, including the reservation number and a description of what happened. Unify will respond within a maximum of 10 business days.",
                    ],
                },
            ],
        },
        {
            id: "modificaciones",
            title: "Modifications",
            blocks: [
                {
                    type: "p",
                    content:
                        "Unify may modify these Terms at any time. Changes will be published at unifyluxury.com with their update date and will apply only to reservations made after their publication.",
                },
            ],
        },
        {
            id: "legislacion",
            title: "Applicable law and jurisdiction",
            blocks: [
                {
                    type: "p",
                    content:
                        "These Terms are governed by the laws of the United Mexican States, in particular by the Federal Consumer Protection Law. For any dispute, the parties submit to the competent courts of Mexico City, without prejudice to Profeco's jurisdiction in administrative matters.",
                },
            ],
        },
    ],
};

export const termsAndConditions: Record<Locale, LegalDocument> = { es, en };
