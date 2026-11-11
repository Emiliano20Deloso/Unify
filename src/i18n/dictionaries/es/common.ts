// Textos compartidos por todo el sitio (menú, botones, pie, accesibilidad, idiomas, contacto).
// El español es la fuente de verdad de tipos: el inglés se tipa contra este objeto.
// Los datos del negocio (correo, WhatsApp, URL) viven en src/lib/site.ts; aquí solo van textos.

const common = {
    brand: "Unify",
    nav: {
        home: "Inicio",
        services: "Servicios",
        pricing: "Tarifas",
        about: "Nosotros",
    },
    actions: {
        quote: "Cotizar",
        bookWhatsApp: "Reservar por WhatsApp",
    },
    footer: {
        tagline: "Unify. Move beyond.",
        navTitle: "Sitio",
        legalTitle: "Legal",
        contactTitle: "Contacto",
        privacy: "Aviso de privacidad",
        terms: "Términos y condiciones",
        rights: "Todos los derechos reservados.",
    },
    a11y: {
        skipToContent: "Saltar al contenido",
        mainNav: "Navegación principal",
        footerNav: "Navegación del pie de página",
        languageSwitcher: "Cambiar idioma",
        openMenu: "Abrir menú",
        closeMenu: "Cerrar menú",
        home: "Unify, ir al inicio",
    },
    languages: {
        es: "Español",
        en: "English",
    },
    contact: {
        emailLabel: "Correo",
        whatsappLabel: "WhatsApp",
        hoursLabel: "Horario de atención",
        hours: "Lunes a sábado, de 8:00 a 22:00",
        areaLabel: "Zona de servicio",
        area: "Ciudad de México y área metropolitana",
    },
};

export type CommonDictionary = typeof common;
export default common;
