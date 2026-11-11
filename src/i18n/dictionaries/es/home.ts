// Portada. El español define los tipos. Las secciones compartidas traen su texto de src/content.

const home = {
    meta: {
        title: "Unify · Chofer privado en Tesla en la Ciudad de México",
        description:
            "Viaja en silencio y llega a tiempo. Chofer privado en Tesla en la Ciudad de México y zona metropolitana, con tarifa clara en pesos e IVA incluido.",
    },
    hero: {
        eyebrow: "Chofer privado en Tesla · Ciudad de México",
        /** Una línea por elemento (salto de línea en pantallas anchas). */
        title: ["Viaja en silencio.", "Llega a tiempo."],
        text: "Tu chofer privado en Tesla, puntual y con tarifa fija desde que cotizas. Ciudad de México y zona metropolitana.",
        trust: ["Precio fijo", "IVA incluido", "Flota 100\u202F% Tesla"],
        imageAlt: "Tesla Model 3 gris en una carretera de desierto al anochecer",
    },
    experience: {
        title: "La experiencia a bordo",
        text: "Un Tesla limpio y revisado antes de cada servicio, y un chofer que cuida cada detalle del trayecto.",
        items: [
            {
                title: "Silencio y confort",
                text: "Sin motor de combustión, la cabina es un espacio tranquilo para conversar, hacer una llamada o descansar.",
            },
            {
                title: "Choferes profesionales",
                text: "Seleccionados y capacitados por Unify, con verificación de antecedentes. Discretos, puntuales y atentos.",
            },
            {
                title: "Puntualidad",
                text: "Llegamos antes de la hora acordada, para que tu agenda no dependa del tráfico.",
            },
            {
                title: "Tarifa clara",
                text: "Cotizas en línea y sabes cuánto pagarás desde el inicio, en pesos y con IVA incluido.",
            },
            {
                title: "Privacidad",
                text: "Lo que pasa en el vehículo se queda en el vehículo.",
            },
        ],
        images: {
            main: "Tablero de un Tesla de noche, con la pantalla central encendida y la ciudad al fondo",
            detail: "Pantalla trasera de un Tesla entre los asientos delanteros",
        },
    },
};

export type HomeDictionary = typeof home;
export default home;
