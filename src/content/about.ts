// Fotos de /nosotros y su encuadre. Los textos (y los alt) viven en el diccionario "about".
import { cargaMano, interiorAsientosTraseros, teslaBlancoConcreto, teslaTraseraAtardecer } from "@/assets/images";

export const aboutImages = {
    /** Portada a sangre: el auto queda centrado sobre el piso oscuro, el texto abajo a la izquierda. */
    hero: { src: teslaBlancoConcreto, position: "50% 62%" },
    /** Vertical, junto a las cuatro razones de "Por qué Tesla". */
    tesla: { src: teslaTraseraAtardecer, position: "60% 55%" },
    /** Panorámica de cabina sobre los seis compromisos de "Cómo te cuidamos". */
    care: { src: interiorAsientosTraseros, position: "50% 55%" },
    /** Carga eléctrica para el compromiso con el medio ambiente. */
    environment: { src: cargaMano, position: "45% 50%" },
} as const;
