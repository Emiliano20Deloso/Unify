export type Lang = "es" | "en";

export const translations = {
    es: {
        nav: {
            inicio: "Inicio",
            servicios: "Servicios",
            tarifas: "Tarifas",
            about: "Nosotros",
            contacto: "Contacto",
            reservar: "Reservar ahora",
        },
        hero: {
            tagline: "The luxury of travelling green",
            description: "Experimenta el transporte de lujo en una flota exclusiva de Tesla. Potencia eléctrica, silencio absoluto y sofisticación en cada kilómetro.",
            cta: "Reserva tu viaje",
            tripsLabel: "Viajes",
            satisfactionLabel: "Satisfacción",
        },
        companies: {
            label: "Ecosistema de movilidad",
            title: "Conectados con los",
            titleHighlight: "líderes",
            titleEnd: "en movilidad",
        },
        features: {
            label: "Por qué elegirnos",
            title: "Lo que nos hace",
            titleHighlight: "diferentes",
            titleEnd: "e insuperables",
            items: [
                {
                    title: "Confort de lujo",
                    description: "Vehículos Tesla equipados para que disfrutes cada minuto del trayecto: silencio, espacio y tecnología a tu alcance.",
                },
                {
                    title: "Seguridad garantizada",
                    description: "Conductores certificados, monitoreo de viaje en tiempo real; todo para tu total tranquilidad.",
                },
                {
                    title: "Reservas simples",
                    description: "Agenda tu viaje fácil y rápido. Te confirmamos en minutos vía WhatsApp o correo.",
                },
                {
                    title: "Tarifa justa, sin sorpresas",
                    description: "Conoce el costo antes de viajar. Cotización clara según distancia y tiempo.",
                },
                {
                    title: "Viajes para negocios",
                    description: "Ideal para reuniones, traslados corporativos o eventos. Puntualidad y discreción absoluta.",
                },
            ],
        },
        analysis: {
            label: "Estándares de excelencia",
            title: "Expertos en crear",
            titleHighlight: "viajes impecables",
            titleEnd: "y en redefinir lo que significa viajar bien",
            card1: {
                title: "Excelencia que acompaña cada trayecto",
                desc: "Un servicio diseñado para los más altos estándares: puntual, seguro y cuidadosamente administrado para tu tranquilidad.",
                metric: "+1,500 viajes",
                metricSub: "98% de satisfacción",
                cols: ["Confort", "Seguridad", "Atención", "Confiabilidad"],
                rows: [
                    ["Asientos Premium", "Estructura 5★", "Soporte 24/7", "Alta Disponibilidad"],
                    ["Streaming", "Tracking real-time", "White-glove", "Puntualidad garantizada"],
                    ["Silencio Total", "Frenado auto.", "Personal VIP", "0 accidentes"],
                ],
            },
            card2: {
                title: "Disfruta cada kilómetro a bordo",
                desc: "Haz más placenteros tus traslados con una selección de bebidas y snacks pensada para cada tipo de viaje.",
                metric: "Máxima comodidad",
                metricSub: "Adaptable a tus gustos",
                cols: ["Plan", "Bebida", "Dulce", "Salado"],
                rows: [
                    ["Práctico", "Agua natural", "—", "Mix nueces"],
                    ["Select", "Agua mineral", "Galletas", "Frutos / Chips"],
                    ["Premium", "Bebidas premium", "Alta confitería", "Frutos selectos"],
                ],
                disclaimer: "*Variedades sujetas a disponibilidad.",
            },
        },
        pricing: {
            label: "Niveles de servicio",
            title: "Elige tu",
            titleHighlight: "experiencia",
            subtitle: "Cada viaje es cotizado según distancia y tiempo. Contáctanos para tu tarifa personalizada.",
            mostPopular: "Más popular",
            cta: "Cotizar vía WhatsApp",
            tiers: [
                {
                    id: "practico",
                    title: "Práctico",
                    badge: false,
                    desc: "La experiencia UNIFY en su versión esencial. Ideal para traslados rápidos y eficientes.",
                    features: [
                        "Vehículo Tesla",
                        "Conductor certificado",
                        "Agua natural",
                        "Mix de nueces",
                        "Reserva vía WhatsApp",
                        "Rastreo en tiempo real",
                    ],
                },
                {
                    id: "select",
                    title: "Select",
                    badge: true,
                    desc: "Una experiencia elevada con detalles pensados para hacer tu viaje más cómodo y memorable.",
                    features: [
                        "Vehículo Tesla premium",
                        "Conductor certificado VIP",
                        "Agua mineral premium",
                        "Galletas artesanales",
                        "Frutos secos y chips",
                        "Música a tu elección",
                        "Cargador inalámbrico",
                    ],
                },
                {
                    id: "premium",
                    title: "Premium",
                    badge: false,
                    desc: "El pináculo del transporte de lujo. Una experiencia diseñada para quienes exigen lo mejor.",
                    features: [
                        "Tesla Model S / X",
                        "Conductor de élite",
                        "Bebidas premium seleccionadas",
                        "Alta confitería",
                        "Frutos secos de lujo",
                        "Ambiente personalizado",
                        "Prioridad de reserva 24/7",
                        "Servicio white-glove",
                    ],
                },
            ],
        },
        howItWorks: {
            label: "Proceso",
            title: "Tu viaje en",
            titleHighlight: "3 pasos",
            steps: [
                {
                    number: "01",
                    title: "Reserva tu viaje",
                    desc: "Escríbenos por WhatsApp o contáctanos directamente. Te confirmamos disponibilidad y tarifa en minutos.",
                },
                {
                    number: "02",
                    title: "Tu Tesla llega a ti",
                    desc: "Tu conductor certificado llega puntual a la dirección que indiques, listo para brindarte la mejor experiencia.",
                },
                {
                    number: "03",
                    title: "Disfruta el trayecto",
                    desc: "Relájate en el interior premium de tu Tesla. Silencio, comodidad y los amenities de tu plan seleccionado.",
                },
            ],
        },
        cta: {
            label: "Empieza hoy",
            title: "Tus mañanas pueden empezar mejor.",
            titleHighlight: "Solo necesitas un viaje a tu altura.",
            subtitle: "Reserva en minutos vía WhatsApp. Tu Tesla estará listo cuando tú lo estés.",
            button: "Reserva tu próximo viaje",
        },
    },

    en: {
        nav: {
            inicio: "Home",
            servicios: "Services",
            tarifas: "Pricing",
            about: "About Us",
            contacto: "Contact",
            reservar: "Book now",
        },
        hero: {
            tagline: "The luxury of travelling green",
            description: "Experience luxury transportation in an exclusive Tesla fleet. Electric power, absolute silence, and sophistication in every kilometer.",
            cta: "Book your Tesla",
            tripsLabel: "Trips",
            satisfactionLabel: "Satisfaction",
        },
        companies: {
            label: "Mobility ecosystem",
            title: "Connected with the",
            titleHighlight: "leaders",
            titleEnd: "in mobility",
        },
        features: {
            label: "Why choose us",
            title: "What makes us",
            titleHighlight: "different",
            titleEnd: "and unbeatable",
            items: [
                {
                    title: "Luxury comfort",
                    description: "Tesla vehicles equipped for you to enjoy every minute: silence, space and technology at your fingertips.",
                },
                {
                    title: "Guaranteed safety",
                    description: "Certified drivers, real-time trip monitoring; everything for your total peace of mind.",
                },
                {
                    title: "Simple reservations",
                    description: "Schedule your trip easily and quickly. We confirm in minutes via WhatsApp or email.",
                },
                {
                    title: "Fair pricing, no surprises",
                    description: "Know the cost before traveling. Clear quote based on distance and time.",
                },
                {
                    title: "Business travel",
                    description: "Ideal for meetings, corporate transfers or events. Absolute punctuality and discretion.",
                },
            ],
        },
        analysis: {
            label: "Excellence standards",
            title: "Experts in creating",
            titleHighlight: "flawless journeys",
            titleEnd: "and redefining what it means to travel well",
            card1: {
                title: "Excellence that accompanies every journey",
                desc: "A service designed for the highest standards: punctual, safe and carefully managed for your peace of mind.",
                metric: "+1,500 trips",
                metricSub: "98% satisfaction",
                cols: ["Comfort", "Safety", "Attention", "Reliability"],
                rows: [
                    ["Premium Seats", "5★ Structure", "24/7 Support", "High Availability"],
                    ["Streaming", "Real-time tracking", "White-glove", "Punctuality guaranteed"],
                    ["Total Silence", "Auto braking", "VIP Staff", "0 accidents"],
                ],
            },
            card2: {
                title: "Enjoy every kilometer on board",
                desc: "Make your transfers more enjoyable with a selection of beverages and snacks designed for every type of trip.",
                metric: "Maximum comfort",
                metricSub: "Adaptable to your tastes",
                cols: ["Plan", "Drink", "Sweet", "Savory"],
                rows: [
                    ["Essential", "Still water", "—", "Nut mix"],
                    ["Select", "Sparkling water", "Cookies", "Nuts / Chips"],
                    ["Premium", "Premium drinks", "Fine confectionery", "Select nuts"],
                ],
                disclaimer: "*Varieties subject to availability.",
            },
        },
        pricing: {
            label: "Service levels",
            title: "Choose your",
            titleHighlight: "experience",
            subtitle: "Each trip is quoted based on distance and time. Contact us for your personalized rate.",
            mostPopular: "Most popular",
            cta: "Get a quote via WhatsApp",
            tiers: [
                {
                    id: "essential",
                    title: "Essential",
                    badge: false,
                    desc: "The UNIFY experience in its essential version. Ideal for quick and efficient transfers.",
                    features: [
                        "Tesla vehicle",
                        "Certified driver",
                        "Still water",
                        "Nut mix",
                        "Book via WhatsApp",
                        "Real-time tracking",
                    ],
                },
                {
                    id: "select",
                    title: "Select",
                    badge: true,
                    desc: "An elevated experience with details designed to make your trip more comfortable and memorable.",
                    features: [
                        "Premium Tesla vehicle",
                        "Certified VIP driver",
                        "Premium sparkling water",
                        "Artisan cookies",
                        "Nuts and chips",
                        "Music of your choice",
                        "Wireless charger",
                    ],
                },
                {
                    id: "premium",
                    title: "Premium",
                    badge: false,
                    desc: "The pinnacle of luxury transportation. An experience designed for those who demand the best.",
                    features: [
                        "Tesla Model S / X",
                        "Elite driver",
                        "Curated premium drinks",
                        "Fine confectionery",
                        "Luxury nuts",
                        "Personalized atmosphere",
                        "24/7 priority booking",
                        "White-glove service",
                    ],
                },
            ],
        },
        howItWorks: {
            label: "Process",
            title: "Your journey in",
            titleHighlight: "3 steps",
            steps: [
                {
                    number: "01",
                    title: "Book your ride",
                    desc: "Message us on WhatsApp or contact us directly. We confirm availability and pricing in minutes.",
                },
                {
                    number: "02",
                    title: "Your Tesla arrives",
                    desc: "Your certified driver arrives punctually at your location, ready to provide the best experience.",
                },
                {
                    number: "03",
                    title: "Enjoy the journey",
                    desc: "Relax in your Tesla's premium interior. Silence, comfort and the amenities of your selected plan.",
                },
            ],
        },
        cta: {
            label: "Start today",
            title: "Your mornings can start better.",
            titleHighlight: "You just need a ride that matches your level.",
            subtitle: "Book in minutes via WhatsApp. Your Tesla will be ready when you are.",
            button: "Book your next ride",
        },
    },
} as const;

export type Translations = typeof translations[Lang];
