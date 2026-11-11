// Página de Tarifas (/tarifas). El español define los tipos; el inglés se tipa contra él.
// Ninguna cifra de tarifa vive aquí: las plantillas llevan {marcadores} que se llenan con la config
// de precios en el servidor (src/lib/pricing). Las políticas salen de terminos-condiciones.md (§ 6 a 9).

const pricing = {
    meta: {
        title: "Tarifas y cotizador",
        description:
            "Cotiza tu traslado en Tesla con chofer en la Ciudad de México. Precio fijo antes de reservar, en pesos y con IVA incluido. Así se calcula cada tarifa.",
    },
    hero: {
        title: "Tarifas",
        text: "Precio fijo antes de reservar, en pesos mexicanos y con IVA incluido.",
    },
    formula: {
        title: "Así se calcula",
        text: "Una sola fórmula para todos los viajes. El precio cotizado y confirmado es el que pagas; cualquier cargo adicional siempre se te informa.",
        stepsLabel: "Pasos del cálculo",
        steps: {
            fare: {
                title: "Nivel y distancia",
                text: "Cada nivel tiene una tarifa base, a la que se suma el costo por kilómetro. Si el trayecto es corto, se cobra la tarifa mínima del nivel.",
            },
            time: {
                title: "Horario y día",
                text: "Los recargos se aplican sobre la tarifa del paso anterior. Si tu viaje cae en dos a la vez, se combinan.",
            },
            passengers: {
                title: "Pasajeros",
                /** {max}: capacidad del vehículo. */
                text: "Cada vehículo lleva hasta {max} pasajeros. Al final se suma el cargo por pasajero adicional, si aplica.",
            },
        },
        levelTable: {
            caption: "Tarifa base, costo por kilómetro y tarifa mínima de cada nivel",
            level: "Nivel",
            base: "Tarifa base",
            perKm: "Por kilómetro",
            minimum: "Tarifa mínima",
        },
        clock: {
            label: "Recargos por horario a lo largo del día",
            peak: "Hora pico",
            night: "Nocturno",
            normal: "Resto del día",
            noSurcharge: "Sin recargo",
            /** Rango de horas: {start} y {end}. */
            range: "{start} a {end}",
            join: " y ",
            weekdaysLabel: "Recargo por día de la semana",
            /** Iniciales de lunes a domingo (decorativas; la leyenda lo dice en texto). */
            weekdays: ["L", "M", "M", "J", "V", "S", "D"],
            weekend: "Sábado y domingo",
            holiday: "Días festivos",
            holidayNote: "El recargo de día festivo reemplaza al de fin de semana.",
        },
        /** {n}: porcentaje entero. Espacio fino no separable antes de "%". */
        percent: "+{n} %",
        /** {m}: multiplicador (1.25). */
        multiplier: "×{m}",
        passenger: {
            /** {n}: número ordinal del primer pasajero con cargo. */
            from: "Desde el {n}.º pasajero",
            each: "por pasajero",
        },
        luggage: {
            from: "Desde la {n}.ª maleta",
            each: "por maleta",
        },
        example: {
            title: "Un ejemplo",
            /** {level}: nivel del ejemplo. */
            text: "En {level}, entre semana y en horario normal. El cálculo completo, línea por línea:",
            to: "a",
            km: "km",
            base: "Tarifa base",
            /** {km} y {rate}. */
            distance: "{km} km × {rate}",
            minimum: "Tarifa mínima de {level}: {amount}",
            minimumNotApplied: "No aplica",
            normalHours: "Horario normal, entre semana",
            total: "Total",
            /** {time}: hora del ejemplo en hora pico. */
            peakTitle: "Si sales a las {time}",
            peakText: "Hora pico entre semana",
            levelsTitle: "La misma ruta en cada nivel",
            levelsNote: "Entre semana, en horario normal.",
        },
    },
    includes: {
        title: "Qué incluye tu tarifa",
        text: "Lo que pagas y lo que no, según nuestros términos y condiciones.",
        vat: {
            title: "IVA incluido",
            text: "Todas las tarifas están en pesos mexicanos e incluyen IVA. Si necesitas factura (CFDI), la pides después del servicio.",
        },
        waiting: {
            title: "Espera sin costo",
            /** {city}, {airport}: minutos. */
            city: "{city} min en la ciudad",
            airport: "{airport} min en el aeropuerto",
            /** {amount}: costo por fracción; {block}: minutos de cada fracción. */
            text: "En el aeropuerto, contados desde el aterrizaje real del vuelo. El tiempo excedente se cobra a {amount} por cada fracción de {block} minutos.",
        },
        capacity: {
            /** {passengers} y {luggage}. */
            title: "Hasta {passengers} pasajeros y {luggage} maletas",
            text: "Por vehículo, con maletas de tamaño estándar. Para grupos o más equipaje te hacemos una cotización personalizada.",
        },
        payment: {
            title: "Pago por adelantado",
            text: "Al confirmar la reserva, con tarjeta de crédito o débito, transferencia u otros medios aceptados.",
        },
        tolls: {
            title: "Casetas y estacionamiento",
            text: "No están incluidos, salvo que vengan en tu cotización. Si se generan, siempre se te informan.",
        },
        cancellation: {
            title: "Cancelaciones",
            text: "Cancela por correo o WhatsApp; cuenta la hora en que recibimos tu aviso. El reembolso se hace al mismo medio de pago.",
            listLabel: "Reembolso según la anticipación del aviso",
            rows: [
                { notice: "Con 24 horas o más", refund: "100 %" },
                { notice: "Entre 24 y 6 horas", refund: "50 %" },
                { notice: "Con menos de 6 horas o no-show", refund: "Sin reembolso" },
            ],
            terms: "Leer los términos completos",
        },
    },
    custom: {
        title: "Lo que no se cotiza en línea",
        text: "Servicio por horas, eventos, viajes fuera de la ciudad o grupos grandes: escríbenos y te enviamos una cotización a la medida.",
        cta: "Cotizar por WhatsApp",
        note: "Atención de lunes a sábado, de 8:00 a 22:00.",
        listLabel: "Servicios con cotización personalizada",
        items: {
            hourly: { title: "Por horas", text: "El chofer a tu disposición durante el tiempo que contrates." },
            event: { title: "Eventos y empresas", text: "Traslados para tu evento o para tu equipo." },
            out_of_zone: {
                title: "Fuera de la Ciudad de México",
                text: "Se cotizan aparte y están sujetos a disponibilidad.",
            },
            capacity: {
                title: "Grupos o más equipaje",
                /** {passengers} y {luggage}. */
                text: "Más de {passengers} pasajeros o de {luggage} maletas.",
            },
        },
        external: "(abre WhatsApp)",
    },
};

export type PricingDictionary = typeof pricing;
export default pricing;
