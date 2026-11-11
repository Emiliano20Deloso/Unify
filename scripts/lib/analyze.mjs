// Análisis de una grabación: píxeles (screencast) + DOM (muestreador) → veredicto.
// Reglas en design/MOVIMIENTO.md §E; los cambios respecto al diseño están en scripts/motion/README.md.
import sharp from "sharp";

export const TH = {
    noChangeD: 0.002, // d(f0, f_fin) por debajo de esto y…
    noChangeC: 0.003, // …max c_t por debajo de esto → SIN CAMBIO
    activeC: 0.001, // un cuadro con c_t mayor cuenta para la duración
    cutRatio: 0.6, // max d_t / Σ d_t
    cutC: 0.005, // c_t del peor cuadro (0.5 % del ROI)
    blockSize: 12, // px de la imagen reducida
    blockMin: 0.04, // diferencia media mínima del bloque en su peor cuadro
    blockCutArea: 0.004, // píxeles cambiados de los bloques cortados, fracción del viewport
    lowCadenceMs: 34, // mediana del intervalo entre cuadros activos
    domConfirm: 0.02, // fracción de píxeles que cambian dentro del rect del elemento
    jumpPx: 8,
    shift: 0.01,
    flashY: 0.06,
    flashBack: 0.015,
    flashK: 4,
    flashWindowMs: 150,
    abaD: 0.01,
    abaBack: 0.3,
    brightY: 0.6,
    darkBase: 0.2,
};

async function decode(buf, W) {
    const { data, info } = await sharp(buf).greyscale().resize({ width: W }).raw().toBuffer({ resolveWithObject: true });
    return { data, w: info.width, h: info.height };
}

function latestBefore(arr, t) {
    let r = null;
    for (const x of arr) {
        if (x.t <= t) r = x;
        else break;
    }
    return r ?? arr[0] ?? null;
}

function maskFrame(img, sample, s) {
    if (!sample?.mask?.length) return;
    for (const [x, y, w, h] of sample.mask) {
        const x0 = Math.max(0, Math.floor(x * s));
        const y0 = Math.max(0, Math.floor(y * s));
        const x1 = Math.min(img.w, Math.ceil((x + w) * s));
        const y1 = Math.min(img.h, Math.ceil((y + h) * s));
        for (let yy = y0; yy < y1; yy++) img.data.fill(0, yy * img.w + x0, yy * img.w + Math.max(x0, x1));
    }
}

function diff(a, b, r) {
    // r: {x0,y0,x1,y1} en píxeles de la imagen reducida
    let sum = 0;
    let chg = 0;
    let n = 0;
    for (let y = r.y0; y < r.y1; y++) {
        const o = y * a.w;
        for (let x = r.x0; x < r.x1; x++) {
            const dd = Math.abs(a.data[o + x] - b.data[o + x]);
            sum += dd;
            if (dd > 10) chg++;
            n++;
        }
    }
    return { d: n ? sum / n / 255 : 0, c: n ? chg / n : 0, n };
}
function lum(a, r) {
    let sum = 0;
    let n = 0;
    for (let y = r.y0; y < r.y1; y++) {
        const o = y * a.w;
        for (let x = r.x0; x < r.x1; x++) {
            sum += a.data[o + x];
            n++;
        }
    }
    return n ? sum / n / 255 : 0;
}
const median = (xs) => {
    if (!xs.length) return null;
    const s = [...xs].sort((a, b) => a - b);
    return s[s.length >> 1];
};

