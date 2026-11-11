// Preguntas frecuentes. Única fuente: terminos-condiciones.md (secciones entre paréntesis).
// Si cambian los términos, se cambia aquí. No agregar hechos que no estén en los términos.
import type { Locale } from "@/i18n/config";

export type FaqTopic = "general" | "pricing";

export type FaqItem = {
    id: string;
    topic: FaqTopic;
    question: string;
    answer: string;
};

const es: FaqItem[] = [
    {
        // §5
        id: "anticipacion",
        topic: "general",
        question: "¿Con cuánta anticipación debo reservar?",
        answer: "Con al menos 12 horas. Las solicitudes con menos anticipación se atienden según disponibilidad. Tu reserva queda confirmada cuando recibes la confirmación por correo o WhatsApp y el pago se ha procesado.",
    },
    {
        // §9
        id: "espera",
        topic: "general",
        question: "¿Cuánto tiempo me espera el chofer?",
        answer: "En la ciudad, 15 minutos sin costo después de la hora acordada. En el aeropuerto, 30 minutos desde el aterrizaje real del vuelo. El tiempo excedente se cobra a $60 MXN por cada 15 minutos. Si nadie se presenta ni se comunica en 45 minutos, el servicio se considera no presentado y se cobra completo.",
    },
    {
        // §8
        id: "cancelaciones",
        topic: "general",
        question: "¿Puedo cancelar o cambiar mi reserva?",
        answer: "Sí, por correo o WhatsApp. Con 24 horas o más de aviso se reembolsa el 100 %; entre 24 y 6 horas antes, el 50 %; con menos de 6 horas o si no te presentas, no hay reembolso. Los cambios de fecha, hora o ruta no tienen costo si los pides con al menos 12 horas, sujetos a disponibilidad y al ajuste de tarifa. Los reembolsos se hacen al mismo medio de pago en un máximo de 10 días hábiles.",
    },
    {
        // §4
        id: "capacidad",
        topic: "general",
        question: "¿Cuántas personas y maletas caben?",
        answer: "Cada vehículo admite hasta 4 pasajeros y 2 maletas de tamaño estándar. Si viajas con más personas o equipaje, escríbenos para una cotización personalizada.",
    },
    {
        // §4
        id: "zona",
        topic: "general",
        question: "¿En qué zona dan servicio? ¿Hacen viajes fuera de la ciudad?",
        answer: "Damos servicio en la Ciudad de México y su área metropolitana. Los viajes fuera de esta zona se cotizan aparte y están sujetos a disponibilidad.",
    },
    {
        // §5, §9 y §12
        id: "aeropuerto",
        topic: "general",
        question: "¿Qué necesito para un traslado al aeropuerto?",
        answer: "Para recogerte en el aeropuerto necesitamos tu número de vuelo. La espera incluida es de 30 minutos desde el aterrizaje real; no damos seguimiento al vuelo, así que los retrasos de la aerolínea pueden generar cargos. Si vas al aeropuerto, reserva con margen suficiente.",
    },
    {
        // §10
        id: "reglas",
        topic: "general",
        question: "¿Qué reglas hay a bordo?",
        answer: "Usa el cinturón durante todo el trayecto. No se permite fumar ni vapear, consumir alcohol ni viajar con mascotas. Los menores viajan con un adulto responsable; si necesitas silla para bebé, pídela al reservar (sujeta a disponibilidad).",
    },
    {
        // §6
        id: "tarifa",
        topic: "pricing",
        question: "¿Cómo se calcula la tarifa?",
        answer: "Según la distancia y el tiempo estimado del recorrido, el nivel de servicio, la fecha y el horario. El precio confirmado es el que se cobra. Todas las tarifas están en pesos mexicanos e incluyen IVA. Los cargos adicionales, como espera excedente o paradas no previstas, siempre se te informan.",
    },
    {
        // §7
        id: "pago",
        topic: "pricing",
        question: "¿Cómo pago? ¿Puedo pedir factura?",
        answer: "El pago es por adelantado al confirmar la reserva, con tarjeta de crédito o débito, transferencia u otros medios aceptados. Si necesitas factura (CFDI), pídela a unifymx@outlook.com dentro de las 48 horas posteriores al servicio y dentro del mismo mes, con tus datos fiscales completos.",
    },
    {
        // §6
        id: "casetas",
        topic: "pricing",
        question: "¿Las casetas y el estacionamiento están incluidos?",
        answer: "Solo si vienen incluidos en tu cotización. Si no, se cobran aparte y siempre se te informan antes.",
    },
];

