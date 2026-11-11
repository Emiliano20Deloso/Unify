// Muestreador que corre DENTRO de la página (se inyecta con Page.addScriptToEvaluateOnNewDocument).
// No depende de los cuadros del screencast: en cada requestAnimationFrame registra
//   - rects, opacidad y transform de los selectores `track` (para BRINCO),
//   - las mutaciones del DOM (MutationObserver) y decide si cada aparición/desaparición/cambio de texto
//     visible estuvo animada (getAnimations() del elemento o sus ancestros, o `style` cambiando por rAF
//     en >= 3 cuadros seguidos, como hace la librería motion),
//   - los `layout-shift` (PerformanceObserver) con sus fuentes,
//   - todas las animaciones vistas (document.getAnimations()) y los cambios de transform/alto por estilo
//     en línea (para la pasada con movimiento reducido).
// Envía todo a Node por el binding `__maPush` (sobrevive a recargas completas de la página).

export function samplerMain() {
    if (window.__ma) return;
    const push = (o) => {
        try {
            window.__maPush(JSON.stringify(o));
        } catch {}
    };
    const now = () => performance.timeOrigin + performance.now();
    // Propiedades cuya animación cuenta como "entrada/salida animada".
    const VIS = /^(opacity|transform|translate|scale|rotate|clip-path|clip|height|width|max-height|max-width|min-height|filter|top|left|right|bottom|inset|margin.*|padding.*|grid-template-rows|grid-template-columns|mask.*|offset.*|visibility|x|y|all)$/;
    // Propiedades que son desplazamiento (prohibidas con movimiento reducido: solo se permite opacidad).
    const MOVE = /^(transform|translate|scale|rotate|top|left|right|bottom|inset|margin.*|offset.*|height|width|max-height|grid-template-rows|x|y)$/;
    const ATTRS = ["class", "style", "hidden", "disabled", "data-state", "aria-expanded", "aria-hidden", "open", "data-open"];

    // Oculta el cursor de texto: si no, su parpadeo cuenta como cambio.
    try {
        const sh = new CSSStyleSheet();
        sh.replaceSync("*{caret-color:transparent!important}");
        document.adoptedStyleSheets = [...document.adoptedStyleSheets, sh];
    } catch {}

    let cfg = null;
    let on = false;
    let waitingFcp = false;
    let fno = 0;
    let tPrev = 0;
    let recs = [];
    let cache = new WeakMap();
    const seen = new WeakSet();
    const propCache = new WeakMap();
    const lastStyle = new WeakMap();
    const touchedHist = {};
    const animHist = {};
    let pend = [];
    let mo = null;
    let po = null;

    function desc(el) {
        if (!el || el.nodeType !== 1) return "?";
        const parts = [];
        let e = el;
        for (let i = 0; i < 4 && e && e.nodeType === 1 && e !== document.documentElement; i++) {
            let s = e.localName;
            if (e.id) {
                parts.unshift(`${s}#${CSS.escape(e.id)}`);
                break;
            }
            const al = e.getAttribute("aria-label");
            const role = e.getAttribute("role");
            const lab = e.getAttribute("aria-labelledby");
            if (al) s += `[aria-label="${al.slice(0, 40)}"]`;
            else if (lab) s += `[aria-labelledby="${lab}"]`;
            else if (role) s += `[role="${role}"]`;
            else {
                const cl = [...e.classList].filter((c) => /^[a-zA-Z][\w-]*$/.test(c)).slice(0, 2);
                if (cl.length) s += "." + cl.join(".");
            }
            parts.unshift(s);
            e = e.parentElement;
        }
        return parts.join(" > ");
    }
    const snippet = (el) => ((el && el.textContent) || "").replace(/\s+/g, " ").trim().slice(0, 40);

    function animProps(a) {
        let p = propCache.get(a);
        if (p) return p;
        p = [];
        if (a.transitionProperty) p = [a.transitionProperty];
        else {
            try {
                const s = new Set();
                for (const k of a.effect?.getKeyframes?.() ?? [])
                    for (const key of Object.keys(k))
                        if (!["offset", "easing", "composite", "computedOffset"].includes(key))
                            s.add(key.replace(/[A-Z]/g, (m) => "-" + m.toLowerCase()));
                p = [...s];
            } catch {}
        }
        propCache.set(a, p);
        return p;
    }

    function roiRect() {
        const vw = innerWidth;
        const vh = innerHeight;
        let r = { l: 0, t: 0, r: vw, b: vh };
        if (cfg && cfg.roi) {
            const e = document.querySelector(cfg.roi);
            if (e) {
                const b = e.getBoundingClientRect();
                r = { l: Math.max(0, b.left), t: Math.max(0, b.top), r: Math.min(vw, b.right), b: Math.min(vh, b.bottom) };
                if (r.r <= r.l || r.b <= r.t) r = { l: 0, t: 0, r: vw, b: vh, missing: true };
            } else r.missing = true;
        }
        return r;
    }

    // Opacidad efectiva y recorte por overflow de los ancestros (memoizado por cuadro).
    function chain(el, memo) {
        if (!el || el.nodeType !== 1) return { op: 1, clip: null };
        if (memo.has(el)) return memo.get(el);
        const cs = getComputedStyle(el);
        const parent = chain(el.parentElement, memo);
        let op;
        if (cs.display === "none") op = 0;
        else {
            op = parseFloat(cs.opacity);
            if (isNaN(op)) op = 1;
            op *= parent.op;
        }
        let clip = parent.clip;
        if (cs.overflowX !== "visible" || cs.overflowY !== "visible" || cs.contain.includes("paint")) {
            const b = el.getBoundingClientRect();
            const c = { l: b.left, t: b.top, r: b.right, b: b.bottom };
            clip = clip ? { l: Math.max(clip.l, c.l), t: Math.max(clip.t, c.t), r: Math.min(clip.r, c.r), b: Math.min(clip.b, c.b) } : c;
        }
        if (cs.position === "fixed") clip = null; // lo fijo escapa del overflow de sus ancestros
        const out = { op, clip, hidden: cs.visibility === "hidden" };
        memo.set(el, out);
        return out;
    }
    const inter = (a, b) => Math.max(0, Math.min(a.r, b.r) - Math.max(a.l, b.l)) * Math.max(0, Math.min(a.b, b.b) - Math.max(a.t, b.t));

    function state(el, memo, roi, rectOverride) {
        if (!el || !el.isConnected) return null;
        const b = rectOverride ?? el.getBoundingClientRect();
        const c = chain(el, memo);
        let r = { l: b.left, t: b.top, r: b.right, b: b.bottom };
        if (c.clip) r = { l: Math.max(r.l, c.clip.l), t: Math.max(r.t, c.clip.t), r: Math.min(r.r, c.clip.r), b: Math.min(r.b, c.clip.b) };
        const vp = { l: 0, t: 0, r: innerWidth, b: innerHeight };
        const area = r.r > r.l && r.b > r.t ? inter(r, vp) : 0;
        const areaRoi = r.r > r.l && r.b > r.t ? inter(r, roi) : 0;
        return {
            op: c.hidden ? 0 : c.op,
            raw: Math.max(0, b.width) * Math.max(0, b.height),
            area,
            areaRoi,
            rect: [Math.round(r.l), Math.round(r.t), Math.round(r.r - r.l), Math.round(r.b - r.t)],
        };
    }
    function sig(st, roi) {
        if (!st) return 0;
        const roiA = Math.max(1, (roi.r - roi.l) * (roi.b - roi.t));
        const vpA = innerWidth * innerHeight;
        return Math.max(st.areaRoi / roiA, st.area / vpA);
    }

    function inChain(el, set) {
        for (let e = el; e && e.nodeType === 1; e = e.parentElement) if (set && set.has(e)) return true;
        return false;
    }
    function descIn(el, set) {
        if (!set || !el) return false;
        for (const t of set.keys ? set.keys() : set) if (t !== el && el.contains(t)) return true;
        return false;
    }
    function masked(el) {
        if (!cfg || !cfg.mask || !cfg.mask.length) return false;
        for (const m of cfg.mask) {
            try {
                if (el.closest(m) || el.querySelector?.(m)) return true;
            } catch {}
        }
        return false;
    }

    function snapshot(memo, roi) {
        cache = new WeakMap();
        const all = document.querySelectorAll("body *");
        for (const el of all) {
            const st = state(el, memo, roi);
            if (st) cache.set(el, st);
        }
    }

    function frame() {
        if (!on) return;
        requestAnimationFrame(frame);
        const t = now();
        if (waitingFcp) {
            const fcp = performance.getEntriesByName("first-contentful-paint")[0];
            recs = [];
            if (!fcp) {
                tPrev = t;
                return;
            }
            waitingFcp = false;
            push({ k: "fcp", t: performance.timeOrigin + fcp.startTime, seen: t });
            snapshot(new Map(), roiRect());
            tPrev = t;
            return;
        }
        fno++;
        const memo = new Map();
        const roi = roiRect();

        // Animaciones en curso (finitas, sobre propiedades visuales).
        const tset = new Map();
        let running = 0;
        for (const a of document.getAnimations()) {
            const tgt = a.effect && a.effect.target;
            if (!tgt) continue;
            const props = animProps(a);
            let timing = {};
            try {
                timing = a.effect.getComputedTiming();
            } catch {}
            const inf = timing.iterations === Infinity;
            if (!seen.has(a)) {
                seen.add(a);
                let easing = "";
                try {
                    easing = a.effect.getTiming().easing;
                    // En una animación CSS la curva (animation-timing-function) va en los fotogramas clave.
                    if (!a.transitionProperty && easing === "linear") easing = a.effect.getKeyframes()[0]?.easing ?? easing;
                } catch {}
                push({
                    k: "an",
                    t,
                    type: a.constructor.name,
                    sel: desc(tgt) + (a.effect.pseudoElement || ""),
                    props,
                    dur: timing.duration,
                    easing,
                    inf,
                    move: props.some((p) => MOVE.test(p)),
                });
            }
            if (inf || a.playState !== "running") continue;
            if (!props.some((p) => VIS.test(p))) continue;
            running++;
            tset.set(tgt, props);
        }
        animHist[fno] = tset;
        delete animHist[fno - 30];

        // Mutaciones desde el cuadro anterior.
        const muts = recs;
        recs = [];
        const touched = new Set();
        const inserted = new Set();
        const attrEls = new Set();
        const textEls = new Map();
        const removed = [];
        for (const m of muts) {
            if (m.type === "childList") {
                for (const n of m.addedNodes) {
                    if (n.nodeType === 1) inserted.add(n);
                    else if (n.nodeType === 3 && n.data.trim() && m.target.nodeType === 1) {
                        if (!textEls.has(m.target)) textEls.set(m.target, []);
                        textEls.get(m.target).push(n);
                        touched.add(m.target);
                    }
                }
                for (const n of m.removedNodes) if (n.nodeType === 1) removed.push({ n, parent: m.target });
            } else if (m.type === "characterData") {
                const p = m.target.parentElement;
                if (p) {
                    if (!textEls.has(p)) textEls.set(p, []);
                    textEls.get(p).push(m.target);
                    touched.add(p);
                }
            } else if (m.type === "attributes" && m.target.nodeType === 1) {
                if (m.attributeName === "style") touched.add(m.target);
                attrEls.add(m.target);
            }
        }
        touchedHist[fno] = touched;
        delete touchedHist[fno - 30];

        const newEv = (kind, el, st, extra = {}) => {
            if (masked(el)) return;
            pend.push({ kind, el, f: fno, t, tPrev, st, anim: false, partial: false, ...extra });
        };

        // Inserciones (solo la raíz de cada subárbol insertado).
        for (const el of inserted) {
            if (!el.isConnected) continue;
            let p = el.parentElement;
            let nested = false;
            while (p) {
                if (inserted.has(p)) {
                    nested = true;
                    break;
                }
                p = p.parentElement;
            }
            if (nested) continue;
            const st = state(el, memo, roi);
            if (st && st.op >= 0.25 && sig(st, roi) >= 0.002) newEv("inserta", el, st);
            cache.set(el, st);
            let i = 0;
            for (const d of el.querySelectorAll("*")) {
                if (i++ > 400) break;
                cache.set(d, state(d, memo, roi));
            }
        }
        // Atributos: ¿pasó de oculto a visible (o al revés) de un cuadro a otro?
        for (const el of attrEls) {
            if (!el.isConnected || inserted.has(el)) continue;
            const prev = cache.get(el);
            const st = state(el, memo, roi);
            if (prev && st) {
                const shown = (st.op - prev.op >= 0.5 && st.op >= 0.25) || (prev.raw < 0.25 * st.raw && st.op >= 0.25 && prev.op >= 0);
                const hid = (prev.op - st.op >= 0.5 && prev.op >= 0.25) || (st.raw < 0.25 * prev.raw && prev.op >= 0.25);
                if (shown && sig(st, roi) >= 0.002) newEv("muestra", el, st, { prevOp: prev.op });
                else if (hid && sig(prev, roi) >= 0.002) newEv("oculta", el, prev, { nowOp: st.op });
            }
            cache.set(el, st);
            // Cambios de transform / tamaño por estilo en línea (pasada reducida).
            if (touched.has(el)) {
                const s = el.style;
                const sig2 = `${s.transform}|${s.translate}|${s.scale}|${s.rotate}|${s.height}|${s.width}|${s.top}|${s.left}`;
                const was = lastStyle.get(el);
                lastStyle.set(el, sig2);
                if (was !== undefined && was !== sig2) push({ k: "mv", t, sel: desc(el), style: sig2 });
            }
        }
        // Texto que cambia de golpe.
        for (const [el, nodes] of textEls) {
            if (!el.isConnected || inserted.has(el)) continue;
            let p = el.parentElement;
            let nested = false;
            while (p) {
                if (inserted.has(p)) {
                    nested = true;
                    break;
                }
                p = p.parentElement;
            }
            if (nested) continue;
            const range = document.createRange();
            let rr = null;
            for (const n of nodes) {
                if (!n.isConnected) continue;
                range.selectNodeContents(n);
                const b = range.getBoundingClientRect();
                rr = rr ? { left: Math.min(rr.left, b.left), top: Math.min(rr.top, b.top), right: Math.max(rr.right, b.right), bottom: Math.max(rr.bottom, b.bottom) } : { left: b.left, top: b.top, right: b.right, bottom: b.bottom };
            }
            if (!rr) continue;
            rr.width = rr.right - rr.left;
            rr.height = rr.bottom - rr.top;
            const st = state(el, memo, roi, rr);
            if (st && st.op >= 0.25 && sig(st, roi) >= 0.002) newEv("texto", el, st, { text: snippet(el) });
        }
        // Retiros: se usa el último estado conocido del elemento.
        for (const { n, parent } of removed) {
            if (n.isConnected) continue;
            const prev = cache.get(n);
            if (!prev || prev.op < 0.25 || sig(prev, roi) < 0.002) continue;
            let wasAnim = false;
            for (let k = fno - 4; k <= fno; k++) if (animHist[k] && (animHist[k].has(n) || descIn(n, animHist[k]))) wasAnim = true;
            newEv("quita", n, prev, { parentRef: parent, anim: wasAnim, text: snippet(n) });
        }
        // Actualiza el estado conocido de lo que se anima.
        for (const el of touched) if (el.isConnected) cache.set(el, state(el, memo, roi));
        for (const el of tset.keys()) if (el.isConnected) cache.set(el, state(el, memo, roi));

        // Resuelve eventos pendientes: ¿hubo animación en ese cuadro o los 2 siguientes?
        const keep = [];
        for (const ev of pend) {
            const age = fno - ev.f;
            const ref = ev.el.isConnected ? ev.el : ev.parentRef;
            if (age <= 2 && ref) {
                if (inChain(ref, tset)) ev.anim = true;
                else if (ev.el.isConnected && descIn(ev.el, tset)) ev.partial = true;
            }
            if (age >= 6) finalize(ev);
            else keep.push(ev);
        }
        pend = keep;

        // Selectores seguidos.
        const tr = [];
        (cfg.track || []).forEach((s, i) => {
            let els = [];
            try {
                els = [...document.querySelectorAll(s)].slice(0, 4);
            } catch {}
            els.forEach((el, j) => {
                const b = el.getBoundingClientRect();
                const c = chain(el, memo);
                const anim = inChain(el, tset) || inChain(el, touched) || inChain(el, touchedHist[fno - 1]) || descIn(el, tset);
                tr.push([i, j, Math.round(b.left), Math.round(b.top), Math.round(b.width), Math.round(b.height), +c.op.toFixed(2), anim ? 1 : 0, getComputedStyle(el).transform]);
            });
        });
        const mask = [];
        for (const m of cfg.mask || []) {
            let els = [];
            try {
                els = [...document.querySelectorAll(m)].slice(0, 12);
            } catch {}
            for (const el of els) {
                const b = el.getBoundingClientRect();
                if (b.width && b.height) mask.push([Math.round(b.left), Math.round(b.top), Math.round(b.width), Math.round(b.height)]);
            }
        }
        push({
            k: "f",
            t,
            f: fno,
            sx: scrollX,
            sy: scrollY,
            vw: innerWidth,
            vh: innerHeight,
            roi: [roi.l, roi.t, roi.r - roi.l, roi.b - roi.t, roi.missing ? 1 : 0],
            mask,
            tr,
            act: muts.length || running || touched.size ? 1 : 0,
            nm: muts.length,
            na: running,
        });
        tPrev = t;
    }

    function touchedRun(el, f) {
        let run = 0;
        let best = 0;
        for (let k = f - 2; k <= f + 5; k++) {
            if (touchedHist[k] && inChain(el, touchedHist[k])) best = Math.max(best, ++run);
            else run = 0;
        }
        return best;
    }
    function touchedDescRun(el, f) {
        let run = 0;
        let best = 0;
        for (let k = f - 2; k <= f + 5; k++) {
            if (touchedHist[k] && descIn(el, touchedHist[k])) best = Math.max(best, ++run);
            else run = 0;
        }
        return best;
    }

    function finalize(ev) {
        const ref = ev.el.isConnected ? ev.el : ev.parentRef;
        let via = ev.anim ? "getAnimations" : "";
        if (!ev.anim && ((ref && touchedRun(ref, ev.f) >= 3) || touchedRun(ev.el, ev.f) >= 3)) {
            ev.anim = true;
            via = "style por rAF";
        }
        if (!ev.anim && !ev.partial && ev.el.nodeType === 1 && touchedDescRun(ev.el, ev.f) >= 3) ev.partial = true;
        push({
            k: "ev",
            t: ev.t,
            tPrev: ev.tPrev,
            kind: ev.kind,
            sel: desc(ev.el),
            text: ev.text ?? snippet(ev.el),
            rect: ev.st.rect,
            area: ev.st.area,
            areaRoi: ev.st.areaRoi,
            op: ev.st.op,
            anim: ev.anim,
            partial: ev.partial,
            via,
        });
    }

    function start(c) {
        cfg = c || {};
        on = true;
        fno = 0;
        pend = [];
        recs = [];
        waitingFcp = !!cfg.nav;
        if (!waitingFcp) snapshot(new Map(), roiRect());
        mo = new MutationObserver((list) => {
            if (on) for (const m of list) recs.push(m);
        });
        mo.observe(document, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ATTRS });
        try {
            po = new PerformanceObserver((list) => {
                for (const e of list.getEntries())
                    push({
                        k: "ls",
                        t: performance.timeOrigin + e.startTime,
                        v: e.value,
                        rec: e.hadRecentInput,
                        src: (e.sources || []).map((s) => desc(s.node)).slice(0, 4),
                        // Opacidad efectiva de lo que se movió: lo invisible (p. ej. una cabecera que aún no
                        // entra) puede reacomodarse sin que nadie lo vea.
                        vis: Math.max(
                            0,
                            ...(e.sources || []).map((s) => {
                                const el = s.node && (s.node.nodeType === 1 ? s.node : s.node.parentElement);
                                if (!el || !el.isConnected) return 1;
                                const c = chain(el, new Map());
                                return c.hidden ? 0 : c.op;
                            }),
                        ),
                    });
            });
            po.observe({ type: "layout-shift", buffered: false });
        } catch {}
        tPrev = now();
        push({ k: "start", t: tPrev, nav: !!cfg.nav, url: location.href });
        requestAnimationFrame(frame);
    }
    function stop() {
        for (const ev of pend) finalize(ev);
        pend = [];
        on = false;
        mo?.disconnect();
        po?.disconnect();
        push({ k: "stop", t: now() });
        return true;
    }
    window.__ma = { start, stop, desc };
    if (window.__maAuto) start(window.__maAuto);
}

/** Código fuente a inyectar. `auto` (opcional) arranca solo al cargar un documento nuevo (navegación completa). */
export function samplerSource() {
    return `(${samplerMain.toString()})();`;
}