export async function analyze(rec, { vp, scenario: sc, reduced }) {
    const res = {
        frames: 0,
        fps: null,
        medianMs: null,
        lowCadence: false,
        durMs: 0,
        startMs: null,
        maxJumpPct: 0,
        pxCuts: [],
        domCuts: [],
        domPartial: [],
        domAnimated: 0,
        brincos: [],
        flashes: [],
        rmMoves: [],
        anims: { n: 0, types: {} },
        series: [],
        verdict: "",
        flags: [],
        notes: [...rec.warnings],
    };
    if (rec.errors.length) {
        res.verdict = "ERROR";
        res.flags = ["ERROR"];
        res.notes.push(...rec.errors);
        return res;
    }
    const W = vp.mobile ? 128 : 192;
    const s = W / vp.width;
    const samples = rec.samples.sort((a, b) => a.t - b.t);
    const all = rec.frames.sort((a, b) => a.t - b.t);
    // t0 por reloj de pared. El cuadro base es el último anterior a la acción.
    let bi = -1;
    for (let i = 0; i < all.length; i++) if (all[i].t <= rec.t0) bi = i;
    if (bi < 0) bi = 0;
    const frames = all.slice(bi).filter((f, i) => i === 0 || (f.t > rec.t0 && f.t <= rec.tEnd + 60));
    res.frames = Math.max(0, frames.length - 1);

    // Animaciones vistas durante la grabación.
    const animsRec = rec.anims.filter((a) => a.t >= rec.t0 - 30);
    res.anims.n = animsRec.length;
    for (const a of animsRec) res.anims.types[a.type] = (res.anims.types[a.type] ?? 0) + 1;
    res.anims.list = animsRec.slice(0, 30).map((a) => ({ type: a.type, sel: a.sel, props: a.props, dur: a.dur, easing: a.easing, inf: a.inf }));

    if (frames.length === 0) {
        res.notes.push("sin cuadros del screencast");
    }
    const imgs = [];
    for (const f of frames) {
        const img = await decode(Buffer.from(f.data, "base64"), W);
        maskFrame(img, latestBefore(samples, f.t), s);
        imgs.push(img);
    }
    const H = imgs[0]?.h ?? Math.round(vp.height * s);

    // ROI fijo: el del inicio, o el último conocido si aún no existía.
    let roiSample = samples.find((x) => x.t >= rec.t0 - 50 && !x.roi[4]) ?? samples.findLast?.((x) => !x.roi[4]);
    if (sc.roi && (!roiSample || roiSample.roi[4])) res.notes.push(`ROI ${sc.roi} no encontrado; se usó el viewport`);
    const rr = roiSample && !roiSample.roi[4] ? roiSample.roi : [0, 0, vp.width, vp.height];
    const R = {
        x0: Math.max(0, Math.floor(rr[0] * s)),
        y0: Math.max(0, Math.floor(rr[1] * s)),
        x1: Math.min(W, Math.ceil((rr[0] + rr[2]) * s)),
        y1: Math.min(H, Math.ceil((rr[1] + rr[3]) * s)),
    };
    if (R.x1 - R.x0 < 2 || R.y1 - R.y0 < 2) Object.assign(R, { x0: 0, y0: 0, x1: W, y1: H });
    const FULL = { x0: 0, y0: 0, x1: W, y1: H };
    res.roiCss = rr.slice(0, 4);

    // Cuadros de scroll (el desplazamiento no es un corte) y de cambio de documento (navegación completa).
    const scroll = frames.map((f, i) => i > 0 && (Math.abs(f.sy - frames[i - 1].sy) > 0.5 || Math.abs(f.sx - frames[i - 1].sx) > 0.5));
    const swap = frames.map(() => false);
    for (const fc of rec.fcp) {
        const i = frames.findIndex((f, k) => k > 0 && f.t >= fc.t - 4);
        if (i > 0) swap[i] = true;
    }
    if (sc.expect?.load && !rec.fcp.length) res.notes.push("escenario de carga sin first-contentful-paint del documento nuevo");

    // Cadencia (intervalos < 200 ms; el screencast no manda cuadros cuando nada cambia).
    const iv = [];
    for (let i = 2; i < frames.length; i++) {
        const dt = frames[i].t - frames[i - 1].t;
        if (dt < 200) iv.push(dt);
    }
    res.medianMs = median(iv);
    res.fps = res.medianMs ? Math.round(1000 / res.medianMs) : null;
    res.lowCadence = res.medianMs != null && res.medianMs > TH.lowCadenceMs;
    if (res.lowCadence) res.notes.push(`cadencia baja: mediana ${res.medianMs.toFixed(1)} ms; los cortes por píxeles quedan como "posibles"`);

    // Métricas por cuadro.
    const ser = frames.map((f, i) => ({ i, t: Math.round(f.t - rec.t0), d: 0, c: 0, Y: imgs[i] ? lum(imgs[i], R) : 0, Yf: imgs[i] ? lum(imgs[i], FULL) : 0, scroll: scroll[i], swap: swap[i] }));
    for (let i = 1; i < frames.length; i++) {
        const m = diff(imgs[i - 1], imgs[i], R);
        ser[i].d = m.d;
        ser[i].c = m.c;
    }
    res.series = ser.map((x) => ({ t: x.t, d: +x.d.toFixed(4), c: +x.c.toFixed(4), Y: +x.Y.toFixed(3), sc: x.scroll ? 1 : 0, sw: x.swap ? 1 : 0 }));
    const counted = ser.filter((x) => x.i > 0 && !x.scroll && !x.swap);
    res.maxJumpPct = +(Math.max(0, ...counted.map((x) => x.c)) * 100).toFixed(2);

    // SIN CAMBIO / duración.
    const endImg = imgs.at(-1);
    const total = imgs.length > 1 ? diff(imgs[0], endImg, R) : { d: 0, c: 0 };
    const maxC = Math.max(0, ...ser.slice(1).map((x) => x.c));
    const active = ser.filter((x) => x.i > 0 && x.c > TH.activeC);
    if (active.length) {
        res.startMs = active[0].t;
        res.durMs = active.at(-1).t - active[0].t;
        res.endMs = active.at(-1).t;
    }
    const noChange = total.d < TH.noChangeD && maxC < TH.noChangeC;

    // CORTE por píxeles, regla global sobre el ROI.
    const sumD = counted.reduce((a, x) => a + x.d, 0);
    const worst = counted.reduce((a, x) => (!a || x.d > a.d ? x : a), null);
    res.worstIndex = worst?.i ?? null;
    if (worst && sumD > 0 && worst.d / sumD >= TH.cutRatio && worst.c >= TH.cutC) {
        res.pxCuts.push({ kind: "global", t: worst.t, i: worst.i, ratio: +(worst.d / sumD).toFixed(2), pct: +(worst.c * 100).toFixed(2) });
    }
    // CORTE por píxeles, por bloques en todo el viewport (atrapa un corte local aunque haya un fundido largo en otra parte).
    const B = TH.blockSize;
    const nbx = Math.ceil(W / B);
    const nby = Math.ceil(H / B);
    if (imgs.length > 1) {
        const bd = []; // bd[i] = Float32Array por bloque (diferencia media)
        const bc = []; // píxeles cambiados por bloque
        for (let i = 1; i < imgs.length; i++) {
            const dsum = new Float64Array(nbx * nby);
            const cc = new Uint32Array(nbx * nby);
            const nn = new Uint32Array(nbx * nby);
            if (!scroll[i] && !swap[i]) {
                const a = imgs[i - 1];
                const b2 = imgs[i];
                for (let y = 0; y < H; y++) {
                    const by = (y / B) | 0;
                    for (let x = 0; x < W; x++) {
                        const k = by * nbx + ((x / B) | 0);
                        const dd = Math.abs(a.data[y * W + x] - b2.data[y * W + x]);
                        dsum[k] += dd;
                        nn[k]++;
                        if (dd > 10) cc[k]++;
                    }
                }
                for (let k = 0; k < dsum.length; k++) dsum[k] = nn[k] ? dsum[k] / nn[k] / 255 : 0;
            }
            bd[i] = dsum;
            bc[i] = cc;
        }
        const cutPix = new Map();
        const cutBox = new Map();
        for (let k = 0; k < nbx * nby; k++) {
            let S = 0;
            let M = 0;
            let Mi = -1;
            for (let i = 1; i < imgs.length; i++) {
                S += bd[i][k];
                if (bd[i][k] > M) {
                    M = bd[i][k];
                    Mi = i;
                }
            }
            if (Mi > 0 && M >= TH.blockMin && M / S >= TH.cutRatio) {
                cutPix.set(Mi, (cutPix.get(Mi) ?? 0) + bc[Mi][k]);
                const bx = (k % nbx) * B;
                const by = Math.floor(k / nbx) * B;
                const box = cutBox.get(Mi) ?? [Infinity, Infinity, -Infinity, -Infinity];
                cutBox.set(Mi, [Math.min(box[0], bx), Math.min(box[1], by), Math.max(box[2], bx + B), Math.max(box[3], by + B)]);
            }
        }
        for (const [i, px] of cutPix) {
            const frac = px / (W * H);
            if (frac >= TH.blockCutArea) {
                const bx = cutBox.get(i);
                const box = [bx[0] / s, bx[1] / s, (Math.min(W, bx[2]) - bx[0]) / s, (Math.min(H, bx[3]) - bx[1]) / s].map(Math.round);
                res.pxCuts.push({ kind: "bloque", t: ser[i].t, i, pct: +(frac * 100).toFixed(2), box });
            }
        }
    }

    // CORTE por DOM, confirmado con píxeles dentro del rect del elemento.
    const evs = rec.events.filter((e) => e.t >= rec.t0 - 20 && e.t <= rec.tEnd + 60);
    for (const e of evs) {
        if (e.anim) {
            res.domAnimated++;
            continue;
        }
        if (e.partial) {
            res.domPartial.push({ kind: e.kind, sel: e.sel, text: e.text, t: Math.round(e.t - rec.t0) });
            continue;
        }
        const [x, y, w, h] = e.rect;
        const rect = {
            x0: Math.max(0, Math.floor(x * s)),
            y0: Math.max(0, Math.floor(y * s)),
            x1: Math.min(W, Math.ceil((x + w) * s)),
            y1: Math.min(H, Math.ceil((y + h) * s)),
        };
        let confirm = "sin cuadros";
        let frac = null;
        const bi2 = frames.findLastIndex((f) => f.t <= e.tPrev - 2);
        const after = frames.map((f, i) => i).filter((i) => frames[i].t > e.tPrev - 2 && frames[i].t <= e.t + 120);
        if (bi2 >= 0 && after.length && rect.x1 > rect.x0 && rect.y1 > rect.y0) {
            const scrolled = after.some((i) => frames[i].sy !== frames[bi2].sy);
            if (!scrolled) {
                frac = Math.max(...after.map((i) => diff(imgs[bi2], imgs[i], rect).c));
                confirm = frac >= TH.domConfirm ? "sí" : "no";
            }
        }
        const item = { kind: e.kind, sel: e.sel, text: e.text, t: Math.round(e.t - rec.t0), rect: e.rect, pctVp: +((e.area / (vp.width * vp.height)) * 100).toFixed(2), pixeles: confirm, frac: frac == null ? null : +frac.toFixed(3) };
        if (confirm === "no") res.notes.push(`DOM sin efecto visible (descartado): ${e.kind} ${e.sel}`);
        else res.domCuts.push(item);
    }
    // Culpable de cada corte por píxeles: el evento DOM más cercano en tiempo (animado o no) que toque la zona.
    for (const c of res.pxCuts) {
        const near = evs
            .map((e) => ({ e, dt: Math.abs(e.t - rec.t0 - c.t) }))
            .filter(({ e, dt }) => dt < 120 && (!c.box || overlap(e.rect, c.box)))
            .sort((a, b) => a.dt - b.dt)[0];
        if (near) c.sel = `${near.e.sel}${near.e.anim ? " (DOM: animado)" : ""}`;
    }

    // BRINCO: layout-shift en un cuadro, o rect seguido que salta sin animación.
    // Un salto es movimiento concentrado en un cuadro. Un alto animado (resorte) reparte el desplazamiento en
    // muchos cuadros y no cuenta, aunque alguno pase del umbral: se exige la misma concentración que al corte
    // por píxeles (un cuadro con >= 60 % de todo lo que se movió).
    // Se descartan los reacomodos de contenido invisible (opacidad < 0.05 cuando ocurrieron).
    const shifts = rec.shifts.filter((x) => x.t >= rec.t0 - 20 && x.t <= rec.tEnd + 60 && !(x.vis != null && x.src.length && x.vis < 0.05));
    const shiftSum = shifts.reduce((a, x) => a + x.v, 0);
    for (const ls of shifts) {
        if (ls.v > TH.shift && ls.v >= TH.cutRatio * shiftSum)
            res.brincos.push({ kind: "layout-shift", t: Math.round(ls.t - rec.t0), v: +ls.v.toFixed(3), share: +(ls.v / shiftSum).toFixed(2), sel: ls.src.join(" | ") });
    }
    const bySel = new Map();
    const moved = new Map(); // por elemento seguido: todo lo que se desplazó y los cuadros candidatos a salto
    for (const smp of samples.filter((x) => x.t >= rec.t0 - 20)) {
        for (const r of smp.tr) {
            const key = `${r[0]}:${r[1]}`;
            const prev = bySel.get(key);
            if (prev) {
                const dv = Math.max(Math.abs(r[2] - prev.r[2]), Math.abs(r[3] - prev.r[3]), Math.abs(r[4] - prev.r[4]), Math.abs(r[5] - prev.r[5]));
                const dd = Math.max(Math.abs(r[2] + smp.sx - prev.r[2] - prev.sx), Math.abs(r[3] + smp.sy - prev.r[3] - prev.sy), Math.abs(r[4] - prev.r[4]), Math.abs(r[5] - prev.r[5]));
                const step = Math.min(dv, dd);
                const m = moved.get(key) ?? { total: 0, hits: [] };
                if (step >= 0.5) m.total += step;
                if (dv > TH.jumpPx && dd > TH.jumpPx && !r[7] && !prev.r[7] && smp.f === prev.f + 1)
                    m.hits.push({ t: Math.round(smp.t - rec.t0), px: Math.round(step), sel: `${(sc.track ?? [])[r[0]]}${r[1] ? ` [${r[1]}]` : ""}` });
                moved.set(key, m);
            }
            bySel.set(key, { r, sx: smp.sx, sy: smp.sy, f: smp.f });
        }
    }
    for (const m of moved.values())
        for (const h of m.hits) if (h.px >= TH.cutRatio * m.total) res.brincos.push({ kind: "rect", ...h, share: +(h.px / m.total).toFixed(2) });

    // Scroll que no debía verse: el escenario declara cuántos cuadros con desplazamiento admite (p. ej. atrás
    // del navegador: como mucho el cuadro en que cambia la página). Más que eso es un scroll animado a la vista.
    if (sc.expect?.maxScrollFrames != null) {
        const sf = ser.filter((x) => x.i > 0 && x.scroll);
        if (sf.length > sc.expect.maxScrollFrames)
            res.brincos.push({ kind: "scroll", t: sf[0].t, v: `${sf.length} cuadros con scroll (máx. ${sc.expect.maxScrollFrames})`, sel: "window" });
    }

    // FLASHAZO.
    const flashOn = (key, label) => {
        for (let i = 1; i < ser.length; i++) {
            const a = ser[i - 1];
            const b2 = ser[i];
            if (b2.scroll) continue;
            if (Math.abs(b2[key] - a[key]) > TH.flashY) {
                for (let k = 1; k <= TH.flashK && i + k < ser.length; k++) {
                    const c = ser[i + k];
                    if (c.scroll || frames[i + k].t - frames[i].t > TH.flashWindowMs) break;
                    if (Math.abs(c[key] - a[key]) < TH.flashBack) {
                        res.flashes.push({ kind: `luminancia ${label}`, t: b2.t, dY: +(b2[key] - a[key]).toFixed(3), back: c.t });
                        break;
                    }
                }
            }
        }
    };
    flashOn("Y", "ROI");
    if (sc.roi) flashOn("Yf", "viewport");
    for (let i = 1; i < imgs.length; i++) {
        if (ser[i].scroll) continue;
        const d1 = diff(imgs[i - 1], imgs[i], R).d;
        if (d1 <= TH.abaD) continue;
        for (let k = 1; k <= TH.flashK && i + k < imgs.length; k++) {
            if (ser[i + k].scroll || frames[i + k].t - frames[i].t > TH.flashWindowMs) break;
            const dk = diff(imgs[i - 1], imgs[i + k], R).d;
            if (dk < TH.abaBack * d1) {
                if (!res.flashes.some((f) => f.t === ser[i].t)) res.flashes.push({ kind: "A→B→A", t: ser[i].t, d: +d1.toFixed(3), back: ser[i + k].t });
                break;
            }
        }
    }
    const base = ser[0];
    const endY = ser.at(-1);
    if (base && base.Yf < TH.darkBase && endY.Yf < 0.35)
        for (const x of ser) if (x.Yf > TH.brightY) {
            res.flashes.push({ kind: "cuadro claro sobre fondo oscuro", t: x.t, Y: +x.Yf.toFixed(3) });
            break;
        }

    // Movimiento reducido: solo se permite opacidad.
    if (reduced) {
        for (const a of animsRec) if (a.move && !a.inf && a.dur !== 0) res.rmMoves.push({ kind: a.type, sel: a.sel, props: a.props.join(",") });
        const mvs = new Map();
        for (const m of rec.moves.filter((x) => x.t >= rec.t0 - 20)) mvs.set(m.sel, (mvs.get(m.sel) ?? 0) + 1);
        for (const [sel, n] of mvs) if (n >= 2) res.rmMoves.push({ kind: "style por rAF", sel, props: `${n} cuadros` });
    }

    // Veredicto.
    const flags = [];
    if (noChange && !res.domCuts.length) {
        flags.push(sc.expect?.animated ? "SIN REACCIÓN" : "SIN CAMBIO");
    } else if (reduced) {
        if (res.domCuts.length) flags.push("CORTE");
        if (res.pxCuts.length && !res.domCuts.length) res.notes.push(`movimiento reducido: ${res.pxCuts.length} cambio(s) de posición o tamaño al instante (permitido; solo se exigen fundidos)`);
        if (res.brincos.length) res.notes.push(`movimiento reducido: ${res.brincos.length} desplazamiento(s) al instante (permitido)`);
        if (res.flashes.length) flags.push("FLASHAZO");
    } else {
        if (res.domCuts.length || (res.pxCuts.length && !res.lowCadence)) flags.push("CORTE");
        else if (res.pxCuts.length) flags.push("CORTE?");
        if (res.brincos.length) flags.push("BRINCO");
        if (res.flashes.length) flags.push("FLASHAZO");
    }
    if (res.rmMoves.length) flags.push("RM-MOVIMIENTO");
    for (const p of rec.post) if (!p.ok) flags.push("POST FALLÓ");
    res.unstable = !!rec.hmr || (rec.navs > 0 && !sc.expect?.load && !sc.expect?.navs);
    if (res.unstable) res.notes.push(`posible recarga del servidor de desarrollo durante la grabación (navegaciones: ${rec.navs}${rec.hmr ? ", Fast Refresh" : ""})`);
    if (sc.expect?.minMs && res.durMs && res.durMs < sc.expect.minMs) res.notes.push(`duración ${res.durMs} ms < mínimo ${sc.expect.minMs}`);
    if (sc.expect?.maxMs && res.endMs && res.endMs > sc.expect.maxMs) res.notes.push(`termina a ${res.endMs} ms > máximo ${sc.expect.maxMs}`);
    if (rec.timedOut) res.notes.push("no se asentó antes de maxMs (animación continua o carga lenta)");
    res.flags = flags;
    res.verdict = flags.length ? flags.join(" + ") : "OK";
    res.failing = flags.some((f) => ["CORTE", "BRINCO", "FLASHAZO", "SIN REACCIÓN", "RM-MOVIMIENTO", "POST FALLÓ"].includes(f));
    res.imgsMeta = { W, H, s };
    return res;
}