const en: FaqItem[] = [
    {
        id: "anticipacion",
        topic: "general",
        question: "How far in advance should I book?",
        answer: "At least 12 hours ahead. Requests with less notice are handled subject to availability. Your booking is confirmed once you receive confirmation by email or WhatsApp and the payment has been processed.",
    },
    {
        id: "espera",
        topic: "general",
        question: "How long will the driver wait for me?",
        answer: "In the city, 15 minutes at no cost after the agreed time. At the airport, 30 minutes from the flight's actual landing. Extra waiting time is charged at $60 MXN per 15 minutes. If no one shows up or gets in touch within 45 minutes, the ride counts as a no-show and is charged in full.",
    },
    {
        id: "cancelaciones",
        topic: "general",
        question: "Can I cancel or change my booking?",
        answer: "Yes, by email or WhatsApp. With 24 hours' notice or more, you get a 100 % refund; between 24 and 6 hours before, 50 %; with less than 6 hours or a no-show, there is no refund. Changes to date, time or route are free if requested at least 12 hours ahead, subject to availability and any fare adjustment. Refunds go back to the original payment method within 10 business days.",
    },
    {
        id: "capacidad",
        topic: "general",
        question: "How many passengers and bags fit?",
        answer: "Each vehicle takes up to 4 passengers and 2 standard-size suitcases. If you're traveling with more people or luggage, message us for a custom quote.",
    },
    {
        id: "zona",
        topic: "general",
        question: "Where do you operate? Do you travel outside the city?",
        answer: "We serve Mexico City and its metropolitan area. Rides outside this area are quoted separately and subject to availability.",
    },
    {
        id: "aeropuerto",
        topic: "general",
        question: "What do you need for an airport transfer?",
        answer: "For airport pickups we need your flight number. The included wait is 30 minutes from the actual landing; we don't track flights, so airline delays may lead to extra charges. If you're heading to the airport, book with enough margin.",
    },
    {
        id: "reglas",
        topic: "general",
        question: "What are the rules on board?",
        answer: "Wear your seat belt for the whole ride. Smoking, vaping, alcohol and pets are not allowed. Minors travel with a responsible adult; if you need a baby seat, request it when booking (subject to availability).",
    },
    {
        id: "tarifa",
        topic: "pricing",
        question: "How is the fare calculated?",
        answer: "By distance and estimated travel time, service level, date and time of day. The confirmed price is what you pay. All fares are in Mexican pesos and include VAT. Any additional charges, such as extra waiting time or unplanned stops, are always communicated to you.",
    },
    {
        id: "pago",
        topic: "pricing",
        question: "How do I pay? Can I get an invoice?",
        answer: "Payment is made in advance when the booking is confirmed, by credit or debit card, bank transfer or other accepted methods. If you need an invoice (CFDI), request it at unifymx@outlook.com within 48 hours after the ride and within the same month, with your full tax details.",
    },
    {
        id: "casetas",
        topic: "pricing",
        question: "Are tolls and parking included?",
        answer: "Only if they're included in your quote. If not, they're charged separately and always communicated in advance.",
    },
];

const copy = {
    es: {
        title: "Preguntas frecuentes",
        text: "Lo esencial de nuestros términos, en pocas palabras.",
        terms: "Leer términos y condiciones",
    },
    en: {
        title: "Frequently asked questions",
        text: "The essentials of our terms, in a few words.",
        terms: "Read terms and conditions",
    },
} satisfies Record<Locale, unknown>;

export const faq: Record<Locale, FaqItem[]> = { es, en };
export const faqCopy: Record<Locale, (typeof copy)["es"]> = copy;
