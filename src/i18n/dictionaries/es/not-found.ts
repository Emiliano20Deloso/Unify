// STUB de la Fase 1a. Su dueño lo completa en la Fase 2 (el español define los tipos).

const notFound = {
    meta: {
        title: "Página no encontrada",
        description: "La página que buscas no existe o cambió de dirección.",
    },
    title: "Página no encontrada",
    body: "La página que buscas no existe o cambió de dirección.",
    backHome: "Volver al inicio",
};

export type NotFoundDictionary = typeof notFound;
export default notFound;
