// STUB de la Fase 1a. Su dueño lo completa en la Fase 2 (el español define los tipos).

const legal = {
    privacy: {
        meta: {
            title: "Aviso de privacidad",
            description: "Cómo tratamos, protegemos y resguardamos sus datos personales en Unify Luxury.",
        },
        title: "Aviso de privacidad",
    },
    terms: {
        meta: {
            title: "Términos y condiciones",
            description: "Las reglas que rigen la contratación y el uso del servicio de transporte privado Unify Luxury.",
        },
        title: "Términos y condiciones",
    },
};

export type LegalDictionary = typeof legal;
export default legal;
