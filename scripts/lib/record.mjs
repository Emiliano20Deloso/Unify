// Grabación de un escenario: Chrome nuevo, preparación, muestreador + screencast, acción, espera a que se
// asiente, pasos `post`. Devuelve los datos crudos que analiza scripts/lib/analyze.mjs.
import { launch, locate, runOp, scrollIntoView, sleep } from "./cdp.mjs";
import { samplerSource } from "./sampler.mjs";

const POINTER_OPS = new Set(["click", "hover", "press"]);

/**
 * @param run {scenario, vpName, vp, reduced, base, defaults}
 */
export async function recordRun(run) {
    const { scenario: sc, vp, reduced, base } = run;
    const d = run.defaults ?? {};
    const maxMs = sc.maxMs ?? sc.expect?.maxRecordMs ?? d.maxMs ?? 1600;
    const settleMs = sc.settleMs ?? d.settleMs ?? 350;
    const mask = [...(d.mask ?? []), ...(sc.mask ?? [])];
    const cfg = { track: sc.track ?? [], roi: sc.roi ?? null, mask };

    const out0 = { frames: [], samples: [], events: [], shifts: [], anims: [], moves: [], starts: [], fcp: [], warnings: [], errors: [], post: [], t0: 0, tEnd: 0, navs: 0, hmr: false, console: [] };
    let b;
    try {
        b = await launch();
    } catch (e) {
        out0.errors.push(`no arrancó Chrome: ${e.message}`);
        return out0;
    }
    const out = { frames: [], samples: [], events: [], shifts: [], anims: [], moves: [], starts: [], fcp: [], warnings: [], errors: [], post: [], t0: 0, tEnd: 0, navs: 0, hmr: false };
    const warn = (m) => out.warnings.push(m);
    try {
        await b.send("Runtime.addBinding", { name: "__maPush" });
        b.on("Runtime.bindingCalled", (p) => {
            if (p.name !== "__maPush") return;
            let o;
            try {
                o = JSON.parse(p.payload);
            } catch {
                return;
            }
            o.rx = Date.now();
            if (o.k === "f") out.samples.push(o);
            else if (o.k === "ev") out.events.push(o);
            else if (o.k === "ls") out.shifts.push(o);
            else if (o.k === "an") out.anims.push(o);
            else if (o.k === "mv") out.moves.push(o);
            else if (o.k === "start") out.starts.push(o);
            else if (o.k === "fcp") out.fcp.push(o);
        });
        b.on("Runtime.consoleAPICalled", (p) => {
            const text = p.args.map((a) => a.value ?? "").join(" ");
            if (/Fast Refresh|\[HMR\]/i.test(text) && out.recording) out.hmr = true;
        });
        b.on("Page.frameNavigated", (p) => {
            if (!p.frame.parentId && out.recording) out.navs++;
        });
        await b.send("Page.addScriptToEvaluateOnNewDocument", { source: samplerSource() });
        await runOp(b, { op: "viewport", ...vp });
        await runOp(b, { op: "media", reducedMotion: !!reduced });

        const ctx = { base, recording: false, warn };
        for (const s of sc.setup ?? []) await runOp(b, s, ctx);

        if (run.check) {
            // Solo verificar selectores: el primero de la acción, el ROI y los seguidos.
            const q = (sel) => b.evaluate(`(() => { try { return document.querySelectorAll(${JSON.stringify(sel)}).length } catch (e) { return -1 } })()`);
            out.check = [];
            const firstSel = (sc.action ?? []).find((s) => s.selector);
            if (firstSel) out.check.push({ what: `acción ${firstSel.op}`, sel: firstSel.selector, n: await q(firstSel.selector) });
            if (sc.roi) out.check.push({ what: "roi", sel: sc.roi, n: await q(sc.roi) });
            for (const t of sc.track ?? []) out.check.push({ what: "track", sel: t, n: await q(t) });
            return out;
        }
        // El primer objetivo de la acción se pone en pantalla ANTES de grabar (el scroll no entra en la grabación).
        const first = (sc.action ?? []).find((s) => POINTER_OPS.has(s.op));
        if (first && (first.selector || first.text)) {
            const pos = await locate(b, first);
            if (!pos) throw new Error(`${first.op}: no encontré ${first.selector ?? first.text}`);
            if (!pos.inView) await scrollIntoView(b, first, 700);
        }
        await sleep(sc.preWait ?? 250);

        // Navegación completa dentro de la acción: el muestreador arranca solo en el documento nuevo.
        const auto = await b.send("Page.addScriptToEvaluateOnNewDocument", {
            source: `window.__maAuto = ${JSON.stringify({ ...cfg, nav: true })}; window.__ma && window.__ma.start(window.__maAuto);`,
        });
        await b.evaluate(`window.__ma ? window.__ma.start(${JSON.stringify(cfg)}) : (()=>{throw new Error("muestreador ausente")})()`);

        let lastAct = Date.now();
        b.on("Page.screencastFrame", (p) => {
            b.send("Page.screencastFrameAck", { sessionId: p.sessionId }).catch(() => {});
            out.frames.push({ t: p.metadata.timestamp * 1000, sy: p.metadata.scrollOffsetY, sx: p.metadata.scrollOffsetX, data: p.data, rx: Date.now() });
            if (out.recording) lastAct = Date.now();
        });
        const vw = vp.width;
        await b.send("Page.startScreencast", { format: "jpeg", quality: 80, maxWidth: vw, maxHeight: vp.height, everyNthFrame: 1 });
        // Cuadro base: el screencast manda el cuadro actual al arrancar.
        for (let i = 0; i < 20 && !out.frames.length; i++) await sleep(25);
        await sleep(120);
        if (!out.frames.length) warn("el screencast no mandó cuadro base");

        out.recording = true;
        out.t0 = Date.now();
        const actx = { base, recording: true, warn };
        for (const s of sc.action ?? []) await runOp(b, s, actx);
        out.tAction = Date.now();
        lastAct = Math.max(lastAct, out.tAction);

        // Graba hasta `settleMs` sin cambios (ni cuadros ni actividad del muestreador) o hasta maxMs.
        const minMs = sc.minRecordMs ?? 300;
        for (;;) {
            await sleep(40);
            const s = out.samples.at(-1);
            if (s && s.act) lastAct = Math.max(lastAct, s.rx);
            const n = Date.now();
            if (n - out.tAction >= maxMs) {
                out.timedOut = true;
                break;
            }
            if (n - out.t0 >= minMs && n - lastAct >= settleMs) break;
        }
        out.tEnd = Date.now();
        out.recording = false;
        await b.send("Page.stopScreencast").catch(() => {});
        try {
            await b.evaluate("window.__ma && window.__ma.stop()", 5000);
        } catch (e) {
            warn(`stop del muestreador: ${e.message}`);
        }
        await sleep(80);
        await b.send("Page.removeScriptToEvaluateOnNewDocument", { identifier: auto.identifier }).catch(() => {});

        for (const s of sc.post ?? []) {
            try {
                const v = await runOp(b, s, { base, recording: false, warn });
                out.post.push({ ok: true, label: s.label ?? s.expr ?? s.op, value: v });
            } catch (e) {
                out.post.push({ ok: false, label: s.label ?? s.expr ?? s.op, error: e.message });
            }
        }
    } catch (e) {
        out.errors.push(e.message);
    } finally {
        out.console = [...new Set(b.problems)].slice(0, 12);
        await b.close();
    }
    return out;
}
