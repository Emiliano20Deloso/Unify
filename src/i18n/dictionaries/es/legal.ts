// Textos de las páginas legales (cabecera, índice, metadata). El contenido legal vive en
// src/content/legal (datos estructurados, copia literal de los .md). El español define los tipos.

const legal = {
    ui: {
        updated: "Última actualización:",
        toc: "Contenido",
        related: "Consulta también",
    },
    privacy: {
        meta: {
            title: "Aviso de privacidad",
            description: "Cómo tratamos, protegemos y resguardamos sus datos personales en Unify Luxury.",
        },
        title: "Aviso de privacidad",
        text: "Cómo tratamos, protegemos y resguardamos sus datos personales en Unify Luxury.",
    },
    terms: {
        meta: {
            title: "Términos y condiciones",
            description: "Las reglas que rigen la contratación y el uso del servicio de transporte privado Unify Luxury.",
        },
        title: "Términos y condiciones",
        text: "Las reglas que rigen la contratación y el uso del servicio de transporte privado Unify Luxury.",
    },
};

export type LegalDictionary = typeof legal;
export default legal;