function overlap(r, b) {
    if (!r) return false;
    return r[0] < b[0] + b[2] && r[0] + r[2] > b[0] && r[1] < b[1] + b[3] && r[1] + r[3] > b[1];
}

/** Tira de cuadros: 8 por fila, 240 px cada uno, rótulo con t y barra de d_t; el peor con borde rojo. */
export async function strip(rec, res, path) {
    const all = rec.frames.sort((a, b) => a.t - b.t);
    let bi = -1;
    for (let i = 0; i < all.length; i++) if (all[i].t <= rec.t0) bi = i;
    const frames = all.slice(Math.max(0, bi)).filter((f, i) => i === 0 || (f.t > rec.t0 && f.t <= rec.tEnd + 60));
    if (!frames.length) return null;
    const MAXT = 32;
    let idx = frames.map((_, i) => i);
    const worstSet = new Set([res.worstIndex, ...res.pxCuts.map((c) => c.i)].filter((x) => x != null));
    if (idx.length > MAXT) {
        const keep = new Set([0, idx.length - 1, ...worstSet]);
        const step = (idx.length - 1) / (MAXT - keep.size);
        for (let k = 0; keep.size < MAXT; k++) keep.add(Math.round(k * step));
        idx = [...keep].filter((i) => i < frames.length).sort((a, b) => a - b);
    }
    const TW = 240;
    const meta = await sharp(Buffer.from(frames[0].data, "base64")).metadata();
    const TH2 = Math.round((meta.height / meta.width) * TW);
    const LH = 22;
    const maxD = Math.max(0.0001, ...res.series.map((x) => x.d));
    const tiles = [];
    for (const i of idx) {
        const img = await sharp(Buffer.from(frames[i].data, "base64")).resize({ width: TW, height: TH2, fit: "fill" }).toBuffer();
        const x = res.series[i] ?? { t: 0, d: 0 };
        const bad = res.pxCuts.some((c) => c.i === i);
        const isWorst = i === res.worstIndex;
        const color = bad ? "#ff2d2d" : isWorst ? "#ffb02d" : null;
        const bar = Math.round((x.d / maxD) * (TW - 70));
        const svg = `<svg width="${TW}" height="${TH2 + LH}" xmlns="http://www.w3.org/2000/svg">
<rect x="0" y="${TH2}" width="${TW}" height="${LH}" fill="#111"/>
<text x="4" y="${TH2 + 15}" font-family="Menlo,monospace" font-size="12" fill="#eee">${i === 0 ? "base" : `${x.t}ms`}</text>
<rect x="64" y="${TH2 + 6}" width="${Math.max(1, bar)}" height="10" fill="${bad ? "#ff2d2d" : "#4fa3ff"}"/>
${x.sc ? `<text x="${TW - 22}" y="${TH2 + 15}" font-family="Menlo" font-size="11" fill="#999">sc</text>` : ""}
${color ? `<rect x="2" y="2" width="${TW - 4}" height="${TH2 + LH - 4}" fill="none" stroke="${color}" stroke-width="4"/>` : ""}
</svg>`;
        tiles.push(
            await sharp({ create: { width: TW, height: TH2 + LH, channels: 3, background: "#000" } })
                .composite([{ input: img, top: 0, left: 0 }, { input: Buffer.from(svg), top: 0, left: 0 }])
                .png()
                .toBuffer(),
        );
    }
    const per = 8;
    const rows = Math.ceil(tiles.length / per);
    const G = 4;
    const cw = Math.min(per, tiles.length) * (TW + G) + G;
    const ch = rows * (TH2 + LH + G) + G;
    await sharp({ create: { width: cw, height: ch, channels: 3, background: "#333" } })
        .composite(tiles.map((t, k) => ({ input: t, left: G + (k % per) * (TW + G), top: G + Math.floor(k / per) * (TH2 + LH + G) })))
        .jpeg({ quality: 72 })
        .toFile(path);
    return path;
}
