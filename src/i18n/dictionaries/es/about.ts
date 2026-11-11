// Textos de /nosotros. Fuente de verdad: Nosotros.md (no se inventa historia, cifras ni nombres).
// El español define los tipos; las fotos y su encuadre viven en src/content/about.ts.

const about = {
    meta: {
        title: "Nosotros",
        description: "El lujo del futuro: silencioso, limpio e inteligente. Conoce quiénes somos y por qué operamos solo con Tesla.",
    },
    title: "Nosotros",
    lead: "El lujo del futuro: silencioso, limpio e inteligente.",
    heroAlt: "Tesla blanco de frente, entre muros de concreto iluminados",
    story: {
        title: "Quiénes somos",
        paragraphs: [
            "Somos dos hermanos que nos cansamos de lo mismo: cada vez que necesitábamos un traslado rápido y cómodo, nos recibían autos en pésimas condiciones y choferes poco capacitados. Un día nos preguntamos: ¿por qué tendríamos que conformarnos con un servicio cada vez peor y cada vez más caro?",
            "No teníamos por qué. Así nació Unify: autos impecables, choferes profesionales y un servicio pensado para que tu tiempo en el camino valga la pena. Llevamos a viajeros, ejecutivos y a cualquiera que valore su tiempo, con la misma atención en un traslado al aeropuerto que en una noche especial.",
        ],
    },
    tesla: {
        title: "Por qué Tesla",
        text: "Elegimos operar exclusivamente con vehículos Tesla porque creemos que el lujo del futuro es silencioso, limpio e inteligente.",
        imageAlt: "Tesla gris oscuro visto desde atrás, estacionado junto a la costa al atardecer",
        reasons: [
            {
                title: "Silencio a bordo",
                text: "Sin motor de combustión, la cabina es un espacio tranquilo para conversar, hacer una llamada o descansar.",
            },
            {
                title: "Cero emisiones",
                text: "Cada trayecto eléctrico es una forma de movernos por la ciudad sin contaminar el aire que todos respiramos.",
            },
            {
                title: "Confort y tecnología",
                text: "Interiores amplios, clima personalizado y un andar suave, aun en el tráfico de la ciudad.",
            },
            {
                title: "Seguridad",
                text: "Vehículos diseñados con altos estándares de seguridad y sistemas de asistencia al conductor.",
            },
        ],
    },
    care: {
        title: "Cómo te cuidamos",
        text: "El vehículo es solo una parte. Lo que hace diferente a Unify es la forma en que cuidamos cada detalle de tu viaje.",
        imageAlt: "Asientos traseros blancos de un Tesla, amplios y con luz natural",
        items: [
            {
                title: "Choferes profesionales",
                text: "Seleccionados y capacitados por Unify, con verificación de antecedentes. Discretos, puntuales y atentos.",
            },
            {
                title: "Puntualidad",
                text: "Llegamos antes de la hora acordada, para que tu agenda no dependa del tráfico.",
            },
            {
                title: "Vehículos impecables",
                text: "Limpios y revisados antes de cada servicio.",
            },
            {
                title: "Privacidad",
                text: "Lo que pasa en el vehículo se queda en el vehículo.",
            },
            {
                title: "Precio claro",
                text: "Cotizas y reservas en línea, y sabes cuánto pagarás desde el inicio.",
            },
            {
                title: "Atención directa",
                text: "Una persona real monitorea cada viaje, priorizando tu comodidad y seguridad en todo momento.",
            },
        ],
    },
    environment: {
        title: "Nuestro compromiso con el medio ambiente",
        imageAlt: "Mano conectando el cable de carga a un Tesla blanco",
        paragraphs: [
            "Moverse por la ciudad no debería costarle al planeta. Por eso nuestra flota es 100 % eléctrica: ninguno de nuestros vehículos emite gases contaminantes por el escape, en una ciudad donde la calidad del aire nos afecta a todos.",
            "Con Unify no tienes que elegir entre viajar con lujo y cuidar el medio ambiente: cada viaje con nosotros es una forma más limpia de moverte por la Ciudad de México.",
        ],
    },
    cta: {
        title: "Cotiza tu próximo viaje",
        text: "Sabes cuánto pagarás desde el inicio, con IVA incluido.",
        action: "Cotizar",
    },
};

export type AboutDictionary = typeof about;
export default about;
