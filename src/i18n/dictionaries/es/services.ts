// Página de Servicios (/servicios). El español define los tipos; el inglés se tipa contra él.
// Tipos de servicio: exactamente los de la sección 4 de terminos-condiciones.md. Las cifras de espera
// y capacidad llegan de la config de precios como {marcadores}.

const services = {
    meta: {
        title: "Servicios",
        description:
            "Transporte privado de lujo con chofer en Tesla: traslados punto a punto, al aeropuerto, por horas, eventos y empresas en la Ciudad de México.",
    },
    hero: {
        title: "Servicios",
        text: "Transporte privado con chofer en Tesla, en la Ciudad de México y su área metropolitana. Elige el viaje; nosotros cuidamos el resto.",
        imageAlt: "Tesla rojo estacionado frente a edificios modernos y palmeras",
    },
    types: {
        title: "Cinco formas de viajar con Unify",
        text: "Los traslados en la ciudad se cotizan al momento. Lo demás lo preparamos contigo por WhatsApp.",
        online: "Cotiza en línea",
        custom: "Cotización personalizada",
        featuresLabel: "Detalles del servicio",
        quoteCta: "Cotizar traslado",
        whatsappCta: "Cotizar por WhatsApp",
        external: "(abre WhatsApp)",
        items: {
            point: {
                title: "Traslados punto a punto",
                text: "De la puerta que indiques a tu destino, dentro de la Ciudad de México y el área metropolitana. Ves el precio antes de reservar.",
                /** {city}: minutos de tolerancia; {passengers} y {luggage}: capacidad. */
                features: [
                    "{city} minutos de tolerancia sin costo",
                    "Hasta {passengers} pasajeros y {luggage} maletas",
                    "Solo ida, o ida y vuelta",
                ],
                imageAlt: "Tesla rojo de perfil en un espacio oscuro, frente a paneles de luz roja",
            },
            airport: {
                title: "Aeropuerto",
                text: "Ida o regreso, desde y hacia el aeropuerto. No damos seguimiento al vuelo: si la aerolínea se retrasa, la espera extra puede tener costo.",
                /** {airport}: minutos de espera sin costo. */
                features: [
                    "{airport} minutos de espera sin costo desde el aterrizaje",
                    "Indica tu número de vuelo al reservar",
                    "Ida, regreso o ambos",
                ],
                imageAlt: "Vista hacia arriba a través del techo de cristal de un Tesla, con palmeras y cielo despejado",
            },
            hourly: {
                title: "Servicio por horas",
                text: "Tu chofer queda a tu disposición durante el tiempo que contrates. Si necesitas más, la extensión se cobra aparte y siempre se te informa.",
            },
            event: {
                title: "Eventos y empresas",
                text: "Traslados para tu evento o para tu equipo, cotizados según fechas, horarios y número de vehículos.",
            },
            out_of_zone: {
                title: "Fuera de la Ciudad de México",
                text: "Viajes más allá del área metropolitana. Se cotizan aparte y están sujetos a disponibilidad.",
            },
        },
        customImageAlt: "Tesla rojo en una carretera costera junto al mar, visto desde lo alto",
    },
};

export type ServicesDictionary = typeof services;
export default services;
