// Fotos de /nosotros y su encuadre. Los textos (y los alt) viven en el diccionario "about".
import { photos } from "./photos";

export const aboutImages = {
    /** Portada a sangre: el auto queda centrado sobre el piso oscuro, el texto abajo a la izquierda. */
    hero: { src: photos.aboutHero, position: "50% 62%" },
    /** Vertical, junto a las cuatro razones de "Por qué Tesla". */
    tesla: { src: photos.aboutTesla, position: "60% 55%" },
    /** Panorámica de cabina sobre los seis compromisos de "Cómo te cuidamos". */
    care: { src: photos.aboutCare, position: "50% 45%" },
    /** Carga eléctrica para el compromiso con el medio ambiente. */
    environment: { src: photos.aboutEnvironment, position: "45% 50%" },
} as const;
