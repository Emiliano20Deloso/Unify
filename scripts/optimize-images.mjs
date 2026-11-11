// Recomprime las fotos originales (design/originals) a JPEG progresivos sin metadatos en
// src/assets/images. Uso: pnpm images
import { mkdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SRC = path.join(root, "design/originals");
const OUT = path.join(root, "src/assets/images");

/** Ancho máximo y peso objetivo por clase. */
const CLASSES = {
    hero: { width: 2560, maxKB: 450 },
    seccion: { width: 1920, maxKB: 250 },
    tarjeta: { width: 1200, maxKB: 150 },
};

const START_QUALITY = 78;
const MIN_QUALITY = 50;

/** origen (relativo a design/originals, sin extensión) → [nombre de salida, clase] */
const MANIFEST = [
    ["images/heromov", "tesla-blanco-concreto", "hero"],
    ["Hero", "tesla-rojo-ciudad", "hero"],
    ["images/new", "tesla-gris-anochecer", "hero"],
    ["images/priv", "tesla-rojo-tunel", "hero"],
    ["images/footer-bg", "tesla-rojo-luces", "hero"],
    ["images/Viajesyneg", "tesla-silueta", "hero"],
    ["images/ejecutivo", "tesla-negro-arquitectura", "hero"],
    ["images/qsms4", "tres-teslas-ciudad", "hero"],
    ["images/Confortdlujo", "interior-asientos-delanteros", "seccion"],
    ["images/interior", "interior-asientos-traseros", "seccion"],
    ["images/infoenter", "interior-pantalla-trasera", "seccion"],
    ["images/sentinel", "interior-tablero-noche", "seccion"],
    ["images/facile", "interior-techo-cristal", "seccion"],
    ["images/Tarifas/tari3", "interior-frente-dia", "seccion"],
    ["images/Model3_56", "tesla-trasera-atardecer", "seccion"],
    ["images/qs1", "estructura-seguridad", "seccion"],
    ["images/qs2", "tesla-blanco-frente", "seccion"],
    ["images/Tarifa", "detalle-calavera", "tarjeta"],
    ["images/priv2", "detalle-faro", "tarjeta"],
    ["images/Tarifas/Aero", "ruta-puente", "tarjeta"],
    ["images/Tarifas/tari2", "ruta-bosque", "tarjeta"],
    ["images/Tarifas/tepoz", "ruta-costa", "tarjeta"],
    ["images/Tarifas/tari4", "ruta-autopista", "tarjeta"],
    ["images/qsoms", "cargador-pared", "tarjeta"],
    ["images/qsms2", "carga-mano", "tarjeta"],
];

async function encode(input, width, quality) {
    return sharp(input)
        .rotate() // aplica la orientación EXIF antes de descartar los metadatos
        .resize({ width, withoutEnlargement: true })
        .jpeg({ quality, progressive: true, mozjpeg: true })
        .toBuffer({ resolveWithObject: true });
}

async function main() {
    await mkdir(OUT, { recursive: true });
    const rows = [];

    for (const [source, name, cls] of MANIFEST) {
        const { width, maxKB } = CLASSES[cls];
        const input = path.join(SRC, `${source}.jpg`);
        await stat(input);

        let quality = START_QUALITY;
        let result = await encode(input, width, quality);
        while (result.data.length > maxKB * 1024 && quality > MIN_QUALITY) {
            quality -= 4;
            result = await encode(input, width, quality);
        }

        await writeFile(path.join(OUT, `${name}.jpg`), result.data);

        const kb = Math.round(result.data.length / 1024);
        rows.push({
            nombre: name,
            clase: cls,
            tamaño: `${result.info.width}×${result.info.height}`,
            calidad: quality,
            KB: kb,
            ok: kb <= maxKB ? "sí" : `NO (> ${maxKB})`,
        });
    }

    console.table(rows);
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
